import mongoose from "mongoose";

const platformSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    currency: { type: String, default: "NGN" },
    gracePeriodDays: { type: Number, default: 14, min: 1, max: 60 },
    pricing: {
      individual: {
        activation: { type: Number, default: 5000 },
        monthly: { type: Number, default: 2000 },
        annual: { type: Number, default: 20000 },
      },
      agency: {
        activation: { type: Number, default: 10000 },
        monthly: { type: Number, default: 5000 },
        annual: { type: Number, default: 50000 },
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("PlatformSetting", platformSettingSchema);
