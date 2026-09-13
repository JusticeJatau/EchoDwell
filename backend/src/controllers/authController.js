import User from "../models/User.js";
import Organization from "../models/Organization.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendAuth } from "../utils/token.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, accountType = "seeker", organizationName } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email and password are required");
  if (await User.exists({ email: email.toLowerCase() })) throw new ApiError(409, "An account already exists with this email");
  const roleMap = { seeker: "seeker", owner: "owner", agent: "agent", agency: "agency_admin" };
  const role = roleMap[accountType];
  if (!role) throw new ApiError(400, "Choose a valid account type");
  const user = await User.create({ name, email, phone, password, role });
  if (["owner", "agent", "agency_admin"].includes(role)) {
    const organization = await Organization.create({ name: organizationName || name, type: role === "agency_admin" ? "agency" : "individual", owner: user._id, subscription: { planType: role === "agency_admin" ? "agency" : "individual" } });
    user.organization = organization._id;
    await user.save();
  }
  sendAuth(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) throw new ApiError(401, "Invalid email or password");
  user.lastLoginAt = new Date();
  await user.save();
  sendAuth(res, user);
});

export const logout = (_req, res) => { res.clearCookie("echodwell_token"); res.json({ message: "Signed out successfully" }); };
export const me = asyncHandler(async (req, res) => res.json({ user: req.user.toSafeObject() }));
