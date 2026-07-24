import { CheckCircle2, Compass, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

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

const buildInitialForm = (role) => {
  if (role === "Investor") {
    return {
      fullName: "",
      company: "",
      focus: "",
      ticketSize: "",
      geography: "",
      sectors: "",
      notes: "",
    };
  }

  return {
    fullName: "",
    companyName: "",
    industry: "",
    stage: "Pre-seed",
    location: "",
    mission: "",
    fundingGoal: "",
    website: "",
  };
};

export default function ProfileDashboard({ navigate }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [form, setForm] = useState(() =>
    buildInitialForm(getStoredUser()?.role || "Entrepreneur"),
  );
  const [status, setStatus] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      setUser(null);
      return;
    }

    setUser(storedUser);
    setForm(
      storedUser.profile
        ? {
            ...buildInitialForm(storedUser.role || "Entrepreneur"),
            ...storedUser.profile,
          }
        : buildInitialForm(storedUser.role || "Entrepreneur"),
    );
  }, []);

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
      role: user.role || "Entrepreneur",
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

  const isInvestor = (user?.role || "Entrepreneur") === "Investor";
  const inputWrapperClassName =
    "flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 dark:border-ink-700 dark:bg-ink-800";
  const inputClassName =
    "w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50 dark:placeholder:text-ink-500";
  const fieldLabelClassName =
    "mb-2 block text-sm font-medium text-ink-700 dark:text-ink-300";

  if (!user) {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,97,255,0.16),_transparent_40%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300 dark:bg-gradient-to-br dark:from-ink-950 dark:to-ink-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-ink-100 bg-white p-8 shadow-lift dark:border-ink-800 dark:bg-ink-900 dark:text-ink-50">
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
        <div className="w-full max-w-xl rounded-3xl border border-ink-100 bg-white/90 p-8 shadow-lift dark:border-ink-800 dark:bg-ink-900/90 dark:text-ink-50">
          <span className="eyebrow dark:text-brand-400">
            <Sparkles className="h-3.5 w-3.5" />
            Complete your profile
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">
            {isInvestor ? "Investor profile" : "Founder profile"}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-ink-600 dark:text-ink-300">
            {isInvestor
              ? "Tell us where you invest, your typical check size, and the companies you are excited to back."
              : "Share your company story, stage, and funding goals so investors can connect with you faster."}
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

        <div className="w-full rounded-3xl border border-ink-100 bg-white p-8 shadow-lift dark:border-ink-800 dark:bg-ink-900 dark:text-ink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">
                Profile dashboard
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                {isInvestor ? "Investor details" : "Startup details"}
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-ink-100 px-3 py-2 text-sm font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200">
              <Compass className="h-4 w-4" />
              {user.role}
            </div>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {isInvestor ? (
              <>
                <label className="block">
                  <span className={fieldLabelClassName}>Your name</span>
                  <div className={inputWrapperClassName}>
                    <UserRound className="h-4 w-4 text-ink-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Aisha Malik"
                      className="w-full border-none bg-transparent text-sm text-ink-900 outline-none"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={fieldLabelClassName}>Firm or fund</span>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                    placeholder="Northstar Capital"
                    className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                  />
                </label>

                <label className="block">
                  <span className={fieldLabelClassName}>Investment focus</span>
                  <input
                    type="text"
                    name="focus"
                    value={form.focus}
                    onChange={handleChange}
                    required
                    placeholder="Fintech, climate, SaaS"
                    className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className={fieldLabelClassName}>
                      Typical check size
                    </span>
                    <input
                      type="text"
                      name="ticketSize"
                      value={form.ticketSize}
                      onChange={handleChange}
                      required
                      placeholder="$100k - $500k"
                      className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className={fieldLabelClassName}>Geography</span>
                    <input
                      type="text"
                      name="geography"
                      value={form.geography}
                      onChange={handleChange}
                      required
                      placeholder="US, MENA, Europe"
                      className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className={fieldLabelClassName}>Preferred sectors</span>
                  <input
                    type="text"
                    name="sectors"
                    value={form.sectors}
                    onChange={handleChange}
                    required
                    placeholder="AI infrastructure, healthtech"
                    className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                  />
                </label>

                <label className="block">
                  <span className={fieldLabelClassName}>Notes</span>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Share any deal criteria, favorite founders, or follow-on preferences."
                    className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className={fieldLabelClassName}>Founder name</span>
                  <div className={inputWrapperClassName}>
                    <UserRound className="h-4 w-4 text-ink-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Salma Noor"
                      className="w-full border-none bg-transparent text-sm text-ink-900 outline-none"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={fieldLabelClassName}>Company name</span>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    required
                    placeholder="BrightPath Labs"
                    className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className={fieldLabelClassName}>Industry</span>
                    <input
                      type="text"
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      required
                      placeholder="Healthtech"
                      className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className={fieldLabelClassName}>Stage</span>
                    <select
                      name="stage"
                      value={form.stage}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                    >
                      <option>Pre-seed</option>
                      <option>Seed</option>
                      <option>Series A</option>
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
                      required
                      placeholder="London, UK"
                      className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className={fieldLabelClassName}>Funding goal</span>
                    <input
                      type="text"
                      name="fundingGoal"
                      value={form.fundingGoal}
                      onChange={handleChange}
                      required
                      placeholder="$750k"
                      className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className={fieldLabelClassName}>Website</span>
                  <input
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://yourcompany.com"
                    className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                  />
                </label>

                <label className="block">
                  <span className={fieldLabelClassName}>Mission</span>
                  <textarea
                    name="mission"
                    value={form.mission}
                    onChange={handleChange}
                    rows="4"
                    placeholder="What problem are you solving and why now?"
                    className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none"
                  />
                </label>
              </>
            )}

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
