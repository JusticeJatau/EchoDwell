import { useEffect, useState } from "react";
import {
  Building2,
  CreditCard,
  Home,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import api from "../api/client.js";
import { money } from "../components/PropertyCard.jsx";
import Logo from "../components/Logo.jsx";
import { useAuthStore } from "../store/authStore.js";
export default function AdminPage() {
  const logout = useAuthStore((state) => state.logout);
  const [stats, setStats] = useState({});
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    Promise.all([api.get("/admin/dashboard"), api.get("/admin/settings")]).then(
      ([a, b]) => {
        setStats(a.data.stats);
        setSettings(b.data.settings);
      },
    );
  }, []);
  const save = async () => {
    const { data } = await api.patch("/admin/settings", settings);
    setSettings(data.settings);
    setMessage("Pricing updated successfully");
  };
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Logo />
        <div className="admin-label">
          <ShieldCheck />
          Platform administration
        </div>
        <nav>
          <a className="active" href="/admin">
            <Home />
            Overview
          </a>
          <a href="#organizations">
            <Building2 />
            Organizations
          </a>
          <a href="#users">
            <Users />
            Users
          </a>
          <a href="#settings">
            <Settings />
            Pricing & settings
          </a>
        </nav>
        <button onClick={logout}>
          <LogOut />
          Sign out
        </button>
      </aside>
      <section className="dashboard-page admin-content">
        <div className="dashboard-head">
          <div>
            <span className="eyebrow">Platform administration</span>
            <h1>EchoDwell operations</h1>
            <p>
              Manage users, verification, listings, billing and marketplace
              health.
            </p>
          </div>
        </div>
        <div className="stat-grid admin">
          {[
            ["Users", stats.users, Users],
            ["Organizations", stats.organizations, Building2],
            ["Live properties", stats.properties, Home],
            ["Pending review", stats.pendingListings, Settings],
            ["Revenue", money(stats.revenue), CreditCard],
          ].map(([label, value, Icon]) => (
            <article key={label}>
              <Icon />
              <span>{label}</span>
              <strong>{value ?? "—"}</strong>
            </article>
          ))}
        </div>
        {settings && (
          <div className="settings-panel" id="settings">
            <div>
              <h2>Platform pricing</h2>
              <p>
                Activation includes the first month. Amounts are stored in
                naira.
              </p>
            </div>
            {message && <div className="notice success">{message}</div>}
            <div className="form-grid">
              <label>
                Individual activation
                <input
                  type="number"
                  value={settings.pricing.individual.activation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pricing: {
                        ...settings.pricing,
                        individual: {
                          ...settings.pricing.individual,
                          activation: Number(e.target.value),
                        },
                      },
                    })
                  }
                />
              </label>
              <label>
                Individual monthly
                <input
                  type="number"
                  value={settings.pricing.individual.monthly}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pricing: {
                        ...settings.pricing,
                        individual: {
                          ...settings.pricing.individual,
                          monthly: Number(e.target.value),
                        },
                      },
                    })
                  }
                />
              </label>
              <label>
                Agency activation
                <input
                  type="number"
                  value={settings.pricing.agency.activation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pricing: {
                        ...settings.pricing,
                        agency: {
                          ...settings.pricing.agency,
                          activation: Number(e.target.value),
                        },
                      },
                    })
                  }
                />
              </label>
              <label>
                Agency monthly
                <input
                  type="number"
                  value={settings.pricing.agency.monthly}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pricing: {
                        ...settings.pricing,
                        agency: {
                          ...settings.pricing.agency,
                          monthly: Number(e.target.value),
                        },
                      },
                    })
                  }
                />
              </label>
              <label>
                Grace period (days)
                <input
                  type="number"
                  value={settings.gracePeriodDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      gracePeriodDays: Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>
            <button onClick={save}>Save pricing</button>
          </div>
        )}
      </section>
    </div>
  );
}
