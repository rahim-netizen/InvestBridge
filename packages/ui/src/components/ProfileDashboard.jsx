import { CheckCircle2, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/auth";

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

const buildInitialForm = () => {
  return {
    fullName: "",
    companyName: "",
    industry: "",
    stage: "Pre-seed",
    location: "",
    mission: "",
    fundingGoal: "",
    website: "",
    company: "",
    focus: "",
    ticketSize: "",
    geography: "",
    sectors: "",
    notes: "",
  };
};

export default function ProfileDashboard({ navigate }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [form, setForm] = useState(() => buildInitialForm());
  const [status, setStatus] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isVerified = urlParams.get("verified") === "1";
    const email = urlParams.get("email");
    const name = urlParams.get("name");
    const id = urlParams.get("id");

    if (isVerified || email) {
      setStatus("Email verified successfully! Welcome to your profile creation page.");
    }

    async function checkSession() {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setForm(storedUser.profile ? { ...buildInitialForm(), ...storedUser.profile } : buildInitialForm());
        return;
      }

      if (isVerified || email) {
        const paramUser = { id: id || 1, email: email || "user@example.com", name: name || "User" };
        localStorage.setItem("investbridgeSessionUser", JSON.stringify(paramUser));
        setUser(paramUser);
        return;
      }

      const fetched = await getCurrentUser();
      if (fetched) {
        setUser(fetched);
        setForm(fetched.profile ? { ...buildInitialForm(), ...fetched.profile } : buildInitialForm());
      } else {
        setUser(null);
        navigate("/login");
      }
    }

    checkSession();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const savedUser = {
      ...user,
      profile: form,
      profileComplete: true,
    };

    const storedUsers = JSON.parse(
      localStorage.getItem("investbridgeUsers") || "[]",
    );
    const existingIndex = storedUsers.findIndex(
      (entry) => entry.email === user.email,
    );

    const nextUsers =
      existingIndex >= 0
        ? storedUsers.map((entry, index) =>
            index === existingIndex ? savedUser : entry,
          )
        : [...storedUsers, savedUser];

    localStorage.setItem("investbridgeSessionUser", JSON.stringify(savedUser));
    localStorage.setItem("investbridgeUsers", JSON.stringify(nextUsers));
    setStatus("Profile saved. Your dashboard is ready to go.");
    navigate("/");
  };

  const inputWrapperClassName =
    "flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 dark:border-ink-700 dark:bg-ink-800";
  const inputClassName =
    "w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50 dark:placeholder:text-ink-500";
  const fieldLabelClassName =
    "mb-2 block text-sm font-medium text-ink-700 dark:text-ink-300";

  if (!user) {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,97,255,0.16),_transparent_40%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300 dark:bg-gradient-to-br dark:from-ink-950 dark:to-ink-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/40 bg-white/70 p-8 shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">
            No active session
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">
            Please sign in first
          </h1>
          <p className="mt-3 text-ink-600 dark:text-ink-300">
            Your profile dashboard will appear after you sign in or create an
            account.
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

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(45,97,255,0.16),_transparent_40%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300 dark:bg-gradient-to-br dark:from-ink-950 dark:to-ink-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
        <div className="w-full max-w-xl rounded-3xl border border-white/40 bg-white/70 p-8 shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
          <span className="eyebrow dark:text-brand-400">
            <Sparkles className="h-3.5 w-3.5" />
            Complete your profile
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">
            Build your InvestBridge profile
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-ink-600 dark:text-ink-300">
            Share your background, interests, and expertise. Whether you're
            seeking opportunities or making connections, a complete profile
            helps you succeed on InvestBridge.
          </p>

          <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/60 dark:bg-brand-950/40">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                  Welcome back, {user.name || user.email}
                </p>
                <p className="text-sm text-ink-600 dark:text-ink-300">
                  We’ll use this profile to personalize your experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full rounded-3xl border border-white/40 bg-white/70 p-8 shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
          <div>
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">
              Profile dashboard
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
              Your information
            </h2>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className={fieldLabelClassName}>Full name</span>
              <div className={inputWrapperClassName}>
                <UserRound className="h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full border-none bg-transparent text-sm text-ink-900 outline-none dark:text-ink-50"
                />
              </div>
            </label>

            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900/60 dark:bg-brand-950/40">
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                Company information
              </p>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                Tell us about your company or firm
              </p>
            </div>

            <label className="block">
              <span className={fieldLabelClassName}>Company/Firm name</span>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Your company or firm name"
                className={inputClassName}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={fieldLabelClassName}>Industry or focus</span>
                <input
                  type="text"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="e.g., Healthtech, Fintech, SaaS"
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={fieldLabelClassName}>Stage</span>
                <select
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option>Pre-seed</option>
                  <option>Seed</option>
                  <option>Series A</option>
                  <option>Series B</option>
                  <option>Series C+</option>
                  <option>Growth</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={fieldLabelClassName}>Location</span>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={fieldLabelClassName}>Website</span>
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://yourcompany.com"
                  className={inputClassName}
                />
              </label>
            </div>

            <label className="block">
              <span className={fieldLabelClassName}>
                Mission or focus areas
              </span>
              <textarea
                name="mission"
                value={form.mission}
                onChange={handleChange}
                rows="3"
                placeholder="Describe your mission, what problems you solve, or your investment focus"
                className={inputClassName}
              />
            </label>

            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900/60 dark:bg-brand-950/40">
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                Investment details
              </p>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                Share your investment interests or funding goals
              </p>
            </div>

            <label className="block">
              <span className={fieldLabelClassName}>
                Funding goal or typical investment
              </span>
              <input
                type="text"
                name="fundingGoal"
                value={form.fundingGoal}
                onChange={handleChange}
                placeholder="e.g., $500k, $100k-$500k"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>
                Preferred sectors or types
              </span>
              <input
                type="text"
                name="sectors"
                value={form.sectors}
                onChange={handleChange}
                placeholder="e.g., AI, climate tech, fintech"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>
                Typical investment ticket size or check size
              </span>
              <input
                type="text"
                name="ticketSize"
                value={form.ticketSize}
                onChange={handleChange}
                placeholder="e.g., $500k, $100k-$1M"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>Geographic interests</span>
              <input
                type="text"
                name="geography"
                value={form.geography}
                onChange={handleChange}
                placeholder="e.g., US, MENA, Europe"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>
                Additional information
              </span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional details about your background, deal criteria, or connections"
                className={inputClassName}
              />
            </label>

            <button type="submit" className="btn-primary w-full">
              Save profile
            </button>
          </form>

          {status && (
            <p className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-900/60 dark:bg-brand-950/40 dark:text-brand-300">
              {status}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
