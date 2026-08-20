import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import PageBackground from "./PageBackground.jsx";
import { getAllOpportunities } from "../api/opportunities";

const DEFAULT_DEAL_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23e5e7eb'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='16'>No image</text></svg>";

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return JSON.parse(
      localStorage.getItem("investbridgeSessionUser") || "null",
    );
  } catch {
    return null;
  }
};

const mapOpportunityToDeal = (opp) => ({
  id: opp.id,
  name: opp.title,
  company: opp.company,
  sector: opp.sector,
  location: opp.location || "TBD",
  goal: opp.funding_goal || "$0",
  blurb: opp.description || "",
  timeline: opp.timeline || "TBD",
  image: opp.image || null,
  postedBy: opp.user?.email || null,
});

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const inputWrapperClassName =
  "surface-rim flex items-center gap-3 rounded-2xl px-4 py-3";
const inputClassName =
  "w-full rounded-2xl border border-white/20 bg-white/35 px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 backdrop-blur-sm dark:border-white/10 dark:bg-ink-950/35 dark:text-ink-50 dark:placeholder:text-ink-500";
const fieldLabelClassName =
  "mb-2 block text-sm font-medium text-ink-700 dark:text-ink-300";

export default function PaymentPage({ navigate }) {
  const { id } = useParams();
  const location = useLocation();
  const [user] = useState(() => getStoredUser());
  const [deal, setDeal] = useState(() => location.state?.deal || null);
  const [loading, setLoading] = useState(!location.state?.deal);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | processing | success
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (deal) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await getAllOpportunities();
        const match = (data.opportunities || []).find(
          (opp) => String(opp.id) === String(id),
        );
        if (cancelled) return;
        if (match) {
          setDeal(mapOpportunityToDeal(match));
        } else {
          setNotFound(true);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deal, id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;
    if (name === "cardNumber") nextValue = formatCardNumber(value);
    if (name === "expiry") nextValue = formatExpiry(value);
    if (name === "cvv") nextValue = value.replace(/\D/g, "").slice(0, 4);
    if (name === "amount") nextValue = value.replace(/[^0-9.]/g, "");
    setForm((current) => ({ ...current, [name]: nextValue }));
  };

  const validate = () => {
    const nextErrors = {};
    const amountValue = parseFloat(form.amount);
    if (!form.amount || Number.isNaN(amountValue) || amountValue <= 0) {
      nextErrors.amount = "Enter an investment amount greater than $0.";
    }
    if (!form.cardName.trim()) {
      nextErrors.cardName = "Cardholder name is required.";
    }
    const cardDigits = form.cardNumber.replace(/\D/g, "");
    if (cardDigits.length < 13 || cardDigits.length > 19) {
      nextErrors.cardNumber = "Enter a valid card number.";
    }
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
      nextErrors.expiry = "Use MM/YY format.";
    }
    if (form.cvv.length < 3) {
      nextErrors.cvv = "Enter a valid CVV.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    setStatus("processing");
    setTimeout(() => {
      setReceipt({
        id: `TXN-${Date.now().toString(36).toUpperCase()}`,
        amount: parseFloat(form.amount),
        last4: form.cardNumber.replace(/\D/g, "").slice(-4),
        date: new Date().toLocaleString(),
      });
      setStatus("success");
    }, 1200);
  };

  if (!user) {
    return (
      <section className="relative min-h-screen px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
        <PageBackground />
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/40 bg-white/70 p-8 shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">
            No active session
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">
            Please sign in first
          </h1>
          <p className="mt-3 text-ink-600 dark:text-ink-300">
            Sign in or create an account to invest in this opportunity.
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-primary mt-6"
          >
            Go to sign in
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="relative min-h-screen px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
        <PageBackground />
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/40 bg-white/70 p-8 text-center shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
          <p className="text-ink-600 dark:text-ink-300">
            Loading opportunity details...
          </p>
        </div>
      </section>
    );
  }

  if (notFound || !deal) {
    return (
      <section className="relative min-h-screen px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
        <PageBackground />
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/40 bg-white/70 p-8 shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
            Opportunity not found
          </h1>
          <p className="mt-3 text-ink-600 dark:text-ink-300">
            This opportunity may have been removed or the link is invalid.
          </p>
          <button
            type="button"
            onClick={() => navigate("/deals")}
            className="btn-primary mt-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to deals
          </button>
        </div>
      </section>
    );
  }

  if (status === "success" && receipt) {
    return (
      <section className="relative min-h-screen px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
        <PageBackground />
        <div className="mx-auto max-w-xl">
          <div className="glass-panel-strong holo-card rounded-[2rem] p-8 text-center sm:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
              Investment confirmed
            </h1>
            <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
              You committed{" "}
              <span className="font-semibold text-ink-900 dark:text-ink-50">
                ${receipt.amount.toLocaleString()}
              </span>{" "}
              to {deal.company}.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-ink-100 bg-ink-50 p-5 text-left text-sm dark:border-ink-800 dark:bg-ink-900/60">
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">
                  Transaction ID
                </span>
                <span className="font-semibold text-ink-900 dark:text-ink-50">
                  {receipt.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">
                  Card ending in
                </span>
                <span className="font-semibold text-ink-900 dark:text-ink-50">
                  •••• {receipt.last4}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500 dark:text-ink-400">Date</span>
                <span className="font-semibold text-ink-900 dark:text-ink-50">
                  {receipt.date}
                </span>
              </div>
            </div>

            <p className="mt-5 text-xs text-ink-400 dark:text-ink-500">
              This is a demo confirmation — no real payment was processed.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn-primary"
              >
                Go to dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate("/deals")}
                className="btn-ghost"
              >
                Browse more deals
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8">
      <PageBackground />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-[-5rem] top-24 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute right-[-4rem] bottom-10 h-80 w-80 rounded-full bg-gold-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/deals")}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to deals
        </button>

        <div className="mb-8">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Secure checkout
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Invest in {deal.company}
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/80">
            Confirm your commitment amount and payment details to complete
            this investment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="glass-panel-strong holo-card rounded-[2rem] p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600/90 text-white shadow-soft">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">
                  Payment details
                </h2>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  All fields are required
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className={fieldLabelClassName}>
                  Investment amount (USD)
                </span>
                <div className={inputWrapperClassName}>
                  <span className="text-sm font-semibold text-ink-500">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="e.g., 5000"
                    className="w-full border-none bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.amount}
                  </p>
                )}
              </label>

              <label className="block">
                <span className={fieldLabelClassName}>Cardholder name</span>
                <div className={inputWrapperClassName}>
                  <User className="h-4 w-4 text-ink-400 shrink-0" />
                  <input
                    type="text"
                    name="cardName"
                    value={form.cardName}
                    onChange={handleChange}
                    placeholder="Name on card"
                    className="w-full border-none bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50"
                  />
                </div>
                {errors.cardName && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.cardName}
                  </p>
                )}
              </label>

              <label className="block">
                <span className={fieldLabelClassName}>Card number</span>
                <div className={inputWrapperClassName}>
                  <CreditCard className="h-4 w-4 text-ink-400 shrink-0" />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="cardNumber"
                    value={form.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full border-none bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50"
                  />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.cardNumber}
                  </p>
                )}
              </label>

              <div className="grid gap-4 grid-cols-2">
                <label className="block">
                  <span className={fieldLabelClassName}>Expiry</span>
                  <div className={inputWrapperClassName}>
                    <Calendar className="h-4 w-4 text-ink-400 shrink-0" />
                    <input
                      type="text"
                      inputMode="numeric"
                      name="expiry"
                      value={form.expiry}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      className="w-full border-none bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50"
                    />
                  </div>
                  {errors.expiry && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {errors.expiry}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className={fieldLabelClassName}>CVV</span>
                  <div className={inputWrapperClassName}>
                    <Lock className="h-4 w-4 text-ink-400 shrink-0" />
                    <input
                      type="text"
                      inputMode="numeric"
                      name="cvv"
                      value={form.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      className="w-full border-none bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50"
                    />
                  </div>
                  {errors.cvv && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {errors.cvv}
                    </p>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "processing"}
              className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              {status === "processing"
                ? "Processing..."
                : `Confirm investment${form.amount ? ` · $${form.amount}` : ""}`}
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400 dark:text-ink-500">
              <Lock className="h-3.5 w-3.5" />
              Demo checkout — no real payment is processed.
            </p>
          </form>

          <div className="glass-panel-strong holo-card rounded-[2rem] p-6 sm:p-8">
            <div className="overflow-hidden rounded-2xl h-40 bg-ink-100 dark:bg-ink-800">
              <img
                src={deal.image || DEFAULT_DEAL_IMAGE}
                alt={deal.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-5 flex items-center gap-2">
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
                {deal.sector}
              </span>
            </div>
            <h3 className="mt-3 font-display text-xl font-bold text-ink-900 dark:text-ink-50">
              {deal.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400">
              <Building2 className="h-3.5 w-3.5" />
              {deal.company}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
              <MapPin className="h-3.5 w-3.5" />
              {deal.location}
            </p>
            {deal.blurb && (
              <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                {deal.blurb}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-brand-50 p-3 text-center dark:bg-brand-400/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Funding goal
                </p>
                <p className="mt-1 font-display text-lg font-bold text-ink-900 dark:text-ink-50">
                  {deal.goal}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-50 p-3 text-center dark:bg-brand-400/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Timeline
                </p>
                <p className="mt-1 font-display text-lg font-bold text-ink-900 dark:text-ink-50">
                  {deal.timeline}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs text-brand-700 dark:border-brand-900/60 dark:bg-brand-950/40 dark:text-brand-300">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Your investment details are only used for this demo checkout.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
