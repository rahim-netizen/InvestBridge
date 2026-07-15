import { Landmark, MessagesSquare, Send, Code } from 'lucide-react';

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
    <footer className="border-t border-ink-100 bg-white">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
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
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700"
                  aria-label="social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-display text-sm font-bold text-ink-900">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-ink-500 transition-colors hover:text-brand-700">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row">
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
