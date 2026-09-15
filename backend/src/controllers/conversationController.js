import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Property from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const startConversation = asyncHandler(async (req, res) => {
  const property = await Property.findOne({
    _id: req.body.propertyId,
    listingStatus: "published",
    "units._id": req.body.unitId,
  });
  if (!property) throw new ApiError(404, "Available property unit not found");
  if (property.owner.equals(req.user._id))
    throw new ApiError(400, "You cannot enquire about your own property");
  let conversation = await Conversation.findOne({
    property: property._id,
    unit: req.body.unitId,
    seeker: req.user._id,
  });
  if (!conversation)
    conversation = await Conversation.create({
      property: property._id,
      unit: req.body.unitId,
      seeker: req.user._id,
      owner: property.owner,
      assignedAgent:
        property.manager && !property.manager.equals(property.owner)
          ? property.manager
          : undefined,
      participants: [
        req.user._id,
        property.owner,
        ...(property.manager && !property.manager.equals(property.owner)
          ? [property.manager]
          : []),
      ],
      lastMessageAt: new Date(),
    });
  res.status(201).json({ conversation });
});

export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate("property", "title slug media location")
    .populate("participants", "name avatar role")
    .sort({ lastMessageAt: -1 });
  res.json({ conversations });
});
export const listMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user._id,
  });
  if (!conversation) throw new ApiError(404, "Conversation not found");
  const messages = await Message.find({ conversation: conversation._id })
    .populate("sender", "name avatar")
    .sort({ createdAt: 1 });
  await Message.updateMany(
    { conversation: conversation._id, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } },
  );
  res.json({ messages });
});
export const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user._id,
    status: "active",
  });
  if (!conversation) throw new ApiError(404, "Active conversation not found");
  if (!req.body.body?.trim()) throw new ApiError(400, "Write a message first");
  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    body: req.body.body.trim(),
    readBy: [req.user._id],
  });
  conversation.lastMessageAt = new Date();
  await conversation.save();
  res.status(201).json({ message });
});
