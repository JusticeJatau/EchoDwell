import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, default: "info" },
    link: String,
    readAt: Date,
  },
  { timestamps: true },
);
export default mongoose.model("Notification", notificationSchema);
