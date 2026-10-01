import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  PenLine,
  Sparkles,
  Star,
  TrendingUp,
  DollarSign,
  Target,
  Briefcase,
  Globe,
  Upload,
  Plus,
  X,
  Trash2,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import PageDecor from "./PageDecor.jsx";
import GradientText from "./GradientText.jsx";
import { createOpportunity, deleteOpportunity, getMyOpportunities } from "../api/opportunities";
import { getConnectionsForOpportunity } from "../api/connected";
import { fadeUp, fadeUpBlur, stagger } from "../lib/motion.jsx";
import {
  FilterChip,
  FilterPopover,
  IconSearchToggle,
  PopoverSelect,
} from "./FilterControls.jsx";
import {
  FormSection,
  OPEN_FOR_DAYS,
  formInputClassName,
  formLabelClassName,
  panelClassName,
} from "./OpportunityFormParts.jsx";

const sectors = ["All", "HealthTech", "CleanEnergy", "E-commerce", "AgriTech", "FinTech", "EdTech","Others"];

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

const EMPTY_FORM = {
  title: "",
  company: "",
  sector: "",
  location: "",
  fundingGoal: "",
  description: "",
  days: 30,
  image: null,
};

const STATUS_STYLES = {
  Live: "bg-emerald-500/15 text-emerald-300",
  Funded: "bg-amber-400/15 text-amber-300",
  Suspended: "bg-rose-500/15 text-rose-300",
};

function timeAgo(value) {
  if (!value) return "just now";
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units = [
    [60 * 60 * 24 * 30, "mo"],
    [60 * 60 * 24, "d"],
    [60 * 60, "h"],
    [60, "m"],
  ];
  const [size, label] = units.find(([unitSize]) => seconds >= unitSize);
  return `${Math.floor(seconds / size)}${label} ago`;
}

// Normalises an API opportunity into the shape the owner card renders.
function toCard(opp) {
  const funded = Boolean(opp.investor_id);
  const suspended = String(opp.status || "").toLowerCase() === "suspended";
  const investedAmount = Number(opp.invested_amount) || 0;
  return {
    id: opp.id,
    title: opp.title,
    company: opp.company,
    sector: opp.sector,
    location: opp.location || "TBD",
    fundingGoal: opp.funding_goal || "$0",
    description: opp.description || "",
    timeline: opp.timeline || "TBD",
    image: opp.image || null,
    status: suspended ? "Suspended" : funded ? "Funded" : "Live",
    pct: funded ? 100 : 0,
    investedAmount,
    updated: opp.updated_at && opp.updated_at !== opp.created_at
      ? `Updated ${timeAgo(opp.updated_at)}`
      : `Posted ${timeAgo(opp.created_at)}`,
    investors: null,
  };
}

// What the owner should do next, derived from the listing's real state.
function nextStepFor(opp) {
  if (opp.status === "Suspended") {
    return { text: "This listing was suspended by an admin.", action: "Contact support", route: "/support" };
  }
  if (opp.status === "Funded") {
    return { text: "An investor has been accepted — coordinate next steps in chat.", action: "Open chat", route: "/connect" };
  }
  if (opp.investors > 0) {
    return {
      text: `${opp.investors} investor${opp.investors === 1 ? " is" : "s are"} interested — review and accept one.`,
      action: "Review investors",
      route: "/dashboard",
    };
  }
  return { text: "Your listing is live in Deals. No investors yet.", action: "View in deals", route: "/deals" };
}

function CardStat({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="mt-2 truncate text-[17px] font-semibold text-white" title={String(value)}>{value}</p>
    </div>
  );
}

function OpportunityCard({ opp, navigate, onDelete }) {
  const deg = `${Math.max(0, Math.min(100, opp.pct)) * 3.6}deg`;
  const step = nextStepFor(opp);

  return (
    <motion.div variants={fadeUp} className="h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(5,9,15,0.55)] backdrop-blur transition-colors duration-300 hover:border-brand-500/45">
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Remove ${opp.title}`}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-white/40 opacity-0 transition hover:bg-rose-500/15 hover:text-rose-300 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Ring + title */}
        <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-5 px-6 pb-6 pt-7 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-7 sm:px-[30px] sm:pt-[30px]">
          <div
            className="relative aspect-square w-full rounded-full"
            style={{ background: `conic-gradient(#10b981 0deg, #fbbf24 ${deg}, rgba(255,255,255,0.08) ${deg} 360deg)` }}
          >
            <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-[#07100e]">
              <span className="text-xl font-semibold text-white sm:text-2xl">{opp.pct}%</span>
              <span className="text-[11px] text-white/55">funded</span>
            </div>
          </div>
          <div className="min-w-0 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[opp.status] || STATUS_STYLES.Live}`}>
                {opp.status}
              </span>
              <span className="rounded-full border border-white/[0.14] px-2.5 py-0.5 text-[11px] font-semibold text-white/80">
                {opp.sector}
              </span>
            </div>
            <h3 className="mt-3.5 text-[22px] font-semibold leading-tight text-white">{opp.title}</h3>
            <p className="mt-2 text-[13px] text-white/55">
              {opp.location} · {opp.updated}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-6 mb-6 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-5 sm:mx-[30px] sm:grid-cols-5">
          <CardStat label="Goal" value={opp.fundingGoal} />
          <CardStat label="Invested" value={opp.investedAmount ? `$${opp.investedAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "$0"} />
          <CardStat label="Timeline" value={opp.timeline} />
          <CardStat label="Investors" value={opp.investors ?? "—"} />
          <CardStat label="Company" value={opp.company} />
        </div>

        {/* Next step */}
        <div className="mt-auto flex items-center gap-3.5 border-t border-brand-500/[0.18] bg-brand-500/[0.07] px-6 py-4 sm:px-[26px]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.15)]" />
          <span className="min-w-0 flex-1 text-[13px] font-medium leading-normal text-white/85">{step.text}</span>
          <button
            type="button"
            onClick={() => navigate(step.route)}
            className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-brand-300 transition-colors hover:text-brand-200"
          >
            {step.action}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </article>
    </motion.div>
  );
}

export default function OpportunitiesPage({ navigate }) {
   const [user, setUser] = useState(() => getStoredUser());
   const [opportunities, setOpportunities] = useState([]);
   const [showForm, setShowForm] = useState(false);
   const [form, setForm] = useState(EMPTY_FORM);
  const [formStatus, setFormStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
   const [searchQuery, setSearchQuery] = useState("");
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
    setUser(getStoredUser());
  }, []);

   useEffect(() => {
    if (!getStoredUser()) return;
    let active = true;
    (async () => {
      try {
        const data = await getMyOpportunities();
        if (!active) return;
        const list = Array.isArray(data.opportunities) ? data.opportunities : [];
        setOpportunities(list.map(toCard));

        // Fill in how many investors have connected to each listing.
        list.forEach((opp) => {
          getConnectionsForOpportunity(opp.id)
            .then((result) => {
              if (!active) return;
              const count = (result.connections || []).length;
              setOpportunities((prev) =>
                prev.map((o) => (o.id === opp.id ? { ...o, investors: count } : o)),
              );
            })
            .catch(() => {});
        });
      } catch {
        // keep empty state on error
      }
    })();
    return () => {
      active = false;
    };
  }, []);

   const filteredOpportunities = opportunities.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === "All" || o.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      setForm((current) => ({ ...current, image: dataUrl }));
    } catch {
      // keep previous value on resize failure
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormStatus("");
    setFormError("");

    const goalAmount = Number(String(form.fundingGoal).replace(/[^0-9.]/g, "")) || 0;
    const missing = [
      !form.title.trim() && "Title",
      !form.company.trim() && "Company",
      !form.sector && "Sector",
      !goalAmount && "Funding goal",
    ].filter(Boolean);
    if (missing.length) {
      setFormError(`Please add: ${missing.join(", ")}.`);
      return;
    }

    setIsLoading(true);
    try {
      const result = await createOpportunity({
        title: form.title.trim(),
        company: form.company.trim(),
        sector: form.sector,
        location: form.location.trim() || "TBD",
        funding_goal: `$${goalAmount.toLocaleString("en-US")}`,
        description: form.description || "",
        timeline: `${form.days} days`,
        image: form.image || null,
      });

      if (result.opportunity) {
        setOpportunities((prev) => [
          { ...toCard(result.opportunity), investors: 0 },
          ...prev,
        ]);
      }

      window.dispatchEvent(new CustomEvent("opportunity-changed"));
      setFormStatus("Opportunity posted successfully!");
      setForm(EMPTY_FORM);
      setShowForm(false);

      setTimeout(() => setFormStatus(""), 4000);
    } catch (err) {
      setFormError(err.message || "Failed to post opportunity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOpportunity(id);
      const updated = opportunities.filter((o) => o.id !== id);
      setOpportunities(updated);
      window.dispatchEvent(new CustomEvent("opportunity-changed"));
    } catch {
      // keep local state on error
    }
  };

  if (!user) {
    return (
      <section className="dark relative min-h-screen overflow-hidden px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8">
        <PageBackground image={false} gradient={AURORA_BG} />
        <PageDecor />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
          <div className="absolute left-[-5rem] top-24 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
          <div className="absolute right-[-4rem] bottom-10 h-80 w-80 rounded-full bg-gold-200/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-2xl">
          <div className="glass-panel-strong mx-auto max-w-2xl rounded-[2rem] p-8 holo-card dark:text-ink-50">
            <UserRound className="mx-auto h-10 w-10 text-brand-600" />
            <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">
              Sign in to view your opportunities
            </h1>
            <p className="mt-3 text-ink-600 dark:text-ink-300">
              Your opportunities page shows every project you have posted on
              InvestBridge. Sign in or create an account to continue.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-primary mt-6"
            >
              Go to sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dark relative min-h-screen overflow-hidden px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8">
      <PageBackground image={false} gradient={AURORA_BG} />
        <PageDecor />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-[-5rem] top-24 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute right-[-4rem] bottom-10 h-80 w-80 rounded-full bg-gold-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div
          className="relative z-40 mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          initial="hidden"
          animate="visible"
          variants={fadeUpBlur}
        >
          <div>
            <span className="eyebrow">
              <PenLine className="h-3.5 w-3.5" />
              My opportunities
            </span>
            <h1 className="mt-4">
              <GradientText
                colors={["#10b981", "#fbbf24", "#10b981"]}
                animationSpeed={5}
                direction="horizontal"
                className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Opportunities you posted
              </GradientText>
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/80">
              These are the opportunities you have published on InvestBridge.
              Create a new listing, track its progress, and keep every round
              moving forward.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <IconSearchToggle
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, company, or sector..."
            />
            <FilterPopover
              label="Filter opportunities"
              activeCount={sectorFilter !== "All" ? 1 : 0}
            >
              <PopoverSelect
                label="Sector"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                options={sectors}
              />
            </FilterPopover>
            <motion.button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="btn-primary shrink-0"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus className="h-4 w-4" />
              {showForm ? "Cancel" : "Post opportunity"}
            </motion.button>
          </div>
        </motion.div>

        {(searchQuery.trim() !== "" || sectorFilter !== "All") && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex flex-wrap items-center gap-3"
          >
            <span className="text-sm font-medium text-white/70">
              <span className="font-display font-bold text-white">
                {filteredOpportunities.length}
              </span>{" "}
              opportunit{filteredOpportunities.length !== 1 ? "ies" : "y"} found
            </span>
            <AnimatePresence>
              {searchQuery.trim() !== "" && (
                <FilterChip
                  key="search"
                  label={`"${searchQuery}"`}
                  onRemove={() => setSearchQuery("")}
                />
              )}
              {sectorFilter !== "All" && (
                <FilterChip
                  key="sector"
                  label={sectorFilter}
                  onRemove={() => setSectorFilter("All")}
                />
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSectorFilter("All");
              }}
              className="text-xs font-semibold text-white/60 underline-offset-2 transition-colors hover:text-white hover:underline"
            >
              Clear all
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {formStatus && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-900/60 dark:bg-brand-950/40 dark:text-brand-300"
            >
              {formStatus}
            </motion.div>
          )}
        </AnimatePresence>

        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            noValidate
            className={panelClassName}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Cover banner — doubles as the image picker */}
            <label
              className="group relative flex min-h-[150px] cursor-pointer flex-wrap items-end gap-4 overflow-hidden rounded-[20px] border border-dashed border-brand-500/40 bg-[radial-gradient(70%_120%_at_15%_0%,rgba(16,185,129,0.22)_0%,rgba(16,185,129,0)_70%),rgba(5,9,15,0.4)] px-5 py-5 transition-colors hover:border-brand-500/70 sm:px-[26px] sm:py-[22px]"
            >
              {form.image && (
                <>
                  <img src={form.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,9,15,0.85)] to-[rgba(5,9,15,0.1)]" />
                </>
              )}
              <div className="relative">
                <h2 className="text-[26px] font-semibold text-white">New opportunity</h2>
                <p className="mt-1.5 text-[13px] text-white/60">
                  {form.image
                    ? "Click to change the cover image."
                    : "This banner is your cover image. Add a photo here (optional)."}
                </p>
              </div>
              <span className="relative ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/[0.18] bg-[rgba(5,9,15,0.6)] px-3.5 py-2 text-[13px] font-semibold text-white">
                <Upload className="h-3.5 w-3.5" />
                {form.image ? "Replace cover" : "Upload cover"}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>

            <FormSection n="01" title="The basics" hint="How investors will find you.">
              <div className="flex flex-col gap-3.5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className={formLabelClassName}>
                    Title *
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      placeholder="e.g. AI diagnostic platform"
                      className={formInputClassName}
                    />
                  </label>
                  <label className={formLabelClassName}>
                    Company *
                    <input
                      name="company"
                      value={form.company}
                      onChange={handleFormChange}
                      placeholder="e.g. NovaVet AI"
                      className={formInputClassName}
                    />
                  </label>
                </div>
                <div className="grid gap-3.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-white/85">Sector *</span>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Sector">
                      {sectors.filter((s) => s !== "All").map((s) => {
                        const active = form.sector === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setForm((current) => ({ ...current, sector: s }))}
                            className={`rounded-full border px-3 py-[7px] text-xs font-semibold transition-colors ${
                              active
                                ? "border-brand-500 bg-brand-500/[0.18] text-brand-300"
                                : "border-white/[0.14] text-white/80 hover:border-white/30"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <label className={formLabelClassName}>
                    Location
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleFormChange}
                      placeholder="e.g. Dhaka, BD"
                      className={formInputClassName}
                    />
                  </label>
                </div>
              </div>
            </FormSection>

            <FormSection n="02" title="The raise" hint="How much, and how long it's open.">
              <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <label className={formLabelClassName}>
                  Funding goal *
                  <span className="flex h-11 items-center overflow-hidden rounded-xl border border-white/[0.12] bg-[rgba(5,9,15,0.5)] transition focus-within:border-brand-500 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]">
                    <span className="flex h-full items-center border-r border-white/[0.08] px-3 text-sm font-semibold text-white/50">
                      USD $
                    </span>
                    <input
                      name="fundingGoal"
                      value={form.fundingGoal}
                      onChange={handleFormChange}
                      inputMode="decimal"
                      placeholder="250,000"
                      className="h-full min-w-0 flex-1 border-none bg-transparent px-3 text-sm font-normal text-white outline-none placeholder:text-white/35 focus-visible:shadow-none"
                    />
                  </span>
                </label>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-white/85">Open for</span>
                  <div
                    role="radiogroup"
                    aria-label="Open for"
                    className="grid h-11 grid-cols-4 gap-1 rounded-xl border border-white/[0.12] bg-[rgba(5,9,15,0.5)] p-1"
                  >
                    {OPEN_FOR_DAYS.map((n) => {
                      const active = form.days === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setForm((current) => ({ ...current, days: n }))}
                          className={`rounded-lg text-[13px] font-semibold transition-colors ${
                            active ? "bg-brand-500/[0.22] text-brand-300" : "text-white/70 hover:text-white"
                          }`}
                        >
                          {n} days
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection n="03" title="The story" hint="Two or three sentences work best." last>
              <label className={formLabelClassName}>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="What problem does it solve, who has it, and what traction do you have?"
                  className={`${formInputClassName} h-auto resize-y py-3 leading-relaxed`}
                />
              </label>
            </FormSection>

            {/* Footer */}
            <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-5">
              <span className={`text-[13px] ${formError ? "text-red-400" : "text-white/55"}`}>
                {formError || "Fields marked * are required."}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
                className="ml-auto rounded-full border border-white/[0.14] px-5 py-3 text-sm font-semibold text-white/85 transition-colors hover:border-white/30 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-full bg-brand-500 px-[22px] py-3 text-sm font-semibold text-[#05090f] transition-colors hover:bg-brand-400 disabled:opacity-60"
              >
                {isLoading ? "Publishing…" : "Publish opportunity"}
              </button>
            </div>
          </motion.form>
        )}

        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {filteredOpportunities.length === 0 ? (
            <div className="col-span-full glass-panel-strong holo-card rounded-[2rem] p-8 text-center">
              <PenLine className="h-12 w-12 mx-auto text-ink-300 dark:text-ink-600" />
              <p className="mt-4 text-ink-500 dark:text-ink-400">
                You haven&apos;t posted any opportunities yet. Be the first to post one!
              </p>
            </div>
          ) : (
            filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opp={opp}
                navigate={navigate}
                onDelete={() => handleDelete(opp.id)}
              />
            ))
          )}
        </motion.div>

        <motion.div
          className="mt-8 grid gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            variants={fadeUp}
            className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              What you will complete
            </p>
            <ul className="mt-4 space-y-3 text-sm text-ink-600 dark:text-ink-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Add sector, goals, and timeline
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Package the opportunity in a guided listing flow
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Send it directly into the discovery pipeline
              </li>
            </ul>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Required info
            </p>
            <ul className="mt-4 space-y-3 text-sm text-ink-600 dark:text-ink-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Opportunity title and short summary
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Sector, funding target, and timeline
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Cover image and description
              </li>
            </ul>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Steps to publish
            </p>
            <div className="mt-4 space-y-3">
              {[
                "Draft the opportunity details",
                "Review the preview card",
                "Publish it for discovery",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-ink-700 shadow-soft dark:bg-ink-950/55 dark:text-ink-200"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}