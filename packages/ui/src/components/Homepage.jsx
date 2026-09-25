import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  Handshake,
  LineChart,
  Megaphone,
  PenLine,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import PageBackground, { AURORA_BG } from "./PageBackground.jsx";
import PageDecor from "./PageDecor.jsx";
import GradientText from "./GradientText.jsx";
import BorderGlow from "./BorderGlow.jsx";
import { getAllOpportunities, getPlatformStats } from "../api/opportunities";
import {
  fadeUp,
  fadeUpBlur,
  stagger,
  useCountUp,
  useInView,
  Parallax,
} from "../lib/motion.jsx";

// Shown until the real numbers arrive from the backend (and kept as a
// fallback if that request fails), so the section never renders empty.
const defaultStats = [
  { value: "$240M+", label: "Total capital deployed" },
  { value: "3,400+", label: "Startups funded" },
  { value: "1,800+", label: "Active investors" },
  { value: "92%", label: "Round success rate" },
];

function formatCompactCurrency(amount) {
  const value = Number(amount) || 0;
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B+`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K+`;
  }
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function formatCount(count) {
  const value = Number(count) || 0;
  return value > 0 ? `${value.toLocaleString("en-US")}+` : "0";
}

function buildStats(raw) {
  return [
    {
      value: formatCompactCurrency(raw.totalCapitalDeployed),
      label: "Total capital deployed",
    },
    { value: formatCount(raw.startupsFunded), label: "Startups funded" },
    { value: formatCount(raw.activeInvestors), label: "Active investors" },
    { value: `${Number(raw.successRate) || 0}%`, label: "Round success rate" },
  ];
}

const steps = [
  {
    icon: PenLine,
    title: "Everyone can post opportunities",
    desc: "Share your startup, project, or investment opportunity with full details about your business model, stage, goals, and timeline — all in one guided flow.",
    route: "/opportunities",
    action: "Open posting flow",
  },
  {
    icon: Search,
    title: "Browse and discover deals",
    desc: "Find vetted opportunities that match your interests. Filter by sector, stage, and geography to discover connections that matter.",
    route: "/deals",
    action: "Explore deals",
  },
  {
    icon: Handshake,
    title: "Connect and grow",
    desc: "Make meaningful connections, track commitments in real time, and close partnerships with a chat-first collaboration space.",
    route: "/connect",
    action: "Open chat workspace",
  },
];

const universalBenefits = [
  {
    icon: Megaphone,
    title: "Share your story",
    desc: "Tell your vision, goals, and background in a compelling way that reaches the right audience.",
  },
  {
    icon: Users,
    title: "Connect with your network",
    desc: "Find opportunities and relationships that match your interests, sector, and geography.",
  },
  {
    icon: ShieldCheck,
    title: "Vetted opportunities",
    desc: "Every listing on InvestBridge passes diligence checks, so you can trust what you see.",
  },
  {
    icon: LineChart,
    title: "Real-time dashboards",
    desc: "Track momentum, commitments, and connections as they happen.",
  },
  {
    icon: Rocket,
    title: "Discover early opportunities",
    desc: "Access pre-seed to growth stage projects across all industries and geographies.",
  },
  {
    icon: BarChart3,
    title: "Build your network",
    desc: "Whether you're looking to invest or raise capital, grow meaningful relationships on InvestBridge.",
  },
];

const founderBenefits = [
  {
    icon: Megaphone,
    title: "Tell your story",
    desc: "A guided pitch builder turns your vision into a compelling, investor-ready listing.",
  },
  {
    icon: Users,
    title: "Reach the right investors",
    desc: "Your round is surfaced to investors who match your sector, stage, and geography.",
  },
  {
    icon: BarChart3,
    title: "Track every commitment",
    desc: "Real-time dashboards show committed capital, investor profiles, and round momentum.",
  },
];

const investorBenefits = [
  {
    icon: ShieldCheck,
    title: "Vetted opportunities",
    desc: "Every listing passes a diligence checkpoint before it reaches your deal flow.",
  },
  {
    icon: LineChart,
    title: "Diversify with confidence",
    desc: "Filter by stage, sector, and geography to build a portfolio that fits your thesis.",
  },
  {
    icon: Rocket,
    title: "Back founders early",
    desc: "Access pre-seed to Series A rounds you would not otherwise see — on one platform.",
  },
];

const testimonials = [
  {
    quote:
      "We closed our $1.5M Series A in three weeks. InvestBridge put us in front of investors who actually understood HealthTech — no cold outreach required.",
    name: "Amara Okafor",
    role: "Founder & CEO, NovaVet AI",
    avatar:
      "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    quote:
      "As an angel investor, deal flow used to be a full-time job. Now I review three vetted rounds before my morning coffee and commit in a couple of clicks.",
    name: "Daniel Reyes",
    role: "Angel Investor · 14 portfolio companies",
    avatar:
      "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    quote:
      "The data rooms are detailed enough to make real decisions. I built a diversified CleanEnergy portfolio across four countries without leaving the platform.",
    name: "Mei Lin Tan",
    role: "Partner, Greenline Capital",
    avatar:
      "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

// Scroll-scrubbed hero composition: two panels (founders / investors) start
// apart at either edge and close the gap as the user scrolls; a bridge line
// draws between them; then a brand endcard fades in over a globe photo. The
// section is 320vh tall with a sticky 100vh stage inside — scrolling through
// the track drives the timeline. Design ported from InvestBridge Hero.dc.
const HERO_BG =
  "radial-gradient(52% 44% at 12% 4%, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0) 60%)," +
  "radial-gradient(44% 38% at 93% 8%, rgba(245,158,11,0.09) 0%, rgba(245,158,11,0) 56%)," +
  "radial-gradient(70% 60% at 50% 112%, rgba(16,185,129,0.22) 0%, rgba(6,95,70,0) 66%)," +
  "linear-gradient(158deg, #05090f 0%, #081512 34%, #0a1f19 68%, #04231b 100%)";

const HERO_GLOW =
  "radial-gradient(52% 44% at 12% 4%, rgba(16,185,129,0.20) 0%, rgba(16,185,129,0) 60%)," +
  "radial-gradient(44% 38% at 93% 8%, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0) 56%)," +
  "radial-gradient(70% 60% at 50% 112%, rgba(16,185,129,0.18) 0%, rgba(6,95,70,0) 66%)";

// A handful of floating motes drawn over the composition — positions are
// carried from the source design's 1920×720 world and expressed as viewBox
// coords in the decor SVG.
const MOTES = [
  [744, 113], [1455, 131], [1268, 227], [1084, 379], [1641, 341],
  [265, 404], [1718, 470], [259, 570], [820, 628], [1529, 646],
  [521, 687], [1158, 743], [966, 512], [612, 258],
];

function HeroDecor() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const loop = (now) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const drift = (t % 24) / 24;
  const wave = (y, amp) =>
    `M -80 ${y} C 340 ${y - amp} 760 ${y + amp} 1120 ${y - amp * 0.4} S 1700 ${y - amp * 1.5} 2000 ${y - amp * 0.8}`;

  return (
    <svg
      viewBox="0 0 1920 720"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0"
    >
      <g fill="none" strokeWidth="1">
        <path d={wave(560, 120)} stroke="rgba(16,185,129,0.20)" />
        <path d={wave(610, 140)} stroke="rgba(16,185,129,0.13)" />
        <path d={wave(500, 100)} stroke="rgba(16,185,129,0.10)" />
        <path d={wave(585, 150)} stroke="rgba(245,158,11,0.30)" strokeWidth="1.4" />
      </g>
      <g fill="none" stroke="rgba(16,185,129,0.34)" strokeWidth="1.2" opacity="0.55">
        <circle cx="1008" cy="588" r="30" />
        <circle cx="265" cy="396" r="34" strokeDasharray="4 7" />
        <path d="M 795 78 l 30 -17 30 17 v 35 l -30 17 -30 -17 z" />
        <path d="M 1590 500 h 84 v 84 h -84 z" />
        <path d="M 1606 560 l 20 -22 14 12 24 -30" />
      </g>
      <g stroke="rgba(245,158,11,0.30)" strokeWidth="1">
        <line x1="1652" y1="168" x2="1652" y2="226" />
        <rect x="1645" y="180" width="14" height="32" fill="none" />
        <line x1="1680" y1="150" x2="1680" y2="222" />
        <rect x="1673" y="164" width="14" height="42" fill="none" />
        <line x1="1708" y1="176" x2="1708" y2="230" />
        <rect x="1701" y="186" width="14" height="30" fill="none" />
      </g>
      {MOTES.map(([x, y], i) => {
        const ph = (drift + i / MOTES.length) % 1;
        const a = 0.18 + 0.5 * Math.abs(Math.sin(ph * Math.PI * 2));
        return (
          <circle
            key={i}
            cx={x}
            cy={y - ph * 26}
            r={i % 4 === 0 ? 3 : 2}
            fill="#10b981"
            opacity={a}
          />
        );
      })}
    </svg>
  );
}

function Hero() {
  const trackRef = useRef(null);
  // scrollYProgress runs 0 → 1 as the tall track scrolls through the viewport.
  // The inner stage is sticky so the composition holds while the track glides
  // beneath — every layer picks its own sub-range on that progress.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Panels are visible from t=0 — the story opens ON the divide, not with a
  // fade-in from nothing. The gap between them closes as the user scrolls.
  const gap = useTransform(scrollYProgress, [0, 0.5], ["24%", "6%"]);
  const halfGap = useTransform(gap, (g) => `calc(50% - ${g} / 2)`);
  const halfGapNeg = useTransform(gap, (g) => `calc(50% + ${g} / 2)`);

  // Bridge line + endcap nodes.
  const bridgeScale = useTransform(scrollYProgress, [0.35, 0.58], [0, 1]);
  const nodeScale = useTransform(scrollYProgress, [0.5, 0.65], [0, 1]);

  // Brand endcard sweeps in over the globe once the two sides have joined.
  const brandOpacity = useTransform(scrollYProgress, [0.58, 0.78], [0, 1]);
  const brandY = useTransform(scrollYProgress, [0.58, 0.82], [24, 0]);
  const ruleScale = useTransform(scrollYProgress, [0.68, 0.9], [0, 1]);
  const globeScale = useTransform(scrollYProgress, [0.58, 1], [1.06, 1.16]);

  // Scroll cue fades out once the story is underway.
  const cueOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const panelBase =
    "absolute top-0 h-full w-1/2 overflow-hidden bg-[#081512] will-change-transform";
  const gradient =
    "linear-gradient(90deg, #10b981, #fbbf24, #10b981)";

  return (
    <section
      id="home"
      ref={trackRef}
      className="relative"
      style={{ height: "320vh" }}
      aria-label="InvestBridge — where founders meet capital"
    >
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ background: HERO_BG }}
      >
        {/* Founders panel */}
        <motion.div
          className={panelBase}
          style={{
            left: 0,
            width: halfGap,
          }}
        >
          <img
            src="/hero-calculator.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90 mix-blend-lighten"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(5,9,15,0.92) 8%, rgba(5,9,15,0.35) 70%)",
            }}
          />
          <div className="absolute bottom-16 left-4 max-w-[16rem] text-left sm:bottom-24 sm:left-12 sm:max-w-[22rem] md:left-20 lg:left-24">
            <p
              className="text-[10px] font-semibold uppercase text-brand-300 sm:text-sm"
              style={{ letterSpacing: "0.22em" }}
            >
              Founders
            </p>
            <p
              className="mt-3 font-display text-lg font-medium leading-[1.1] tracking-tight text-transparent bg-clip-text sm:text-2xl md:text-3xl lg:text-4xl"
              style={{
                backgroundImage: gradient,
                backgroundSize: "300% 100%",
                animation: "hero-grad 5s ease-in-out infinite",
              }}
            >
              Building something real.
            </p>
          </div>
        </motion.div>

        {/* Investors panel */}
        <motion.div
          className={panelBase}
          style={{
            right: 0,
            width: halfGap,
          }}
        >
          <img
            src="/hero-globe.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90 mix-blend-lighten"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(270deg, rgba(5,9,15,0.92) 8%, rgba(5,9,15,0.35) 70%)",
            }}
          />
          <div className="absolute bottom-16 right-4 max-w-[16rem] text-right sm:bottom-24 sm:right-12 sm:max-w-[22rem] md:right-20 lg:right-24">
            <p
              className="text-[10px] font-semibold uppercase text-brand-300 sm:text-sm"
              style={{ letterSpacing: "0.22em" }}
            >
              Investors
            </p>
            <p
              className="mt-3 font-display text-lg font-medium leading-[1.1] tracking-tight text-transparent bg-clip-text sm:text-2xl md:text-3xl lg:text-4xl"
              style={{
                backgroundImage: gradient,
                backgroundSize: "300% 100%",
                animation: "hero-grad 5s ease-in-out infinite",
              }}
            >
              Looking for the next one.
            </p>
          </div>
        </motion.div>

        {/* Bridge line + nodes, drawn at vertical centre */}
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
          style={{ height: 2 }}
        >
          <motion.div
            className="mx-auto h-[2px] w-1/2"
            style={{
              background: "#10b981",
              boxShadow: "0 0 18px #10b981",
              scaleX: bridgeScale,
              transformOrigin: "center",
              opacity: bridgeScale,
            }}
          />
        </div>
        <motion.div
          className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: halfGap,
            background: "#10b981",
            boxShadow: "0 0 26px #10b981",
            scale: nodeScale,
          }}
        />
        <motion.div
          className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: halfGapNeg,
            background: "#10b981",
            boxShadow: "0 0 26px #10b981",
            scale: nodeScale,
          }}
        />

        {/* Ambient glow overlay + decorative geometry */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: HERO_GLOW, mixBlendMode: "screen" }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <HeroDecor />
        </div>

        {/* Brand endcard — headline + rule + subhead over the globe */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ opacity: brandOpacity }}
        >
          <motion.div
            className="absolute right-0 top-0 h-full w-[62%]"
            style={{ scale: globeScale, transformOrigin: "80% 50%" }}
          >
            <img
              src="/hero-globe.jpg"
              alt=""
              className="h-full w-full object-cover opacity-90"
            />
          </motion.div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(95deg, rgba(5,9,15,0.96) 32%, rgba(5,9,15,0.5) 62%, rgba(5,9,15,0) 88%)",
            }}
          />
          <motion.div
            className="absolute left-6 top-1/2 w-full max-w-[36rem] -translate-y-1/2 sm:left-12 md:left-20 lg:left-24"
            style={{ y: brandY }}
          >
            <h1
              className="font-display text-4xl font-medium leading-[1.02] tracking-tight text-transparent bg-clip-text sm:text-5xl md:text-6xl lg:text-7xl"
              style={{
                backgroundImage: gradient,
                backgroundSize: "300% 100%",
                animation: "hero-grad 5s ease-in-out infinite",
              }}
            >
              Where founders meet capital.
            </h1>
            <motion.div
              className="my-8 h-px w-[70%] max-w-[26rem] origin-left"
              style={{
                scaleX: ruleScale,
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0), #10b981 20%, #10b981 80%, rgba(0,0,0,0))",
              }}
            />
            <p className="max-w-[32rem] text-base leading-relaxed text-white/70 sm:text-lg md:text-xl">
              InvestBridge connects entrepreneurs with investors who are ready
              to move.
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
          style={{ opacity: cueOpacity }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 rounded-full bg-black/25 px-3.5 py-2 text-white/80 backdrop-blur-sm"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest">
              Scroll
            </span>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StatItem({ s, isInView }) {
  const display = useCountUp(s.value, isInView);
  return (
    <motion.div
      className="px-4 py-6 text-center sm:py-0"
      variants={fadeUp}
    >
      <p className="bg-gradient-to-br from-white to-white/70 bg-clip-text font-display text-3xl font-extrabold text-transparent sm:text-4xl">
        {display}
      </p>
      <p className="mt-1.5 text-sm text-white/65">{s.label}</p>
    </motion.div>
  );
}

function Stats() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.5 });
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const data = await getPlatformStats();
        if (!cancelled && data.stats) {
          setStats(buildStats(data.stats));
        }
      } catch {
        // Keep the fallback stats already in state.
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <motion.div
          ref={containerRef}
          className="mx-auto grid max-w-5xl grid-cols-2 divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/[0.03] px-4 shadow-[0_24px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:divide-x sm:divide-y-0 sm:px-4 lg:grid-cols-4"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          {stats.map((s) => (
            <StatItem key={s.label} s={s} isInView={isInView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks({ navigate }) {
  const user = getStoredUser();
  if (user) {
    return null;
  }

  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="container-page">
        <Parallax range={40}>
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUpBlur}
          >
            <span className="eyebrow">How it works</span>
            <h2 className="mt-4">
              <GradientText
                colors={["#10b981", "#fbbf24", "#10b981"]}
                animationSpeed={5}
                direction="horizontal"
                className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Three steps from pitch to funded
              </GradientText>
            </h2>
            <p className="mt-4 text-lg text-white/75">
              A transparent process that keeps founders focused on building and
              investors confident in their commitments.
            </p>
          </motion.div>
        </Parallax>

        <motion.div
          className="mt-14 grid gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((s, i) => (
            <StepCard key={s.title} s={s} i={i} navigate={navigate} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StepCard({ s, i, navigate }) {
  return (
    <BorderGlow
      backgroundColor="transparent"
      borderRadius={40}
      glowRadius={4}
      glowIntensity={1.8}
      edgeSensitivity={35}
      coneSpread={35}
      glowColor="40 90 60"
      colors={["#10b981", "#fbbf24", "#10b981"]}
      className="h-full"
    >
      <motion.button
        type="button"
        onClick={() => navigate(s.route)}
        className="holo-card holo-card-dark group relative h-full w-full rounded-[40px] p-7 text-left"
        variants={fadeUp}
        whileHover={{ y: -4, transition: { duration: 0.25 } }}
      >
        <span className="absolute right-6 top-6 font-display text-5xl font-extrabold text-white/10">
          {i + 1}
        </span>
        <motion.span
          className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-300"
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <s.icon className="h-6 w-6" />
        </motion.span>
        <h3 className="mt-5 font-display text-lg font-bold text-white">
          {s.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{s.desc}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-300 transition-colors group-hover:text-brand-200">
          {s.action}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
        </span>
      </motion.button>
    </BorderGlow>
  );
}

function FeaturedStartups({ navigate, imageErrors, handleImageError }) {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStartups() {
      try {
        const data = await getAllOpportunities();
        if (cancelled) return;
        const mapped = (data.opportunities || []).slice(0, 6).map((opp) => ({
          id: opp.id,
          name: opp.title,
          company: opp.company,
          sector: opp.sector,
          location: opp.location || "TBD",
          goal: opp.funding_goal || "TBD",
          blurb: opp.description || "",
          timeline: opp.timeline || "TBD",
          status: opp.investor_id ? "Funded" : "Open",
          image: opp.image || null,
        }));
        setStartups(mapped);
      } catch {
        if (!cancelled) setStartups([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStartups();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="startups" className="py-20 sm:py-28">
      <div className="container-page">
        <Parallax range={40}>
          <motion.div
            className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUpBlur}
          >
            <div className="max-w-2xl">
              <span className="eyebrow">Live deals</span>
              <h2 className="mt-4">
                <GradientText
                  colors={["#10b981", "#fbbf24", "#10b981"]}
                  animationSpeed={5}
                  direction="horizontal"
                  className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
                >
                  Featured startups raising now
                </GradientText>
              </h2>
              <p className="mt-4 text-lg text-white/75">
                A snapshot of vetted rounds currently open for investment on
                InvestBridge.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/deals")}
              className="btn-ghost group shrink-0"
            >
              Browse all deals
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
            </button>
          </motion.div>
        </Parallax>

        {!loading && startups.length === 0 ? (
          <div className="mt-12 rounded-[40px] border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur">
            <p className="text-white/65">
              No opportunities have been posted yet. Be the first to raise a
              round on InvestBridge.
            </p>
            <button
              type="button"
              onClick={() => navigate("/opportunities")}
              className="btn-primary mt-5 inline-flex"
            >
              Post an opportunity
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <motion.div
            className="mt-12 flex flex-col gap-3.5"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {startups.map((s) => (
              <StartupCard
                key={s.id}
                s={s}
                navigate={navigate}
                imageErrors={imageErrors}
                handleImageError={handleImageError}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

function DealStat({ label, value, divider = false }) {
  return (
    <div className={`min-w-0 ${divider ? "border-l border-white/[0.08] pl-3" : ""}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
        {label}
      </p>
      <p className="mt-1.5 truncate text-[15px] font-semibold text-white">{value}</p>
    </div>
  );
}

// Wide deal row: media | name + blurb | stats strip. Collapses to a stacked
// card on small screens.
function StartupCard({ s, navigate, imageErrors, handleImageError }) {
  const hasImage = s.image && !imageErrors[s.id];
  return (
    <motion.div
      variants={fadeUp}
      className="transition-transform duration-300 ease-out hover:translate-x-1"
    >
      <BorderGlow
        backgroundColor="transparent"
        borderRadius={22}
        glowRadius={4}
        glowIntensity={1.8}
        edgeSensitivity={35}
        coneSpread={35}
        glowColor="40 90 60"
        colors={["#10b981", "#fbbf24", "#10b981"]}
      >
        <a
          href="/deals"
          onClick={(event) => {
            event.preventDefault();
            navigate("/deals");
          }}
          className="group grid overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(5,9,15,0.55)] text-inherit no-underline backdrop-blur transition-colors duration-300 ease-out hover:border-brand-500/50 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)_340px]"
        >
          {/* Media */}
          <div className="relative min-h-[132px] bg-[radial-gradient(90%_100%_at_20%_0%,rgba(16,185,129,0.35)_0%,rgba(16,185,129,0)_70%),#0a1f19]">
            {hasImage ? (
              <img
                src={s.image}
                alt=""
                loading="lazy"
                onError={() => handleImageError(s.id)}
                className="absolute inset-0 h-full w-full object-cover opacity-85 mix-blend-lighten"
              />
            ) : (
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center font-display text-[56px] font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_rgba(110,231,183,0.4)]"
              >
                {initialsOf(s.name)}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,9,15,0.8)] to-transparent md:bg-gradient-to-r md:from-transparent md:from-50% md:to-[rgba(5,9,15,0.8)]" />
          </div>
    
          {/* Body */}
          <div className="flex flex-col justify-center gap-2 px-6 py-5 sm:px-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[19px] font-semibold text-white">{s.name}</span>
              <span className="rounded-full border border-white/[0.14] px-2.5 py-0.5 text-[11px] font-semibold text-white/80">
                {s.sector}
              </span>
              <span className="text-xs text-white/50">{s.location}</span>
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-white/70 [text-wrap:pretty]">
              {s.blurb || s.company}
            </p>
          </div>
    
          {/* Stats */}
          <div className="flex flex-col justify-center gap-3 border-t border-white/[0.07] px-6 py-5 md:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:px-[26px]">
            <div className="grid grid-cols-3 border-b border-white/[0.08] pb-3">
              <DealStat label="Goal" value={s.goal} />
              <DealStat label="Timeline" value={s.timeline} divider />
              <DealStat label="Status" value={s.status} divider />
            </div>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-300 transition-colors group-hover:text-brand-200">
              View deal room
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </a>
      </BorderGlow>
    </motion.div>
  );
}

function ForWho() {
  return (
    <section id="investors" className="py-20 sm:py-28">
      <div className="container-page">
        <Parallax range={40}>
          <motion.div
            className="mx-auto max-w-2xl text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUpBlur}
          >
            <span className="eyebrow">Features for everyone</span>
            <h2 className="mt-4">
              <GradientText
                colors={["#10b981", "#fbbf24", "#10b981"]}
                animationSpeed={5}
                direction="horizontal"
                className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Everything you need on one platform
              </GradientText>
            </h2>
            <p className="mt-3 text-white/75">
              Whether you're looking to share an opportunity, find an investment,
              or build your network, InvestBridge gives you all the tools you
              need.
            </p>
          </motion.div>
        </Parallax>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {universalBenefits.map((b) => (
            <BenefitCard key={b.title} b={b} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BenefitCard({ b }) {
  return (
    <BorderGlow
      backgroundColor="transparent"
      borderRadius={40}
      glowRadius={4}
      glowIntensity={1.8}
      edgeSensitivity={35}
      coneSpread={35}
      glowColor="40 90 60"
      colors={["#10b981", "#fbbf24", "#10b981"]}
      className="h-full"
    >
      <motion.div
        className="holo-card holo-card-dark h-full rounded-[40px] p-8 hover:shadow-lift"
        variants={fadeUp}
        whileHover={{ y: -3, transition: { duration: 0.25 } }}
      >
        <motion.span
          className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-300"
          whileHover={{ rotate: -8, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <b.icon className="h-6 w-6" />
        </motion.span>
        <p className="mt-4 font-display font-bold text-white">{b.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{b.desc}</p>
      </motion.div>
    </BorderGlow>
  );
}

function Testimonials({ imageErrors, handleImageError }) {
  return (
    <section id="stories" className="py-20 text-white sm:py-28">
      <div className="container-page">
        <Parallax range={40}>
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUpBlur}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:border-white/15 dark:bg-white/5 dark:text-brand-300">
              Success stories
            </span>
            <h2 className="mt-4">
              <GradientText
                colors={["#10b981", "#fbbf24", "#10b981"]}
                animationSpeed={5}
                direction="horizontal"
                className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Trusted by founders and investors alike
              </GradientText>
            </h2>
          </motion.div>
        </Parallax>

        <motion.div
          className="mt-14 grid gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {testimonials.map((t) => (
            <TestimonialCard
              key={t.name}
              t={t}
              imageErrors={imageErrors}
              handleImageError={handleImageError}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const starPop = {
  hidden: { opacity: 0, scale: 0, rotate: -30 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { delay: 0.3 + i * 0.06, duration: 0.35, ease: "backOut" },
  }),
};

function TestimonialCard({ t, imageErrors, handleImageError }) {
  return (
    <BorderGlow
      backgroundColor="transparent"
      borderRadius={40}
      glowRadius={4}
      glowIntensity={1.8}
      edgeSensitivity={35}
      coneSpread={35}
      glowColor="40 90 60"
      colors={["#10b981", "#fbbf24", "#10b981"]}
      className="h-full"
    >
      <motion.figure
        className="holo-card holo-card-dark relative h-full rounded-[40px] p-7"
        variants={fadeUp}
        whileHover={{ y: -3, transition: { duration: 0.25 } }}
      >
        <motion.div whileHover={{ rotate: -10, scale: 1.1 }}>
          <Quote className="h-8 w-8 text-brand-400/60" />
        </motion.div>
        <blockquote className="mt-4 text-sm leading-relaxed text-white/75">
          {t.quote}
        </blockquote>
        <div className="mt-6 flex items-center gap-3">
          {!imageErrors[t.name] ? (
            <img
              src={t.avatar}
              alt={t.name}
              className="h-11 w-11 rounded-full object-cover"
              loading="lazy"
              onError={() => handleImageError(t.name)}
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-ink-200 flex items-center justify-center dark:bg-ink-800">
              <span className="text-ink-600 text-xs font-semibold dark:text-ink-300">
                {t.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <figcaption className="text-sm font-semibold text-white">
              {t.name}
            </figcaption>
            <p className="text-xs text-white/55">{t.role}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-0.5 text-gold-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={starPop}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.6 }}
            >
              <Star className="h-4 w-4 fill-current" />
            </motion.span>
          ))}
        </div>
      </motion.figure>
    </BorderGlow>
  );
}

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

function CTA({ navigate }) {
  const user = getStoredUser();
  if (user) {
    return null;
  }

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <motion.div
          className="holo-scene"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-16 text-center shadow-lift ring-1 ring-white/15 holo-card sm:px-12">
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-20"
              animate={{ opacity: [0.14, 0.26, 0.14] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.25) 0, transparent 40%)",
                }}
              />
            </motion.div>
            <div className="relative mx-auto max-w-2xl holo-layer-soft">
              <h2>
                <GradientText
                  colors={["#ffffff", "#fbbf24", "#ffffff"]}
                  animationSpeed={5}
                  direction="horizontal"
                  className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
                >
                  Ready to build the bridge?
                </GradientText>
              </h2>
              <p className="mt-4 text-lg text-brand-50">
                Join thousands of founders and investors turning bold ideas into
                funded companies.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <motion.button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-soft transition-shadow hover:shadow-glow"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  Create your account
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => navigate("/connect")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  Talk to our team
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Homepage({ navigate }) {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (key) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <>
      <PageBackground image={false} gradient={AURORA_BG} />
      <PageDecor />
      <Hero />
      <Stats />
      <HowItWorks navigate={navigate} />
      <FeaturedStartups
        navigate={navigate}
        imageErrors={imageErrors}
        handleImageError={handleImageError}
      />
      <ForWho />
      <Testimonials
        imageErrors={imageErrors}
        handleImageError={handleImageError}
      />
      <CTA navigate={navigate} />
    </>
  );
}
