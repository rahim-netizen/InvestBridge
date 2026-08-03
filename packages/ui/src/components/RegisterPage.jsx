import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { apiRegister } from "../api/auth";

export default function RegisterPage({ navigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bgImageError, setBgImageError] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const data = await apiRegister(form.name, form.email, form.password);
      setStatus(`Thanks, ${data.user?.name || form.name}! Your account is ready.`);
      setTimeout(() => {
        navigate("/profile");
      }, 600);
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
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
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="absolute right-[-4rem] top-16 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute left-[-5rem] bottom-12 h-72 w-72 rounded-full bg-gold-200/30 blur-3xl" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center holo-scene">
        <div className="max-w-xl text-white drop-shadow-[0_8px_24px_rgba(15,23,42,0.5)]">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Join InvestBridge
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Connect and grow your network.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-100/90">
            Create an account to discover opportunities, connect with founders
            and investors, and build meaningful relationships on InvestBridge.
          </p>

          <div className="glass-panel mt-8 rounded-3xl p-5 holo-card">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-brand-600/90 text-white shadow-soft backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  Trusted by modern teams
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Secure onboarding in minutes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel-strong w-full max-w-lg rounded-[2rem] p-8 holo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700">
                Create account
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-950 dark:text-white">
                Register
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="nav-link text-sm font-semibold text-ink-500 transition-colors hover:text-brand-700 dark:text-ink-100 dark:hover:text-brand-400"
            >
              Back home
            </button>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Full name
              </span>
              <div className="surface-rim flex items-center gap-3 rounded-2xl px-4 py-3">
                <UserRound className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Amina Rahman"
                  className="w-full border-none bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Work email
              </span>
              <div className="surface-rim flex items-center gap-3 rounded-2xl px-4 py-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                  className="w-full border-none bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </span>
              <div className="surface-rim flex items-center gap-3 rounded-2xl px-4 py-3">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password"
                  className="w-full border-none bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}

          {status && (
            <p className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
              {status}
            </p>
          )}

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-300">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
