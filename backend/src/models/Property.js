import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    toilets: { type: Number, default: 0 },
    totalUnits: { type: Number, default: 1, min: 1 },
    availableUnits: { type: Number, default: 1, min: 0 },
    rentAmount: { type: Number, required: true, min: 0 },
    rentPeriod: {
      type: String,
      enum: ["daily", "weekly", "monthly", "annually"],
      default: "annually",
    },
    fees: {
      agency: { type: Number, default: 0 },
      legal: { type: Number, default: 0 },
      caution: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
    },
    furnishing: {
      type: String,
      enum: ["unfurnished", "semi-furnished", "furnished"],
      default: "unfurnished",
    },
    status: {
      type: String,
      enum: ["available", "reserved", "occupied", "unavailable"],
      default: "available",
    },
  },
  { timestamps: true },
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    managementType: {
      type: String,
      enum: ["owner", "agent", "agency"],
      default: "owner",
    },
    propertyType: {
      type: String,
      enum: [
        "compound",
        "flat",
        "house",
        "self-contained",
        "shop",
        "office",
        "land",
      ],
      required: true,
    },
    location: {
      state: String,
      city: String,
      area: String,
      landmark: String,
      publicAddress: String,
      privateAddress: String,
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: undefined },
      },
    },
    amenities: [String],
    utilities: {
      electricity: String,
      water: String,
      roadAccess: String,
      security: String,
    },
    media: [
      {
        type: { type: String, enum: ["image", "video"] },
        url: String,
        publicId: String,
      },
    ],
    units: [unitSchema],
    listingStatus: {
      type: String,
      enum: [
        "draft",
        "pending_review",
        "published",
        "rejected",
        "hidden",
        "expired",
      ],
      default: "draft",
    },
    hiddenByBilling: { type: Boolean, default: false },
    rejectionReason: String,
    lastConfirmedAvailableAt: Date,
    expiresAt: Date,
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    promotion: {
      type: {
        type: String,
        enum: ["none", "boost", "featured", "spotlight"],
        default: "none",
      },
      expiresAt: Date,
    },
  },
  { timestamps: true },
);

propertySchema.index({
  title: "text",
  description: "text",
  "location.area": "text",
  "location.city": "text",
});
propertySchema.index({ "location.geo": "2dsphere" });
export default mongoose.model("Property", propertySchema);
