import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  PenLine,
  Plus,
  Search,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import PageDecor from "./PageDecor.jsx";
import GradientText from "./GradientText.jsx";
import {
  deleteOpportunity,
  getMyOpportunities,
  updateOpportunity,
} from "../api/opportunities";
import {
  getConnectedOpportunities,
  disconnectOpportunity,
} from "../api/connected";
import {
  fadeUp,
  fadeUpBlur,
  modalOverlay,
  modalPanel,
  stagger,
} from "../lib/motion.jsx";
import { FilterChip, IconSearchToggle } from "./FilterControls.jsx";
import {
  FormSection,
  OPEN_FOR_DAYS,
  formInputClassName,
  formLabelClassName,
  panelClassName,
} from "./OpportunityFormParts.jsx";
import {
  formatInvestmentAmount,
  getInvestorCount,
} from "../lib/opportunityStats.js";

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

const STATUS_OPTIONS = ["Active", "Pending", "Completed", "Progress"];

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

// Status pill colours for the dark split cards.
const CARD_STATUS_STYLES = {
  Active: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25",
  Pending: "bg-amber-400/15 text-amber-300 hover:bg-amber-400/25",
  Completed: "bg-brand-500/15 text-brand-300 hover:bg-brand-500/25",
  Progress: "bg-sky-500/15 text-sky-300 hover:bg-sky-500/25",
};

const cardStatusClass = (status) =>
  CARD_STATUS_STYLES[STATUS_OPTIONS.includes(status) ? status : "Active"];

// Escrow lifecycle for a saved post, matching the badges on the status page.
const SAVED_PAYOUT_STYLES = {
  NA: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
};

const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

function CardStat({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="mt-1 truncate text-base font-semibold text-white" title={String(value)}>{value}</p>
    </div>
  );
}

// Split card matching the Deals page: media left, details right; stacks on phones.
function DashboardCard({ opp, actions }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = opp.image && !imageFailed;

  return (
    <motion.article
      variants={fadeUp}
      className="group grid overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(5,9,15,0.55)] backdrop-blur transition-colors duration-300 hover:border-brand-500/50 sm:grid-cols-[190px_minmax(0,1fr)]"
    >
      {/* Media */}
      <div className="relative min-h-[160px] bg-[radial-gradient(90%_80%_at_30%_10%,rgba(16,185,129,0.35)_0%,rgba(16,185,129,0)_70%),#0a1f19] sm:min-h-[250px]">
        {hasImage ? (
          <img
            src={opp.image}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 h-full w-full object-cover opacity-85 mix-blend-lighten"
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center font-display text-[64px] font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_rgba(110,231,183,0.4)]"
          >
            {initialsOf(opp.title)}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,9,15,0.85)] to-transparent sm:bg-gradient-to-r sm:from-transparent sm:from-[55%] sm:to-[rgba(5,9,15,0.85)]" />
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-col px-6 py-6 sm:px-[26px]">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/[0.14] px-2.5 py-0.5 text-[11px] font-semibold text-white/80">
            {opp.sector}
          </span>
          <span className="truncate text-xs text-white/50">{opp.location || "TBD"}</span>
        </div>

        <h3 className="mt-3.5 text-xl font-semibold leading-tight text-white">{opp.title}</h3>
        <p className="mt-1 text-xs text-white/55">by {opp.company}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/70 [text-wrap:pretty]">
          {opp.blurb || "No description provided."}
        </p>

        <div className="mt-auto flex flex-wrap items-end gap-[22px] pt-[18px]">
          <CardStat
            label="Invested / goal"
            value={`${formatInvestmentAmount(opp.investedAmount)} / ${opp.goal}`}
          />
          <CardStat
            label="Investors"
            value={opp.investorCount ?? "Unavailable"}
          />
          <CardStat label="Timeline" value={opp.timeline || "TBD"} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3.5">
          {actions}
        </div>
      </div>
    </motion.article>
  );
}


function PaymentResultModal({ status, tranId, onClose, navigate }) {
  const success = status === "success";
  const cancelled = status === "cancel";

  return (
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center bg-ink-950/50 px-4 backdrop-blur-sm"
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[1.75rem] border border-white/40 bg-white/95 p-6 text-center shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/95"
        variants={modalPanel}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={
            "mx-auto grid h-14 w-14 place-items-center rounded-full " +
            (success
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300")
          }
        >
          {success ? (
            <CheckCircle2 className="h-7 w-7" />
          ) : (
            <AlertTriangle className="h-7 w-7" />
          )}
        </div>

        <h2 className="mt-4 font-display text-xl font-bold text-ink-900 dark:text-ink-50">
          {success
            ? "Investment successful"
            : cancelled
              ? "Payment cancelled"
              : "Payment failed"}
        </h2>
        <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
          {success
            ? "Your investment was completed successfully."
            : cancelled
              ? "You cancelled the payment. No checkpoints were saved."
              : "The payment could not be completed. No checkpoints were saved."}
        </p>

        {tranId && (
          <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">
            Transaction: {tranId}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/dashboard");
            }}
            className="btn-primary"
          >
            Go to dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate("/deals")}
            className="btn-ghost"
          >
            Browse deals
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function UserDashboard({ navigate }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [connectedOpportunities, setConnectedOpportunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    sector: "",
    location: "",
    fundingGoal: "",
    description: "",
    timeline: "",
    image: null,
  });
  const [editStatus, setEditStatus] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const editPanelRef = useRef(null);
  const [, setProgressVersion] = useState(0);
  const location = useLocation();
  const [paymentReturn, setPaymentReturn] = useState(null);

  // Show the payment result modal when returning from the SSLCommerz gateway
  // (the backend redirects here with ?status=success|fail|cancel).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const returnStatus = params.get("status");
    if (
      returnStatus === "success" ||
      returnStatus === "fail" ||
      returnStatus === "cancel"
    ) {
      setPaymentReturn({
        status: returnStatus,
        tranId: params.get("tran_id"),
      });
      // Clean the query string so a refresh doesn't re-show the modal.
      navigate("/dashboard", { replace: true });
    }
  }, [location.search, navigate]);

  const sectors = [
    "HealthTech",
    "CleanEnergy",
    "E-commerce",
    "AgriTech",
    "FinTech",
    "EdTech",
    "Others",
  ];

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const loadOpportunities = useCallback(async () => {
    try {
      const data = await getMyOpportunities();
      if (data.opportunities) {
        const mapped = data.opportunities.map((opp) => ({
          id: opp.id,
          title: opp.title,
          company: opp.company,
          sector: opp.sector,
          location: opp.location || "TBD",
          goal: opp.funding_goal || "$0",
          blurb: opp.description || "",
          image: opp.image || null,
          timeline: opp.timeline || "TBD",
          postedBy: opp.user?.email || null,
          postedByName: opp.user?.name || opp.user?.email || "Anonymous",
          createdAt: opp.created_at,
          status: opp.status || "Active",
          investedAmount: Number(opp.invested_amount) || 0,
          investorCount: getInvestorCount(opp),
        }));
        setAllOpportunities(mapped);
      }
    } catch {
      // keep empty state on error
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  useEffect(() => {
    async function loadConnected() {
      try {
        const data = await getConnectedOpportunities();
        if (data.connections) {
          const mapped = data.connections
            .filter((c) => c.opportunity)
            .map((c) => {
              const opp = c.opportunity;
              return {
                connectionId: c.id,
                id: opp.id,
                title: opp.title,
                company: opp.company,
                sector: opp.sector,
                location: opp.location || "TBD",
                goal: opp.funding_goal || "$0",
                blurb: opp.description || "",
                image: opp.image || null,
                timeline: opp.timeline || "TBD",
                postedBy: opp.user?.email || null,
                postedByName: opp.user?.name || opp.user?.email || "Anonymous",
                createdAt: opp.created_at,
                status: opp.status || "Active",
                investedAmount: Number(opp.invested_amount) || 0,
                investorCount: getInvestorCount(opp),
                myInvestment: Number(c.investment_amount) || 0,
                payoutStatus: c.status || "NA",
                myPayout: Number(c.payout_amount) || 0,
                myShare: Number(c.investor_share) || 0,
              };
            });
          setConnectedOpportunities(mapped);
        }
      } catch {
        // keep empty state on error
      }
    }

    loadConnected();
  }, []);

  useEffect(() => {
    const handler = () => {
      loadOpportunities();
      setProgressVersion((version) => version + 1);
    };
    window.addEventListener("opportunity-changed", handler);
    window.addEventListener("project-progress-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("opportunity-changed", handler);
      window.removeEventListener("project-progress-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, [loadOpportunities]);

  const filteredProjects = allOpportunities.filter((o) => {
    const q = searchQuery.toLowerCase();
    return o.title.toLowerCase().includes(q);
  });

  const confirmDelete = (id, type) => setPendingDelete({ id, type });
  const cancelDelete = () => setPendingDelete(null);

  const handleDelete = async (id) => {
    try {
      await deleteOpportunity(id);
      const updated = allOpportunities.filter((o) => o.id !== id);
      setAllOpportunities(updated);
      setPendingDelete(null);
      window.dispatchEvent(new CustomEvent("opportunity-changed"));
    } catch {
      setPendingDelete(null);
    }
  };

  const handleDisconnect = async (connectionId) => {
    try {
      await disconnectOpportunity(connectionId);
      const updated = connectedOpportunities.filter(
        (o) => o.connectionId !== connectionId,
      );
      setConnectedOpportunities(updated);
      setPendingDelete(null);
      window.dispatchEvent(new CustomEvent("connection-changed"));
    } catch {
      setPendingDelete(null);
    }
  };

  const openEdit = (opp) => {
    setEditTarget(opp);
    setEditForm({
      title: opp.title || "",
      company: opp.company || "",
      sector: opp.sector || "",
      location: opp.location || "",
      fundingGoal: String(opp.goal || "").replace(/^\$\s*/, ""),
      description: opp.blurb || "",
      timeline: opp.timeline || "",
      image: opp.image || null,
    });
    setEditStatus("");
    // The panel renders inline above the project grid; bring it into view.
    requestAnimationFrame(() =>
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleEditImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      setEditForm((current) => ({ ...current, image: dataUrl }));
    } catch {
      // keep previous value on resize failure
    }
  };

  const closeEdit = () => setEditTarget(null);

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editTarget) return;
    setEditLoading(true);
    setEditStatus("");

    if (!editForm.title.trim() || !editForm.company.trim()) {
      setEditStatus("Please fill in the title and company fields.");
      setEditLoading(false);
      return;
    }

    // Same "$250,000" format the Post opportunity form uses; free text such
    // as "1.5M" is kept as typed, just with the currency sign.
    const rawGoal = String(editForm.fundingGoal).trim();
    const goalAmount = /^[\d,.\s]+$/.test(rawGoal)
      ? Number(rawGoal.replace(/[^0-9.]/g, "")) || 0
      : null;
    const fundingGoal =
      goalAmount !== null
        ? `$${goalAmount.toLocaleString("en-US")}`
        : `$${rawGoal.replace(/^\$\s*/, "")}`;

    try {
      await updateOpportunity(editTarget.id, {
        title: editForm.title,
        company: editForm.company,
        sector: editForm.sector || "Others",
        location: editForm.location || "TBD",
        funding_goal: fundingGoal,
        description: editForm.description || "",
        timeline: editForm.timeline || "TBD",
        image: editForm.image || null,
      });

      const updated = allOpportunities.map((o) =>
        o.id === editTarget.id
          ? {
              ...o,
              title: editForm.title,
              company: editForm.company,
              sector: editForm.sector,
              location: editForm.location,
              goal: fundingGoal,
              blurb: editForm.description,
              timeline: editForm.timeline,
              image: editForm.image,
            }
          : o,
      );
      setAllOpportunities(updated);
      window.dispatchEvent(new CustomEvent("opportunity-changed"));
      setEditStatus("Opportunity updated successfully!");
      setTimeout(() => setEditTarget(null), 800);
    } catch (err) {
      setEditStatus(err.message || "Failed to update opportunity.");
    } finally {
      setEditLoading(false);
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
              Sign in to view your dashboard
            </h1>
            <p className="mt-3 text-ink-600 dark:text-ink-300">
              Your dashboard shows every project you have posted on
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

  const totalProjects = allOpportunities.length;

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
              <BarChart3 className="h-3.5 w-3.5" />
              My dashboard
            </span>
            <h1 className="mt-4">
              <GradientText
                colors={["#10b981", "#fbbf24", "#10b981"]}
                animationSpeed={5}
                direction="horizontal"
                className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Projects you posted
              </GradientText>
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/80">
              Here are the opportunities you have published on InvestBridge.
              Track progress, share updates, and keep every round moving
              forward.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {totalProjects > 0 && (
              <IconSearchToggle
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title..."
              />
            )}
            <motion.button
              type="button"
              onClick={() => navigate("/opportunities")}
              className="btn-ghost shrink-0"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus className="h-4 w-4" />
              Post new project
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate("/")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/30 bg-white/35 text-ink-700"
              aria-label="Back home"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {totalProjects === 0 ? (
          <div className="glass-panel-strong holo-card rounded-[2rem] p-8 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-ink-300 dark:text-ink-600" />
            <p className="mt-4 text-ink-500 dark:text-ink-400">
              You haven&apos;t posted any projects yet.
            </p>
            <button
              type="button"
              onClick={() => navigate("/opportunities")}
              className="btn-primary mt-4"
            >
              <Plus className="h-4 w-4" />
              Post your first opportunity
            </button>
          </div>
        ) : (
          <>
            <motion.div
              className="mb-6 grid gap-4 sm:grid-cols-3"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="rounded-[24px] border border-white/10 bg-[rgba(5,9,15,0.55)] p-5 backdrop-blur transition-colors duration-300 hover:border-brand-500/50 sm:px-[26px]"
                variants={fadeUp}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Projects posted
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                  {totalProjects}
                </p>
              </motion.div>
              <motion.div
                className="rounded-[24px] border border-white/10 bg-[rgba(5,9,15,0.55)] p-5 backdrop-blur transition-colors duration-300 hover:border-brand-500/50 sm:px-[26px]"
                variants={fadeUp}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Total funding goal
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                  {allOpportunities
                    .reduce((sum, o) => {
                      const val =
                        parseFloat((o.goal || "$0").replace(/[^0-9.]/g, "")) ||
                        0;
                      return sum + val;
                    }, 0)
                    .toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                </p>
              </motion.div>
              <motion.div
                className="rounded-[24px] border border-white/10 bg-[rgba(5,9,15,0.55)] p-5 backdrop-blur transition-colors duration-300 hover:border-brand-500/50 sm:px-[26px]"
                variants={fadeUp}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Latest post
                </p>
                <p className="mt-2 font-display text-lg font-bold text-ink-900 dark:text-ink-50 truncate">
                  {allOpportunities[0]?.title || "N/A"}
                </p>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  {allOpportunities[0]?.createdAt
                    ? new Date(
                        allOpportunities[0].createdAt,
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </motion.div>
            </motion.div>

            {searchQuery.trim() !== "" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex flex-wrap items-center gap-3"
              >
                <span className="text-sm font-medium text-white/70">
                  <span className="font-display font-bold text-white">
                    {filteredProjects.length}
                  </span>{" "}
                  project{filteredProjects.length !== 1 ? "s" : ""} found
                </span>
                <AnimatePresence>
                  <FilterChip
                    key="search"
                    label={`"${searchQuery}"`}
                    onRemove={() => setSearchQuery("")}
                  />
                </AnimatePresence>
              </motion.div>
            )}

            <AnimatePresence>
              {editTarget && (
                <motion.form
                  key={editTarget.id}
                  ref={editPanelRef}
                  onSubmit={handleEditSubmit}
                  noValidate
                  className={`${panelClassName} scroll-mt-24`}
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Cover banner — doubles as the image picker */}
                  <label className="group relative flex min-h-[190px] cursor-pointer flex-wrap items-end gap-4 overflow-hidden rounded-[20px] border border-dashed border-brand-500/40 bg-[radial-gradient(70%_120%_at_15%_0%,rgba(16,185,129,0.22)_0%,rgba(16,185,129,0)_70%),rgba(5,9,15,0.4)] px-5 py-5 transition-colors hover:border-brand-500/70 sm:px-[26px] sm:py-[22px]">
                    {editForm.image && (
                      <>
                        <img src={editForm.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,9,15,0.85)] to-[rgba(5,9,15,0.1)]" />
                      </>
                    )}
                    <div className="relative">
                      <h2 className="text-[26px] font-semibold text-white">Edit opportunity</h2>
                      <p className="mt-1.5 text-[13px] text-white/60">
                        {editForm.image
                          ? "Click to change the cover image."
                          : "This banner is your cover image. Add a photo here (optional)."}
                      </p>
                    </div>
                    <span className="relative ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/[0.18] bg-[rgba(5,9,15,0.6)] px-3.5 py-2 text-[13px] font-semibold text-white">
                      <Upload className="h-3.5 w-3.5" />
                      {editForm.image ? "Replace cover" : "Upload cover"}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleEditImageChange}
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
                            value={editForm.title}
                            onChange={handleEditChange}
                            placeholder="e.g. AI diagnostic platform"
                            className={formInputClassName}
                          />
                        </label>
                        <label className={formLabelClassName}>
                          Company *
                          <input
                            name="company"
                            value={editForm.company}
                            onChange={handleEditChange}
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
                              const active = editForm.sector === s;
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() => setEditForm((current) => ({ ...current, sector: s }))}
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
                            value={editForm.location}
                            onChange={handleEditChange}
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
                        Funding goal
                        <span className="flex h-11 items-center overflow-hidden rounded-xl border border-white/[0.12] bg-[rgba(5,9,15,0.5)] transition focus-within:border-brand-500 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]">
                          <span className="flex h-full items-center border-r border-white/[0.08] px-3 text-sm font-semibold text-white/50">
                            USD $
                          </span>
                          <input
                            name="fundingGoal"
                            value={editForm.fundingGoal}
                            onChange={handleEditChange}
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
                            const active = parseInt(editForm.timeline, 10) === n;
                            return (
                              <button
                                key={n}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => setEditForm((current) => ({ ...current, timeline: `${n} days` }))}
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
                        value={editForm.description}
                        onChange={handleEditChange}
                        rows={4}
                        placeholder="What problem does it solve, who has it, and what traction do you have?"
                        className={`${formInputClassName} h-auto resize-y py-3 leading-relaxed`}
                      />
                    </label>
                  </FormSection>

                  {/* Footer */}
                  <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-5">
                    <span
                      className={`text-[13px] ${
                        !editStatus
                          ? "text-white/55"
                          : editStatus.includes("successfully")
                            ? "text-brand-300"
                            : "text-red-400"
                      }`}
                    >
                      {editStatus || "Fields marked * are required."}
                    </span>
                    <button
                      type="button"
                      onClick={closeEdit}
                      className="ml-auto rounded-full border border-white/[0.14] px-5 py-3 text-sm font-semibold text-white/85 transition-colors hover:border-white/30 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="rounded-full bg-brand-500 px-[22px] py-3 text-sm font-semibold text-[#05090f] transition-colors hover:bg-brand-400 disabled:opacity-60"
                    >
                      {editLoading ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {filteredProjects.length === 0 ? (
              <div className="glass-panel-strong holo-card rounded-[2rem] p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-ink-300 dark:text-ink-600" />
                <p className="mt-4 text-ink-500 dark:text-ink-400">
                  No projects matched your search.
                </p>
              </div>
            ) : (
              <motion.div
                className="grid gap-[22px] lg:grid-cols-2"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {filteredProjects.map((opp) => (
                  <DashboardCard
                    key={opp.id}
                    opp={opp}
                    actions={
                      <>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(opp)}
                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-300 transition-colors hover:text-brand-200"
                          >
                            <PenLine className="h-4 w-4" />
                            Edit
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => navigate("/status/" + opp.id)}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${cardStatusClass(opp.status)}`}
                          >
                            Status: {opp.status || "Active"}
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(opp.id, "own")}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 transition-colors hover:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </>
                    }
                  />
                ))}
              </motion.div>
            )}
          </>
        )}

        <div className="mt-14">
          <div className="mb-6">
            <span className="eyebrow">
              <Bookmark className="h-3.5 w-3.5" />
              Saved from discovery
            </span>
            <h2 className="mt-4">
              <GradientText
                colors={["#10b981", "#fbbf24", "#10b981"]}
                animationSpeed={5}
                direction="horizontal"
                className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Opportunities you connected with
              </GradientText>
            </h2>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/80">
              Posts you saved from the discovery feed. You can remove them from
              your dashboard at any time without affecting the original post.
            </p>
          </div>

          {connectedOpportunities.length === 0 ? (
            <div className="glass-panel-strong holo-card rounded-[2rem] p-8 text-center">
              <Bookmark className="mx-auto h-12 w-12 text-ink-300 dark:text-ink-600" />
              <p className="mt-4 text-ink-500 dark:text-ink-400">
                You haven&apos;t saved any opportunities yet.
              </p>
              <button
                type="button"
                onClick={() => navigate("/deals")}
                className="btn-primary mt-4"
              >
                <Plus className="h-4 w-4" />
                Browse deals
              </button>
            </div>
          ) : (
            <motion.div
              className="grid gap-[22px] lg:grid-cols-2"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {connectedOpportunities.map((opp) => (
                <DashboardCard
                  key={opp.connectionId}
                  opp={opp}
                  actions={
                    <>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                        <Bookmark className="h-3.5 w-3.5 fill-amber-300" />
                        Saved
                      </span>
                      <div className="flex items-center gap-3">
                        {opp.myPayout > 0 ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${SAVED_PAYOUT_STYLES[opp.payoutStatus] || SAVED_PAYOUT_STYLES.NA}`}
                            title="Your escrow payout for this post"
                          >
                            Payout: $
                            {opp.myPayout.toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => navigate("/status/" + opp.id)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${cardStatusClass(opp.status)}`}
                        >
                          Status: {opp.status || "Active"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            confirmDelete(opp.connectionId, "connected")
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 transition-colors hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </>
                  }
                />
              ))}
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {pendingDelete && (
            <motion.div
              className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
              variants={modalOverlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={cancelDelete}
            >
              <motion.div
                className="glass-panel-strong holo-card w-full max-w-md rounded-[2rem] p-6"
                variants={modalPanel}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-rose-600/90 text-white shadow-soft">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
                        {pendingDelete.type === "connected"
                          ? "Remove saved opportunity?"
                          : "Remove project?"}
                      </h2>
                      <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                        {pendingDelete.type === "connected"
                          ? "This only removes the post from your dashboard. The original post stays on discovery for everyone."
                          : "This action cannot be undone. This project will be removed from your dashboard and discovery."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="text-ink-400 hover:text-ink-700 dark:text-ink-500 dark:hover:text-ink-300"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      pendingDelete.type === "connected"
                        ? handleDisconnect(pendingDelete.id)
                        : handleDelete(pendingDelete.id)
                    }
                    className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-rose-700"
                  >
                    {pendingDelete.type === "connected"
                      ? "Remove from dashboard"
                      : "Remove project"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {paymentReturn && (
            <PaymentResultModal
              status={paymentReturn.status}
              tranId={paymentReturn.tranId}
              onClose={() => setPaymentReturn(null)}
              navigate={navigate}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
