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
      navigate("adminPage");
      return;
    }

    setStatus(`Welcome back, ${form.email || "investor"}!`);
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,97,255,0.16),_transparent_40%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] dark:bg-gradient-to-br dark:from-ink-950 dark:to-ink-900 px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Sign in to your account
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
            Unlock your next investment opportunity.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-600">
            Access your dashboard, track raised capital, and stay close to the
            startups that matter.
          </p>

          <div className="mt-8 rounded-2xl border border-brand-100 bg-white/80 p-5 shadow-soft">
            <p className="text-sm font-semibold text-ink-900">
              Why founders love InvestBridge
            </p>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li>• Review investor activity in real time.</li>
              <li>• Securely manage your round and documents.</li>
              <li>• Stay updated with warm introductions and momentum.</li>
            </ul>
          </div>
        </div>

        <div className="w-full max-w-lg rounded-3xl border border-ink-100 bg-white p-8 shadow-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700">
                Welcome back
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink-900">
                Sign in
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm font-semibold text-ink-500 transition-colors hover:text-brand-700"
            >
              Back home
            </button>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-700">
                Email address
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3">
                <Mail className="h-4 w-4 text-ink-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                  className="w-full border-none bg-transparent text-sm text-ink-900 outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-700">
                Password
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3">
                <LockKeyhole className="h-4 w-4 text-ink-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full border-none bg-transparent text-sm text-ink-900 outline-none"
                />
              </div>
            </label>

            <div className="flex items-center justify-between text-sm text-ink-500">
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

          <div className="mt-6 text-center text-sm text-ink-500">
            New here?{" "}
            <button
              type="button"
              onClick={() => navigate("register")}
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
