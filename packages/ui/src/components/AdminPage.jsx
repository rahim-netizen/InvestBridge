import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import PageDecor from "./PageDecor.jsx";
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Link2,
  Loader2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Table as TableIcon,
  Trash2,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { fadeUp, stagger, useCountUp, useInView } from "../lib/motion.jsx";
import { apiLogout } from "../api/auth";
import {
  getMilestoneAmount,
  getNextMilestone,
  getProjectPaymentState,
  saveProjectProgress,
} from "../lib/projectProgress";
import {
  deleteAdminOpportunity,
  deleteAdminUser,
  getAdminOpportunities,
  getAdminComplaints,
  sendComplaintFeedback,
  getAdminStats,
  getAdminUsers,
  setAdminOpportunityStatus,
} from "../api/admin";

/* ---------- primitives ---------------------------------------------------- */

// A colored stat card in the SB-Admin style: solid gradient body with an icon
// tile and value, and a "view details" footer that jumps to the matching tab.
function StatCard({ icon: Icon, label, value, tone, onClick, isInView }) {
  const display = useCountUp(String(value), isInView);
  const tones = {
    brand: {
      body: "from-brand-500 to-brand-700",
      footer: "bg-brand-800/70",
    },
    sky: {
      body: "from-sky-500 to-sky-700",
      footer: "bg-sky-800/70",
    },
    gold: {
      body: "from-amber-500 to-amber-600",
      footer: "bg-amber-700/70",
    },
    rose: {
      body: "from-rose-500 to-rose-600",
      footer: "bg-rose-700/70",
    },
  }[tone];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={fadeUp}
      whileHover={{ y: -3 }}
      className={`group flex flex-col overflow-hidden rounded-2xl text-left text-white shadow-[0_18px_40px_rgba(2,6,23,0.35)] ring-1 ring-white/10 transition-shadow hover:shadow-[0_24px_60px_rgba(2,6,23,0.5)]`}
    >
      <div
        className={`flex items-center gap-4 bg-gradient-to-br ${tones.body} p-5`}
      >
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/75">
            {label}
          </p>
          <p className="mt-0.5 font-display text-2xl font-extrabold leading-tight">
            {display}
          </p>
        </div>
      </div>
      <div
        className={`flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-white/85 ${tones.footer}`}
      >
        View details
        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  );
}

// Frames the tab content the way SB-Admin frames each report: a titled
// header strip, then a body with the table/search.
function ContentCard({ icon: Icon, title, actions, children }) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="glass-panel overflow-hidden rounded-2xl"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/60 px-5 py-3.5 dark:bg-ink-950/60">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
          {Icon && (
            <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          )}
          {title}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </header>
      <div className="p-5">{children}</div>
    </motion.section>
  );
}

function formatDate(value) {
  if (!value) return "â€”";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "â€”";
  }
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[80] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-soft backdrop-blur-xl ${
              toast.type === "error"
                ? "border-rose-200 bg-rose-50/95 text-rose-800"
                : "border-emerald-200 bg-emerald-50/95 text-emerald-800"
            }`}
          >
            {toast.type === "error" ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ConfirmDialog({ config, onCancel, onConfirm, busy }) {
  return (
    <AnimatePresence>
      {config && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="glass-panel-strong w-full max-w-sm rounded-2xl p-6"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-700">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink-900">
                  {config.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">
                  {config.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {config.confirmLabel || "Remove"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- sidebar model ------------------------------------------------- */

// SB-Admin groups items under headings ("Core", "Interface", "Addons"). We
// mirror that grouping so the sidebar reads at a glance.
const navGroups = [
  {
    heading: "Core",
    items: [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Management",
    items: [
      { key: "users", label: "Users", icon: Users },
      { key: "projects", label: "Projects", icon: TableIcon },
      { key: "complaints", label: "Complaints", icon: MessageSquareWarning },
    ],
  },
];

const sectionMeta = {
  dashboard: { title: "Dashboard", crumb: "Dashboard" },
  users: { title: "Users", crumb: "Management / Users" },
  projects: { title: "Projects", crumb: "Management / Projects" },
  complaints: { title: "Complaints", crumb: "Management / Complaints" },
};

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(
      localStorage.getItem("investbridgeSessionUser") || "null",
    );
  } catch {
    return null;
  }
}

/* ---------- main component ----------------------------------------------- */

export default function AdminPage({ navigate }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [stats, setStats] = useState({
    users: 0,
    activeOpportunities: 0,
    connections: 0,
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feedback, setFeedback] = useState({});

  const [activeTab, setActiveTab] = useState("dashboard");
  const [userSearch, setUserSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");

  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [busyAction, setBusyAction] = useState(false);
  const [pendingRowId, setPendingRowId] = useState(null);
  const [projectProgress, setProjectProgress] = useState({});

  // The sidebar is collapsed to icons on desktop and hidden on mobile. On
  // desktop the toggle flips a persisted flag; on mobile it opens/closes an
  // overlay. One state powers both because SB-Admin behaves the same way.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const currentUser = getStoredUser();
  const profileLabel = currentUser?.name || currentUser?.email || "Admin";
  const profileInitial = String(profileLabel).charAt(0).toUpperCase();

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

  const pushToast = (message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const loadAll = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [statsRes, usersRes, opportunitiesRes, complaintsRes] =
        await Promise.all([
          getAdminStats(),
          getAdminUsers(),
          getAdminOpportunities(),
          getAdminComplaints(),
        ]);
      setStats(statsRes.stats || stats);
      setUsers(usersRes.users || []);
      setProjects(opportunitiesRes.opportunities || []);
      setComplaints(complaintsRes.complaints || []);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("permission")) {
        navigate("/");
        return;
      }
      setLoadError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the mobile drawer whenever we jump to a section so it doesn't sit
  // open over the newly-loaded content.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [activeTab]);

  const filteredUsers = useMemo(() => {
    const query = (userSearch || globalSearch).trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  }, [users, userSearch, globalSearch]);

  const filteredProjects = useMemo(() => {
    const query = (projectSearch || globalSearch).trim().toLowerCase();
    if (!query) return projects;
    return projects.filter(
      (project) =>
        project.title?.toLowerCase().includes(query) ||
        project.company?.toLowerCase().includes(query) ||
        project.user?.name?.toLowerCase().includes(query),
    );
  }, [projects, projectSearch, globalSearch]);

  const requestConfirm = (config) => setConfirmConfig(config);
  const closeConfirm = () => {
    if (busyAction) return;
    setConfirmConfig(null);
  };

  const runConfirmed = async (action) => {
    setBusyAction(true);
    try {
      await action();
    } finally {
      setBusyAction(false);
      setConfirmConfig(null);
    }
  };

  const handleDeleteUser = (user) => {
    requestConfirm({
      title: "Remove this user?",
      message: `${user.name} will lose access immediately and this cannot be undone.`,
      confirmLabel: "Remove user",
      onConfirm: () =>
        runConfirmed(async () => {
          try {
            await deleteAdminUser(user.id);
            setUsers((current) => current.filter((u) => u.id !== user.id));
            pushToast(`${user.name} was removed.`);
          } catch (err) {
            pushToast(err.message || "Failed to remove user.", "error");
          }
        }),
    });
  };

  const handleDeleteProject = (project) => {
    requestConfirm({
      title: "Remove this project?",
      message: `"${project.title}" will be permanently deleted from the platform.`,
      confirmLabel: "Remove project",
      onConfirm: () =>
        runConfirmed(async () => {
          try {
            await deleteAdminOpportunity(project.id);
            setProjects((current) =>
              current.filter((p) => p.id !== project.id),
            );
            pushToast(`"${project.title}" was removed.`);
          } catch (err) {
            pushToast(err.message || "Failed to remove project.", "error");
          }
        }),
    });
  };

  const handleToggleProjectStatus = async (project) => {
    const nextStatus = project.status === "suspended" ? "active" : "suspended";
    setPendingRowId(project.id);
    try {
      const res = await setAdminOpportunityStatus(project.id, nextStatus);
      setProjects((current) =>
        current.map((p) =>
          p.id === project.id ? { ...p, status: res.opportunity.status } : p,
        ),
      );
      pushToast(
        nextStatus === "suspended"
          ? `"${project.title}" was suspended.`
          : `"${project.title}" is active again.`,
      );
    } catch (err) {
      pushToast(err.message || "Failed to update project status.", "error");
    } finally {
      setPendingRowId(null);
    }
  };

  // The old file called handlePayMilestone from the progress cell but never
  // defined it â€” clicking Pay would throw. This wires the button up against
  // the same local-storage progress store the rest of the app reads.
  const handlePayMilestone = (project) => {
    const state =
      projectProgress[project.id] || getProjectPaymentState(project);
    const next = getNextMilestone(state.progress);
    if (!next) return;
    const paidMilestones = Array.from(new Set([...state.paidMilestones, next]));
    saveProjectProgress(project.id, next, paidMilestones);
    setProjectProgress((current) => ({
      ...current,
      [project.id]: { progress: next, paidMilestones },
    }));
    pushToast(`Marked ${next}% milestone paid for "${project.title}".`);
  };

  const handleSendFeedback = async (complaint) => {
    const text = (feedback[complaint.id] || "").trim();
    if (!text) return;

    try {
      const response = await sendComplaintFeedback(complaint.id, text);
      setComplaints((current) =>
        current.map((item) =>
          item.id === complaint.id ? response.complaint : item,
        ),
      );
      setFeedback((current) => ({ ...current, [complaint.id]: "" }));
      pushToast("Feedback sent to the user.");
    } catch (err) {
      pushToast(err.message || "Failed to send feedback.", "error");
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    navigate("/");
  };

  /* ---------- render helpers --------------------------------------------- */

  const renderStatCards = () => (
    <motion.div
      ref={statsRef}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <StatCard
        icon={Users}
        tone="brand"
        label="Total users"
        value={stats.users}
        onClick={() => setActiveTab("users")}
        isInView={statsInView}
      />
      <StatCard
        icon={TableIcon}
        tone="sky"
        label="Active projects"
        value={stats.activeOpportunities}
        onClick={() => setActiveTab("projects")}
        isInView={statsInView}
      />
      <StatCard
        icon={Link2}
        tone="gold"
        label="Connections"
        value={stats.connections}
        onClick={() => setActiveTab("dashboard")}
        isInView={statsInView}
      />
      <StatCard
        icon={MessageSquareWarning}
        tone="rose"
        label="Complaints"
        value={complaints.length}
        onClick={() => setActiveTab("complaints")}
        isInView={statsInView}
      />
    </motion.div>
  );

  const renderDashboard = () => {
    const recentUsers = users.slice(0, 5);
    const recentProjects = projects.slice(0, 5);
    return (
      <div className="grid gap-5 xl:grid-cols-2">
        <ContentCard icon={Users} title="Recent sign-ups">
          <ul className="divide-y divide-white/5">
            {recentUsers.length === 0 && (
              <li className="py-6 text-center text-sm text-ink-400">
                No users yet.
              </li>
            )}
            {recentUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-500 ring-1 ring-brand-500/25">
                    {String(user.name || user.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                      {user.name || "â€”"}
                    </p>
                    <p className="text-xs text-ink-500">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs text-ink-400">
                  {formatDate(user.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </ContentCard>
        <ContentCard icon={TableIcon} title="Recent projects">
          <ul className="divide-y divide-white/5">
            {recentProjects.length === 0 && (
              <li className="py-6 text-center text-sm text-ink-400">
                No projects yet.
              </li>
            )}
            {recentProjects.map((project) => (
              <li
                key={project.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    {project.title}
                  </p>
                  <p className="text-xs text-ink-500">
                    {project.user?.name || "Unknown founder"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    project.status === "suspended"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {project.status === "suspended" ? "Suspended" : "Active"}
                </span>
              </li>
            ))}
          </ul>
        </ContentCard>
      </div>
    );
  };

  const renderUsersTable = () => (
    <ContentCard
      icon={Users}
      title={`Users (${users.length})`}
      actions={
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            placeholder="Search name or emailâ€¦"
            className="w-full rounded-xl border border-ink-100 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink-700 outline-none transition-colors focus:border-brand-300 dark:border-ink-800 dark:bg-ink-950/40"
          />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wider text-ink-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            <AnimatePresence initial={false}>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="px-4 py-3.5 font-semibold text-ink-900 dark:text-ink-100">
                    {user.name}
                  </td>
                  <td className="px-4 py-3.5 text-ink-500">{user.email}</td>
                  <td className="px-4 py-3.5 text-ink-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="py-8 text-center text-ink-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ContentCard>
  );

  const renderProjectsTable = () => (
    <ContentCard
      icon={TableIcon}
      title={`Projects (${projects.length})`}
      actions={
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={projectSearch}
            onChange={(event) => setProjectSearch(event.target.value)}
            placeholder="Search project or founderâ€¦"
            className="w-full rounded-xl border border-ink-100 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink-700 outline-none transition-colors focus:border-brand-300 dark:border-ink-800 dark:bg-ink-950/40"
          />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wider text-ink-400">
              <th className="px-4 py-3">Project Name</th>
              <th className="px-4 py-3">Founder</th>
              <th className="px-4 py-3">Funding Goal</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            <AnimatePresence initial={false}>
              {filteredProjects.map((project) => {
                const state =
                  projectProgress[project.id] ||
                  getProjectPaymentState(project);
                const nextMilestone = getNextMilestone(state.progress);
                return (
                  <motion.tr
                    key={project.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3.5 font-semibold text-ink-900 dark:text-ink-100">
                      {project.title}
                    </td>
                    <td className="px-4 py-3.5 text-ink-500">
                      {project.user?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-ink-900 dark:text-ink-100">
                      {project.funding_goal || "â€”"}
                    </td>
                    <td className="min-w-44 px-4 py-3.5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-ink-700 dark:text-ink-300">
                            {state.progress}% complete
                          </span>
                          <span className="text-ink-400">
                            {state.paidMilestones.length}/4 paid
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all duration-500"
                            style={{ width: `${state.progress}%` }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePayMilestone(project)}
                          disabled={
                            !nextMilestone || pendingRowId === project.id
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800 disabled:cursor-not-allowed disabled:text-ink-400 dark:text-brand-400"
                          title={
                            nextMilestone
                              ? `Pay ${nextMilestone}% milestone (${getMilestoneAmount(
                                  project,
                                  nextMilestone,
                                ).toLocaleString(undefined, {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 0,
                                })})`
                              : "All milestones paid"
                          }
                        >
                          <Banknote className="h-3.5 w-3.5" />
                          {nextMilestone
                            ? `Pay ${nextMilestone}% milestone`
                            : "Fully funded"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          project.status === "suspended"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {project.status === "suspended"
                          ? "Suspended"
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleProjectStatus(project)}
                          disabled={pendingRowId === project.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-all hover:border-amber-300 hover:bg-amber-100 disabled:opacity-50"
                        >
                          {pendingRowId === project.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : project.status === "suspended" ? (
                            <PlayCircle className="h-3.5 w-3.5" />
                          ) : (
                            <PauseCircle className="h-3.5 w-3.5" />
                          )}
                          {project.status === "suspended"
                            ? "Activate"
                            : "Suspend"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center text-ink-400">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ContentCard>
  );

  const renderComplaintsTable = () => (
    <ContentCard
      icon={MessageSquareWarning}
      title={`Complaints (${complaints.length})`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wider text-ink-400">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Complaint</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {complaints.map((complaint) => (
              <tr key={complaint.id} className="hover:bg-white/5">
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-ink-900 dark:text-ink-100">
                    {complaint.user?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-ink-500">
                    {complaint.user?.email}
                  </p>
                </td>
                <td className="px-4 py-3.5 font-semibold text-ink-900 dark:text-ink-100">
                  {complaint.subject}
                </td>
                <td className="max-w-md px-4 py-3.5 text-ink-600 dark:text-ink-300">
                  {complaint.message}
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    {complaint.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-ink-500">
                  {formatDate(complaint.created_at)}
                </td>
                <td className="min-w-64 px-4 py-3.5">
                  {complaint.feedback && (
                    <p className="mb-2 text-xs text-emerald-700 dark:text-emerald-400">
                      {complaint.feedback}
                    </p>
                  )}
                  <textarea
                    value={feedback[complaint.id] || ""}
                    onChange={(event) =>
                      setFeedback((current) => ({
                        ...current,
                        [complaint.id]: event.target.value,
                      }))
                    }
                    placeholder="Write feedback"
                    rows="2"
                    className="w-full rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs outline-none dark:border-ink-800 dark:bg-ink-950"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendFeedback(complaint)}
                    className="mt-2 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Send
                  </button>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center text-ink-400">
                  No complaints found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ContentCard>
  );

  const renderActiveContent = () => {
    if (loading) {
      return (
        <div className="glass-panel flex flex-col items-center justify-center gap-3 rounded-2xl py-16 text-ink-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm font-medium">Loading admin dataâ€¦</p>
        </div>
      );
    }
    if (loadError) {
      return (
        <div className="glass-panel flex flex-col items-center justify-center gap-3 rounded-2xl py-16 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-medium text-ink-600">{loadError}</p>
          <button type="button" onClick={loadAll} className="btn-ghost">
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      );
    }
    // Each renderer returns a ContentCard (or a grid of them) that animates
    // its own mount, so a plain switch here is enough â€” wrapping in
    // AnimatePresence mode="wait" around plain-div children swallowed the
    // swap in practice.
    if (activeTab === "users") return renderUsersTable();
    if (activeTab === "projects") return renderProjectsTable();
    if (activeTab === "complaints") return renderComplaintsTable();
    return renderDashboard();
  };

  /* ---------- sidebar ---------------------------------------------------- */

  // A single sidebar component that renders in three modes:
  //  - Desktop expanded (labels + icons)
  //  - Desktop collapsed (icons only, tooltips via title)
  //  - Mobile overlay (labels + icons, full-height)
  const SideNav = ({ mode }) => {
    const collapsed = mode === "collapsed";
    return (
      <aside
        className={`flex h-full flex-col border-r border-white/10 bg-gradient-to-b from-ink-950 to-[#04140f] text-ink-100 ${
          mode === "mobile" ? "w-72" : collapsed ? "w-16" : "w-64"
        }`}
      >
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {navGroups.map((group) => (
            <div key={group.heading} className="mb-4">
              {!collapsed && (
                <p className="px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-widest text-ink-500">
                  {group.heading}
                </p>
              )}
              {collapsed && (
                <div className="mx-auto my-2 h-px w-6 bg-white/10" />
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.key;
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(item.key)}
                        title={collapsed ? item.label : undefined}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                          active
                            ? "bg-brand-500/15 text-brand-300 shadow-[inset_2px_0_0_0_rgb(52,211,153)]"
                            : "text-ink-300 hover:bg-white/5 hover:text-white"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          {collapsed ? (
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="grid h-10 w-full place-items-center rounded-xl border border-rose-800/50 bg-rose-950/40 text-rose-300 transition hover:border-rose-700 hover:bg-rose-900/60"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">
                Signed in as
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-white">
                {profileLabel}
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-800/50 bg-rose-950/40 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:border-rose-700 hover:bg-rose-900/60"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    );
  };

  /* ---------- shell ------------------------------------------------------ */

  const meta = sectionMeta[activeTab] || sectionMeta.dashboard;

  return (
    <div className="dark relative min-h-screen">
      <PageBackground image={false} gradient={AURORA_BG} />
        <PageDecor />

      {/* Top navbar â€” fixed across the top like SB-Admin's .sb-topnav */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-white/10 bg-ink-950/85 pl-0 pr-4 backdrop-blur-2xl sm:pr-6">
        {/* Brand block spans the sidebar column on desktop */}
        <div
          className={`hidden h-full items-center border-r border-white/10 px-4 md:flex ${
            sidebarCollapsed ? "w-16 justify-center" : "w-64"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-brand-600/90 text-white shadow-soft">
              <Landmark className="h-5 w-5" />
            </span>
            {!sidebarCollapsed && (
              <span className="font-display text-lg font-extrabold tracking-tight text-white">
                Invest<span className="text-brand-400">Bridge</span>
              </span>
            )}
          </div>
        </div>

        {/* Sidebar toggle */}
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 768) {
              setMobileNavOpen((value) => !value);
            } else {
              setSidebarCollapsed((value) => !value);
            }
          }}
          className="ml-2 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-100 transition hover:border-brand-500/40 hover:bg-white/10 hover:text-brand-400 md:ml-4"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Global search â€” hidden on very small screens */}
        <div className="ml-3 hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search users or projectsâ€¦"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-500 outline-none transition-colors focus:border-brand-400/50"
            />
          </div>
        </div>

        {/* Brand initials on mobile â€” a compact wordmark since the sidebar
            brand is hidden */}
        <span className="ml-3 flex items-center gap-2 font-display text-base font-extrabold text-white md:hidden">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 bg-brand-600/90">
            <Landmark className="h-4 w-4" />
          </span>
          <span className="hidden xs:inline">
            Invest<span className="text-brand-400">Bridge</span>
          </span>
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-100 transition hover:border-brand-500/40 hover:bg-white/10 hover:text-brand-400 disabled:opacity-50"
            aria-label="Refresh data"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-brand-400/40 bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
              aria-label="Open profile menu"
            >
              {profileInitial}
            </button>
            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-72 rounded-3xl border border-brand-500/20 bg-ink-950/95 p-4 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-2xl"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{profileLabel}</p>
                      <p className="text-sm text-ink-400">Administrator</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-ink-300">
                    <p>
                      <span className="font-semibold text-white">Email:</span>{" "}
                      {currentUser?.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-800/50 bg-rose-950/40 px-3 py-2 text-sm font-semibold text-rose-300 transition hover:border-rose-700 hover:bg-rose-900/60"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Layout: sidebar + content, sitting under the fixed 64px topnav. */}
      <div className="flex min-h-screen pt-16">
        {/* Desktop sidebar */}
        <div
          className={`fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] md:block ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <SideNav mode={sidebarCollapsed ? "collapsed" : "expanded"} />
        </div>

        {/* Mobile drawer + backdrop â€” the drawer only mounts while open so
            we never race a stalled CSS transition. */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 top-16 z-30 bg-ink-950/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
        {mobileNavOpen && (
          <div className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] md:hidden">
            <SideNav mode="mobile" />
          </div>
        )}

        {/* Main content column â€” offset by the sidebar width on desktop */}
        <main
          className={`flex min-h-[calc(100vh-4rem)] w-full flex-col ${
            sidebarCollapsed ? "md:pl-16" : "md:pl-64"
          }`}
        >
          <div className="flex-1 px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
              {/* Page header + breadcrumb, matching SB-Admin's h1 + .breadcrumb */}
              <div>
                <h1 className="font-display text-3xl font-extrabold text-white">
                  {meta.title}
                </h1>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-ink-400">
                  Admin / {meta.crumb}
                </p>
              </div>

              {renderStatCards()}
              {renderActiveContent()}
            </div>
          </div>

          {/* Footer â€” echoes SB-Admin's small copyright strip */}
          <footer className="mt-auto border-t border-white/10 bg-ink-950/60 px-4 py-4 backdrop-blur-xl sm:px-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-ink-400 sm:flex-row">
              <span>
                Â© {new Date().getFullYear()} InvestBridge Â· Admin console
              </span>
              <span className="flex items-center gap-3">
                <BarChart3 className="h-3.5 w-3.5" />
                Data refreshed live
              </span>
            </div>
          </footer>
        </main>
      </div>

      <ConfirmDialog
        config={confirmConfig}
        onCancel={closeConfirm}
        onConfirm={() => confirmConfig?.onConfirm()}
        busy={busyAction}
      />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
