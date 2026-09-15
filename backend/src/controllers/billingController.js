import crypto from "node:crypto";
import Payment from "../models/Payment.js";
import Organization from "../models/Organization.js";
import PlatformSetting from "../models/PlatformSetting.js";
import Property from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addDays, addMonths } from "../utils/billing.js";

async function paystack(path, options = {}) {
  if (
    !process.env.PAYSTACK_SECRET_KEY ||
    !process.env.PAYSTACK_SECRET_KEY.startsWith("sk_")
  )
    throw new ApiError(
      503,
      "Paystack is not configured yet. Add PAYSTACK_SECRET_KEY to backend/.env",
    );
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok || !data.status)
    throw new ApiError(502, data.message || "Payment provider error");
  return data.data;
}

export const initializePayment = asyncHandler(async (req, res) => {
  const organization = await Organization.findOne({
    _id: req.user.organization,
    owner: req.user._id,
  });
  if (!organization) throw new ApiError(404, "Organization not found");
  const settings = await PlatformSetting.findOneAndUpdate(
    { key: "main" },
    { $setOnInsert: { key: "main" } },
    { upsert: true, new: true },
  );
  const purpose = organization.subscription.activatedAt
    ? "renewal"
    : "activation";
  const cycle = req.body.billingCycle === "annual" ? "annual" : "monthly";
  const amount =
    purpose === "activation"
      ? settings.pricing[organization.type].activation
      : settings.pricing[organization.type][cycle];
  const reference = `ED-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  await Payment.create({
    user: req.user._id,
    organization: organization._id,
    reference,
    purpose,
    amount,
  });
  const data = await paystack("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: req.user.email,
      amount: amount * 100,
      reference,
      callback_url: process.env.PAYSTACK_CALLBACK_URL,
      metadata: { organizationId: organization._id.toString(), purpose, cycle },
    }),
  });
  res.json({ authorizationUrl: data.authorization_url, reference });
});

export const getBillingDetails = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(
    req.user.organization,
  ).select("name type verificationStatus subscription");
  if (!organization) throw new ApiError(404, "Organization not found");
  const settings = await PlatformSetting.findOneAndUpdate(
    { key: "main" },
    { $setOnInsert: { key: "main" } },
    { upsert: true, new: true },
  );
  res.json({
    organization,
    pricing: settings.pricing[organization.type],
    gracePeriodDays: settings.gracePeriodDays,
    currency: settings.currency,
  });
});

export async function completePayment(reference, paystackData) {
  const payment = await Payment.findOne({ reference });
  if (!payment || payment.status === "successful") return payment;
  if (
    paystackData.status !== "success" ||
    paystackData.amount !== payment.amount * 100
  )
    throw new ApiError(400, "Payment verification failed");
  payment.status = "successful";
  payment.paidAt = new Date();
  payment.paystackData = paystackData;
  await payment.save();
  const organization = await Organization.findById(payment.organization);
  const settings = await PlatformSetting.findOne({ key: "main" });
  const start = new Date();
  const cycle = paystackData.metadata?.cycle || "monthly";
  const end = cycle === "annual" ? addMonths(start, 12) : addMonths(start, 1);
  organization.subscription = {
    ...organization.subscription.toObject(),
    status:
      payment.purpose === "activation" ? "pending_verification" : "active",
    billingCycle: cycle,
    activatedAt: organization.subscription.activatedAt || start,
    currentPeriodStart: start,
    currentPeriodEnd: end,
    gracePeriodEndsAt: addDays(end, settings?.gracePeriodDays || 14),
    paystackCustomerCode:
      paystackData.customer?.customer_code ||
      organization.subscription.paystackCustomerCode,
  };
  await organization.save();
  if (payment.purpose === "renewal")
    await Property.updateMany(
      { organization: organization._id, hiddenByBilling: true },
      { listingStatus: "published", hiddenByBilling: false },
    );
  return payment;
}

export const verifyPayment = asyncHandler(async (req, res) => {
  const data = await paystack(
    `/transaction/verify/${encodeURIComponent(req.params.reference)}`,
  );
  const payment = await completePayment(req.params.reference, data);
  res.json({ payment, message: "Payment verified" });
});

export const webhook = asyncHandler(async (req, res) => {
  const signature = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.rawBody)
    .digest("hex");
  if (signature !== req.headers["x-paystack-signature"])
    throw new ApiError(401, "Invalid webhook signature");
  res.sendStatus(200);
  if (req.body.event === "charge.success")
    await completePayment(req.body.data.reference, req.body.data);
});
