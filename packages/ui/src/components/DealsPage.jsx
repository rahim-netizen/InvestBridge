import {
  Sparkles,
  Star,
  ArrowUpRight,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import PageDecor from "./PageDecor.jsx";
import GradientText from "./GradientText.jsx";
import { getAllOpportunities } from "../api/opportunities";
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

const sizeBands = [
  { value: "All", label: "Any size" },
  { value: "<100K", label: "Under $100K" },
  { value: "100K-1M", label: "$100K – $1M" },
  { value: "1M-10M", label: "$1M – $10M" },
  { value: "10M+", label: "$10M and above" },
];

const sortOptions = [
  { value: "None", label: "Featured" },
  { value: "Newest", label: "Newest first" },
  { value: "Oldest", label: "Oldest first" },
  { value: "High to Low", label: "Goal: high to low" },
  { value: "Low to High", label: "Goal: low to high" },
];

const DEFAULT_DEAL_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23e5e7eb'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='16'>No image</text></svg>";

// Turns a human funding goal such as "$1.5M", "250K" or "500000" into a plain
// number so it can be compared against what has already been raised.
const parseGoal = (goalStr) => {
  if (!goalStr || goalStr === "$0") return 0;
  const num = parseFloat(String(goalStr).replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) return 0;
  const suffix = String(goalStr).replace(/[0-9.]/g, "").trim().toUpperCase();
  if (suffix.includes("B")) return num * 1000000000;
  if (suffix.includes("M")) return num * 1000000;
  if (suffix.includes("K")) return num * 1000;
  return num;
};

// A round is closed once the raised total has reached its goal, so it should
// no longer be offered as an open discovery deal.
const isFullyFunded = (opp) => {
  const goal = parseGoal(opp.funding_goal);
  if (goal <= 0) return false;
  return Number(opp.invested_amount || 0) >= goal;
};

const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

function DealStat({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="mt-1 truncate text-base font-semibold text-white" title={String(value)}>{value}</p>
    </div>
  );
}

// Split card: media on the left, details on the right; stacks on phones.
function DealCard({ deal, saved, saving, onOpen, onToggleSave }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = deal.image && !imageFailed;

  return (
    <motion.article
      variants={fadeUp}
      onClick={onOpen}
      className="group grid cursor-pointer overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(5,9,15,0.55)] backdrop-blur transition-colors duration-300 hover:border-brand-500/50 sm:grid-cols-[190px_minmax(0,1fr)]"
    >
      {/* Media */}
      <div className="relative min-h-[160px] bg-[radial-gradient(90%_80%_at_30%_10%,rgba(16,185,129,0.35)_0%,rgba(16,185,129,0)_70%),#0a1f19] sm:min-h-[250px]">
        {hasImage ? (
          <img
            src={deal.image}
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
            {initialsOf(deal.name)}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,9,15,0.85)] to-transparent sm:bg-gradient-to-r sm:from-transparent sm:from-[55%] sm:to-[rgba(5,9,15,0.85)]" />
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-col px-6 py-6 sm:px-[26px]">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/[0.14] px-2.5 py-0.5 text-[11px] font-semibold text-white/80">
            {deal.sector}
          </span>
          <span className="truncate text-xs text-white/50">{deal.location}</span>
          <div className="ml-auto flex shrink-0 items-center">
            <button
              type="button"
              title={saved ? "Saved" : "Save"}
              aria-pressed={saved}
              disabled={saving}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className="grid h-[30px] w-[30px] place-items-center rounded-full text-amber-400 transition hover:bg-amber-400/10 disabled:opacity-50"
            >
              <Star className={`h-4 w-4 ${saved ? "fill-amber-400" : ""}`} />
            </button>
          </div>
        </div>

        <h3 className="mt-3.5 text-xl font-semibold leading-tight text-white">{deal.name}</h3>
        <p className="mt-1 text-xs text-white/55">by {deal.company}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/70 [text-wrap:pretty]">
          {deal.blurb}
        </p>

        <div className="mt-auto flex items-end gap-[22px] pt-[18px]">
          <DealStat label="Goal" value={deal.goal} />
          <DealStat label="Timeline" value={deal.timeline} />
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-brand-300 transition-colors group-hover:text-brand-200">
            View deal room
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function DealsPage({ navigate }) {
  const user = getStoredUser();
  const [deals, setDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sizeBand, setSizeBand] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [goalSort, setGoalSort] = useState("None");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [connectedMap, setConnectedMap] = useState({});
  const [connectingId, setConnectingId] = useState(null);
  const [connectStatus, setConnectStatus] = useState("");

  const loadDeals = useCallback(async () => {
    try {
      const data = await getAllOpportunities();
      if (data.opportunities && data.opportunities.length > 0) {
        // A round stays in discovery while it can still take money, so it only
        // drops off once the raised total has reached the funding goal.
        const mapped = data.opportunities
          .filter((opp) => !isFullyFunded(opp))
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
            investedAmount: Number(opp.invested_amount) || 0,
            createdAt: opp.created_at || null,
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


  const matchesSizeBand = (goalStr, band) => {
    if (band === "All") return true;
    const amount = parseGoal(goalStr);
    if (amount <= 0) return false;
    if (band === "<100K") return amount < 100_000;
    if (band === "100K-1M") return amount >= 100_000 && amount < 1_000_000;
    if (band === "1M-10M") return amount >= 1_000_000 && amount < 10_000_000;
    if (band === "10M+") return amount >= 10_000_000;
    return true;
  };

  // Distinct locations seen in the loaded deals, so the location filter
  // never lists options that would return zero results.
  const locationOptions = [
    "All",
    ...Array.from(
      new Set(
        deals
          .map((d) => d.location)
          .filter((loc) => loc && loc !== "TBD"),
      ),
    ).sort(),
  ];

  const filteredDeals = deals.filter((d) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      d.location.toLowerCase().includes(q) ||
      (d.name || "").toLowerCase().includes(q) ||
      (d.company || "").toLowerCase().includes(q);
    const matchesSector = sectorFilter === "All" || d.sector === sectorFilter;
    const matchesLocation =
      locationFilter === "All" || d.location === locationFilter;
    const matchesSize = matchesSizeBand(d.goal, sizeBand);
    const matchesSaved = !savedOnly || Boolean(connectedMap[d.id]);
    return (
      matchesSearch &&
      matchesSector &&
      matchesLocation &&
      matchesSize &&
      matchesSaved
    );
  });

  const parseDate = (value) => {
    if (!value) return 0;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (goalSort === "High to Low") return parseGoal(b.goal) - parseGoal(a.goal);
    if (goalSort === "Low to High") return parseGoal(a.goal) - parseGoal(b.goal);
    if (goalSort === "Newest") return parseDate(b.createdAt) - parseDate(a.createdAt);
    if (goalSort === "Oldest") return parseDate(a.createdAt) - parseDate(b.createdAt);
    return 0;
  });

  const activeFilterCount =
    (sectorFilter !== "All" ? 1 : 0) +
    (locationFilter !== "All" ? 1 : 0) +
    (sizeBand !== "All" ? 1 : 0) +
    (savedOnly ? 1 : 0) +
    (goalSort !== "None" ? 1 : 0);

  const hasActiveFilters =
    searchQuery.trim() !== "" || activeFilterCount > 0;

  const clearAllFilters = () => {
    setSearchQuery("");
    setSectorFilter("All");
    setLocationFilter("All");
    setSizeBand("All");
    setSavedOnly(false);
    setGoalSort("None");
  };

  const sizeBandLabel = (value) =>
    sizeBands.find((band) => band.value === value)?.label || value;
  const sortLabel = (value) =>
    sortOptions.find((opt) => opt.value === value)?.label || value;

  return (
    <section className="dark relative min-h-screen overflow-hidden px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8">
      <PageBackground image={false} gradient={AURORA_BG} />

      <PageDecor />

      <div className="mx-auto max-w-7xl">
        <motion.div
          className="relative z-40 mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
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
              placeholder="Search deals, companies, locations..."
            />
            <FilterPopover
              label="Filter deals"
              activeCount={activeFilterCount}
            >
              <PopoverSelect
                label="Sector"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                options={sectors}
              />
              <PopoverSelect
                label="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                options={locationOptions}
              />
              <PopoverSelect
                label="Funding goal"
                value={sizeBand}
                onChange={(e) => setSizeBand(e.target.value)}
                options={sizeBands}
              />
              <PopoverSelect
                label="Sort by"
                value={goalSort}
                onChange={(e) => setGoalSort(e.target.value)}
                options={sortOptions}
              />
              {user && (
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 bg-white/60 px-3 py-2 text-sm font-medium text-ink-800 transition-colors hover:bg-white dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-100 dark:hover:bg-ink-900">
                  <input
                    type="checkbox"
                    checked={savedOnly}
                    onChange={(e) => setSavedOnly(e.target.checked)}
                    className="h-4 w-4 accent-brand-500"
                  />
                  Saved only
                </label>
              )}
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
            {locationFilter !== "All" && (
              <FilterChip
                key="location"
                label={locationFilter}
                onRemove={() => setLocationFilter("All")}
              />
            )}
            {sizeBand !== "All" && (
              <FilterChip
                key="size"
                label={sizeBandLabel(sizeBand)}
                onRemove={() => setSizeBand("All")}
              />
            )}
            {savedOnly && (
              <FilterChip
                key="saved"
                label="Saved only"
                onRemove={() => setSavedOnly(false)}
              />
            )}
            {goalSort !== "None" && (
              <FilterChip
                key="sort"
                label={sortLabel(goalSort)}
                onRemove={() => setGoalSort("None")}
              />
            )}
          </AnimatePresence>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-white/60 underline-offset-2 transition-colors hover:text-white hover:underline"
            >
              Clear all
            </button>
          )}
        </motion.div>

         <motion.div
           className="grid gap-[22px] lg:grid-cols-2"
           variants={stagger}
           initial="hidden"
           animate="visible"
         >
           {sortedDeals.length === 0 ? (
             <div className="col-span-full glass-panel-strong holo-card rounded-[2rem] p-8 text-center">
               <p className="text-ink-500 dark:text-ink-400">No deals match your filters.</p>
               <button
                 type="button"
                 onClick={clearAllFilters}
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
                saved={Boolean(connectedMap[deal.id])}
                saving={connectingId === deal.id}
                onOpen={() => {
                  setSelectedDeal(deal);
                  setConnectStatus("");
                }}
                onToggleSave={() =>
                  connectedMap[deal.id] ? handleDisconnect(deal) : handleConnect(deal)
                }
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
