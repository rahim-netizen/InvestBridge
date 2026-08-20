import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
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
import { useRef, useState } from "react";
import PageBackground from "./PageBackground.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

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

const startups = [
  {
    name: "NovaVet AI",
    logo: "NV",
    sector: "HealthTech",
    stage: "Series A",
    location: "San Francisco, US",
    goal: "$1.5M",
    raised: "$920K",
    pct: 61,
    blurb: "AI-assisted diagnostics for independent veterinary clinics.",
    image:
      "https://images.pexels.com/photos/7088530/pexels-photo-7088530.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Lumen Grid",
    logo: "LG",
    sector: "CleanEnergy",
    stage: "Seed",
    location: "Berlin, DE",
    goal: "$800K",
    raised: "$540K",
    pct: 67,
    blurb: "Decentralized solar microgrids for multi-family housing.",
    image:
      "https://images.pexels.com/photos/371900/pexels-photo-371900.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Cartful",
    logo: "CF",
    sector: "E-commerce",
    stage: "Pre-seed",
    location: "Bengaluru, IN",
    goal: "$400K",
    raised: "$210K",
    pct: 52,
    blurb: "Headless checkout that turns every link into a storefront.",
    image:
      "https://images.pexels.com/photos/4464820/pexels-photo-4464820.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Verdant Labs",
    logo: "VL",
    sector: "AgriTech",
    stage: "Series A",
    location: "Nairobi, KE",
    goal: "$2M",
    raised: "$1.1M",
    pct: 55,
    blurb: "Satellite-driven crop intelligence for smallholder farmers.",
    image:
      "https://images.pexels.com/photos/2284166/pexels-photo-2284166.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "PayBridge",
    logo: "PB",
    sector: "FinTech",
    stage: "Seed",
    location: "Singapore",
    goal: "$1M",
    raised: "$780K",
    pct: 78,
    blurb: "Cross-border B2B payments with instant FX settlement.",
    image:
      "https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Loop Education",
    logo: "LE",
    sector: "EdTech",
    stage: "Pre-seed",
    location: "São Paulo, BR",
    goal: "$500K",
    raised: "$260K",
    pct: 52,
    blurb: "Adaptive learning loops for public school curricula.",
    image:
      "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800",
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
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-white/10 py-12">
      <motion.div
        className="container-page grid grid-cols-2 gap-8 lg:grid-cols-4"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {stats.map((s) => (
          <motion.div key={s.label} className="text-center" variants={fadeUp}>
            <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-white/70">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function HowItWorks({ navigate }) {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="container-page">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
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

        <motion.div
          className="mt-14 grid gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((s, i) => (
            <motion.button
              key={s.title}
              type="button"
              onClick={() => navigate(s.route)}
              className="card holo-card relative p-7 text-left"
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
            >
              <span className="absolute right-6 top-6 font-display text-5xl font-extrabold text-ink-100">
                {i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {s.desc}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                {s.action}
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedStartups({ imageErrors, handleImageError }) {
  return (
    <section id="startups" className="py-20 sm:py-28">
      <div className="container-page">
        <motion.div
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
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
          <a href="#" className="btn-ghost shrink-0">
            Browse all deals
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {startups.map((s) => (
            <motion.article
              key={s.name}
              className="card holo-card group overflow-hidden hover:shadow-lift"
              variants={fadeUp}
            >
              <div className="relative h-40 overflow-hidden">
                {!imageErrors[s.name] ? (
                  <img
                    src={s.image}
                    alt={s.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => handleImageError(s.name)}
                  />
                ) : (
                  <div className="h-full w-full bg-ink-900 flex items-center justify-center">
                    <span className="text-ink-500 text-xs">
                      Image unavailable
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/10 to-transparent" />
                <div className="absolute left-4 top-4 flex gap-2">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-800 backdrop-blur">
                    {s.sector}
                  </span>
                  <span className="rounded-full bg-brand-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                    {s.stage}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 font-display text-sm font-bold backdrop-blur">
                    {s.logo}
                  </span>
                  <span className="font-display text-lg font-bold">
                    {s.name}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm leading-relaxed text-ink-600">
                  {s.blurb}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {s.location}
                </p>

                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-ink-500">
                    <span>
                      {s.raised}{" "}
                      <span className="text-ink-400">of {s.goal}</span>
                    </span>
                    <span className="text-brand-700">{s.pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>

                <a
                  href="#"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
                >
                  View deal room
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ForWho() {
  return (
    <section id="investors" className="py-20 sm:py-28">
      <div className="container-page">
        <motion.div
          className="mx-auto max-w-2xl text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
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

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {universalBenefits.map((b) => (
            <motion.div
              key={b.title}
              className="card holo-card p-8 hover:shadow-lift"
              variants={fadeUp}
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <b.icon className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display font-bold text-ink-900">
                {b.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {b.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Testimonials({ imageErrors, handleImageError }) {
  return (
    <section id="stories" className="py-20 text-white sm:py-28">
      <div className="container-page">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:border-white/15 dark:bg-white/5 dark:text-brand-300">
            Success stories
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Trusted by founders and investors alike
          </h2>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {testimonials.map((t) => (
            <motion.figure
              key={t.name}
              className="holo-card relative rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition-colors hover:bg-white/[0.07]"
              variants={fadeUp}
            >
              <Quote className="h-8 w-8 text-brand-400/60" />
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
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
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
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.25) 0, transparent 40%)",
                }}
              />
            </div>
            <div className="relative mx-auto max-w-2xl holo-layer-soft">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Ready to build the bridge?
              </h2>
              <p className="mt-4 text-lg text-brand-50">
                Join thousands of founders and investors turning bold ideas into
                funded companies.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Create your account
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/connect")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Talk to our team
                </button>
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
