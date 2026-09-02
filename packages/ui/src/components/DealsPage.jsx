import {
  Sparkles,
  MapPin,
  Clock,
  ArrowUpRight,
  Trash2,
  X,
  DollarSign,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import PageBackground from "./PageBackground.jsx";
import GradientText from "./GradientText.jsx";
import { deleteOpportunity, getAllOpportunities } from "../api/opportunities";
import {
  connectOpportunity,
  disconnectOpportunity,
  getConnectedOpportunities,
} from "../api/connected";
import {
  fadeUp,
  fadeUpBlur,
  modalOverlay,
  modalPanel,
  stagger,
  useTilt,
} from "../lib/motion.jsx";
import {
  FilterChip,
  FilterPopover,
  IconSearchToggle,
  PopoverSelect,
} from "./FilterControls.jsx";

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

const sectors = ["All", "HealthTech", "CleanEnergy", "E-commerce", "AgriTech", "FinTech", "EdTech", "Others"];

const DEFAULT_DEAL_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23e5e7eb'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='16'>No image</text></svg>";

function DealCard({ deal, user, saved, onOpen, onDelete }) {
  const tilt = useTilt(5);

  return (
    <motion.article
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="glass-panel-strong holo-card group overflow-hidden hover:shadow-lift cursor-pointer"
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      onClick={onOpen}
    >
      <div className="relative h-48 overflow-hidden bg-ink-100 dark:bg-ink-800">
        <img
          src={deal.image || DEFAULT_DEAL_IMAGE}
          alt={deal.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-800 backdrop-blur">
            {deal.sector}
          </span>
          {saved && (
            <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              Saved
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
          {deal.name}
        </h3>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          by {deal.company}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
          {deal.blurb}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-ink-500 dark:text-ink-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {deal.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {deal.timeline}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" />
            {deal.goal}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/30 px-6 py-3 dark:border-white/10">
        <a
          href="#"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onOpen();
          }}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
        >
          View deal room
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
        </a>
        {deal.postedBy === user?.email && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 transition-colors hover:text-rose-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>
    </motion.article>
  );
}

export default function DealsPage({ navigate }) {
  const user = getStoredUser();
  const [deals, setDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [goalSort, setGoalSort] = useState("None");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [connectedMap, setConnectedMap] = useState({});
  const [connectingId, setConnectingId] = useState(null);
  const [connectStatus, setConnectStatus] = useState("");

  const loadDeals = useCallback(async () => {
    try {
      const data = await getAllOpportunities();
      if (data.opportunities && data.opportunities.length > 0) {
        // Hide opportunities whose investor has already been accepted, since
        // they are no longer open discovery deals.
        const mapped = data.opportunities
          .filter((opp) => !opp.investor_id)
          .map((opp) => ({
            id: opp.id,
            name: opp.title,
            company: opp.company,
            sector: opp.sector,
            location: opp.location || "TBD",
            goal: opp.funding_goal || "$0",
            blurb: opp.description || "",
            timeline: opp.timeline || "TBD",
            image: opp.image || null,
            postedBy: opp.user?.email || null,
            investorId: opp.investor_id ?? null,
          }));
        setDeals(mapped);
      } else {
        setDeals([]);
      }
    } catch {
      // keep empty state on error
    }
  }, []);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  useEffect(() => {
    const handler = () => {
      loadDeals();
    };
    window.addEventListener("opportunity-changed", handler);
    return () => {
      window.removeEventListener("opportunity-changed", handler);
    };
  }, [loadDeals]);

  const loadConnected = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getConnectedOpportunities();
      if (data.connections) {
        const map = {};
        data.connections.forEach((c) => {
          map[c.opportunity_id] = c.id;
        });
        setConnectedMap(map);
      }
    } catch {
      // keep empty state on error
    }
  }, [user]);

  useEffect(() => {
    loadConnected();
  }, [loadConnected]);

  useEffect(() => {
    const handler = () => {
      loadConnected();
    };
    window.addEventListener("connection-changed", handler);
    return () => {
      window.removeEventListener("connection-changed", handler);
    };
  }, [loadConnected]);

  const handleConnect = async (deal) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setConnectingId(deal.id);
    setConnectStatus("");
    try {
      const data = await connectOpportunity(deal.id);
      setConnectedMap((prev) => ({ ...prev, [deal.id]: data.connection.id }));
      setConnectStatus("Saved to your dashboard.");
    } catch (err) {
      setConnectStatus(err.message || "Could not save this opportunity.");
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (deal) => {
    const connectionId = connectedMap[deal.id];
    if (!connectionId) return;
    setConnectingId(deal.id);
    setConnectStatus("");
    try {
      await disconnectOpportunity(connectionId);
      setConnectedMap((prev) => {
        const next = { ...prev };
        delete next[deal.id];
        return next;
      });
      setConnectStatus("Removed from your dashboard.");
    } catch (err) {
      setConnectStatus(err.message || "Could not remove this opportunity.");
    } finally {
      setConnectingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this opportunity?")) return;
    try {
      await deleteOpportunity(id);
      const updated = deals.filter((d) => d.id !== id);
      setDeals(updated);
      if (selectedDeal?.id === id) {
        setSelectedDeal(null);
      }
    } catch {
      // keep state on error
    }
  };

   const filteredDeals = deals.filter((d) => {
     const q = searchQuery.toLowerCase();
     const matchesSearch = d.location.toLowerCase().includes(q);
     const matchesSector = sectorFilter === "All" || d.sector === sectorFilter;
     return matchesSearch && matchesSector;
   });

  const parseGoal = (goalStr) => {
    if (!goalStr || goalStr === "$0") return 0;
    const num = parseFloat(String(goalStr).replace(/[^0-9.]/g, ""));
    if (Number.isNaN(num)) return 0;
    const suffix = String(goalStr).replace(/[0-9.]/g, "").trim().toUpperCase();
    if (suffix.includes("M")) return num * 1000000;
    if (suffix.includes("K")) return num * 1000;
    return num;
  };

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (goalSort === "High to Low") return parseGoal(b.goal) - parseGoal(a.goal);
    if (goalSort === "Low to High") return parseGoal(a.goal) - parseGoal(b.goal);
    return 0;
  });

  const hasActiveFilters =
    searchQuery.trim() !== "" || sectorFilter !== "All" || goalSort !== "None";

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8">
      <PageBackground image={false} />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-[-5rem] top-24 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute right-[-4rem] bottom-10 h-80 w-80 rounded-full bg-gold-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          initial="hidden"
          animate="visible"
          variants={fadeUpBlur}
        >
          <div>
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Browse and discover deals
            </span>
            <h1 className="mt-4">
              <GradientText
                colors={["#10b981", "#fbbf24", "#10b981"]}
                animationSpeed={5}
                direction="horizontal"
                className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Explore vetted opportunities that match your thesis.
              </GradientText>
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/80">
              Filter by sector and momentum to find
              opportunities worth your time.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <IconSearchToggle
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location..."
            />
            <FilterPopover
              label="Filter deals"
              activeCount={
                (sectorFilter !== "All" ? 1 : 0) + (goalSort !== "None" ? 1 : 0)
              }
            >
              <PopoverSelect
                label="Sector"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                options={sectors}
              />
              <PopoverSelect
                label="Sort by goal"
                value={goalSort}
                onChange={(e) => setGoalSort(e.target.value)}
                options={["None", "High to Low", "Low to High"]}
              />
            </FilterPopover>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="mb-6 flex flex-wrap items-center gap-3"
        >
          <span className="text-sm font-medium text-white/70">
            <span className="font-display font-bold text-white">
              {sortedDeals.length}
            </span>{" "}
            deal{sortedDeals.length !== 1 ? "s" : ""} found
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
            {goalSort !== "None" && (
              <FilterChip
                key="sort"
                label={goalSort}
                onRemove={() => setGoalSort("None")}
              />
            )}
          </AnimatePresence>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSectorFilter("All");
                setGoalSort("None");
              }}
              className="text-xs font-semibold text-white/60 underline-offset-2 transition-colors hover:text-white hover:underline"
            >
              Clear all
            </button>
          )}
        </motion.div>

         <motion.div
           className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
           variants={stagger}
           initial="hidden"
           animate="visible"
         >
           {sortedDeals.length === 0 ? (
             <div className="col-span-full glass-panel-strong holo-card rounded-[2rem] p-8 text-center">
               <p className="text-ink-500 dark:text-ink-400">No deals match your filters.</p>
               <button
                 type="button"
                 onClick={() => {
                   setSearchQuery("");
                   setSectorFilter("All");
                   setGoalSort("None");
                 }}
                 className="mt-4 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400"
               >
                 Clear all filters
               </button>
             </div>
           ) : (
             sortedDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                user={user}
                saved={Boolean(connectedMap[deal.id])}
                onOpen={() => {
                  setSelectedDeal(deal);
                  setConnectStatus("");
                }}
                onDelete={() => handleDelete(deal.id)}
              />
            ))
          )}
        </motion.div>

        <AnimatePresence>
          {selectedDeal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-sm p-4"
              variants={modalOverlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setSelectedDeal(null)}
            >
              <motion.div
                className="glass-panel-strong holo-card rounded-[2rem] p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto dark:bg-ink-950/90"
                variants={modalPanel}
                onClick={(e) => e.stopPropagation()}
              >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                  {selectedDeal.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedDeal(null)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-white/50 text-ink-500 transition hover:bg-white/80 dark:border-white/10 dark:bg-ink-950/40 dark:text-ink-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden mb-6 h-48 bg-ink-100 dark:bg-ink-800">
                <img
                  src={selectedDeal.image || DEFAULT_DEAL_IMAGE}
                  alt={selectedDeal.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
                  {selectedDeal.sector}
                </span>
                <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                  {selectedDeal.location}
                </span>
                <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                  {selectedDeal.company}
                </span>
              </div>

              <p className="text-ink-600 dark:text-ink-300 mb-6">
                {selectedDeal.blurb}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl bg-brand-50 p-4 text-center dark:bg-brand-400/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    Funding goal
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {selectedDeal.goal}
                  </p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-4 text-center dark:bg-brand-400/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    Timeline
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {selectedDeal.timeline}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {!user ? (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="btn-primary w-full"
                  >
                    Sign in to invest
                  </button>
                ) : selectedDeal.postedBy === user.email ? (
                  <button
                    type="button"
                    disabled
                    className="btn-ghost w-full cursor-not-allowed opacity-60"
                  >
                    Your post
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={connectingId === selectedDeal?.id}
                    onClick={() =>
                      connectedMap[selectedDeal.id]
                        ? handleDisconnect(selectedDeal)
                        : handleConnect(selectedDeal)
                    }
                    className="btn-ghost w-full"
                  >
                    {connectingId === selectedDeal?.id
                      ? "Please wait..."
                      : connectedMap[selectedDeal.id]
                      ? "Remove from dashboard"
                      : "Save to dashboard"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDeal(null)}
                  className="btn-ghost w-full"
                >
                  Close
                </button>
              </div>

              {connectStatus && (
                <p className="mt-3 text-center text-sm font-semibold text-brand-700 dark:text-brand-300">
                  {connectStatus}
                </p>
              )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
