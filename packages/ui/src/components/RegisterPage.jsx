import {
  ArrowRight,
  Building2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState } from "react";

export default function RegisterPage({ navigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Founder",
  });
  const [status, setStatus] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const storedUsers = JSON.parse(
      localStorage.getItem("investbridgeUsers") || "[]",
    );
    const existingUser = storedUsers.find(
      (entry) => entry.email === form.email,
    );

    const user = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      profileComplete: false,
    };

    if (!existingUser) {
      localStorage.setItem(
        "investbridgeUsers",
        JSON.stringify([...storedUsers, user]),
      );
    }

    localStorage.setItem("investbridgeSessionUser", JSON.stringify(user));
    setStatus(`Thanks, ${form.name || "there"}! Your account is ready to go.`);
    navigate("/profile");
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(45,97,255,0.16),_transparent_40%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] dark:bg-gradient-to-br dark:from-ink-950 dark:to-ink-900 px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Join InvestBridge
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
            Start building a stronger funding network.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-600">
            Create an account to pitch your startup, discover investors, or
            browse opportunities with confidence.
          </p>

          <div className="mt-8 rounded-2xl border border-brand-100 bg-white/80 p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  Trusted by modern teams
                </p>
                <p className="text-sm text-ink-500">
                  Secure onboarding in minutes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg rounded-3xl border border-ink-100 bg-white p-8 shadow-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700">
                Create account
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink-900">
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
              <span className="mb-2 block text-sm font-medium text-ink-700">
                Full name
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3">
                <UserRound className="h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Amina Rahman"
                  className="w-full border-none bg-transparent text-sm text-ink-900 outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-700">
                Work email
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
                  placeholder="Create a password"
                  className="w-full border-none bg-transparent text-sm text-ink-900 outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-700">
                I’m joining as
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3">
                <Building2 className="h-4 w-4 text-ink-400" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border-none bg-transparent text-sm text-ink-900 outline-none"
                >
                  <option>Entrepreneur</option>
                  <option>Investor</option>
                </select>
              </div>
            </label>

            <button type="submit" className="btn-primary w-full">
              Create account
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {status && (
            <p className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
              {status}
            </p>
          )}

          <div className="mt-6 text-center text-sm text-ink-500">
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
