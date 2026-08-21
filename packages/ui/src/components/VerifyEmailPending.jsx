import { ArrowRight, Clock, MailCheck, RefreshCw, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiResendVerification } from "../api/auth";

export default function VerifyEmailPending({ navigate }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bgImageError, setBgImageError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email") || localStorage.getItem("pendingVerificationEmail") || "user@example.com";
    setEmail(emailParam);

    if (params.get("error") === "expired") {
      setError("Your verification link has expired (links are valid for 5 minutes). Please click 'Resend Verification Link' below.");
    }
  }, []);

  const handleResend = async () => {
    if (!email) return;
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const data = await apiResendVerification(email);
      setStatus(data.message || `A new 5-minute verification link has been sent to ${email}.`);
    } catch (err) {
      setError(err.message || "Failed to resend verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-scene relative min-h-screen overflow-hidden px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,_rgba(255,247,214,0.28),_transparent_30%),radial-gradient(circle_at_18%_80%,_rgba(255,255,255,0.16),_transparent_22%),linear-gradient(180deg,_rgba(15,23,42,0.18),_rgba(15,23,42,0.52))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-95 dark:opacity-85">
        {!bgImageError ? (
          <img
            src="/investBridge.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-[center_34%]"
            onError={() => setBgImageError(true)}
          />
        ) : (
          <div className="h-full w-full bg-ink-950 flex items-center justify-center">
            <span className="text-ink-500 text-xs">Image unavailable</span>
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />
      
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center text-center">
        <motion.div
          className="glass-panel-strong w-full max-w-xl rounded-[2.5rem] p-8 sm:p-10 holo-card"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-200/50 bg-brand-50 text-brand-600 shadow-soft backdrop-blur-sm dark:border-brand-800/40 dark:bg-brand-950/50 dark:text-brand-400"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "backOut" }}
          >
            <MailCheck className="h-8 w-8" />
          </motion.div>

          <span className="eyebrow mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            Verification Required
          </span>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Verify Your Email
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Please verify your email address. We sent a link to{" "}
            <span className="font-semibold text-slate-950 dark:text-white">{email}</span>.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300">
            <Clock className="h-4 w-4 shrink-0" />
            <span>The link will expire in 5 minutes. No session cookie will be issued until verified.</span>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
              >
                {error}
              </motion.p>
            )}

            {status && (
              <motion.p
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 dark:border-brand-900/50 dark:bg-brand-950/40 dark:text-brand-300"
              >
                {status}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-8 flex flex-col gap-3">
            <motion.button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Sending new link..." : "Resend Verification Link"}
            </motion.button>

            <motion.button
              type="button"
              onClick={() => navigate("/login")}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/80 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Already verified? Sign in
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
