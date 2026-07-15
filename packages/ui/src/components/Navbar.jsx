import { useEffect, useState } from "react";
import { Menu, X, Landmark } from "lucide-react";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Startups", href: "#startups" },
  { label: "For Investors", href: "#investors" },
  { label: "Stories", href: "#stories" },
];

export default function Navbar({ navigate }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-ink-100 bg-white/80 backdrop-blur-xl shadow-soft"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between sm:h-20">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="flex items-center gap-2.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Landmark className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
            Invest<span className="text-brand-600">Bridge</span>
          </span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-700"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => navigate("login")}
            className="text-sm font-semibold text-ink-700 hover:text-brand-700"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => navigate("register")}
            className="btn-primary"
          >
            Get started
          </button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-ink-200 bg-white text-ink-700 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-100 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("login");
                }}
                className="btn-ghost flex-1"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("register");
                }}
                className="btn-primary flex-1"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
