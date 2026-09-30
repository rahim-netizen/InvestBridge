// Full-page status view for a saved opportunity. Rendered inside PageLayout at
// /status/:id, so it behaves like every other page in the app: page header,
// scrolling sections of content, and actions — not a floating dialog.
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Globe2,
  Landmark,
  Layers,
  Mail,
  MessageCircle,
  Receipt,
  Target,
  TrendingUp,
  UserRound,
  Users2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import PageDecor from "./PageDecor.jsx";
import EntrepreneurSubmitModal from "./EntrepreneurSubmitModal.jsx";
import GradientText from "./GradientText.jsx";
import { fadeUp, fadeUpBlur, stagger } from "../lib/motion.jsx";

const STATUS_STYLES = {
  Active: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  Pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  Completed: "border-brand-400/40 bg-brand-400/10 text-brand-200",
  Progress: "border-sky-400/40 bg-sky-400/10 text-sky-200",
};

const STATUS_OPTIONS = ["Active", "Pending", "Completed", "Progress"];

// Payment record states returned by the transactions endpoint.
const TRANSACTION_STYLES = {
  validated: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  failed: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  cancelled: "border-white/15 bg-white/5 text-white/55",
};

const STATUS_DESCRIPTIONS = {
  Active: "This opportunity is open and taking investments.",
  Pending: "This opportunity is under review and not open for investment yet.",
  Progress: "Funding is in progress. Checkpoints are being delivered.",
  Completed: "This round has been completed.",
};

// "$1.5M" / "$250K" / "$40,000" -> absolute number, used for the funding bar.
function parseMoney(value) {
  if (value === null || value === undefined) return 0;
  const raw = String(value);
  const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) return 0;
  const suffix = raw.replace(/[0-9.,$]/g, "").trim().toUpperCase();
  if (suffix.includes("B")) return num * 1_000_000_000;
  if (suffix.includes("M")) return num * 1_000_000;
  if (suffix.includes("K")) return num * 1_000;
  return num;
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

const initialsOf = (name = "") =>
  (name || "")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

function DetailRow({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-400/10 text-brand-300">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
          {label}
        </p>
        <p className="mt-1 font-semibold text-white">{value}</p>
        {sub ? <p className="mt-0.5 text-xs text-white/50">{sub}</p> : null}
      </div>
    </div>
  );
}

function Milestone({ title, description, state }) {
  const done = state === "done";
  const active = state === "active";

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      <span
        className={`absolute left-[15px] top-8 h-full w-px ${
          done ? "bg-brand-400/40" : "bg-white/10"
        }`}
      />
      <span
        className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold ${
          done
            ? "border-brand-400/60 bg-brand-400/15 text-brand-200"
            : active
              ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
              : "border-white/15 bg-white/5 text-white/40"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : active ? "•" : ""}
      </span>
      <div className="pt-0.5">
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-white/60">{description}</p>
      </div>
    </div>
  );
}

// Payout states tracked on connected_opportunities.
const PAYOUT_LABELS = {
  NA: "N/A",
  pending: "Pending",
  completed: "Completed",
};

const PAYOUT_DESCRIPTIONS = {
  NA: "You have not paid into this post yet.",
  pending: "Your payment is in and is waiting on the platform payout.",
  completed: "Your payout has been completed.",
};

const PAYOUT_STYLES = {
  NA: "border-white/15 bg-white/5 text-white/60",
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  completed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
};

function Status({
  opp,
  isOwner = false,
  transactions = [],
  investors = [],
  connections = [],
  payResult,
  onClose,
  navigate,
}) {
  const status = STATUS_OPTIONS.includes(opp.status) ? opp.status : "Active";
  const goal = parseMoney(opp.goal);
  const invested = Number(opp.investedAmount) || 0;
  const myInvestment = Number(opp.myInvestment) || 0;
  const payoutStatus = opp.payoutStatus || "NA";
  // Escrow figures for the investor's saved post.
  const myPayout = Number(opp.myPayout) || 0;
  const myShare = Number(opp.myShare) || 0;
  const paidAt = opp.paidAt || null;
  const entrepreneur = opp.entrepreneur || null;
  const progressPercent = goal > 0 ? Math.min(100, Math.round((invested / goal) * 100)) : 0;

  const milestones = [
    {
      title: "Opportunity posted",
      description: isOwner
        ? "You published this round for investors to review."
        : `${opp.postedByName || "The founder"} published this round for investors to review.`,
      state: "done",
    },
    {
      title: isOwner ? "Funding round opened" : "Saved to your dashboard",
      description: isOwner
        ? "Your post is live for investors to discover and connect with."
        : "You connected with this project, which added it to your saved list.",
      state: isOwner && status === "Active" ? "active" : "done",
    },
    {
      title:
        status === "Completed"
          ? "Round completed"
          : status === "Progress"
            ? "Funding in progress"
            : "Funding open",
      description: STATUS_DESCRIPTIONS[status],
      state: status === "Completed" ? "done" : status === "Active" ? "active" : "upcoming",
    },
  ];

  // The investor's own payment records for this saved post.
  const history = (transactions || []).filter((t) => t.status === "validated");
  const attempts = (transactions || []).length;
  const historyTotal = history.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0,
  );
  const investorList = investors || [];
  const investorsTotal = investorList.reduce(
    (sum, i) => sum + (Number(i.amount) || 0),
    0,
  );

  const [submitOpen, setSubmitOpen] = useState(false);

  const openChatWith = (person) =>
    navigate("/connect", {
      state: {
        chatWith: {
          id: person.id,
          name: person.name,
          email: person.email,
        },
      },
    });

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
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeUpBlur}
        >
          {payResult ? (
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                payResult.status === "success"
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                  : "border-rose-400/40 bg-rose-400/10 text-rose-200"
              }`}
            >
              {payResult.status === "success"
                ? "Your project submission payment went through."
                : payResult.status === "cancel"
                  ? "Your project submission payment was cancelled."
                  : "Your project submission payment failed."}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Project status
              </span>
              <h1 className="mt-4">
                <GradientText
                  colors={["#10b981", "#fbbf24", "#10b981"]}
                  animationSpeed={5}
                  direction="horizontal"
                  className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
                >
                  {opp.title}
                </GradientText>
              </h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-lg text-white/75">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {opp.company || "Unknown"}
                </span>
                {opp.location && opp.location !== "TBD" ? (
                  <span className="inline-flex items-center gap-1.5 text-base text-white/55">
                    <Globe2 className="h-4 w-4" />
                    {opp.location}
                  </span>
                ) : null}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${STATUS_STYLES[status]}`}
              >
                Status: {opp.status || "Active"}
              </span>

              {isOwner ? (
                <button
                  type="button"
                  onClick={() => setSubmitOpen(true)}
                  className="btn-primary"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-[22px] lg:grid-cols-[1.35fr_0.85fr] lg:items-start"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Main column */}
          <div className="space-y-[22px]">
            <motion.section
              variants={fadeUp}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(5,9,15,0.55)] backdrop-blur"
            >
              <div className="relative h-56 bg-[radial-gradient(90%_80%_at_30%_10%,rgba(16,185,129,0.35)_0%,rgba(16,185,129,0)_70%),#0a1f19] sm:h-72">
                {opp.image ? (
                  <img
                    src={opp.image}
                    alt={opp.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-85"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <Layers className="h-12 w-12 text-emerald-200/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,9,15,0.9)] via-[rgba(5,9,15,0.35)] to-transparent" />
                <div className="absolute bottom-5 left-6 right-6">
                  <span className="rounded-full border border-white/[0.14] px-3 py-1 text-[11px] font-semibold text-white/85">
                    {opp.sector || "Uncategorised"}
                  </span>
                </div>
              </div>

              <div className="px-6 py-7 sm:px-8">
                <h2 className="font-display text-xl font-bold text-white">
                  About this opportunity
                </h2>
                <p className="mt-3 text-base leading-relaxed text-white/70 [text-wrap:pretty]">
                  {opp.blurb ||
                    "The founder has not added a description for this round yet."}
                </p>
              </div>
            </motion.section>

            <motion.section
              variants={fadeUp}
              className="rounded-[2rem] border border-white/10 bg-[rgba(5,9,15,0.55)] p-6 backdrop-blur sm:p-8"
            >
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-300">
                <TrendingUp className="h-4 w-4" />
                Funding progress
              </div>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                    Raised
                  </p>
                  <p className="font-display text-3xl font-extrabold text-white">
                    {formatMoney(invested)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                    Goal
                  </p>
                  <p className="font-display text-3xl font-extrabold text-white/85">
                    {opp.goal || "$0"}
                  </p>
                </div>
              </div>

              <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-gold-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <p className="mt-2 text-xs text-white/55">
                {progressPercent}% of the funding goal reached
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-brand-400/10 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                    Timeline
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {opp.timeline || "TBD"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                    Sector
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {opp.sector || "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                    Your investment
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {myInvestment > 0 ? formatMoney(myInvestment) : "Not invested"}
                  </p>
                </div>
              </div>

              {!isOwner ? (
                <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${PAYOUT_STYLES[payoutStatus] || PAYOUT_STYLES.NA}`}
                  >
                    Payout: {PAYOUT_LABELS[payoutStatus] || payoutStatus}
                  </span>
                  <p className="text-sm text-white/55">
                    {PAYOUT_DESCRIPTIONS[payoutStatus] ||
                      "Your saved post has no recorded payout yet."}
                  </p>
                </div>
              ) : null}
            </motion.section>

            {!isOwner ? (
              <motion.section
                variants={fadeUp}
                className="rounded-[2rem] border border-white/10 bg-[rgba(5,9,15,0.55)] p-6 backdrop-blur sm:p-8"
              >
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-300">
                  <Landmark className="h-4 w-4" />
                  Your escrow position
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      You invested
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {myInvestment > 0 ? formatMoney(myInvestment) : "$0"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      Share of goal
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {myShare > 0 ? `${myShare.toFixed(2)}%` : "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-brand-400/10 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                      Your payout
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {myPayout > 0 ? formatMoney(myPayout) : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${PAYOUT_STYLES[payoutStatus] || PAYOUT_STYLES.NA}`}
                  >
                    Status: {PAYOUT_LABELS[payoutStatus] || payoutStatus}
                  </span>
                  <p className="text-sm text-white/55">
                    {PAYOUT_DESCRIPTIONS[payoutStatus] ||
                      "Your saved post has no recorded payout yet."}
                  </p>
                  {paidAt ? (
                    <span className="text-xs text-white/40">
                      Paid on {new Date(paidAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>

                {entrepreneur ? (
                  <div className="mt-6 flex flex-wrap items-start gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    {entrepreneur.avatar ? (
                      <img
                        src={entrepreneur.avatar}
                        alt={entrepreneur.name}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-400/15 text-lg font-bold text-brand-200">
                        {String(entrepreneur.name || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                        Posted by
                      </p>
                      <p className="mt-1 font-semibold text-white">
                        {entrepreneur.name}
                      </p>
                      {entrepreneur.position ? (
                        <p className="text-sm text-white/55">
                          {entrepreneur.position}
                          {entrepreneur.company
                            ? ` at ${entrepreneur.company}`
                            : ""}
                        </p>
                      ) : entrepreneur.company ? (
                        <p className="text-sm text-white/55">
                          {entrepreneur.company}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                        {entrepreneur.email ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {entrepreneur.email}
                          </span>
                        ) : null}
                        {entrepreneur.industry ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            {entrepreneur.industry}
                          </span>
                        ) : null}
                        {entrepreneur.website ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Globe2 className="h-3.5 w-3.5" />
                            {entrepreneur.website}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.section>
            ) : null}

            <motion.section
              variants={fadeUp}
              className="rounded-[2rem] border border-white/10 bg-[rgba(5,9,15,0.55)] p-6 backdrop-blur sm:p-8"
            >
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-300">
                <Target className="h-4 w-4" />
                Where this round stands
              </div>
              <div className="mt-7">
                {milestones.map((milestone) => (
                  <Milestone key={milestone.title} {...milestone} />
                ))}
              </div>
            </motion.section>

            <motion.section
              variants={fadeUp}
              className="rounded-[2rem] border border-white/10 bg-[rgba(5,9,15,0.55)] p-6 backdrop-blur sm:p-8"
            >
              {isOwner ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-300">
                    <Users2 className="h-4 w-4" />
                    Investors in this round
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-brand-400/10 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                        Investors
                      </p>
                      <p className="mt-1 font-display text-xl font-bold text-white">
                        {investorList.length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                        Collected
                      </p>
                      <p className="mt-1 font-display text-xl font-bold text-white">
                        {formatMoney(investorsTotal)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                        Goal
                      </p>
                      <p className="mt-1 font-display text-xl font-bold text-white">
                        {opp.goal || "$0"}
                      </p>
                    </div>
                  </div>

                  {investorList.length === 0 ? (
                    <p className="mt-6 text-sm leading-relaxed text-white/60">
                      No investor has completed a payment on this post yet.
                      Investors appear here as soon as their payment goes
                      through.
                    </p>
                  ) : (
                    <ul className="mt-6 space-y-3">
                      {investorList.map((investor) => (
                        <li
                          key={investor.transaction_id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-400/15 font-semibold text-brand-200">
                              {initialsOf(investor.name || investor.email)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">
                                {investor.name || "Investor"}
                              </p>
                              <p className="truncate text-xs text-white/50">
                                {investor.email || ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold text-white">
                                {formatMoney(investor.amount)}
                              </p>
                              <p className="text-xs text-white/45">
                                {investor.invested_at
                                  ? new Date(investor.invested_at).toLocaleDateString()
                                  : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => openChatWith(investor)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/40 bg-brand-400/10 px-3 py-1.5 text-xs font-semibold text-brand-200 transition-colors hover:bg-brand-400/20"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Chat
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {(connections || []).length > 0 ? (
                    <div className="mt-10 border-t border-white/10 pt-8">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
                        <UserRound className="h-4 w-4" />
                        Interested investors
                      </div>
                      <p className="mt-2 text-sm text-white/50">
                        Everyone who has saved this post. Investors appear here
                        as they pay in.
                      </p>

                      <ul className="mt-5 space-y-3">
                        {(connections || []).map((connection) => (
                          <li
                            key={connection.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 font-semibold text-white/80">
                                {initialsOf(connection.name || connection.email)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-white">
                                  {connection.name || "Investor"}
                                </p>
                                <p className="truncate text-xs text-white/50">
                                  {connection.email || ""}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => openChatWith(connection)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Chat
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-300">
                    <Receipt className="h-4 w-4" />
                    Your investment history
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-brand-400/10 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                        Payments
                      </p>
                      <p className="mt-1 font-display text-xl font-bold text-white">
                        {history.length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                        Total paid
                      </p>
                      <p className="mt-1 font-display text-xl font-bold text-white">
                        {formatMoney(historyTotal)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                        Attempts
                      </p>
                      <p className="mt-1 font-display text-xl font-bold text-white">
                        {attempts}
                      </p>
                    </div>
                  </div>

                  {attempts === 0 ? (
                    <p className="mt-6 text-sm leading-relaxed text-white/60">
                      You have not invested in this post yet. Once a payment
                      goes through, it will be listed here.
                    </p>
                  ) : (
                    <ul className="mt-6 space-y-3">
                      {transactions.map((t) => {
                        const settled = t.status === "validated";
                        return (
                          <li
                            key={t.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-white">
                                {formatMoney(t.amount)}
                              </p>
                              <p className="mt-0.5 text-xs text-white/50">
                                {t.tran_id}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${TRANSACTION_STYLES[t.status] || TRANSACTION_STYLES.pending}`}
                              >
                                {t.status}
                              </span>
                              <p className="mt-1 text-xs text-white/45">
                                {t.created_at
                                  ? new Date(t.created_at).toLocaleString()
                                  : ""}
                              </p>
                            </div>
                            {!settled ? (
                              <p className="w-full text-xs text-white/40">
                                Only completed payments count towards the raised
                                total.
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
            </motion.section>
          </div>

          {/* Sidebar column */}
          <motion.aside variants={fadeUp} className="space-y-[22px]">
            <div className="rounded-[2rem] border border-white/10 bg-[rgba(5,9,15,0.55)] p-6 backdrop-blur sm:p-7">
              <h2 className="font-display text-lg font-bold text-white">
                Opportunity details
              </h2>
              <div className="mt-5 space-y-3">
                <DetailRow
                  icon={Building2}
                  label="Company"
                  value={opp.company || "Unknown"}
                />
                <DetailRow
                  icon={Layers}
                  label="Sector"
                  value={opp.sector || "—"}
                />
                <DetailRow
                  icon={Target}
                  label="Funding goal"
                  value={opp.goal || "$0"}
                />
                <DetailRow
                  icon={CalendarClock}
                  label="Timeline"
                  value={opp.timeline || "TBD"}
                />
                <DetailRow
                  icon={UserRound}
                  label="Posted by"
                  value={opp.postedByName || "Unknown"}
                  sub={opp.postedBy || undefined}
                />
              </div>
            </div>

            {!isOwner && (
              <div className="rounded-[2rem] border border-white/10 bg-[rgba(5,9,15,0.55)] p-6 backdrop-blur sm:p-7">
                <h2 className="font-display text-lg font-bold text-white">
                  Next steps
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {STATUS_DESCRIPTIONS[status]}
                </p>

                {myInvestment > 0 ? (
                  <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Your investment
                    </p>
                    <p className="mt-1 font-display text-xl font-bold text-emerald-100">
                      {formatMoney(myInvestment)}
                    </p>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/connect")}
                    className="btn-primary w-full"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with the founder
                  </button>
                  <button
                    type="button"
                    onClick={() => {
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
                    className="btn-ghost w-full"
                  >
                    <CreditCard className="h-4 w-4" />
                    Go to payment
                  </button>
                </div>
              </div>
            )}

            {isOwner ? (
              <div className="rounded-[2rem] border border-white/10 bg-[rgba(5,9,15,0.55)] p-6 backdrop-blur sm:p-7">
                <h2 className="font-display text-lg font-bold text-white">
                  Your round
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {STATUS_DESCRIPTIONS[status]}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/connect")}
                  className="btn-primary mt-5 w-full"
                >
                  <MessageCircle className="h-4 w-4" />
                  Open messages
                </button>
              </div>
            ) : null}
          </motion.aside>
        </motion.div>
      </div>

      {isOwner ? (
        <EntrepreneurSubmitModal
          opp={opp}
          open={submitOpen}
          onClose={() => setSubmitOpen(false)}
        />
      ) : null}
    </section>
  );
}

export default Status;
