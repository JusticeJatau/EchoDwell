import PlatformSetting from "../models/PlatformSetting.js";
import Organization from "../models/Organization.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import AuditLog from "../models/AuditLog.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const log = (req, action, targetType, targetId, details) => AuditLog.create({ actor: req.user._id, action, targetType, targetId, details, ip: req.ip });

export const dashboard = asyncHandler(async (_req, res) => {
  const [users, organizations, properties, pendingListings, revenue] = await Promise.all([User.countDocuments(), Organization.countDocuments(), Property.countDocuments({ listingStatus: "published" }), Property.countDocuments({ listingStatus: "pending_review" }), Payment.aggregate([{ $match: { status: "successful" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])]);
  res.json({ stats: { users, organizations, properties, pendingListings, revenue: revenue[0]?.total || 0 } });
});

export const getSettings = asyncHandler(async (_req, res) => { const settings = await PlatformSetting.findOneAndUpdate({ key: "main" }, { $setOnInsert: { key: "main" } }, { upsert: true, new: true }); res.json({ settings }); });
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await PlatformSetting.findOneAndUpdate({ key: "main" }, { $set: { pricing: req.body.pricing, gracePeriodDays: req.body.gracePeriodDays, currency: req.body.currency || "NGN" } }, { new: true, runValidators: true, upsert: true });
  await log(req, "settings.updated", "PlatformSetting", settings._id, req.body);
  res.json({ settings });
});

export const reviewOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id);
  if (!organization) throw new ApiError(404, "Organization not found");
  const approved = req.body.decision === "approve";
  organization.verificationStatus = approved ? "approved" : "rejected";
  if (approved && organization.subscription.status === "pending_verification") organization.subscription.status = "active";
  await organization.save();
  await User.updateOne({ _id: organization.owner }, { verificationStatus: organization.verificationStatus });
  await log(req, `organization.${organization.verificationStatus}`, "Organization", organization._id, { reason: req.body.reason });
  res.json({ organization });
});

export const reviewProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");
  const approved = req.body.decision === "approve";
  property.listingStatus = approved ? "published" : "rejected";
  property.rejectionReason = approved ? undefined : req.body.reason;
  property.lastConfirmedAvailableAt = approved ? new Date() : property.lastConfirmedAvailableAt;
  await property.save();
  await log(req, `property.${property.listingStatus}`, "Property", property._id, { reason: req.body.reason });
  res.json({ property });
});

export const listOrganizations = asyncHandler(async (req, res) => { const organizations = await Organization.find().populate("owner", "name email phone status").sort({ createdAt: -1 }); res.json({ organizations }); });
export const listPendingProperties = asyncHandler(async (_req, res) => { const properties = await Property.find({ listingStatus: "pending_review" }).populate("owner", "name email"); res.json({ properties }); });
