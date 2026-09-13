import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  reference: { type: String, required: true, unique: true },
  purpose: { type: String, enum: ["activation", "renewal", "promotion"], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
  paidAt: Date,
  paystackData: mongoose.Schema.Types.Mixed,
}, { timestamps: true });
export default mongoose.model("Payment", paymentSchema);
