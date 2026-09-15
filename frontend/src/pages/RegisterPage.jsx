import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    accountType: "seeker",
    organizationName: "",
  });
  const [error, setError] = useState("");
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await register(form);
      navigate(user.role === "seeker" ? "/account" : "/billing");
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <section className="auth-page">
      <form className="auth-card wide" onSubmit={submit}>
        <span className="eyebrow">Create your account</span>
        <h1>How will you use EchoDwell?</h1>
        {error && <div className="notice error">{error}</div>}
        <div className="account-types">
          {[
            ["seeker", "Find a home"],
            ["owner", "List my property"],
            ["agent", "Work as an agent"],
            ["agency", "Register an agency"],
          ].map(([value, label]) => (
            <button
              type="button"
              className={form.accountType === value ? "selected" : ""}
              key={value}
              onClick={() => setForm({ ...form, accountType: value })}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="form-grid">
          <label>
            Full name
            <input required value={form.name} onChange={set("name")} />
          </label>
          <label>
            Phone number
            <input required value={form.phone} onChange={set("phone")} />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={set("email")}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength="8"
              value={form.password}
              onChange={set("password")}
            />
          </label>
          {form.accountType === "agency" && (
            <label className="full">
              Agency name
              <input
                required
                value={form.organizationName}
                onChange={set("organizationName")}
              />
            </label>
          )}
        </div>
        <button>Create account</button>
        <small>
          Owners, agents and agencies complete verification before publishing
          listings.
        </small>
      </form>
    </section>
  );
}
