import { useState } from "react";
import { LocateFixed, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";

const emptyUnit = {
  name: "",
  type: "flat",
  bedrooms: 1,
  bathrooms: 1,
  toilets: 1,
  totalUnits: 1,
  availableUnits: 1,
  rentAmount: "",
  rentPeriod: "annually",
};
export default function AddPropertyPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "house",
    location: {
      state: "Yobe",
      city: "Damaturu",
      area: "",
      publicAddress: "",
      privateAddress: "",
    },
    media: [],
    units: [{ ...emptyUnit }],
  });
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const locationField = (key, value) =>
    setForm({ ...form, location: { ...form.location, [key]: value } });
  const unitField = (key, value) =>
    setForm({ ...form, units: [{ ...form.units[0], [key]: value }] });
  const useLocation = () =>
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) =>
        setForm({
          ...form,
          location: {
            ...form.location,
            geo: {
              type: "Point",
              coordinates: [coords.longitude, coords.latitude],
            },
          },
        }),
      () => setError("Location permission was not granted."),
      { enableHighAccuracy: true },
    );
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const unit = form.units[0];
      await api.post("/properties", {
        ...form,
        media: imageUrl ? [{ type: "image", url: imageUrl }] : [],
        units: [
          {
            ...unit,
            rentAmount: Number(unit.rentAmount),
            totalUnits: Number(unit.totalUnits),
            availableUnits: Number(unit.availableUnits),
            bedrooms: Number(unit.bedrooms),
            bathrooms: Number(unit.bathrooms),
            toilets: Number(unit.toilets),
          },
        ],
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="page-section property-form-page">
      <div className="section-heading">
        <span className="eyebrow">New property</span>
        <h1>Add a property or compound</h1>
        <p>
          Create the main property once, then describe the rentable units inside
          it.
        </p>
      </div>
      {error && <div className="notice error">{error}</div>}
      <form className="property-form" onSubmit={submit}>
        <div className="form-card">
          <h2>Property information</h2>
          <div className="form-grid">
            <label>
              Property title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              Property type
              <select
                value={form.propertyType}
                onChange={(e) =>
                  setForm({ ...form, propertyType: e.target.value })
                }
              >
                <option value="house">House</option>
                <option value="flat">Flat</option>
                <option value="compound">Compound</option>
                <option value="self-contained">Self-contained</option>
                <option value="shop">Shop</option>
                <option value="office">Office</option>
              </select>
            </label>
            <label className="full">
              Description
              <textarea
                required
                rows="5"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
          </div>
        </div>
        <div className="form-card">
          <div className="form-card-title">
            <h2>Location</h2>
            <button
              type="button"
              className="location-button"
              onClick={useLocation}
            >
              <LocateFixed />
              Capture coordinates
            </button>
          </div>
          <div className="form-grid">
            {[
              ["state", "State"],
              ["city", "City"],
              ["area", "Area"],
              ["publicAddress", "Public address or landmark"],
              ["privateAddress", "Full private address"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  required={key !== "publicAddress"}
                  value={form.location[key]}
                  onChange={(e) => locationField(key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="form-card">
          <h2>First rentable unit</h2>
          <div className="form-grid">
            <label>
              Unit name
              <input
                required
                value={form.units[0].name}
                onChange={(e) => unitField("name", e.target.value)}
                placeholder="e.g. Two-bedroom apartment"
              />
            </label>
            <label>
              Rent amount
              <input
                type="number"
                min="0"
                required
                value={form.units[0].rentAmount}
                onChange={(e) => unitField("rentAmount", e.target.value)}
              />
            </label>
            <label>
              Total identical units
              <input
                type="number"
                min="1"
                value={form.units[0].totalUnits}
                onChange={(e) => unitField("totalUnits", e.target.value)}
              />
            </label>
            <label>
              Available units
              <input
                type="number"
                min="0"
                value={form.units[0].availableUnits}
                onChange={(e) => unitField("availableUnits", e.target.value)}
              />
            </label>
            <label>
              Bedrooms
              <input
                type="number"
                min="0"
                value={form.units[0].bedrooms}
                onChange={(e) => unitField("bedrooms", e.target.value)}
              />
            </label>
            <label>
              Rent period
              <select
                value={form.units[0].rentPeriod}
                onChange={(e) => unitField("rentPeriod", e.target.value)}
              >
                <option value="annually">Annually</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </label>
          </div>
        </div>
        <div className="form-card">
          <h2>Property image</h2>
          <label>
            Image URL
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>
        <button disabled={busy}>
          <Plus />
          {busy ? "Saving property…" : "Save property draft"}
        </button>
      </form>
    </section>
  );
}
