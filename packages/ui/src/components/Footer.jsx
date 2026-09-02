import { Landmark, MessagesSquare, Send, Code } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "../lib/motion.jsx";
import GradientText from "./GradientText.jsx";

const columns = [
  {
    title: "Platform",
    links: [
      ["Explore deals", "/deals"],
      ["Post a startup", "/opportunities"],
      ["For investors", "/for-investors"],
      ["For founders", "/for-founders"],
      ["Pricing", "/pricing"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About us", "/about"],
      ["Careers", "/careers"],
      ["Press", "/press"],
      ["Partners", "/partners"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Help center", "/help"],
      ["Founder guide", "/founder-guide"],
      ["Investor guide", "/investor-guide"],
      ["Blog", "/blog"],
      ["API docs", "/api-docs"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms", "/terms"],
      ["Privacy", "/privacy"],
      ["Risk disclosure", "/risk-disclosure"],
      ["Cookie policy", "/cookie-policy"],
    ],
  },
];

export default function Footer({ navigate }) {
  return (
    <footer className="border-t border-white/10 bg-ink-950/60 backdrop-blur-2xl">
      <div className="container-page py-14">
        <motion.div
          className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={fadeUp}>
            <button type="button" onClick={() => navigate("/")} className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
                <Landmark className="h-5 w-5" />
              </span>
              <GradientText
                colors={["#10b981", "#fbbf24", "#10b981"]}
                animationSpeed={4}
                direction="horizontal"
                className="font-display text-lg font-black tracking-tight"
              >
                InvestBridge
              </GradientText>
            </button>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              The bridge between ambitious founders and serious investors. Discover, fund, and grow
              the next generation of startups.
            </p>
            <div className="mt-5 flex gap-3">
              {[MessagesSquare, Send, Code].map((Icon, i) => (
                <motion.a
                  key={i}
                  href={["https://www.linkedin.com", "https://t.me", "https://github.com"][i]}
                  target="_blank"
                  rel="noreferrer"
                  className="social-link grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white/50 transition-colors hover:border-brand-400/50 hover:text-brand-300"
                  aria-label={["LinkedIn", "Telegram", "GitHub"][i]}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {columns.map((col) => (
            <motion.div key={col.title} variants={fadeUp}>
              <p className="font-display text-sm font-bold text-white">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, path]) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => navigate(path)}
                      className="footer-link text-left text-sm text-white/55 transition-colors hover:text-brand-300"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} InvestBridge. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Investing involves risk. Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
