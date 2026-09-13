import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BadgeCheck, CalendarDays, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import api from "../api/client.js";
import Loading from "../components/Loading.jsx";
import { money } from "../components/PropertyCard.jsx";

export default function PropertyPage() {
  const { slug } = useParams(); const [property, setProperty] = useState(null); const [error, setError] = useState("");
  useEffect(() => { api.get(`/properties/${slug}`).then(({ data }) => setProperty(data.property)).catch((err) => setError(err.message)); }, [slug]);
  if (error) return <div className="page-section"><div className="notice error">{error}</div></div>; if (!property) return <Loading/>;
  const images = property.media?.filter((item) => item.type === "image") || []; const unit = property.units?.find((item) => item.availableUnits > 0) || property.units?.[0];
  return <section className="property-page"><div className="detail-gallery">{(images.length ? images : [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85" }]).slice(0, 3).map((image, index) => <img key={image.url} className={index === 0 ? "primary" : ""} src={image.url} alt="Property view"/>)}</div><div className="detail-layout"><article><span className="eyebrow"><BadgeCheck size={16}/> Reviewed listing</span><h1>{property.title}</h1><p className="location"><MapPin/>{property.location?.publicAddress || `${property.location?.area}, ${property.location?.city}`}</p><div className="detail-price">{money(unit?.rentAmount)} <small>/ {unit?.rentPeriod}</small></div><p className="description">{property.description}</p><h2>Available units</h2><div className="unit-list">{property.units.map((item) => <div className="unit" key={item._id}><div><strong>{item.name}</strong><span>{item.bedrooms} bed · {item.bathrooms} bath · {item.furnishing}</span></div><div><strong>{money(item.rentAmount)}</strong><span>{item.availableUnits} of {item.totalUnits} available</span></div></div>)}</div></article><aside className="contact-card"><ShieldCheck/><h3>{property.managementType === "owner" ? "Owner-managed property" : "Managed by an authorized professional"}</h3><p>Chat securely and inspect the property before making a rental decision.</p><button><MessageCircle/>Start conversation</button><button className="secondary"><CalendarDays/>Request free inspection</button></aside></div></section>;
}
