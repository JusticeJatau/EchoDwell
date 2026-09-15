import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import Loading from "../components/Loading.jsx";
import { money } from "../components/PropertyCard.jsx";

export default function ActivationPage() {
  const [params] = useSearchParams();
  const [details, setDetails] = useState(null);
  const [cycle, setCycle] = useState("monthly");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = () =>
    api
      .get("/billing/details")
      .then(({ data }) => setDetails(data))
      .catch((err) => setError(err.message));
  useEffect(() => {
    const reference = params.get("reference") || params.get("trxref");
    if (reference) {
      setBusy(true);
      api
        .get(`/billing/verify/${reference}`)
        .then(() =>
          setMessage(
            "Payment verified. Your account is now awaiting verification approval.",
          ),
        )
        .catch((err) => setError(err.message))
        .finally(() => {
          setBusy(false);
          load();
        });
    } else load();
  }, []);
  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/billing/initialize", {
        billingCycle: cycle,
      });
      window.location.assign(data.authorizationUrl);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };
  if (!details && !error) return <Loading />;
  const subscription = details?.organization.subscription;
  const firstPayment = !subscription?.activatedAt;
  const amount = firstPayment
    ? details?.pricing.activation
    : details?.pricing[cycle];
  return (
    <section className="billing-page">
      <div className="billing-intro">
        <span className="eyebrow">EchoDwell membership</span>
        <h1>
          {firstPayment
            ? "Activate your property account"
            : "Renew your membership"}
        </h1>
        <p>
          {firstPayment
            ? "Your one-time activation payment includes your first month on EchoDwell."
            : `Renew before the ${details?.gracePeriodDays}-day grace period ends to keep your listings visible.`}
        </p>
      </div>
      {message && (
        <div className="notice success">
          <CheckCircle2 />
          {message}
        </div>
      )}
      {error && <div className="notice error">{error}</div>}
      {details && (
        <div className="billing-card">
          <div className="billing-card-head">
            <CreditCard />
            <div>
              <strong>
                {details.organization.type === "agency"
                  ? "Agency account"
                  : "Individual account"}
              </strong>
              <span>{details.organization.name}</span>
            </div>
          </div>
          {!firstPayment && (
            <div className="billing-cycle">
              <button
                className={cycle === "monthly" ? "selected" : ""}
                onClick={() => setCycle("monthly")}
              >
                Monthly
              </button>
              <button
                className={cycle === "annual" ? "selected" : ""}
                onClick={() => setCycle("annual")}
              >
                Annual · save 2 months
              </button>
            </div>
          )}
          <div className="billing-total">
            <span>
              {firstPayment ? "Activation + first month" : `${cycle} renewal`}
            </span>
            <strong>{money(amount)}</strong>
          </div>
          <ul>
            <li>
              <CheckCircle2 />
              Publish legitimate properties without a small listing cap
            </li>
            <li>
              <CheckCircle2 />
              Receive chats and free inspection requests
            </li>
            <li>
              <CheckCircle2 />
              Keep dashboard access if payment becomes overdue
            </li>
          </ul>
          <button
            onClick={pay}
            disabled={
              busy ||
              ["active", "pending_verification"].includes(subscription?.status)
            }
          >
            <ShieldCheck />
            {busy
              ? "Preparing secure payment…"
              : subscription?.status === "active"
                ? "Membership active"
                : subscription?.status === "pending_verification"
                  ? "Awaiting verification"
                  : `Pay ${money(amount)} with Paystack`}
          </button>
          <small>
            Payment is initialized and verified by the EchoDwell backend.
          </small>
        </div>
      )}
    </section>
  );
}
