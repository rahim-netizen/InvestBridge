import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Handshake,
  LineChart,
  MapPin,
  Megaphone,
  PenLine,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

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
  },
  {
    icon: Search,
    title: "Browse and discover deals",
    desc: "Find vetted opportunities that match your interests. Filter by sector, stage, and geography to discover connections that matter.",
  },
  {
    icon: Handshake,
    title: "Connect and grow",
    desc: "Make meaningful connections, track commitments in real time, and close partnerships — InvestBridge handles the logistics.",
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
  return (
    <section id="home" className="relative overflow-hidden pt-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-gold-200/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #0f1620 1px, transparent 1px), linear-gradient(to bottom, #0f1620 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fadeUp">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              The bridge between ideas and capital
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              Where ambitious founders meet{" "}
              <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                serious investors
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
              InvestBridge helps entrepreneurs showcase their startups to a
              curated network of investors — and gives investors a front-row
              seat to the next big thing.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#startups" className="btn-primary">
                Explore startups
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#" className="btn-ghost">
                Pitch your startup
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
              {[
                "No setup fees",
                "Vetted opportunities",
                "Global investor network",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative animate-fadeUp [animation-delay:120ms] holo-scene">
            <div className="relative mx-auto max-w-md">
              <div className="card holo-card overflow-hidden p-0 shadow-lift">
                <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50 px-5 py-4 holo-layer-soft">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white font-display font-bold">
                      NV
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        NovaVet AI
                      </p>
                      <p className="text-xs text-ink-500">
                        Series A · HealthTech
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    Raising
                  </span>
                </div>
                <div className="space-y-4 p-5 holo-layer-soft">
                  <div className="flex items-end justify-between holo-layer">
                    <div>
                      <p className="text-xs text-ink-500">Target raise</p>
                      <p className="font-display text-2xl font-bold text-ink-900">
                        $1.5M
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink-500">Committed</p>
                      <p className="font-display text-2xl font-bold text-brand-600">
                        $920K
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-ink-500">
                      <span>61% funded</span>
                      <span>14 days left</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                        style={{ width: "61%" }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-500 holo-layer-soft">
                    <TrendingUp className="h-4 w-4 text-brand-600" />
                    3.2x projected return over 5 years
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-6 w-44 animate-floatUp rounded-2xl border border-ink-100 bg-white p-4 shadow-lift holo-card sm:-left-10">
                <p className="text-xs text-ink-500">New investment</p>
                <p className="mt-1 font-display text-lg font-bold text-ink-900">
                  $50,000
                </p>
                <p className="text-xs text-brand-600">
                  from 2 investors · just now
                </p>
              </div>

              <div className="absolute -right-4 -top-6 hidden animate-floatUp rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-lift holo-card [animation-delay:1.5s] sm:block">
                <p className="text-xs font-semibold text-ink-900">Live deals</p>
                <p className="font-display text-xl font-extrabold text-brand-600">
                  128
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-ink-100 bg-white py-12">
      <div className="container-page grid grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Three steps from pitch to funded
          </h2>
          <p className="mt-4 text-lg text-ink-600">
            A transparent process that keeps founders focused on building and
            investors confident in their commitments.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="card holo-card relative p-7 hover:shadow-lift"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedStartups() {
  return (
    <section id="startups" className="bg-ink-50 py-20 sm:py-28">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow">Live deals</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Featured startups raising now
            </h2>
            <p className="mt-4 text-lg text-ink-600">
              A snapshot of vetted rounds currently open for investment on
              InvestBridge.
            </p>
          </div>
          <a href="#" className="btn-ghost shrink-0">
            Browse all deals
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {startups.map((s) => (
            <article
              key={s.name}
              className="card holo-card group overflow-hidden hover:shadow-lift"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForWho() {
  return (
    <section id="investors" className="py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <span className="eyebrow">Features for everyone</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Everything you need on one platform
          </h2>
          <p className="mt-3 text-ink-600">
            Whether you're looking to share an opportunity, find an investment,
            or build your network, InvestBridge gives you all the tools you
            need.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {universalBenefits.map((b) => (
            <div key={b.title} className="card holo-card p-8 hover:shadow-lift">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <b.icon className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display font-bold text-ink-900">
                {b.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section
      id="stories"
      className="bg-white py-20 text-ink-900 sm:py-28 dark:bg-ink-950 dark:text-white"
    >
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:border-white/15 dark:bg-white/5 dark:text-brand-300">
            Success stories
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Trusted by founders and investors alike
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="holo-card relative rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition-colors hover:bg-white/[0.07]"
            >
              <Quote className="h-8 w-8 text-brand-400/60" />
              <blockquote className="mt-4 text-sm leading-relaxed text-ink-200">
                {t.quote}
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-11 w-11 rounded-full object-cover"
                  loading="lazy"
                />
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
            </figure>
          ))}
        </div>
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

function CTA() {
  const user = getStoredUser();
  if (user) {
    return null;
  }

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <div className="holo-scene">
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
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Create your account
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Talk to our team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Homepage() {
  return (
    <>
      <Hero />
      <Stats />
      <HowItWorks />
      <FeaturedStartups />
      <ForWho />
      <Testimonials />
      <CTA />
    </>
  );
}
