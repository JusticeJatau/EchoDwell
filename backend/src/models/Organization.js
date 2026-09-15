import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["individual", "agency"], required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "agent", "support"] },
        status: {
          type: String,
          enum: ["invited", "active", "removed"],
          default: "invited",
        },
      },
    ],
    address: String,
    phone: String,
    documents: [
      {
        name: String,
        url: String,
        publicId: String,
        status: { type: String, default: "pending" },
      },
    ],
    verificationStatus: {
      type: String,
      enum: ["not_started", "pending", "approved", "rejected"],
      default: "not_started",
    },
    subscription: {
      status: {
        type: String,
        enum: [
          "pending_payment",
          "pending_verification",
          "active",
          "past_due",
          "grace_period",
          "restricted",
          "suspended",
        ],
        default: "pending_payment",
      },
      planType: { type: String, enum: ["individual", "agency"] },
      billingCycle: {
        type: String,
        enum: ["monthly", "annual"],
        default: "monthly",
      },
      activatedAt: Date,
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      gracePeriodEndsAt: Date,
      paystackCustomerCode: String,
      paystackSubscriptionCode: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Organization", organizationSchema);
