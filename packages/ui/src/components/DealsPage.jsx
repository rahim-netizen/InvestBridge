import {
  ArrowLeft,
  ArrowUpRight,
  Filter,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Star,
  ChevronDown,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { deleteOpportunity, getAllOpportunities } from "../api/opportunities";

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

export default function DealsPage({ navigate }) {
  const user = getStoredUser();
  const [deals, setDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [sortBy, setSortBy] = useState("none");
  const [view, setView] = useState("grid");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const handler = () => {
      async function loadDeals() {
        try {
          const data = await getAllOpportunities();
          if (data.opportunities && data.opportunities.length > 0) {
            const mapped = data.opportunities.map((opp) => ({
              id: opp.id,
              name: opp.company,
              logo: opp.company.slice(0, 2).toUpperCase(),
              sector: opp.sector,
              location: opp.location || "TBD",
              goal: opp.funding_goal || "$0",
              raised: "$0",
              pct: 0,
              blurb: opp.description || "",
              image: opp.image || null,
              investors: 0,
              daysLeft: opp.timeline || "TBD",
              postedBy: opp.user?.email || null,
            }));
            setDeals(mapped);
          }
        } catch {
          // keep localStorage fallback
        }
      }
      loadDeals();
    };
    window.addEventListener("opportunity-changed", handler);
    return () => {
      window.removeEventListener("opportunity-changed", handler);
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteOpportunity(id);
      const updated = deals.filter((d) => d.id !== id);
      setDeals(updated);
      setDeleteId(null);
    } catch {
      setDeleteId(null);
    }
  };

  useEffect(() => {
    async function loadDeals() {
      try {
        const data = await getAllOpportunities();
        if (data.opportunities && data.opportunities.length > 0) {
          const mapped = data.opportunities.map((opp) => ({
            id: opp.id,
            name: opp.company,
            logo: opp.company.slice(0, 2).toUpperCase(),
            sector: opp.sector,
            location: opp.location || "TBD",
            goal: opp.funding_goal || "$0",
            raised: "$0",
            pct: 0,
            blurb: opp.description || "",
            image: opp.image || null,
            investors: 0,
            daysLeft: opp.timeline || "TBD",
            postedBy: opp.user?.email || null,
          }));
          setDeals(mapped);
        }
      } catch {
        // keep localStorage fallback
      }
    }

    loadDeals();
  }, []);

  const filteredDeals = deals
    .filter((d) => {
      const matchesSearch =
        d.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = sectorFilter === "All" || d.sector === sectorFilter;
      return matchesSearch && matchesSector;
    })
    .sort((a, b) => {
      if (sortBy === "highToLow") {
        const parseMoney = (m) => parseFloat(m.replace(/[$MKB]/g, "")) * (m.includes("M") ? 1000000 : m.includes("K") ? 1000 : 1);
        return parseMoney(b.goal) - parseMoney(a.goal);
      }
      if (sortBy === "lowToHigh") {
        const parseMoney = (m) => parseFloat(m.replace(/[$MKB]/g, "")) * (m.includes("M") ? 1000000 : m.includes("K") ? 1000 : 1);
        return parseMoney(a.goal) - parseMoney(b.goal);
      }
      return 0;
    });

  const handleInvest = (deal) => {
    const updated = deals.map((d) =>
      d.id === deal.id
        ? { ...d, raised: deal.raised, pct: Math.min(100, deal.pct + Math.floor(Math.random() * 5 + 1)) }
        : d,
    );
    setDeals(updated);
  };

  const handleImageError = (dealId) => {
    setImageErrors((prev) => ({ ...prev, [dealId]: true }));
  };

  const inputWrapperClassName =
    "surface-rim flex items-center gap-3 rounded-2xl px-4 py-3";
  const inputClassName =
    "w-full rounded-2xl border border-white/20 bg-white/35 px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 backdrop-blur-sm dark:border-white/10 dark:bg-ink-950/35 dark:text-ink-50 dark:placeholder:text-ink-500";

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,97,255,0.16),_transparent_36%),radial-gradient(circle_at_80%_12%,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8 dark:bg-gradient-to-br dark:from-ink-950 dark:via-ink-950 dark:to-ink-900">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-[-5rem] top-24 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute right-[-4rem] bottom-10 h-80 w-80 rounded-full bg-gold-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Browse and discover deals
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Explore vetted opportunities that match your thesis.
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-600 dark:text-ink-300">
            Filter by sector and momentum to find
            opportunities worth your time.
          </p>
        </div>

        <div className="glass-panel-strong holo-card rounded-[2rem] p-6 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by location..."
                className={`${inputWrapperClassName} pl-11`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className={inputWrapperClassName}
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={inputWrapperClassName}
              >
                <option value="none">None</option>
                <option value="highToLow">High to Low</option>
                <option value="lowToHigh">Low to High</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-ink-500 dark:text-ink-400">
            <span>{filteredDeals.length} deal{filteredDeals.length !== 1 ? "s" : ""} found</span>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Active filters applied</span>
            </div>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDeals.length === 0 ? (
              <div className="col-span-full glass-panel-strong holo-card rounded-[2rem] p-8 text-center">
                <p className="text-ink-500 dark:text-ink-400">No deals match your filters.</p>
                <button
                  type="button"
onClick={() => {
                     setSearchQuery("");
                     setSectorFilter("All");
                   }}
                  className="mt-4 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <article
                  key={deal.id}
                  className="card holo-card group overflow-hidden hover:shadow-lift cursor-pointer"
                  onClick={() => setSelectedDeal(deal)}
                >
                   <div className="relative h-40 overflow-hidden">
                     {!imageErrors[deal.id] ? (
                       <img
                         src={deal.image}
                         alt={deal.name}
                         loading="lazy"
                         className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                         onError={() => handleImageError(deal.id)}
                       />
                     ) : (
                       <div className="h-full w-full bg-ink-900 flex items-center justify-center">
                         <span className="text-ink-500 text-xs">Image unavailable</span>
                       </div>
                     )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/10 to-transparent" />
<div className="absolute left-4 top-4 flex gap-2">
                       <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-800 backdrop-blur">
                         {deal.sector}
                       </span>
                     </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 font-display text-sm font-bold backdrop-blur">
                        {deal.logo}
                      </span>
                      <span className="font-display text-lg font-bold">
                        {deal.name}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                      {deal.blurb}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {deal.location}
                    </div>

                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs font-medium text-ink-500">
                        <span>
                          {deal.raised}{" "}
                          <span className="text-ink-400">of {deal.goal}</span>
                        </span>
                        <span className="text-brand-700">{deal.pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                          style={{ width: `${deal.pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {deal.investors} investors
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {deal.daysLeft} days left
                      </span>
                    </div>

                     <a
                       href="#"
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedDeal(deal);
                       }}
                       className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
                     >
                       View deal room
                       <ArrowUpRight className="h-4 w-4" />
                     </a>

                     {deal.postedBy === user?.email && (
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           setDeleteId(deal.id);
                         }}
                         className="ml-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-500 transition-colors hover:text-rose-700"
                       >
                         <Trash2 className="h-3.5 w-3.5" />
                         Remove
                       </button>
                     )}
                  </div>
                </article>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                className="glass-panel-strong holo-card rounded-2xl p-6 flex items-center gap-6 cursor-pointer hover:shadow-lift transition"
                onClick={() => setSelectedDeal(deal)}
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600/90 text-white font-display font-bold shrink-0">
                  {deal.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">
                      {deal.name}
                    </h3>
                    <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                      {deal.sector}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                    {deal.blurb}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-ink-400 dark:text-ink-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {deal.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {deal.investors} investors
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {deal.daysLeft} days left
                    </span>
                  </div>
                </div>
                 <div className="text-right shrink-0">
                   <p className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
                     {deal.pct}%
                   </p>
                   <p className="text-xs text-ink-500 dark:text-ink-400">
                     {deal.raised} of {deal.goal}
                   </p>
                   <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                     <div
                       className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                       style={{ width: `${deal.pct}%` }}
                     />
                   </div>
                   {deal.postedBy === user?.email && (
                     <button
                       type="button"
                       onClick={(e) => {
                         e.stopPropagation();
                         setDeleteId(deal.id);
                       }}
                       className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-500 transition-colors hover:text-rose-700"
                     >
                       <Trash2 className="h-3.5 w-3.5" />
                       Remove
                     </button>
                   )}
                 </div>
              </div>
            ))}
          </div>
        )}

        {selectedDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-sm p-4">
            <div className="glass-panel-strong holo-card rounded-[2rem] p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto dark:bg-ink-950/90">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                  {selectedDeal.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedDeal(null)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-white/50 text-ink-500 transition hover:bg-white/80 dark:border-white/10 dark:bg-ink-950/40 dark:text-ink-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>

               <div className="rounded-2xl overflow-hidden mb-6 h-48">
                 {!imageErrors[selectedDeal.id] ? (
                   <img
                     src={selectedDeal.image}
                     alt={selectedDeal.name}
                     className="h-full w-full object-cover"
                     onError={() => handleImageError(selectedDeal.id)}
                   />
                 ) : (
                   <div className="h-full w-full bg-ink-900 flex items-center justify-center">
                     <span className="text-ink-500 text-xs">Image unavailable</span>
                   </div>
                 )}
               </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
                  {selectedDeal.sector}
                </span>
                <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                  {selectedDeal.location}
                </span>
              </div>

              <p className="text-ink-600 dark:text-ink-300 mb-6">
                {selectedDeal.blurb}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl bg-brand-50 p-4 text-center dark:bg-brand-400/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    Raised
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {selectedDeal.raised}
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">
                    of {selectedDeal.goal}
                  </p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-4 text-center dark:bg-brand-400/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    Progress
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {selectedDeal.pct}%
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">funded</p>
                </div>
                <div className="rounded-2xl bg-brand-50 p-4 text-center dark:bg-brand-400/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    Investors
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {selectedDeal.investors}
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400">active</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-1.5 flex justify-between text-xs font-medium text-ink-500">
                  <span>Funding progress</span>
                  <span className="text-brand-700">{selectedDeal.pct}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                    style={{ width: `${selectedDeal.pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-ink-400 dark:text-ink-500 mb-6">
                <Clock className="h-3.5 w-3.5" />
                {selectedDeal.daysLeft} days remaining
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleInvest(selectedDeal);
                    setSelectedDeal(null);
                  }}
                  className="btn-primary flex-1"
                >
                  <DollarSign className="h-4 w-4" />
                  Invest now
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDeal(null)}
                  className="btn-ghost flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Showing {filteredDeals.length} of {deals.length} deals
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                view === "grid"
                  ? "bg-brand-600 text-white shadow-soft"
                  : "bg-ink-50 text-ink-600 hover:bg-ink-100 dark:hover:shadow-glow"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                view === "list"
                  ? "bg-brand-600 text-white shadow-soft"
                  : "bg-ink-50 text-ink-600 hover:bg-ink-100 dark:hover:shadow-glow"
              }`}
            >
              List
            </button>
          </div>
        </div>

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
                      Remove deal?
                    </h2>
                    <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                      This action cannot be undone. This opportunity will be removed
                      from discovery and your dashboard.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="text-ink-400 hover:text-ink-700 dark:text-ink-500 dark:hover:text-ink-300"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteId)}
                  className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-rose-700"
                >
                  Remove deal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}