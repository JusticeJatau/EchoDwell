import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: [
        "seeker",
        "owner",
        "agent",
        "agency_admin",
        "agency_agent",
        "platform_admin",
      ],
      default: "seeker",
    },
    avatar: String,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    verificationStatus: {
      type: String,
      enum: ["not_started", "pending", "approved", "rejected"],
      default: "not_started",
    },
    status: {
      type: String,
      enum: ["active", "restricted", "suspended"],
      default: "active",
    },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    avatar: this.avatar,
    organization: this.organization,
    verificationStatus: this.verificationStatus,
    status: this.status,
  };
};

export default mongoose.model("User", userSchema);
