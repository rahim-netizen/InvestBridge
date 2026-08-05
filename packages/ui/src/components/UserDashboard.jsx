import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  MapPin,
  PenLine,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { deleteOpportunity, getMyOpportunities } from "../api/opportunities";

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

export default function UserDashboard({ navigate }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    async function loadOpportunities() {
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
          }));
          setAllOpportunities(mapped);
        }
      } catch {
        // keep empty state on error
      }
    }

    loadOpportunities();
  }, []);

  useEffect(() => {
    const handler = () => {
      loadOpportunities();
    };
    window.addEventListener("opportunity-changed", handler);
    return () => {
      window.removeEventListener("opportunity-changed", handler);
    };
  }, []);

  const filteredProjects = allOpportunities.filter((o) => {
    const q = searchQuery.toLowerCase();
    return o.title.toLowerCase().includes(q);
  });

  const confirmDelete = (id) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);

  const handleDelete = async (id) => {
    try {
      await deleteOpportunity(id);
      const updated = allOpportunities.filter((o) => o.id !== id);
      setAllOpportunities(updated);
      setDeleteId(null);
      window.dispatchEvent(new CustomEvent("opportunity-changed"));
    } catch {
      setDeleteId(null);
    }
  };

  const inputWrapperClassName =
    "surface-rim flex items-center gap-3 rounded-2xl px-4 py-3";

  if (!user) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,97,255,0.16),_transparent_36%),radial-gradient(circle_at_80%_12%,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8 dark:bg-gradient-to-br dark:from-ink-950 dark:via-ink-950 dark:to-ink-900">
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
              Your dashboard shows every project you have posted on InvestBridge.
              Sign in or create an account to continue.
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
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,97,255,0.16),_transparent_36%),radial-gradient(circle_at_80%_12%,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8 dark:bg-gradient-to-br dark:from-ink-950 dark:via-ink-950 dark:to-ink-900">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-[-5rem] top-24 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute right-[-4rem] bottom-10 h-80 w-80 rounded-full bg-gold-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="eyebrow dark:text-brand-400">
              <BarChart3 className="h-3.5 w-3.5" />
              My dashboard
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Projects you posted
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-600 dark:text-ink-300">
              Here are the opportunities you have published on InvestBridge.
              Track progress, share updates, and keep every round moving
              forward.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/opportunities")}
              className="btn-ghost shrink-0"
            >
              <Plus className="h-4 w-4" />
              Post new project
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="theme-toggle grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/30 bg-white/35 text-ink-700"
              aria-label="Back home"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

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
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Projects posted
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                  {totalProjects}
                </p>
              </div>
              <div className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Total funding goal
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                  {allOpportunities.reduce((sum, o) => {
                    const val = parseFloat((o.goal || "$0").replace(/[^0-9.]/g, "")) || 0;
                    return sum + val;
                  }, 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Latest post
                </p>
                <p className="mt-2 font-display text-lg font-bold text-ink-900 dark:text-ink-50 truncate">
                  {allOpportunities[0]?.title || "N/A"}
                </p>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  {allOpportunities[0]?.createdAt ? new Date(allOpportunities[0].createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title..."
                  className={`${inputWrapperClassName} pl-11`}
                />
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="glass-panel-strong holo-card rounded-[2rem] p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-ink-300 dark:text-ink-600" />
                <p className="mt-4 text-ink-500 dark:text-ink-400">
                  No projects matched your search.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((opp) => (
                  <article
                    key={opp.id}
                    className="glass-panel-strong holo-card group overflow-hidden hover:shadow-lift"
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
                        <span className="font-display text-lg font-bold">
                          {opp.company}
                        </span>
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

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => navigate("/connect")}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
                          >
                            <PenLine className="h-4 w-4" />
                            Edit
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => confirmDelete(opp.id)}
                          className="text-xs font-semibold text-rose-500 transition-colors hover:text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {deleteId !== null && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
            <div className="glass-panel-strong holo-card w-full max-w-md rounded-[2rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-rose-600/90 text-white shadow-soft">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
                      Remove project?
                    </h2>
                    <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                      This action cannot be undone. This project will be removed
                      from your dashboard and discovery.
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
                  onClick={() => handleDelete(deleteId)}
                  className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-rose-700"
                >
                  Remove project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
