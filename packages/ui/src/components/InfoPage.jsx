import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Sparkles, Zap } from "lucide-react";
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

const excludedPaths = new Set(["/for-investors", "/for-founders", "/pricing"]);

const detailByPath = {
  "/about": { label: "Our point of view", steps: ["Start with context, not noise", "Make the right introduction easier", "Keep momentum after the first conversation"], note: "InvestBridge is designed around the quality of the relationship, not the volume of the feed." },
  "/careers": { label: "Life at InvestBridge", steps: ["Bring your sharpest questions", "Build with a small, thoughtful team", "Leave the product better than you found it"], note: "We value clear thinking, generous collaboration, and work that earns trust." },
  "/press": { label: "Inside the story", steps: ["See what we are building", "Understand why the market needs it", "Connect with the team behind it"], note: "For interviews, product context, or company background, our team is ready to help." },
  "/partners": { label: "A practical partnership", steps: ["Find the overlap in our communities", "Design a useful path for members", "Measure the value together"], note: "The best partnerships give founders and investors a reason to return." },
  "/contact": { label: "A direct line", steps: ["Tell us what you are trying to do", "Get the right person in the loop", "Leave with a clear next step"], note: "A little context helps us make your first reply more useful." },
  "/help": { label: "A quicker way forward", steps: ["Choose the workflow you are in", "Follow the essential steps", "Get unstuck with focused support"], note: "The Help Center is growing with the questions our community asks most often." },
  "/founder-guide": { label: "Build your signal", steps: ["Frame the problem clearly", "Show evidence of movement", "Invite the right conversation"], note: "Specificity creates confidence. Give a busy investor something real to lean into." },
  "/investor-guide": { label: "A thoughtful review", steps: ["Set your investment lens", "Compare the details that matter", "Ask the question behind the pitch"], note: "Good diligence is not about slowing down. It is about knowing what deserves speed." },
  "/blog": { label: "What we are thinking about", steps: ["Notice the signal in the market", "Learn from the people doing the work", "Carry one useful idea into your week"], note: "Practical writing for the decisions that happen between the big announcements." },
  "/api-docs": { label: "Integration path", steps: ["Map your workflow to our model", "Build with clear boundaries", "Ship an experience that stays connected"], note: "Developer resources are being shaped around secure, predictable platform access." },
  "/terms": { label: "Using InvestBridge", steps: ["Create and maintain an accurate account", "Treat every participant with respect", "Make decisions with care"], note: "These terms help keep the platform useful, fair, and dependable for everyone." },
  "/privacy": { label: "Your information", steps: ["Understand what the service needs", "Choose what you share publicly", "Reach out when something is unclear"], note: "Privacy should be understandable. We aim to make the important parts easy to find." },
  "/risk-disclosure": { label: "Before you decide", steps: ["Review the opportunity in full", "Consider uncertainty and liquidity", "Choose an amount within your means"], note: "This page is informational and does not replace independent financial, legal, or tax advice." },
  "/cookie-policy": { label: "A lighter interface", steps: ["Remember your preferences", "Keep sessions working smoothly", "Control storage in your browser"], note: "You can manage local storage and cookies through your browser settings at any time." },
};

export default function InfoPage({ navigate, content }) {
  const details = excludedPaths.has(content.path) ? null : detailByPath[content.path];

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
        {details && (
          <motion.section
            className="mt-14 grid gap-6 lg:grid-cols-[1fr_0.8fr]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="glass-panel-strong rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                <Zap className="h-4 w-4" />
                {details.label}
              </div>
              <div className="mt-7 space-y-0">
                {details.steps.map((step, index) => (
                  <motion.div key={step} variants={fadeUp} className="relative flex gap-4 pb-7 last:pb-0">
                    {index < details.steps.length - 1 && <span className="absolute left-4 top-9 h-full w-px bg-brand-200 dark:bg-brand-900" />}
                    <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-brand-200 bg-brand-50 text-sm font-bold text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">{index + 1}</span>
                    <p className="pt-1 font-semibold text-ink-900 dark:text-ink-50">{step}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-gold-200/60 bg-gold-50/90 p-6 shadow-soft dark:border-gold-900/40 dark:bg-gold-950/25 sm:p-8">
              <div className="absolute right-5 top-5 h-16 w-16 rounded-full border border-gold-300/60" />
              <div className="absolute right-9 top-9 h-8 w-8 rounded-full bg-gold-300/30" />
              <p className="relative mt-16 text-lg font-semibold leading-relaxed text-ink-900 dark:text-ink-50">{details.note}</p>
            </motion.div>
          </motion.section>
        )}
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate(content.primary[1])} className="btn-primary">{content.primary[0]} <ArrowRight className="h-4 w-4" /></button>
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> Back</button>
        </div>
        <div className="mt-14 flex items-center gap-3 text-sm text-white/65"><FileText className="h-4 w-4" /> InvestBridge platform information</div>
      </div>
    </section>
  );
}