import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  DollarSign,
  Handshake,
  LineChart,
  MapPin,
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
import PageBackground from "./PageBackground.jsx";
import { getAllOpportunities } from "../api/opportunities";
import {
  fadeUp,
  fadeUpBlur,
  stagger,
  useCountUp,
  useInView,
  useTilt,
  Parallax,
} from "../lib/motion.jsx";

const stats = [
  { value: "$240M+", label: "Total capital deployed" },
  { value: "3,400+", label: "Startups funded" },
  { value: "1,800+", label: "Active investors" },
  { value: "92%", label: "Round success rate" },
];

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

const DEFAULT_DEAL_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23e5e7eb'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='16'>No image</text></svg>";

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

function Hero() {
  const sectionRef = useRef(null);
  // Tracks the hero's own scroll position through the viewport: progress is
  // 0 while its top edge sits at the viewport top, and reaches 1 once its
  // bottom edge has scrolled up to the viewport top — i.e. exactly the span
  // during which the hero is passing out of view underneath the sticky nav.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.1]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative pt-16 sm:pt-20 overflow-hidden"
    >
      <motion.div style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}>
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          poster="/homepage-bg.jpg"
          className="block w-full h-auto"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <source src="/investbridge-hero.mp4" type="video/mp4" />
        </motion.video>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.div style={{ opacity: heroOpacity }}>
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
      </motion.div>
    </section>
  );
}

function StatItem({ s, isInView }) {
  const display = useCountUp(s.value, isInView);
  return (
    <motion.div className="text-center" variants={fadeUp}>
      <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">
        {display}
      </p>
      <p className="mt-1 text-sm text-white/70">{s.label}</p>
    </motion.div>
  );
}

function Stats() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.5 });

  return (
    <section className="border-y border-white/10 py-12">
      <motion.div
        ref={containerRef}
        className="container-page grid grid-cols-2 gap-8 lg:grid-cols-4"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {stats.map((s) => (
          <StatItem key={s.label} s={s} isInView={isInView} />
        ))}
      </motion.div>
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
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Three steps from pitch to funded
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
  const tilt = useTilt();

  return (
    <motion.button
      ref={tilt.ref}
      type="button"
      onClick={() => navigate(s.route)}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="card holo-card group relative p-7 text-left"
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
    >
      <span className="absolute right-6 top-6 font-display text-5xl font-extrabold text-ink-100">
        {i + 1}
      </span>
      <motion.span
        className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700"
        whileHover={{ rotate: 8, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <s.icon className="h-6 w-6" />
      </motion.span>
      <h3 className="mt-5 font-display text-lg font-bold text-ink-900">
        {s.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.desc}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        {s.action}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
      </span>
    </motion.button>
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
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Featured startups raising now
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
          <div className="mt-12 card holo-card p-10 text-center">
            <p className="text-ink-600">
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
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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

function StartupCard({ s, navigate, imageErrors, handleImageError }) {
  const tilt = useTilt(5);

  return (
    <motion.article
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="card holo-card group overflow-hidden hover:shadow-lift cursor-pointer"
      variants={fadeUp}
      onClick={() => navigate("/deals")}
    >
      <div className="relative h-40 overflow-hidden bg-ink-900">
        {s.image && !imageErrors[s.id] ? (
          <img
            src={s.image}
            alt={s.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => handleImageError(s.id)}
          />
        ) : (
          <img
            src={DEFAULT_DEAL_IMAGE}
            alt={s.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/10 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-800 backdrop-blur">
            {s.sector}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
          <span className="font-display text-lg font-bold">{s.name}</span>
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
          {s.company}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-600 line-clamp-2">
          {s.blurb}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {s.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" />
            Goal {s.goal}
          </span>
        </div>

        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors group-hover:text-brand-800 group-hover:gap-1.5">
          View deal room
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.article>
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
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Everything you need on one platform
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
  const tilt = useTilt(5);

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="card holo-card p-8 hover:shadow-lift"
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
    >
      <motion.span
        className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700"
        whileHover={{ rotate: -8, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <b.icon className="h-6 w-6" />
      </motion.span>
      <p className="mt-4 font-display font-bold text-ink-900">{b.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{b.desc}</p>
    </motion.div>
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
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Trusted by founders and investors alike
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
  const tilt = useTilt(5);

  return (
    <motion.figure
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="holo-card relative rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition-colors hover:bg-white/[0.07]"
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
    >
      <motion.div whileHover={{ rotate: -10, scale: 1.1 }}>
        <Quote className="h-8 w-8 text-brand-400/60" />
      </motion.div>
      <blockquote className="mt-4 text-sm leading-relaxed text-ink-200">
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
          <p className="text-xs text-ink-400">{t.role}</p>
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-16 text-center shadow-lift holo-card sm:px-12">
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
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Ready to build the bridge?
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
      <PageBackground />
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
