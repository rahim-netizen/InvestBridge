import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageBackground from "./PageBackground.jsx";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Landmark,
  Link2,
  Loader2,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sun,
  Trash2,
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
  getAdminStats,
  getAdminUsers,
  setAdminOpportunityStatus,
} from "../api/admin";

function StatCard({ icon: Icon, iconClass, label, value, isInView }) {
  const display = useCountUp(String(value), isInView);
  return (
    <motion.div className="glass-panel holo-card p-6" variants={fadeUp} whileHover={{ y: -3 }}>
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl p-3 ${iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="text-2xl font-bold text-ink-900">{display}</p>
        </div>
      </div>
    </motion.div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-full max-w-sm flex-col gap-2">
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
            <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
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
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm"
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
                <h3 className="text-base font-semibold text-ink-900">{config.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{config.message}</p>
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

const navTabs = [
  { key: "users", label: "Users", icon: Users },
  { key: "projects", label: "Projects", icon: LayoutDashboard },
];

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("investbridgeSessionUser") || "null");
  } catch {
    return null;
  }
}

export default function AdminPage({ navigate, theme, toggleTheme }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [stats, setStats] = useState({
    users: 0,
    activeOpportunities: 0,
    connections: 0,
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [activeTab, setActiveTab] = useState("users"); // "users", "projects"
  const [userSearch, setUserSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [busyAction, setBusyAction] = useState(false);
  const [pendingRowId, setPendingRowId] = useState(null);
  const [projectProgress, setProjectProgress] = useState({});

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const currentUser = getStoredUser();
  const profileLabel = currentUser?.name || currentUser?.email || "Admin";
  const profileInitial = String(profileLabel).charAt(0).toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });

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
      const [statsRes, usersRes, opportunitiesRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminOpportunities(),
      ]);
      setStats(statsRes.stats || stats);
      setUsers(usersRes.users || []);
      setProjects(opportunitiesRes.opportunities || []);
      setProjectProgress(
        Object.fromEntries(
          (opportunitiesRes.opportunities || []).map((project) => [
            project.id,
            getProjectPaymentState(project),
          ]),
        ),
      );
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

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  }, [users, userSearch]);

  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter(
      (project) =>
        project.title?.toLowerCase().includes(query) ||
        project.company?.toLowerCase().includes(query) ||
        project.user?.name?.toLowerCase().includes(query),
    );
  }, [projects, projectSearch]);

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
            setProjects((current) => current.filter((p) => p.id !== project.id));
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
        current.map((p) => (p.id === project.id ? { ...p, status: res.opportunity.status } : p)),
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

  const handlePayMilestone = (project) => {
    const state = projectProgress[project.id] || getProjectPaymentState(project);
    const nextMilestone = getNextMilestone(state.progress);
    if (!nextMilestone) {
      pushToast(`All milestones for "${project.title}" are paid.`);
      return;
    }

    const nextState = {
      progress: nextMilestone,
      paidMilestones: [...state.paidMilestones, nextMilestone],
    };
    saveProjectProgress(project.id, nextState.progress, nextState.paidMilestones);
    setProjectProgress((current) => ({ ...current, [project.id]: nextState }));
    pushToast(`Milestone ${nextMilestone}% paid to ${project.user?.name || "the entrepreneur"}.`);
  };

  const handleLogout = async () => {
    await apiLogout();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <PageBackground />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-[-5rem] top-24 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute right-[-5rem] bottom-12 h-96 w-96 rounded-full bg-gold-200/20 blur-3xl" />
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-2xl transition-all duration-300 ${
          scrolled
            ? "border-brand-500/15 bg-ink-950/80 shadow-[0_10px_30px_rgba(2,6,23,0.45)]"
            : "border-brand-500/10 bg-ink-950/55 shadow-[0_8px_24px_rgba(2,6,23,0.3)]"
        }`}
      >
        <nav className="container-page flex h-16 items-center justify-between sm:h-20">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-brand-600/90 text-white shadow-soft backdrop-blur-sm">
              <Landmark className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Invest<span className="text-brand-500">Bridge</span>
            </span>
            <span className="ml-1 hidden rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-300 sm:inline-block">
              Admin
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`nav-link flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    active ? "text-brand-400" : "text-ink-100/75 hover:text-brand-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-100 shadow-[0_6px_18px_rgba(2,6,23,0.3)] transition hover:border-brand-500/40 hover:bg-white/10 hover:text-brand-400"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-100 transition hover:border-brand-500/40 hover:bg-white/10 hover:text-brand-400 disabled:opacity-50"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((value) => !value)}
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-brand-400/40 bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white shadow-[0_0_0_3px_rgba(16,185,129,0.15)] backdrop-blur-sm"
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
                      <div className="grid h-11 w-11 place-items-center rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 backdrop-blur-sm">
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

          <button
            type="button"
            onClick={() => setMobileNavOpen((value) => !value)}
            className="theme-toggle grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-100 shadow-[0_6px_18px_rgba(2,6,23,0.3)] transition hover:border-brand-500/40 hover:bg-white/10 hover:text-brand-400 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-white/10 bg-ink-950/90 backdrop-blur-2xl md:hidden"
            >
              <div className="container-page flex flex-col gap-1 py-4">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.key);
                        setMobileNavOpen(false);
                      }}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                        active ? "bg-brand-500/10 text-brand-400" : "text-ink-100 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="theme-toggle grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-100 shadow-[0_6px_18px_rgba(2,6,23,0.3)] transition hover:border-brand-500/40 hover:bg-white/10 hover:text-brand-400"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      loadAll();
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-ink-100"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      handleLogout();
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-800/50 bg-rose-950/40 px-3 py-2 text-sm font-semibold text-rose-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 holo-scene">
        <motion.div
          ref={statsRef}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            icon={Users}
            iconClass="bg-brand-100 text-brand-700"
            label="Total users"
            value={stats.users}
            isInView={statsInView}
          />
          <StatCard
            icon={LayoutDashboard}
            iconClass="bg-emerald-100 text-emerald-700"
            label="Active projects"
            value={stats.activeOpportunities}
            isInView={statsInView}
          />
          <StatCard
            icon={Link2}
            iconClass="bg-purple-100 text-purple-700"
            label="Connections"
            value={stats.connections}
            isInView={statsInView}
          />
        </motion.div>

        <section className="glass-panel rounded-[2rem] p-8 holo-card">
          <div className="flex flex-col gap-6 border-b border-ink-100 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700">Your Tasks</p>
              <h2 className="mt-1 text-xl font-semibold text-ink-900">
                Manage Platform Records
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === "users"
                    ? "bg-brand-600 text-white shadow-soft dark:shadow-glow"
                    : "bg-ink-50 text-ink-600 hover:bg-ink-100 dark:hover:shadow-glow"
                }`}
              >
                Users ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === "projects"
                    ? "bg-brand-600 text-white shadow-soft dark:shadow-glow"
                    : "bg-ink-50 text-ink-600 hover:bg-ink-100 dark:hover:shadow-glow"
                }`}
              >
                Projects ({projects.length})
              </button>
            </div>
          </div>

          <div className="mt-6">
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm font-medium">Loading admin data…</p>
              </div>
            )}

            {!loading && loadError && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
                <p className="text-sm font-medium text-ink-600">{loadError}</p>
                <button type="button" onClick={loadAll} className="btn-ghost">
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            )}

            {!loading && !loadError && (
              <AnimatePresence mode="wait">
                {activeTab === "users" && (
                  <motion.div
                    key="users"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-end border-b border-ink-100/50 pb-4">
                      <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(event) => setUserSearch(event.target.value)}
                          placeholder="Search name or email…"
                          className="w-full rounded-xl border border-ink-100 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink-700 outline-none transition-colors focus:border-brand-300 dark:bg-ink-950/40 dark:border-ink-800"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wider text-ink-400">
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Joined</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-50 text-sm">
                          <AnimatePresence initial={false}>
                            {filteredUsers.map((user) => (
                              <motion.tr
                                key={user.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                                className="transition-colors hover:bg-ink-50/50"
                              >
                                <td className="py-3.5 px-4 font-semibold text-ink-900">
                                  {user.name}
                                </td>
                                <td className="py-3.5 px-4 text-ink-500">{user.email}</td>
                                <td className="py-3.5 px-4 text-ink-500">
                                  {formatDate(user.created_at)}
                                </td>
                                <td className="py-3.5 px-4 text-right">
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
                  </motion.div>
                )}

                {activeTab === "projects" && (
                  <motion.div
                    key="projects"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-end border-b border-ink-100/50 pb-4">
                      <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <input
                          type="text"
                          value={projectSearch}
                          onChange={(event) => setProjectSearch(event.target.value)}
                          placeholder="Search project or founder…"
                          className="w-full rounded-xl border border-ink-100 bg-white/70 py-2 pl-9 pr-3 text-sm text-ink-700 outline-none transition-colors focus:border-brand-300 dark:bg-ink-950/40 dark:border-ink-800"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wider text-ink-400">
                            <th className="py-3 px-4">Project Name</th>
                            <th className="py-3 px-4">Founder</th>
                            <th className="py-3 px-4">Funding Goal</th>
                            <th className="py-3 px-4">Progress</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-50 text-sm">
                          <AnimatePresence initial={false}>
                            {filteredProjects.map((project) => (
                              <motion.tr
                                key={project.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                                className="transition-colors hover:bg-ink-50/50"
                              >
                                <td className="py-3.5 px-4 font-semibold text-ink-900">
                                  {project.title}
                                </td>
                                <td className="py-3.5 px-4 text-ink-500">
                                  {project.user?.name || "Unknown"}
                                </td>
                                <td className="py-3.5 px-4 font-medium text-ink-900">
                                  {project.funding_goal || "—"}
                                </td>
                                <td className="min-w-44 py-3.5 px-4">
                                  {(() => {
                                    const state = projectProgress[project.id] || getProjectPaymentState(project);
                                    const nextMilestone = getNextMilestone(state.progress);
                                    return (
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="font-semibold text-ink-700 dark:text-ink-300">{state.progress}% complete</span>
                                          <span className="text-ink-400">{state.paidMilestones.length}/4 paid</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                                          <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${state.progress}%` }} />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handlePayMilestone(project)}
                                          disabled={!nextMilestone || pendingRowId === project.id}
                                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800 disabled:cursor-not-allowed disabled:text-ink-400 dark:text-brand-400"
                                          title={nextMilestone ? `Pay ${nextMilestone}% milestone (${getMilestoneAmount(project, nextMilestone).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })})` : "All milestones paid"}
                                        >
                                          <Banknote className="h-3.5 w-3.5" />
                                          {nextMilestone ? `Pay ${nextMilestone}% milestone` : "Fully funded"}
                                        </button>
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                      project.status === "suspended"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-emerald-100 text-emerald-800"
                                    }`}
                                  >
                                    {project.status === "suspended" ? "Suspended" : "Active"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
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
                                      {project.status === "suspended" ? "Activate" : "Suspend"}
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
                            ))}
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
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </section>
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
