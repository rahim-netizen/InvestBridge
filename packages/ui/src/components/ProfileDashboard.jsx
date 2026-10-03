import { Check, Upload } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import PageDecor from "./PageDecor.jsx";
import { getCurrentUser, setAuthToken, onAuthChange } from "../api/auth";
import { updateProfile } from "../api/profile";
import { isInvestorProfileComplete } from "../lib/profileCompletion.js";

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

function resizeImage(file, maxDim = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function toPhotoArray(value) {
  return Array.isArray(value) ? value : [];
}

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
    companyPersonnelPhotos: toPhotoArray(backendProfile.company_personnel_photos),
    nidPhotos: toPhotoArray(backendProfile.nid_photos),
    profileImage: backendProfile.profile_image || null,
  };
}

const panelClassName =
  "rounded-[28px] border border-white/10 bg-[rgba(5,9,15,0.55)] backdrop-blur";
const inputClassName =
  "h-11 w-full rounded-xl border border-white/[0.12] bg-[rgba(5,9,15,0.5)] px-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)] focus-visible:border-brand-500 focus-visible:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]";
const labelClassName = "flex flex-col gap-1.5 text-[13px] font-semibold text-white/85";
const kickerClassName = "text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300";
const subClassName = "mt-1.5 text-[13px] text-white/60";
const sectionClassName = "flex scroll-mt-24 flex-col gap-4 border-t border-white/[0.08] pt-7";

function Field({ label, textarea = false, ...rest }) {
  return (
    <label className={labelClassName}>
      {label}
      {textarea ? (
        <textarea
          rows={3}
          {...rest}
          className={`${inputClassName} h-auto resize-y py-3 font-normal leading-relaxed`}
        />
      ) : (
        <input {...rest} className={`${inputClassName} font-normal`} />
      )}
    </label>
  );
}

// Dashed image slot; shows the picked image with a "Replace" tag once filled.
function DropZone({ label, src, onFile, tone = "emerald" }) {
  const toneClass =
    tone === "gold"
      ? "border-amber-400/40 bg-amber-400/[0.05] text-amber-300 hover:border-amber-400/70"
      : "border-brand-500/40 bg-brand-500/[0.05] text-brand-300 hover:border-brand-500/70";
  return (
    <label
      className={`relative flex h-24 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-[14px] border border-dashed text-[13px] font-semibold transition-colors ${toneClass}`}
    >
      {src ? (
        <>
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute bottom-2 left-2 rounded-full bg-[rgba(5,9,15,0.75)] px-2 py-0.5 text-[11px] font-semibold text-white">
            Replace
          </span>
        </>
      ) : (
        <>
          <span className="inline-flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            {label}
          </span>
          <span className="text-[11px] font-normal text-white/50">JPG or PNG</span>
        </>
      )}
      <input
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(event) => onFile(event.target.files?.[0] || null)}
      />
    </label>
  );
}

function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex items-center gap-2.5 text-[13px] font-medium text-white/80"
    >
      {label}
      <span
        className={`relative h-[22px] w-10 rounded-full transition-colors duration-200 ${
          on ? "bg-brand-500" : "bg-white/[0.18]"
        }`}
      >
        <span
          className={`absolute top-[3px] h-4 w-4 rounded-full bg-[#e9e9ed] transition-[left] duration-200 ${
            on ? "left-[21px]" : "left-[3px]"
          }`}
        />
      </span>
    </button>
  );
}

export default function ProfileDashboard({ onOpenDeals, onOpenConnect, onOpenPayment, navigate }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [form, setForm] = useState(() => {
    const stored = getStoredUser();
    if (stored?.profile) return mapBackendProfileToForm(stored.profile);
    const initial = buildInitialForm();
    if (stored?.name) initial.fullName = stored.name;
    return initial;
  });
  const [status, setStatus] = useState("");
  const [hasCompanyInfo, setHasCompanyInfo] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isVerified = urlParams.get("verified") === "1";
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    const name = urlParams.get("name");
    const id = urlParams.get("id");

    if (token) {
      setAuthToken(token);
    }

    if (isVerified || email) {
      setStatus("Email verified successfully! Welcome to your profile creation page.");
    }

    async function checkSession() {
      const storedUser = getStoredUser();

      // Trust the client-side session that the rest of the app relies on. A
      // verified user is only ever stored here after a successful login, so its
      // presence means we are authenticated. We only bounce to sign in when
      // there is no session at all (neither a stored user nor a server session).
      if (storedUser) {
        setUser(storedUser);
        if (storedUser.profile) {
          const profile = mapBackendProfileToForm(storedUser.profile);
          if (profile.companyName || profile.industry || profile.position || profile.website || profile.mission) {
            setHasCompanyInfo(true);
          }
          setForm(profile);
        } else if (storedUser.name) {
          setForm((prev) => ({ ...prev, fullName: storedUser.name }));
        }
      }

      const fetched = await getCurrentUser();
      if (fetched) {
        setUser(fetched);
        const profile = fetched.profile ? mapBackendProfileToForm(fetched.profile) : buildInitialForm();
        if (!fetched.profile && fetched.name) {
          profile.fullName = fetched.name;
        }
        if (profile.companyName || profile.industry || profile.position || profile.website || profile.mission) {
          setHasCompanyInfo(true);
        }
        setForm(profile);
      } else if (!storedUser) {
        setUser(null);
        setForm(buildInitialForm());
        navigate("/login");
      }
    }

    checkSession();

    const unsubscribe = onAuthChange((event) => {
      if (event.type === "LOGOUT") {
        setUser(null);
        setForm(buildInitialForm());
        navigate("/login");
      } else if (event.type === "LOGIN") {
        checkSession();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await resizeImage(file);
    setForm((current) => ({ ...current, profileImage: dataUrl }));
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
      profile_image: form.profileImage,
      company_personnel_photos: form.companyPersonnelPhotos || [],
      nid_photos: form.nidPhotos || [],
      profile_complete: isInvestorProfileComplete({
        ...form,
        hasCompanyInfo,
      }),
    };

    try {
      const response = await updateProfile(profilePayload);
      const savedUser = {
        ...user,
        ...(response.user || {}),
        profile: response.profile || form,
        profileComplete: Boolean(response.profile?.profile_complete),
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
      const profileComplete = Boolean(response.profile?.profile_complete);
      if (profileComplete) {
        setStatus("Profile saved. Your dashboard is ready to go.");
        navigate("/dashboard");
      } else {
        setStatus("Profile saved. Complete the remaining details to unlock your dashboard.");
      }
    } catch (err) {
      setStatus(err.message || "Failed to save profile. Please try again.");
    }
  };

  const setPhotoAt = (field, index) => async (file) => {
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      setForm((current) => {
        const photos = [...toPhotoArray(current[field])];
        photos[index] = dataUrl;
        return { ...current, [field]: photos.slice(0, 2) };
      });
    } catch {
      // keep the previous photo if the file can't be read
    }
  };

  if (!user) {
    return (
      <section className="dark relative min-h-screen px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
        <PageBackground image={false} gradient={AURORA_BG} />
        <PageDecor />
        <div className={`mx-auto max-w-2xl p-8 ${panelClassName}`}>
          <p className={kickerClassName}>No active session</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Please sign in first</h1>
          <p className="mt-3 text-white/65">
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

  const fullName = (form.fullName || "").trim();
  const personnelPhotos = toPhotoArray(form.companyPersonnelPhotos);
  const nidPhotos = toPhotoArray(form.nidPhotos);
  const nidDone = Boolean(nidPhotos[0] && nidPhotos[1]);
  const companyDone = Boolean(form.companyName?.trim() && form.position?.trim());

  const sections = [
    { id: "about", label: "About you", done: Boolean(fullName), note: fullName ? "Done" : "1 field" },
    {
      id: "company",
      label: "Company",
      done: !hasCompanyInfo || companyDone,
      note: hasCompanyInfo ? (companyDone ? "Done" : "Add details") : "Skipped",
    },
    {
      id: "investment",
      label: "Investment details",
      done: Boolean(form.notes?.trim()),
      note: form.notes?.trim() ? "Done" : "1 field",
    },
    { id: "verify", label: "Verification", done: nidDone, note: nidDone ? "Done" : "NID" },
  ];
  const pct = Math.round((sections.filter((s) => s.done).length / sections.length) * 100);
  const firstName = fullName.split(/\s+/)[0] || user.name || "there";
  const initialLetter = (fullName[0] || user.email?.[0] || "?").toUpperCase();

  const jumpTo = (id) => (event) => {
    event.preventDefault();
    document.getElementById(`profile-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="dark relative min-h-screen px-4 py-20 sm:px-6 lg:px-8 transition-colors duration-300">
      <PageBackground image={false} gradient={AURORA_BG} />
      <PageDecor />
      <div className="mx-auto grid max-w-6xl items-start gap-7 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* Left rail: welcome, strength meter, section checklist */}
        <motion.aside
          className={`flex flex-col gap-5 p-6 sm:p-7 lg:sticky lg:top-24 ${panelClassName}`}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="self-start rounded-full bg-brand-500/[0.14] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
            Complete your profile
          </span>
          <div>
            <h1 className="text-[26px] font-semibold leading-tight text-white">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-white/65 [text-wrap:pretty]">
              A complete profile gets you matched faster and helps investors and
              founders trust who they&apos;re talking to.
            </p>
          </div>
          <div>
            <div className="flex justify-between text-[13px] font-medium text-white/70">
              <span>Profile strength</span>
              <span className="font-semibold text-amber-400">{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400 transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#profile-${s.id}`}
                onClick={jumpTo(s.id)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/[0.04]"
              >
                <span
                  className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
                    s.done
                      ? "border-brand-500 bg-brand-500 text-[#05090f]"
                      : "border-white/25 text-white/60"
                  }`}
                >
                  {s.done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                {s.label}
                <span className="ml-auto text-xs font-normal text-white/45">{s.note}</span>
              </a>
            ))}
          </nav>
        </motion.aside>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className={`flex flex-col gap-8 p-6 sm:p-8 ${panelClassName}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <AnimatePresence>
            {status && (
              <motion.p
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-brand-500/25 bg-brand-500/[0.08] px-4 py-3 text-sm text-brand-200"
              >
                {status}
              </motion.p>
            )}
          </AnimatePresence>

          <div id="profile-about" className="flex scroll-mt-24 flex-col gap-4">
            <p className={kickerClassName}>01 · About you</p>
            <div className="flex items-center gap-5">
              <span className="grid h-[76px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-full border border-dashed border-brand-500/50 bg-brand-500/[0.08] text-2xl font-semibold text-brand-300">
                {form.profileImage ? (
                  <img src={form.profileImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  initialLetter
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Profile photo</p>
                <p className="mb-2.5 mt-1 text-xs text-white/55">
                  Optional. A square JPG or PNG works best.
                </p>
                <label className="inline-block cursor-pointer rounded-full border border-white/[0.14] px-3.5 py-[7px] text-xs font-semibold text-white/85 transition-colors hover:border-white/30">
                  {form.profileImage ? "Change photo" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={handleProfileImageChange}
                  />
                </label>
              </div>
            </div>
            <Field
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>

          <div id="profile-company" className={sectionClassName}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-[200px] flex-1">
                <p className={kickerClassName}>02 · Company</p>
                <p className={subClassName}>Tell us about the company or firm you represent.</p>
              </div>
              <Switch on={hasCompanyInfo} onChange={setHasCompanyInfo} label="I represent a company" />
            </div>
            {hasCompanyInfo && (
              <>
                <Field
                  label="Company / firm name"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="e.g. NovaVet AI"
                />
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field
                    label="Industry or focus"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    placeholder="e.g. HealthTech, FinTech"
                  />
                  <Field
                    label="Your position"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="e.g. Co-founder, Partner"
                  />
                </div>
                <Field
                  label="Website"
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://yourcompany.com"
                />
                <Field
                  label="Mission or focus areas"
                  textarea
                  name="mission"
                  value={form.mission}
                  onChange={handleChange}
                  placeholder="What problems you solve, or your investment focus"
                />
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-semibold text-white/85">
                    Team photos <span className="font-normal text-white/50">· up to 2</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <DropZone label="Add photo" src={personnelPhotos[0]} onFile={setPhotoAt("companyPersonnelPhotos", 0)} />
                    <DropZone label="Second photo" src={personnelPhotos[1]} onFile={setPhotoAt("companyPersonnelPhotos", 1)} />
                  </div>
                </div>
              </>
            )}
          </div>

          <div id="profile-investment" className={sectionClassName}>
            <div>
              <p className={kickerClassName}>03 · Investment details</p>
              <p className={subClassName}>Your investment interests or funding goals.</p>
            </div>
            <Field
              label="Additional information"
              textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Background, deal criteria, ticket size or connections"
            />
          </div>

          <div id="profile-verify" className={sectionClassName}>
            <div>
              <p className={kickerClassName}>04 · Verification</p>
              <p className={subClassName}>Upload the front and back of your National ID.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DropZone label="NID front" tone="gold" src={nidPhotos[0]} onFile={setPhotoAt("nidPhotos", 0)} />
              <DropZone label="NID back" tone="gold" src={nidPhotos[1]} onFile={setPhotoAt("nidPhotos", 1)} />
            </div>
            <p className="flex gap-2.5 rounded-xl bg-amber-400/[0.07] px-3.5 py-3 text-xs leading-relaxed text-white/75">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
              Only the InvestBridge verification team can see this. It&apos;s never
              shown on your public profile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-5">
            <span className="text-[13px] text-white/55">You can come back and finish this later.</span>
            <button
              type="submit"
              className="ml-auto rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-[#05090f] transition-colors hover:bg-brand-400"
            >
              Save profile
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
