import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  targetType: String,
  targetId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ip: String,
}, { timestamps: true });
export default mongoose.model("AuditLog", auditLogSchema);
