import Authorization from "../models/Authorization.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const inviteAgent = asyncHandler(async (req, res) => {
  const agent = await User.findOne({
    email: req.body.email?.toLowerCase(),
    role: { $in: ["agent", "agency_agent"] },
  });
  if (!agent)
    throw new ApiError(404, "No agent account was found with this email");
  const properties = await Property.find({
    _id: { $in: req.body.propertyIds || [] },
    owner: req.user._id,
  }).select("_id");
  if (!properties.length)
    throw new ApiError(400, "Choose at least one property you own");
  const authorization = await Authorization.findOneAndUpdate(
    {
      owner: req.user._id,
      agent: agent._id,
      status: { $in: ["pending", "active"] },
    },
    {
      $set: {
        properties: properties.map((item) => item._id),
        permissions: req.body.permissions,
        startsAt: new Date(),
        expiresAt: req.body.expiresAt,
      },
      $setOnInsert: {
        owner: req.user._id,
        agent: agent._id,
        organization: req.user.organization,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
  res.status(201).json({ authorization, message: "Agent authorization sent" });
});

export const respondToAuthorization = asyncHandler(async (req, res) => {
  const authorization = await Authorization.findOne({
    _id: req.params.id,
    agent: req.user._id,
    status: "pending",
  });
  if (!authorization)
    throw new ApiError(404, "Authorization request not found");
  authorization.status = req.body.accept ? "active" : "revoked";
  await authorization.save();
  if (req.body.accept)
    await Property.updateMany(
      { _id: { $in: authorization.properties } },
      { manager: req.user._id, managementType: "agent" },
    );
  res.json({ authorization });
});

export const revokeAuthorization = asyncHandler(async (req, res) => {
  const authorization = await Authorization.findOne({
    _id: req.params.id,
    owner: req.user._id,
    status: "active",
  });
  if (!authorization) throw new ApiError(404, "Active authorization not found");
  authorization.status = "revoked";
  await authorization.save();
  await Property.updateMany(
    { _id: { $in: authorization.properties }, owner: req.user._id },
    { manager: req.user._id, managementType: "owner" },
  );
  res.json({ message: "Agent access revoked" });
});

export const myAuthorizations = asyncHandler(async (req, res) => {
  const authorizations = await Authorization.find({
    $or: [{ owner: req.user._id }, { agent: req.user._id }],
  })
    .populate("owner agent", "name email avatar")
    .populate("properties", "title slug listingStatus")
    .sort({ createdAt: -1 });
  res.json({ authorizations });
});
