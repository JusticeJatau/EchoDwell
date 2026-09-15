import { Link } from "react-router-dom";
import { BadgeCheck, BedDouble, MapPin } from "lucide-react";
export const money = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);
export default function PropertyCard({ property }) {
  const unit =
    property.units?.find((item) => item.availableUnits > 0) ||
    property.units?.[0] ||
    {};
  const image =
    property.media?.find((item) => item.type === "image")?.url ||
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80";
  return (
    <Link className="property-card" to={`/properties/${property.slug}`}>
      <div className="property-image">
        <img src={image} alt="" />
        <span className="property-badge">
          {property.promotion?.type !== "none"
            ? property.promotion?.type
            : "Available"}
        </span>
        {property.distanceKm != null && (
          <span className="distance-badge">{property.distanceKm} km away</span>
        )}
      </div>
      <div className="property-content">
        <div className="card-heading">
          <h3>{property.title}</h3>
          <BadgeCheck size={18} />
        </div>
        <p>
          <MapPin size={15} />
          {property.location?.area}, {property.location?.city}
        </p>
        <div className="card-footer">
          <strong>
            {money(unit.rentAmount)}{" "}
            <small>/ {unit.rentPeriod || "year"}</small>
          </strong>
          <span>
            <BedDouble size={16} />
            {unit.bedrooms ?? 0} bed
          </span>
        </div>
      </div>
    </Link>
  );
}
