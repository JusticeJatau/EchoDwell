import Organization from "../models/Organization.js";
import Property from "../models/Property.js";
import { getBillingStatus } from "../utils/billing.js";

export async function enforceSubscriptionAccess(now = new Date()) {
  const organizations = await Organization.find({
    "subscription.currentPeriodEnd": { $exists: true },
  });
  for (const organization of organizations) {
    const status = getBillingStatus(organization.subscription, now);
    if (
      status !== organization.subscription.status &&
      !["pending_verification", "suspended"].includes(
        organization.subscription.status,
      )
    ) {
      organization.subscription.status = status;
      await organization.save();
    }
    if (status === "restricted")
      await Property.updateMany(
        { organization: organization._id, listingStatus: "published" },
        { listingStatus: "hidden", hiddenByBilling: true },
      );
  }
}
