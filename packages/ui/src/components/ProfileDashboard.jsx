import { CheckCircle2, Sparkles, UserRound, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/auth";
import { updateProfile } from "../api/profile";

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
    profileImage: null,
    fullName: "",
    companyName: "",
    industry: "",
    position: "",
    website: "",
    mission: "",
    notes: "",
    companyPersonnelPhotos: [],
    nidPhotos: [],
  };
};

function mapBackendProfileToForm(backendProfile) {
  if (!backendProfile) return buildInitialForm();
  return {
    fullName: backendProfile.full_name || backendProfile.fullName || "",
    companyName: backendProfile.company_name || backendProfile.companyName || "",
    industry: backendProfile.industry || "",
    position: backendProfile.position || "",
    website: backendProfile.website || "",
    mission: backendProfile.mission || "",
    notes: backendProfile.notes || "",
    companyPersonnelPhotos: [],
    nidPhotos: [],
    profileImage: null,
  };
}

export default function ProfileDashboard({ navigate }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [form, setForm] = useState(() => buildInitialForm());
  const [status, setStatus] = useState("");
  const [hasCompanyInfo, setHasCompanyInfo] = useState(false);

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
        if (storedUser.profile) {
          const profile = mapBackendProfileToForm(storedUser.profile);
          if (profile.companyName || profile.industry || profile.position || profile.website || profile.mission) {
            setHasCompanyInfo(true);
          }
          setForm(profile);
          return;
        }
      }

      const fetched = await getCurrentUser();
      if (fetched) {
        setUser(fetched);
        const profile = fetched.profile ? mapBackendProfileToForm(fetched.profile) : buildInitialForm();
        if (profile.companyName || profile.industry || profile.position || profile.website || profile.mission) {
          setHasCompanyInfo(true);
        }
        setForm(profile);
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

  const handlePhotoChange = async (event, field) => {
    const files = Array.from(event.target.files || []);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        }),
    );

    const results = await Promise.all(readers);
    setForm((current) => ({ ...current, [field]: results }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const profilePayload = {
      full_name: form.fullName,
      company_name: form.companyName,
      industry: form.industry,
      position: form.position,
      website: form.website,
      mission: form.mission,
      notes: form.notes,
      profile_complete: true,
    };

    try {
      const response = await updateProfile(profilePayload);
      const savedUser = {
        ...user,
        ...(response.user || {}),
        profile: response.profile || form,
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
    } catch (err) {
      setStatus("Failed to save profile. Please try again.");
    }
  };

  const inputWrapperClassName =
    "flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 dark:border-ink-700 dark:bg-ink-800";
  const inputClassName =
    "w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50 dark:placeholder:text-ink-500";
  const fieldLabelClassName =
    "mb-2 block text-sm font-medium text-ink-700 dark:text-ink-300";
  const blurredClassName =
    "transition-all duration-200 " +
    (hasCompanyInfo
      ? "blur-0"
      : "blur-sm select-none pointer-events-none opacity-60");

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
            <div className="flex flex-col items-center">
              <label className="group relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="sr-only"
                />
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-ink-300 bg-ink-50 transition group-hover:border-brand-400 group-hover:bg-brand-50 dark:border-ink-600 dark:bg-ink-800 dark:group-hover:border-brand-500 dark:group-hover:bg-brand-900/20">
                  {form.profileImage ? (
                    <img
                      src={form.profileImage}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-ink-400 dark:text-ink-500">
                      <Camera className="h-6 w-6" />
                      <UserRound className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </label>
              <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
                Profile image (optional)
              </p>
            </div>

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

            <label className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 dark:border-ink-700 dark:bg-ink-800">
              <input
                type="checkbox"
                checked={hasCompanyInfo}
                onChange={(e) => setHasCompanyInfo(e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">
                Company information
              </span>
            </label>

            <div className={blurredClassName}>
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
                  <span className={fieldLabelClassName}>Position</span>
                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="Your position in the company"
                    className={inputClassName}
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
                  className={inputClassName}
                />
              </label>

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

              <label className="block">
                <span className={fieldLabelClassName}>
                  Company personnel photos
                </span>
                <p className="mb-2 text-xs text-ink-500 dark:text-ink-400">
                  Upload up to 2 photos
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoChange(e, "companyPersonnelPhotos")}
                  className="block w-full text-sm text-ink-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/40 dark:file:text-brand-300"
                />
                {(form.companyPersonnelPhotos || []).length > 0 && (
                  <div className="mt-3 flex gap-3">
                    {form.companyPersonnelPhotos.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`Company personnel ${idx + 1}`}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}
              </label>
            </div>

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

            <label className="block">
              <span className={fieldLabelClassName}>
                NID photos
              </span>
              <p className="mb-2 text-xs text-ink-500 dark:text-ink-400">
                Upload up to 2 photos
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoChange(e, "nidPhotos")}
                className="block w-full text-sm text-ink-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/40 dark:file:text-brand-300"
              />
              {(form.nidPhotos || []).length > 0 && (
                <div className="mt-3 flex gap-3">
                  {form.nidPhotos.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`NID ${idx + 1}`}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}
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
