import Property from "../models/Property.js";
import Organization from "../models/Organization.js";
import Authorization from "../models/Authorization.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const makeSlug = (title) => `${title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;

async function canManage(user, property, permission) {
  if (user.role === "platform_admin" || property.owner.equals(user._id)) return true;
  const authorization = await Authorization.findOne({ agent: user._id, properties: property._id, status: "active" });
  return Boolean(authorization?.permissions?.[permission]);
}

export const listProperties = asyncHandler(async (req, res) => {
  const { search, state, city, area, type, minPrice, maxPrice, bedrooms, lat, lng, radiusKm = 50, page = 1, limit = 12 } = req.query;
  const filter = { listingStatus: "published", "units.availableUnits": { $gt: 0 } };
  if (search) filter.$text = { $search: search };
  if (state) filter["location.state"] = new RegExp(state, "i");
  if (city) filter["location.city"] = new RegExp(city, "i");
  if (area) filter["location.area"] = new RegExp(area, "i");
  if (type) filter.propertyType = type;
  if (bedrooms) filter["units.bedrooms"] = Number(bedrooms);
  if (minPrice || maxPrice) filter["units.rentAmount"] = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
  const skip = (Number(page) - 1) * Number(limit);
  const hasLocation = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
  if (hasLocation) {
    const longitude = Number(lng);
    const latitude = Number(lat);
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) throw new ApiError(400, "Invalid location coordinates");
    const nearby = await Property.aggregate([
      { $geoNear: { near: { type: "Point", coordinates: [longitude, latitude] }, distanceField: "distanceMeters", maxDistance: Math.min(Number(radiusKm) || 50, 200) * 1000, spherical: true, query: filter } },
      { $sort: { "promotion.type": -1, distanceMeters: 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      { $addFields: { distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 1] } } },
    ]);
    return res.json({ properties: nearby, total: nearby.length, page: Number(page), pages: 1, locationSearch: true });
  }
  const [properties, total] = await Promise.all([
    Property.find(filter).populate("owner", "name verificationStatus").populate("manager", "name verificationStatus").sort({ "promotion.type": -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
    Property.countDocuments(filter),
  ]);
  res.json({ properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ slug: req.params.slug, listingStatus: "published" }).populate("owner", "name verificationStatus").populate("manager", "name verificationStatus");
  if (!property) throw new ApiError(404, "Property not found");
  property.views += 1;
  await property.save();
  res.json({ property });
});

export const myProperties = asyncHandler(async (req, res) => {
  const authorizations = await Authorization.find({ agent: req.user._id, status: "active" }).select("properties");
  const assigned = authorizations.flatMap((item) => item.properties);
  const properties = await Property.find({ $or: [{ owner: req.user._id }, { manager: req.user._id }, { _id: { $in: assigned } }] }).sort({ createdAt: -1 });
  res.json({ properties });
});

export const createProperty = asyncHandler(async (req, res) => {
  if (!req.user.organization) throw new ApiError(400, "Complete your owner or agency profile first");
  const organization = await Organization.findById(req.user.organization);
  if (!organization || !["active", "grace_period"].includes(organization.subscription.status)) throw new ApiError(402, "Activate your account before publishing properties");
  const property = await Property.create({ ...req.body, slug: makeSlug(req.body.title), owner: req.user._id, organization: organization._id, manager: req.user._id, managementType: organization.type === "agency" ? "agency" : "owner" });
  res.status(201).json({ property });
});

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");
  if (!(await canManage(req.user, property, "editProperty"))) throw new ApiError(403, "You are not authorized to edit this property");
  const protectedFields = ["owner", "organization", "listingStatus", "views", "slug"];
  protectedFields.forEach((field) => delete req.body[field]);
  Object.assign(property, req.body);
  await property.save();
  res.json({ property });
});

export const submitProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");
  if (!(await canManage(req.user, property, "createListings"))) throw new ApiError(403, "You are not authorized to submit this property");
  if (!property.units.length || !property.media.some((item) => item.type === "image")) throw new ApiError(400, "Add at least one unit and one property image before review");
  property.listingStatus = "pending_review";
  await property.save();
  res.json({ property, message: "Property submitted for review" });
});
