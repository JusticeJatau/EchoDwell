import mongoose from "mongoose";

const authorizationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  properties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
  permissions: {
    editProperty: { type: Boolean, default: false },
    createListings: { type: Boolean, default: true },
    uploadMedia: { type: Boolean, default: true },
    respondToChats: { type: Boolean, default: true },
    scheduleInspections: { type: Boolean, default: true },
    updateAvailability: { type: Boolean, default: true },
    approveApplications: { type: Boolean, default: false },
  },
  status: { type: String, enum: ["pending", "active", "revoked", "expired"], default: "pending" },
  startsAt: Date,
  expiresAt: Date,
  proofDocument: { url: String, publicId: String },
}, { timestamps: true });

authorizationSchema.index({ owner: 1, agent: 1, status: 1 });
export default mongoose.model("Authorization", authorizationSchema);
