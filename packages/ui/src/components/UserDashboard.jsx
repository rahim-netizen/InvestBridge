import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  PenLine,
  Plus,
  Rocket,
  Search,
  Trash2,
  UserRound,
  X,
  Clock,
  CreditCard,
  MessageCircle,
  Image as ImageIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import PageDecor from "./PageDecor.jsx";
import GradientText from "./GradientText.jsx";
import {
  deleteOpportunity,
  getCheckpoints,
  getMyOpportunities,
  updateOpportunity,
} from "../api/opportunities";
import {
  getConnectedOpportunities,
  disconnectOpportunity,
  getConnectionsForOpportunity,
  acceptConnection,
} from "../api/connected";
import {
  fadeUp,
  fadeUpBlur,
  modalOverlay,
  modalPanel,
  stagger,
  useTilt,
} from "../lib/motion.jsx";
import { FilterChip, IconSearchToggle } from "./FilterControls.jsx";

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

const DEFAULT_DEAL_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23e5e7eb'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='16'>No image</text></svg>";

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

const STATUS_STYLES = {
  Active: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Completed: "bg-brand-100 text-brand-700",
  Progress: "bg-sky-100 text-sky-700",
};

function DashboardCard({ opp, actions }) {
  const tilt = useTilt(5);

  return (
    <motion.article
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="glass-panel-strong holo-card group overflow-hidden rounded-[2rem] transition-shadow duration-300 hover:shadow-lift"
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
    >
      <div className="relative h-40 overflow-hidden bg-ink-100 dark:bg-ink-800">
        <img
          src={opp.image || DEFAULT_DEAL_IMAGE}
          alt={opp.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-800 backdrop-blur">
            {opp.sector}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 font-display text-sm font-bold backdrop-blur">
            {opp.company?.slice(0, 2).toUpperCase() || "OP"}
          </span>
          <span className="font-display text-lg font-bold">{opp.company}</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">
          {opp.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
          {opp.blurb || "No description provided."}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-ink-500 dark:text-ink-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {opp.location || "TBD"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {opp.timeline || "TBD"}
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/60 p-3 dark:border-brand-900/50 dark:bg-brand-950/25">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink-700 dark:text-ink-300">
              Funding goal
            </span>
            <span className="font-display font-bold text-brand-700 dark:text-brand-300">
              {opp.goal}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">{actions}</div>
      </div>
    </motion.article>
  );
}

function StatusModal({ opp, isOwner, onClose, navigate, onAccepted }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(opp.status || "Active");
  const [progressOpen, setProgressOpen] = useState(false);
  const [progress, setProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  const openProgress = () => {
    setProgressLoading(true);
    getCheckpoints(opp.id)
      .then((data) => setProgress(data.checkpoints || []))
      .catch(() => setProgress([]))
      .finally(() => setProgressLoading(false));
  };

  useEffect(() => {
    if (!isOwner) return;
    let active = true;
    setLoading(true);
    getConnectionsForOpportunity(opp.id)
      .then((data) => {
        if (active) setConnections(data.connections || []);
      })
      .catch(() => {
        if (active) setConnections([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOwner, opp.id]);

  const handleAccept = async (connectionId) => {
    try {
      await acceptConnection(opp.id, connectionId);
      setCurrentStatus("Active");
      onAccepted?.(opp.id);
      setConnections((prev) => {
        const accepted = prev.find((x) => x.id === connectionId);
        return accepted ? [{ ...accepted, accepted: true }] : prev;
      });
    } catch {
      // ignore
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
        variants={modalOverlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="glass-panel-strong holo-card w-full max-w-lg rounded-[2rem] p-6"
          variants={modalPanel}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
                Project status
              </h2>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                {opp.title}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-ink-400 hover:text-ink-700 dark:text-ink-500 dark:hover:text-ink-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[STATUS_OPTIONS.includes(opp.status) ? opp.status : "Active"]}`}
            >
              Status: {opp.status || "Active"}
            </span>
          </div>

          <div className="mt-6">
            {isOwner ? (
              <>
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                  Investors who connected with this project
                </h3>
                {loading ? (
                  <p className="mt-3 text-sm text-ink-500">Loadingâ€¦</p>
                ) : connections.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-500">
                    No investors have connected with this project yet.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {connections.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-ink-950/40"
                      >
                        <div>
                          <p className="font-semibold text-ink-900 dark:text-ink-50">
                            {c.name || "Unknown"}
                          </p>
                          <p className="text-xs text-ink-500">{c.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-ink-400">
                            {c.connected_at
                              ? new Date(c.connected_at).toLocaleDateString()
                              : ""}
                          </span>
                          {c.accepted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Accepted
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAccept(c.id)}
                              className="btn-primary"
                            >
                              Accept
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate("/connect")}
                            className="btn-ghost"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Chat
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setProgressOpen(true);
                    openProgress();
                  }}
                  className="btn-primary mt-4 w-full"
                >
                  <BarChart3 className="h-4 w-4" />
                  Progress
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/20 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-ink-950/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                    Interested user
                  </p>
                  <p className="mt-1 font-semibold text-ink-900 dark:text-ink-50">
                    {opp.postedByName || "Unknown"}
                  </p>
                  <p className="text-xs text-ink-500">{opp.postedBy || ""}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/connect");
                    }}
                    className="btn-primary flex-1"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/payment/" + opp.id, {
                        state: {
                          deal: {
                            id: opp.id,
                            name: opp.title,
                            company: opp.company,
                            sector: opp.sector,
                            location: opp.location || "TBD",
                            goal: opp.goal || "$0",
                            status: opp.status || "Active",
                            blurb: opp.blurb || "",
                            timeline: opp.timeline || "TBD",
                            image: opp.image || null,
                            postedBy: opp.postedBy || null,
                          },
                        },
                      });
                    }}
                    className="btn-ghost flex-1"
                  >
                    <CreditCard className="h-4 w-4" />
                    Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {progressOpen && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/50 px-4"
          onClick={() => setProgressOpen(false)}
        >
          <div
            className="glass-panel-strong holo-card w-full max-w-md rounded-[2rem] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
                  Investment progress
                </h2>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                  {opp.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProgressOpen(false)}
                className="text-ink-400 hover:text-ink-700 dark:text-ink-500 dark:hover:text-ink-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5">
              {progressLoading ? (
                <p className="text-sm text-ink-500">Loadingâ€¦</p>
              ) : progress.length === 0 ? (
                <p className="text-sm text-ink-500">
                  No checkpoints have been added yet.
                </p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500 dark:bg-ink-900/60 dark:text-ink-400">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                      {progress.map((cp, index) => (
                        <tr key={cp.id || index}>
                          <td className="px-4 py-3 text-ink-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-ink-900 dark:text-ink-50">
                            {cp.title}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-ink-900 dark:text-ink-50">
                            ${(parseFloat(cp.amount) || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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
            onClick={() => navigate("/dashboard")}
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
  const [, setProgressVersion] = useState(0);
  const [statusModal, setStatusModal] = useState(null);
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
      fundingGoal: opp.goal || "",
      description: opp.blurb || "",
      timeline: opp.timeline || "",
      image: opp.image || null,
    });
    setEditStatus("");
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

  const openStatusModal = (opp, isOwner) => setStatusModal({ opp, isOwner });

  const handleAccepted = (opportunityId) => {
    setAllOpportunities((prev) =>
      prev.map((o) =>
        o.id === opportunityId ? { ...o, status: "Progress" } : o,
      ),
    );
  };

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

    try {
      await updateOpportunity(editTarget.id, {
        title: editForm.title,
        company: editForm.company,
        sector: editForm.sector || "Others",
        location: editForm.location || "TBD",
        funding_goal: editForm.fundingGoal || "$0",
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
              goal: editForm.fundingGoal,
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
                className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55"
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
                className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55"
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
                className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55"
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

            {filteredProjects.length === 0 ? (
              <div className="glass-panel-strong holo-card rounded-[2rem] p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-ink-300 dark:text-ink-600" />
                <p className="mt-4 text-ink-500 dark:text-ink-400">
                  No projects matched your search.
                </p>
              </div>
            ) : (
              <motion.div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
                          >
                            <PenLine className="h-4 w-4" />
                            Edit
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openStatusModal(opp, true)}
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[STATUS_OPTIONS.includes(opp.status) ? opp.status : "Active"]}`}
                          >
                            Status: {opp.status || "Active"}
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(opp.id, "own")}
                            className="text-xs font-semibold text-rose-500 transition-colors hover:text-rose-700"
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
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400">
                        <Bookmark className="h-3.5 w-3.5" />
                        Saved
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openStatusModal(opp, false)}
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[STATUS_OPTIONS.includes(opp.status) ? opp.status : "Active"]}`}
                        >
                          Status: {opp.status || "Active"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            confirmDelete(opp.connectionId, "connected")
                          }
                          className="text-xs font-semibold text-rose-500 transition-colors hover:text-rose-700"
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
          {editTarget && (
            <motion.div
              className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
              variants={modalOverlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeEdit}
            >
              <motion.div
                className="glass-panel-strong holo-card w-full max-w-lg rounded-[2rem] p-8"
                variants={modalPanel}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
                      Edit opportunity
                    </h2>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                      Update the details below and save your changes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="text-ink-400 hover:text-ink-700 dark:text-ink-500 dark:hover:text-ink-300"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {editStatus && (
                  <p
                    className={`mt-4 text-sm ${editStatus.includes("successfully") ? "text-brand-700 dark:text-brand-300" : "text-rose-600 dark:text-rose-400"}`}
                  >
                    {editStatus}
                  </p>
                )}

                <form className="mt-6 space-y-4" onSubmit={handleEditSubmit}>
                  <div className="flex flex-col items-center">
                    <label className="group relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="sr-only"
                      />
                      <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-ink-300 bg-ink-50 transition group-hover:border-brand-400 group-hover:bg-brand-50 dark:border-ink-600 dark:bg-ink-800 dark:group-hover:border-brand-500 dark:group-hover:bg-brand-900/20">
                        {editForm.image ? (
                          <img
                            src={editForm.image}
                            alt="Opportunity preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-ink-400 dark:text-ink-500">
                            <ImageIcon className="h-8 w-8" />
                            <span className="text-xs font-medium">
                              Opportunity image
                            </span>
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
                        value={editForm.title}
                        onChange={handleEditChange}
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
                        value={editForm.company}
                        onChange={handleEditChange}
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
                        value={editForm.sector}
                        onChange={handleEditChange}
                        required
                        className={inputClassName}
                      >
                        <option value="">Select a sector</option>
                        {sectors
                          .filter((s) => s !== "All")
                          .map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className={fieldLabelClassName}>Location</span>
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleEditChange}
                        placeholder="e.g., San Francisco, US"
                        className={inputClassName}
                      />
                    </label>
                    <label className="block">
                      <span className={fieldLabelClassName}>Funding goal</span>
                      <input
                        type="text"
                        name="fundingGoal"
                        value={editForm.fundingGoal}
                        onChange={handleEditChange}
                        placeholder="e.g., $1.5M"
                        className={inputClassName}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className={fieldLabelClassName}>Description</span>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
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
                      value={editForm.timeline}
                      onChange={handleEditChange}
                      placeholder="e.g., 14 days"
                      className={inputClassName}
                    />
                  </label>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeEdit}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={editLoading}
                    >
                      <Rocket className="h-4 w-4" />
                      {editLoading ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {statusModal && (
            <StatusModal
              opp={statusModal.opp}
              isOwner={statusModal.isOwner}
              onClose={() => setStatusModal(null)}
              navigate={navigate}
              onAccepted={handleAccepted}
            />
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
