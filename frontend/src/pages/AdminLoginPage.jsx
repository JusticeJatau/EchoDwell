import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { useAuthStore } from "../store/authStore.js";

export default function AdminLoginPage() {
  const { user, adminLogin } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  if (user?.role === "platform_admin") return <Navigate to="/admin" replace />;
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminLogin(form);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="admin-login-page">
      <div className="admin-login-brand">
        <Logo />
        <span>Platform administration</span>
      </div>
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-shield">
          <ShieldCheck />
        </div>
        <span className="eyebrow">Restricted access</span>
        <h1>Admin sign in</h1>
        <p>Use your EchoDwell platform administrator account.</p>
        {error && <div className="notice error">{error}</div>}
        <label>
          Email address
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength="8"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button disabled={busy}>
          {busy ? "Signing in…" : "Open admin dashboard"}
        </button>
      </form>
    </main>
  );
}
