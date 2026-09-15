import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
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
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["active", "closed", "reported"],
      default: "active",
    },
    lastMessageAt: Date,
  },
  { timestamps: true },
);

conversationSchema.index({ property: 1, unit: 1, seeker: 1 }, { unique: true });
export default mongoose.model("Conversation", conversationSchema);
