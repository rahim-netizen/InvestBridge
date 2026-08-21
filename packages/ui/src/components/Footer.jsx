import { Landmark, MessagesSquare, Send, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../lib/motion.jsx';

const columns = [
  {
    title: 'Platform',
    links: ['Explore deals', 'Post a startup', 'For investors', 'For founders', 'Pricing'],
  },
  {
    title: 'Company',
    links: ['About us', 'Careers', 'Press', 'Partners', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Help center', 'Founder guide', 'Investor guide', 'Blog', 'API docs'],
  },
  {
    title: 'Legal',
    links: ['Terms', 'Privacy', 'Risk disclosure', 'Cookie policy'],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/40 bg-white/60 backdrop-blur-2xl dark:border-white/10 dark:bg-ink-950/60">
      <div className="container-page py-14">
        <motion.div
          className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={fadeUp}>
            <a href="#home" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
                <Landmark className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
                Invest<span className="text-brand-600">Bridge</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              The bridge between ambitious founders and serious investors. Discover, fund, and grow
              the next generation of startups.
            </p>
            <div className="mt-5 flex gap-3">
              {[MessagesSquare, Send, Code].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="social-link grid h-9 w-9 place-items-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700"
                  aria-label="social link"
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
              <p className="font-display text-sm font-bold text-ink-900">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="footer-link text-sm text-ink-500 transition-colors hover:text-brand-700">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/40 pt-6 dark:border-white/10 sm:flex-row">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} InvestBridge. All rights reserved.
          </p>
          <p className="text-xs text-ink-400">
            Investing involves risk. Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
