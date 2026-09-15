import Inspection from "../models/Inspection.js";
import Property from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const requestInspection = asyncHandler(async (req, res) => {
  const property = await Property.findOne({
    _id: req.body.propertyId,
    listingStatus: "published",
    units: { $elemMatch: { _id: req.body.unitId, availableUnits: { $gt: 0 } } },
  });
  if (!property) throw new ApiError(404, "Available property unit not found");
  const scheduledFor = new Date(req.body.scheduledFor);
  if (!Number.isFinite(scheduledFor.getTime()) || scheduledFor <= new Date())
    throw new ApiError(400, "Choose a future inspection time");
  const duplicate = await Inspection.exists({
    property: property._id,
    unit: req.body.unitId,
    seeker: req.user._id,
    status: { $in: ["pending", "counter_proposed", "confirmed"] },
  });
  if (duplicate)
    throw new ApiError(
      409,
      "You already have an active inspection request for this unit",
    );
  const inspection = await Inspection.create({
    property: property._id,
    unit: req.body.unitId,
    seeker: req.user._id,
    owner: property.owner,
    assignedAgent:
      property.manager && !property.manager.equals(property.owner)
        ? property.manager
        : undefined,
    proposedBy: req.user._id,
    scheduledFor,
    note: req.body.note,
  });
  res.status(201).json({ inspection });
});
export const listInspections = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === "seeker"
      ? { seeker: req.user._id }
      : { $or: [{ owner: req.user._id }, { assignedAgent: req.user._id }] };
  const inspections = await Inspection.find(filter)
    .populate("property", "title slug location")
    .populate("seeker owner assignedAgent", "name email")
    .sort({ scheduledFor: 1 });
  res.json({ inspections });
});
export const updateInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findOne({
    _id: req.params.id,
    $or: [
      { seeker: req.user._id },
      { owner: req.user._id },
      { assignedAgent: req.user._id },
    ],
  });
  if (!inspection) throw new ApiError(404, "Inspection not found");
  const allowed = [
    "counter_proposed",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
  ];
  if (!allowed.includes(req.body.status))
    throw new ApiError(400, "Invalid inspection status");
  if (req.body.scheduledFor) {
    const date = new Date(req.body.scheduledFor);
    if (date <= new Date())
      throw new ApiError(400, "Choose a future inspection time");
    inspection.scheduledFor = date;
    inspection.proposedBy = req.user._id;
  }
  inspection.status = req.body.status;
  if (req.body.status === "completed") {
    if (inspection.seeker.equals(req.user._id))
      inspection.seekerConfirmedCompletion = true;
    else inspection.managerConfirmedCompletion = true;
  }
  await inspection.save();
  res.json({ inspection });
});
