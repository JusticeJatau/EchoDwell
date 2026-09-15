import mongoose from "mongoose";

const inspectionSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    unit: { type: mongoose.Schema.Types.ObjectId, required: true },
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduledFor: { type: Date, required: true },
    note: String,
    status: {
      type: String,
      enum: [
        "pending",
        "counter_proposed",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "pending",
    },
    seekerConfirmedCompletion: { type: Boolean, default: false },
    managerConfirmedCompletion: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export default mongoose.model("Inspection", inspectionSchema);
