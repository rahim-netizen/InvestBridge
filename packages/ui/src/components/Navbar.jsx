import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
  Landmark,
  Pencil,
  UserCircle2,
} from "lucide-react";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Startups", href: "#startups" },
  { label: "For Investors", href: "#investors" },
  { label: "Stories", href: "#stories" },
];

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

export default function Navbar({ navigate, theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const showProfileMenu = Boolean(currentUser?.profileComplete);
  const profileLabel = currentUser?.name || currentUser?.email || "Profile";
  const profileInitial = String(profileLabel).charAt(0).toUpperCase();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-ink-100 bg-white/80 backdrop-blur-xl shadow-soft dark:border-ink-800 dark:bg-ink-950/80"
          : "border-b border-transparent bg-transparent dark:bg-ink-950/90"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between sm:h-20">
        <button
          type="button"
          onClick={() => navigate("/")}
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
              className="nav-link text-sm font-medium text-ink-600 transition-colors hover:text-brand-700 dark:text-ink-100 dark:hover:text-brand-400"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle grid h-10 w-10 place-items-center rounded-lg border border-ink-200 bg-white text-ink-700 transition hover:border-brand-300 hover:text-brand-700 hover:shadow-glow dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100 dark:hover:border-brand-400 dark:hover:text-brand-400"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          {showProfileMenu ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((value) => !value)}
                className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white shadow-soft"
                aria-label="Open profile menu"
              >
                {profileInitial}
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-ink-100 bg-white p-4 shadow-lift dark:border-ink-800 dark:bg-ink-950">
                  <div className="flex items-center gap-3 border-b border-ink-100 pb-3 dark:border-ink-800">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-100 text-brand-700">
                      <UserCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900 dark:text-ink-50">
                        {profileLabel}
                      </p>
                      <p className="text-sm text-ink-500">
                        {currentUser?.role || "Member"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-ink-600 dark:text-ink-300">
                    <p>
                      <span className="font-semibold text-ink-900 dark:text-ink-50">
                        Email:
                      </span>{" "}
                      {currentUser?.email}
                    </p>
                    {currentUser?.profile && (
                      <p>
                        <span className="font-semibold text-ink-900 dark:text-ink-50">
                          Focus:
                        </span>{" "}
                        {currentUser.profile.company ||
                          currentUser.profile.companyName ||
                          currentUser.profile.focus ||
                          "Profile ready"}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-200"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("investbridgeSessionUser");
                      setProfileMenuOpen(false);
                      navigate("/");
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="nav-link text-sm font-semibold text-ink-700 hover:text-brand-700 dark:text-ink-100 dark:hover:text-brand-400"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="btn-primary"
              >
                Get started
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="theme-toggle grid h-10 w-10 place-items-center rounded-lg border border-ink-200 bg-white text-ink-700 transition hover:border-brand-300 hover:text-brand-700 hover:shadow-glow dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-950 md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-900"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-ink-200 bg-white text-ink-700 transition hover:border-brand-300 hover:text-brand-700 hover:shadow-glow dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100 dark:hover:border-brand-400 dark:hover:text-brand-400"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              {showProfileMenu ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/profile");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-200"
                >
                  <UserCircle2 className="h-4 w-4" />
                  {profileLabel}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate("/login");
                    }}
                    className="btn-ghost flex-1"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate("/register");
                    }}
                    className="btn-primary flex-1"
                  >
                    Get started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
