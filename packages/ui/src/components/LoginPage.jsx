import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useState } from "react";

export default function LoginPage({ navigate }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.email === "admin@company.com" && form.password === "admin") {
      navigate("/admin");
      return;
    }

    const storedUsers = JSON.parse(
      localStorage.getItem("investbridgeUsers") || "[]",
    );
    const existingUser = storedUsers.find(
      (entry) => entry.email === form.email,
    );

    if (existingUser && existingUser.password === form.password) {
      localStorage.setItem(
        "investbridgeSessionUser",
        JSON.stringify(existingUser),
      );
      navigate("/profile");
      return;
    }

    setStatus(`Welcome back, ${form.email || "user"}!`);
  };

  return (
    <section className="auth-scene relative min-h-screen overflow-hidden px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(255,247,214,0.28),_transparent_30%),radial-gradient(circle_at_80%_15%,_rgba(255,255,255,0.16),_transparent_22%),linear-gradient(180deg,_rgba(15,23,42,0.18),_rgba(15,23,42,0.52))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-95 dark:opacity-85">
        <img
          src="/investBridge.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[center_34%]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-gold-200/30 blur-3xl" />
        <div className="absolute right-[-5rem] top-1/3 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center holo-scene">
        <div className="max-w-xl text-white drop-shadow-[0_8px_24px_rgba(15,23,42,0.5)]">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Sign in to your account
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Connect with opportunities on InvestBridge.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-100/90">
            Access your dashboard and manage your connections, projects, and
            opportunities.
          </p>

          <div className="glass-panel mt-8 rounded-3xl p-5 holo-card">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Why you'll love InvestBridge
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <li>• Connect with entrepreneurs and investors globally.</li>
              <li>• Discover and manage opportunities seamlessly.</li>
              <li>• Build meaningful relationships and grow your network.</li>
            </ul>
          </div>
        </div>

        <div className="glass-panel-strong w-full max-w-lg rounded-[2rem] p-8 holo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700">
                Welcome back
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-950 dark:text-white">
                Sign in
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
                Email address
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
                  placeholder="Enter your password"
                  className="w-full border-none bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </label>

            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-ink-300 text-brand-600"
                />
                Keep me signed in
              </label>
              <button
                type="button"
                className="font-medium text-brand-700 hover:text-brand-800"
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn-primary w-full">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {status && (
            <p className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
              {status}
            </p>
          )}

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-300">
            New here?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
