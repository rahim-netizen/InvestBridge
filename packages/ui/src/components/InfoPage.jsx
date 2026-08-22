import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import PageBackground from "./PageBackground.jsx";
import { fadeUp, stagger } from "../lib/motion.jsx";

export const infoPages = {
  "/for-investors": {
    eyebrow: "Invest with intention",
    title: "A clearer path to your next opportunity.",
    description: "Discover focused startup opportunities, compare the details that matter, and build conviction before you connect.",
    points: ["Browse by sector, stage, and geography", "Keep conversations tied to each deal", "Make decisions with transparent opportunity details"],
    primary: ["Explore deals", "/deals"],
  },
  "/for-founders": {
    eyebrow: "Build your round",
    title: "Turn a strong idea into a fundable story.",
    description: "Share the context behind your company and meet investors who understand where you are going.",
    points: ["Create a structured opportunity profile", "Show traction, goals, and timeline clearly", "Move from interest to a focused conversation"],
    primary: ["Post a startup", "/opportunities"],
  },
  "/pricing": {
    eyebrow: "Simple by design",
    title: "The essentials for meaningful connections.",
    description: "InvestBridge keeps discovery and collaboration straightforward while the platform grows with your network.",
    points: ["Explore the marketplace without friction", "Organize deal conversations in one workspace", "No hidden platform steps between interest and connection"],
    primary: ["Create an account", "/register"],
  },
  "/about": {
    eyebrow: "About InvestBridge",
    title: "Where ambition meets informed action.",
    description: "InvestBridge brings founders and investors into the same focused space, with the context and tools needed to move forward.",
    points: ["Founder-led opportunity discovery", "Investor conversations with useful context", "A calmer, more transparent path to partnership"],
    primary: ["Explore the platform", "/deals"],
  },
  "/careers": { eyebrow: "Careers", title: "Help build the bridge.", description: "We are creating better infrastructure for the people taking thoughtful risks on what comes next.", points: ["Work on a mission with visible impact", "Shape a product used by founders and investors", "Bring curiosity and care to complex problems"], primary: ["Contact us", "/contact"] },
  "/press": { eyebrow: "Press", title: "The story behind the marketplace.", description: "Find the latest company perspective, product notes, and milestones from InvestBridge.", points: ["Product announcements", "Founder and investor stories", "Company background and media enquiries"], primary: ["Contact us", "/contact"] },
  "/partners": { eyebrow: "Partners", title: "Grow the ecosystem together.", description: "Connect your community, expertise, or capital to a network built around better startup relationships.", points: ["Reach focused founder and investor audiences", "Create useful ecosystem pathways", "Build partnerships around shared outcomes"], primary: ["Start a conversation", "/contact"] },
  "/contact": { eyebrow: "Contact", title: "Let’s make the next connection useful.", description: "Whether you are exploring a partnership, need support, or want to share feedback, we would like to hear from you.", points: ["Platform and account questions", "Partnership and press enquiries", "Product feedback from the community"], primary: ["Open a workspace", "/register"] },
  "/help": { eyebrow: "Help center", title: "Find your next answer.", description: "Start with the essentials for navigating opportunities, profiles, and connections on InvestBridge.", points: ["Set up your profile", "Discover and review opportunities", "Start and manage conversations"], primary: ["Go to dashboard", "/dashboard"] },
  "/founder-guide": { eyebrow: "Founder guide", title: "Present the opportunity behind the pitch.", description: "A useful founder profile makes it easier for the right investors to understand your company quickly.", points: ["Lead with the problem and the insight", "Add specific traction and funding goals", "Keep updates clear and timely"], primary: ["Post a startup", "/opportunities"] },
  "/investor-guide": { eyebrow: "Investor guide", title: "Evaluate with better context.", description: "Use structured opportunity details and direct conversations to turn browsing into informed diligence.", points: ["Define the sectors and stages you follow", "Read the full opportunity context", "Ask focused questions in the deal room"], primary: ["Explore deals", "/deals"] },
  "/blog": { eyebrow: "Journal", title: "Ideas for the people building what is next.", description: "A future home for practical notes on fundraising, investing, and the relationships that make both work.", points: ["Fundraising perspectives", "Investor research notes", "Community stories and product updates"], primary: ["Explore opportunities", "/deals"] },
  "/api-docs": { eyebrow: "Developer resources", title: "Build alongside the network.", description: "Explore the foundations for connecting your tools and workflows with InvestBridge.", points: ["Understand the platform model", "Plan secure integrations", "Keep product workflows connected"], primary: ["Contact us", "/contact"] },
  "/terms": { eyebrow: "Legal", title: "Terms of service", description: "These terms describe the expectations for using the InvestBridge platform and participating in its community.", points: ["Use the platform responsibly", "Keep account information accurate", "Review opportunity information carefully"], primary: ["Return home", "/"] },
  "/privacy": { eyebrow: "Legal", title: "Privacy at InvestBridge", description: "We aim to handle account and platform information with care and clear expectations.", points: ["We collect information needed to operate the service", "You control the profile information you share", "Questions can be directed to our team"], primary: ["Contact us", "/contact"] },
  "/risk-disclosure": { eyebrow: "Legal", title: "Risk disclosure", description: "Startup investing carries risk, including possible loss of capital. Review each opportunity carefully and seek independent advice where appropriate.", points: ["Past performance does not guarantee future results", "Early-stage companies can be illiquid and volatile", "Invest only what you can afford to lose"], primary: ["Explore deals", "/deals"] },
  "/cookie-policy": { eyebrow: "Legal", title: "Cookie policy", description: "Cookies and local storage help InvestBridge remember preferences and keep the interface working as expected.", points: ["Remember your theme preference", "Support session and interface behavior", "Review browser controls for local preferences"], primary: ["Return home", "/"] },
};

export default function InfoPage({ navigate, content }) {
  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <PageBackground />
      <div className="mx-auto max-w-5xl">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
          <motion.span className="eyebrow" variants={fadeUp}><Sparkles className="h-3.5 w-3.5" />{content.eyebrow}</motion.span>
          <motion.h1 variants={fadeUp} className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">{content.title}</motion.h1>
          <motion.p variants={fadeUp} className="mt-5 text-lg leading-relaxed text-white/80">{content.description}</motion.p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate="visible" className="mt-12 grid gap-4 md:grid-cols-3">
          {content.points.map((point) => <motion.div key={point} variants={fadeUp} className="glass-panel-strong rounded-3xl p-6"><CheckCircle2 className="h-5 w-5 text-brand-500" /><p className="mt-4 font-semibold text-ink-900 dark:text-ink-50">{point}</p></motion.div>)}
        </motion.div>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate(content.primary[1])} className="btn-primary">{content.primary[0]} <ArrowRight className="h-4 w-4" /></button>
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> Back</button>
        </div>
        <div className="mt-14 flex items-center gap-3 text-sm text-white/65"><FileText className="h-4 w-4" /> InvestBridge platform information</div>
      </div>
    </section>
  );
}