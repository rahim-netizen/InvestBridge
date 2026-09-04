import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  MessageCircle,
  PenLine,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Briefcase,
  Globe,
  Rocket,
  Plus,
  X,
  UserRound,
  Image as ImageIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import PageDecor from "./PageDecor.jsx";
import GradientText from "./GradientText.jsx";
import { createOpportunity, deleteOpportunity, getMyOpportunities } from "../api/opportunities";
import { fadeUp, fadeUpBlur, stagger, useTilt } from "../lib/motion.jsx";
import {
  FilterChip,
  FilterPopover,
  IconSearchToggle,
  PopoverSelect,
} from "./FilterControls.jsx";

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

function OpportunityCard({ opp, navigate, onDelete }) {
  const tilt = useTilt(4);

  return (
    <motion.article
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="glass-panel-strong holo-card rounded-[2rem] p-6 relative"
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
              {opp.sector}
            </span>
          </div>
          {opp.image && (
            <img
              src={opp.image}
              alt={opp.title}
              className="mt-3 h-48 w-full rounded-2xl object-cover"
            />
          )}
          <h3 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
            {opp.title}
          </h3>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            by {opp.company}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-2xl font-bold text-brand-600">
            {opp.pct}%
          </p>
          <p className="text-xs text-ink-500 dark:text-ink-400">funded</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
        {opp.description}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/50 p-3 dark:bg-ink-950/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
            Funding goal
          </p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900 dark:text-ink-50">
            {opp.fundingGoal}
          </p>
          <p className="text-xs text-ink-500 dark:text-ink-400">
            {opp.raised} raised
          </p>
        </div>
        <div className="rounded-2xl bg-white/50 p-3 dark:bg-ink-950/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
            Timeline
          </p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900 dark:text-ink-50">
            {opp.timeline}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-ink-500 dark:text-ink-400">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {opp.location}
        </span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
          initial={{ width: 0 }}
          animate={{ width: `${opp.pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/connect")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-brand-700 dark:text-ink-400"
          >
            <Users className="h-4 w-4" />
            View investors
          </button>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs font-semibold text-rose-500 transition-colors hover:text-rose-700"
        >
          Remove
        </button>
      </div>
    </motion.article>
  );
}

export default function OpportunitiesPage({ navigate }) {
   const [user, setUser] = useState(() => getStoredUser());
   const [opportunities, setOpportunities] = useState([]);
   const [showForm, setShowForm] = useState(false);
   const [form, setForm] = useState({
    title: "",
    company: "",
    sector: "",
    location: "",
    fundingGoal: "",
    description: "",
    timeline: "",
    image: null,
  });
  const [formStatus, setFormStatus] = useState("");
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
        setOpportunities(
          list.map((opp) => ({
            id: opp.id,
            title: opp.title,
            company: opp.company,
            sector: opp.sector,
            location: opp.location || "TBD",
            fundingGoal: opp.funding_goal || "$0",
            raised: "$0",
            pct: 0,
            description: opp.description || "",
            timeline: opp.timeline || "TBD",
            image: opp.image || null,
          })),
        );
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
     setIsLoading(true);

     if (!form.title.trim() || !form.company.trim()) {
      setFormStatus("Please fill in the title and company fields.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createOpportunity({
        title: form.title,
        company: form.company,
        sector: form.sector || "Other",
        location: form.location || "TBD",
        funding_goal: form.fundingGoal || "$0",
        description: form.description || "",
        timeline: form.timeline || "TBD",
        image: form.image || null,
      });

      if (result.opportunity) {
        setOpportunities((prev) => [
          {
            id: result.opportunity.id,
            title: result.opportunity.title,
            company: result.opportunity.company,
            sector: result.opportunity.sector,
            location: result.opportunity.location || "TBD",
            fundingGoal: result.opportunity.funding_goal || "$0",
            raised: "$0",
            pct: 0,
            description: result.opportunity.description || "",
            timeline: result.opportunity.timeline || "TBD",
            nextMilestone: "",
            businessModel: "",
            targetAudience: "",
          },
          ...prev,
        ]);
      }

      window.dispatchEvent(new CustomEvent("opportunity-changed"));
      setFormStatus("Opportunity posted successfully!");
      setForm({
        title: "",
        company: "",
        sector: "",
        location: "",
        fundingGoal: "",
        description: "",
        timeline: "",
        image: null,
      });
      setShowForm(false);

      setTimeout(() => setFormStatus(""), 4000);
    } catch (err) {
      setFormStatus(err.message || "Failed to post opportunity.");
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

  const inputClassName =
    "w-full rounded-2xl border border-white/20 bg-white/35 px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 backdrop-blur-sm dark:border-white/10 dark:bg-ink-950/35 dark:text-ink-50 dark:placeholder:text-ink-500";
  const fieldLabelClassName =
    "mb-2 block text-sm font-medium text-ink-700 dark:text-ink-300";

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
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
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
          <motion.div
            className="glass-panel-strong holo-card rounded-[2rem] p-8 mb-8"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
              New opportunity
            </h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              Fill in the details below to publish your opportunity.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center">
                <label className="group relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-ink-300 bg-ink-50 transition group-hover:border-brand-400 group-hover:bg-brand-50 dark:border-ink-600 dark:bg-ink-800 dark:group-hover:border-brand-500 dark:group-hover:bg-brand-900/20">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Opportunity preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-ink-400 dark:text-ink-500">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-xs font-medium">Opportunity image</span>
                      </div>
                    )}
                  </div>
                </label>
                <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
                  Upload a cover image (optional)
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={fieldLabelClassName}>Title *</span>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g., AI-Powered Diagnostic Platform"
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className={fieldLabelClassName}>Company *</span>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g., NovaVet AI"
                    className={inputClassName}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className={fieldLabelClassName}>Sector *</span>
                  <select
                    name="sector"
                    value={form.sector}
                    onChange={handleFormChange}
                    required
                    className={inputClassName}
                  >
                    <option value="">Select a sector</option>
                    {sectors.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={fieldLabelClassName}>Location</span>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                    placeholder="e.g., San Francisco, US"
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className={fieldLabelClassName}>Funding goal</span>
                  <input
                    type="text"
                    name="fundingGoal"
                    value={form.fundingGoal}
                    onChange={handleFormChange}
                    placeholder="e.g., $1.5M"
                    className={inputClassName}
                  />
                </label>
              </div>

              <label className="block">
                <span className={fieldLabelClassName}>Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Describe the opportunity, what problem it solves, and why it matters..."
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={fieldLabelClassName}>Timeline</span>
                <input
                  type="text"
                  name="timeline"
                  value={form.timeline}
                  onChange={handleFormChange}
                  placeholder="e.g., 14 days"
                  className={inputClassName}
                />
              </label>

              <button type="submit" className="btn-primary">
                <Rocket className="h-4 w-4" />
                Publish opportunity
              </button>
            </form>
          </motion.div>
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