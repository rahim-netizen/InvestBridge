import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import GradientText from "./GradientText.jsx";
import { getAllOpportunities, initiateInvestment, getCheckpoints } from "../api/opportunities";
import { fadeUpBlur } from "../lib/motion.jsx";

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
  status: opp.status || "Active",
  blurb: opp.description || "",
  timeline: opp.timeline || "TBD",
  image: opp.image || null,
  postedBy: opp.user?.email || null,
});

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

  const [checkpoints, setCheckpoints] = useState([
    { title: "", description: "", amount: "" },
  ]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | processing | success
  const [paymentReturn, setPaymentReturn] = useState(null);
  const [savedCheckpoints, setSavedCheckpoints] = useState([]);
  const [showProgress, setShowProgress] = useState(false);

  const totalAmount = checkpoints.reduce(
    (sum, cp) => sum + (parseFloat(cp.amount) || 0),
    0,
  );

  const canPay = (deal?.status || "").toLowerCase() === "progress";

  const hasInvested = Boolean(user) && savedCheckpoints.some(
    (cp) => String(cp.investor_id) === String(user.id),
  );

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const returnStatus = params.get("status");
    if (returnStatus) {
      setPaymentReturn({
        status: returnStatus,
        tranId: params.get("tran_id"),
      });
    }
  }, [location.search]);

  useEffect(() => {
    if (!deal) return;
    getCheckpoints(deal.id)
      .then((data) => setSavedCheckpoints(data.checkpoints || []))
      .catch(() => setSavedCheckpoints([]));
  }, [deal]);

  const handleCheckpointChange = (index, field, rawValue) => {
    const value =
      field === "amount" ? rawValue.replace(/[^0-9.]/g, "") : rawValue;
    setCheckpoints((current) =>
      current.map((cp, i) =>
        i === index ? { ...cp, [field]: value } : cp,
      ),
    );
  };

  const addCheckpoint = () => {
    setCheckpoints((current) =>
      current.length >= 5
        ? current
        : [...current, { title: "", description: "", amount: "" }],
    );
  };

  const removeCheckpoint = (index) => {
    setCheckpoints((current) =>
      current.length > 1 ? current.filter((_, i) => i !== index) : current,
    );
  };

  const validate = () => {
    const nextErrors = {};
    checkpoints.forEach((cp, i) => {
      if (!cp.title.trim()) {
        nextErrors[`title-${i}`] = "Checkpoint title is required.";
      }
      const amountValue = parseFloat(cp.amount);
      if (!cp.amount || Number.isNaN(amountValue) || amountValue <= 0) {
        nextErrors[`amount-${i}`] = "Enter an amount greater than $0.";
      }
    });
    if (totalAmount <= 0) {
      nextErrors.total = "Add at least one checkpoint with an amount.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canPay) {
      setErrors((current) => ({
        ...current,
        total: "Investment is only allowed for opportunities that are in progress.",
      }));
      return;
    }
    if (!validate()) return;

    setStatus("processing");
    try {
      const data = await initiateInvestment(deal.id, checkpoints);
      if (data.gateway_url) {
        // Send the current tab to the SSLCommerz gateway. After payment it
        // redirects back to the SPA, which shows the result modal in-page.
        window.location.href = data.gateway_url;
        return;
      }
      throw new Error("Payment gateway did not respond.");
    } catch (error) {
      setErrors((current) => ({
        ...current,
        total: error.message || "Failed to start payment.",
      }));
      setStatus("idle");
    }
  };

  if (!user) {
    return (
      <section className="dark relative min-h-screen px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
        <PageBackground image={false} gradient={AURORA_BG} />
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
      <section className="dark relative min-h-screen px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
        <PageBackground image={false} gradient={AURORA_BG} />
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
      <section className="dark relative min-h-screen px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
        <PageBackground image={false} gradient={AURORA_BG} />
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

  if (paymentReturn?.status === "success") {
    return (
      <div className="dark fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-[1.75rem] border border-white/40 bg-white/95 p-6 text-center shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/95">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-ink-900 dark:text-ink-50">
            Payment successful
          </h2>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
            You invested in{" "}
            <span className="font-semibold text-ink-900 dark:text-ink-50">
              {deal.name}
            </span>{" "}
            successfully.
          </p>
          {paymentReturn.tranId && (
            <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">
              Transaction: {paymentReturn.tranId}
            </p>
          )}

          {savedCheckpoints.length > 0 && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-ink-100 text-left dark:border-ink-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500 dark:bg-ink-900/60 dark:text-ink-400">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                  {savedCheckpoints.map((cp, index) => (
                    <tr key={cp.id || index}>
                      <td className="px-3 py-2 text-ink-400">{index + 1}</td>
                      <td className="px-3 py-2 font-medium text-ink-900 dark:text-ink-50">
                        {cp.title}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-ink-900 dark:text-ink-50">
                        ${(parseFloat(cp.amount) || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
    );
  }

  if (paymentReturn?.status === "fail" || paymentReturn?.status === "cancel") {
    const cancelled = paymentReturn.status === "cancel";
    return (
      <section className="dark relative min-h-screen px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
        <PageBackground image={false} gradient={AURORA_BG} />
        <div className="mx-auto max-w-xl">
          <motion.div
            className="glass-panel-strong holo-card rounded-[2rem] p-8 text-center sm:p-10"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
              {cancelled ? "Payment cancelled" : "Payment failed"}
            </h1>
            <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
              {cancelled
                ? "You cancelled the payment. No checkpoints were saved."
                : "The payment could not be completed. No checkpoints were saved."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/payment/${deal.id}`)}
                className="btn-primary"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => navigate("/deals")}
                className="btn-ghost"
              >
                Browse more deals
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="dark relative min-h-screen overflow-hidden px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8">
      <PageBackground image={false} gradient={AURORA_BG} />
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

        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeUpBlur}>
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Secure checkout
          </span>
          <h1 className="mt-4">
            <GradientText
              colors={["#10b981", "#fbbf24", "#10b981"]}
              animationSpeed={5}
              direction="horizontal"
              className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              Invest in {deal.company}
            </GradientText>
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/80">
            Add one or more checkpoints with a title, description, and amount
            to complete this investment.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          {hasInvested ? (
            <div className="glass-panel-strong holo-card rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600/90 text-white shadow-soft">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">
                    Already invested
                  </h2>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    You have committed to this opportunity
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProgress((value) => !value)}
                className="btn-primary mt-6 w-full"
              >
                {showProgress ? "Hide progress" : "Progress"}
              </button>

              {showProgress && savedCheckpoints.length > 0 && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500 dark:bg-ink-900/60 dark:text-ink-400">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                      {savedCheckpoints.map((cp, index) => (
                        <tr key={cp.id || index}>
                          <td className="px-4 py-3 text-ink-400">{index + 1}</td>
                          <td className="px-4 py-3 font-medium text-ink-900 dark:text-ink-50">
                            {cp.title}
                          </td>
                          <td className="px-4 py-3 text-ink-600 dark:text-ink-300">
                            {cp.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-ink-900 dark:text-ink-50">
                            ${(parseFloat(cp.amount) || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="glass-panel-strong holo-card rounded-[2rem] p-6 sm:p-8"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600/90 text-white shadow-soft">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">
                  Investment checkpoints
                </h2>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Add a title, description, and amount per checkpoint
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {checkpoints.map((cp, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4 dark:border-ink-800 dark:bg-ink-900/40"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Checkpoint {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCheckpoint(index)}
                      disabled={checkpoints.length === 1}
                      className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 transition-colors hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-rose-400 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="block">
                      <span className={fieldLabelClassName}>Title</span>
                      <input
                        type="text"
                        value={cp.title}
                        onChange={(event) =>
                          handleCheckpointChange(
                            index,
                            "title",
                            event.target.value,
                          )
                        }
                        placeholder="e.g., Seed round milestone"
                        className={inputClassName}
                      />
                      {errors[`title-${index}`] && (
                        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                          {errors[`title-${index}`]}
                        </p>
                      )}
                    </label>

                    <label className="block">
                      <span className={fieldLabelClassName}>Description</span>
                      <textarea
                        rows={3}
                        value={cp.description}
                        onChange={(event) =>
                          handleCheckpointChange(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="What this checkpoint represents"
                        className={`${inputClassName} resize-none`}
                      />
                    </label>

                    <label className="block">
                      <span className={fieldLabelClassName}>Amount (USD)</span>
                      <div className={inputWrapperClassName}>
                        <span className="text-sm font-semibold text-ink-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={cp.amount}
                          onChange={(event) =>
                            handleCheckpointChange(
                              index,
                              "amount",
                              event.target.value,
                            )
                          }
                          placeholder="e.g., 5000"
                          className="w-full border-none bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50"
                        />
                      </div>
                      {errors[`amount-${index}`] && (
                        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                          {errors[`amount-${index}`]}
                        </p>
                      )}
                    </label>
                  </div>
                </div>
              ))}

              {errors.total && (
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  {errors.total}
                </p>
              )}

              <button
                type="button"
                onClick={addCheckpoint}
                disabled={checkpoints.length >= 5}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-300"
              >
                <Plus className="h-4 w-4" />
                {checkpoints.length >= 5 ? "Maximum 5 checkpoints" : "Add checkpoint"}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={status === "processing" || !canPay}
              className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={status === "processing" || !canPay ? {} : { y: -2 }}
              whileTap={status === "processing" || !canPay ? {} : { scale: 0.98 }}
            >
              <ShieldCheck className="h-4 w-4" />
              {status === "processing"
                ? "Processing..."
                : `Confirm investment${totalAmount ? ` · $${totalAmount.toLocaleString()}` : ""}`}
            </motion.button>

            {!canPay && (
              <p className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-medium text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                Investment is only allowed for opportunities that are in progress.
              </p>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400 dark:text-ink-500">
              <Lock className="h-3.5 w-3.5" />
              Demo checkout — no real payment is processed.
            </p>
          </motion.form>
          )}

          <motion.div
            className="glass-panel-strong holo-card rounded-[2rem] p-6 sm:p-8"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
