import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BarChart3,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
  Landmark,
  Pencil,
  UserCircle2,
  LayoutDashboard,
  Compass,
  Handshake,
  Users2,
  LifeBuoy,
} from "lucide-react";
import { apiLogout, onAuthChange } from "../api/auth";
import GradientText from "./GradientText.jsx";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Startups", href: "#startups" },
  { label: "For Investors", href: "#investors" },
  { label: "Stories", href: "#stories" },
];

const appLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Opportunities", path: "/opportunities", icon: Compass },
  { label: "Deals", path: "/deals", icon: Handshake },
  { label: "Connect", path: "/connect", icon: Users2 },
  { label: "Support", path: "/support", icon: LifeBuoy },
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

    const unsubscribe = onAuthChange((event) => {
      if (event.type === "LOGIN") {
        setCurrentUser(event.user || getStoredUser());
      } else if (event.type === "LOGOUT") {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, [location.pathname]);

  const showProfileMenu = Boolean(currentUser);
  const profileLabel = currentUser?.name || currentUser?.email || "Profile";
  const profileInitial = String(profileLabel).charAt(0).toUpperCase();
  const profileImage = currentUser?.profile?.profile_image || null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 backdrop-blur-2xl ${
        showProfileMenu
          ? scrolled
            ? "border-brand-500/15 bg-ink-950/80 shadow-[0_10px_30px_rgba(2,6,23,0.45)]"
            : "border-brand-500/10 bg-ink-950/55 shadow-[0_8px_24px_rgba(2,6,23,0.3)]"
          : scrolled
            ? "border-white/10 bg-ink-950/80 shadow-[0_10px_30px_rgba(2,6,23,0.45)]"
            : "border-white/10 bg-ink-950/55 shadow-[0_8px_24px_rgba(2,6,23,0.3)]"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between sm:h-20">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-brand-600/90 text-white shadow-soft backdrop-blur-sm">
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

        <div className="hidden items-center gap-8 md:flex">
          {showProfileMenu
            ? appLinks.map((l) => {
                const Icon = l.icon;
                const active = location.pathname === l.path;
                return (
                  <button
                    key={l.path}
                    type="button"
                    onClick={() => navigate(l.path)}
                    className={`nav-link flex items-center gap-1.5 text-sm font-bold transition-colors ${
                      active
                        ? "text-brand-400"
                        : "text-ink-100/75 hover:text-brand-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {active ? (
                      l.label
                    ) : (
                      <GradientText
                        colors={["#10b981", "#fbbf24", "#10b981"]}
                        animationSpeed={4}
                        direction="horizontal"
                        pauseOnHover
                        className="text-sm font-bold"
                      >
                        {l.label}
                      </GradientText>
                    )}
                  </button>
                );
              })
            : links.map((l) => (
                <a key={l.href} href={l.href} className="nav-link">
                  <GradientText
                    colors={["#10b981", "#fbbf24", "#10b981"]}
                    animationSpeed={4}
                    direction="horizontal"
                    pauseOnHover
                    className="text-sm font-bold"
                  >
                    {l.label}
                  </GradientText>
                </a>
              ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-100 shadow-[0_6px_18px_rgba(2,6,23,0.3)] transition hover:border-brand-500/40 hover:bg-white/10 hover:text-brand-400"
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
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-brand-400/40 bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white shadow-[0_0_0_3px_rgba(16,185,129,0.15)] backdrop-blur-sm"
                aria-label="Open profile menu"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={profileLabel}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profileInitial
                )}
              </button>
              <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-72 rounded-3xl border border-brand-500/20 bg-ink-950/95 p-4 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-2xl">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 backdrop-blur-sm">
                      <UserCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {profileLabel}
                      </p>
                      <p className="text-sm text-ink-400">
                        {currentUser?.role || "Member"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-ink-300">
                    <p>
                      <span className="font-semibold text-white">
                        Email:
                      </span>{" "}
                      {currentUser?.email}
                    </p>
                    {currentUser?.profile && (
                      <p>
                        <span className="font-semibold text-white">
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
                     className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-ink-100 transition hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-400"
                   >
                     <Pencil className="h-4 w-4" />
                     Edit profile
                   </button>
                   <button
                     type="button"
                     onClick={() => {
                       setProfileMenuOpen(false);
                       navigate("/dashboard");
                     }}
                     className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-ink-100 transition hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-400"
                   >
                     <BarChart3 className="h-4 w-4" />
                     My dashboard
                   </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await apiLogout();
                        setCurrentUser(null);
                        setProfileMenuOpen(false);
                        navigate("/");
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-800/50 bg-rose-950/40 px-3 py-2 text-sm font-semibold text-rose-300 transition hover:border-rose-700 hover:bg-rose-900/60"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="nav-link text-sm font-bold text-ink-100 hover:text-brand-400"
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
          className="theme-toggle grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-100 shadow-[0_6px_18px_rgba(2,6,23,0.3)] transition hover:border-brand-500/40 hover:bg-white/10 hover:text-brand-400 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden border-t border-white/10 bg-ink-950/90 backdrop-blur-2xl md:hidden"
        >
          <div className="container-page flex flex-col gap-1 py-4">
            {showProfileMenu
              ? appLinks.map((l) => {
                  const Icon = l.icon;
                  const active = location.pathname === l.path;
                  return (
                    <button
                      key={l.path}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        navigate(l.path);
                      }}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                        active
                          ? "bg-brand-500/10 text-brand-400"
                          : "text-ink-100 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {active ? (
                        l.label
                      ) : (
                        <GradientText
                          colors={["#10b981", "#fbbf24", "#10b981"]}
                          animationSpeed={4}
                          direction="horizontal"
                          className="text-sm font-bold"
                        >
                          {l.label}
                        </GradientText>
                      )}
                    </button>
                  );
                })
              : links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 transition hover:bg-white/5"
                  >
                    <GradientText
                      colors={["#10b981", "#fbbf24", "#10b981"]}
                      animationSpeed={4}
                      direction="horizontal"
                      className="text-sm font-bold"
                    >
                      {l.label}
                    </GradientText>
                  </a>
                ))}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-ink-100 shadow-[0_6px_18px_rgba(2,6,23,0.3)] transition hover:border-brand-500/40 hover:bg-white/10 hover:text-brand-400"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              {showProfileMenu ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-ink-100"
                  >
                    <UserCircle2 className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await apiLogout();
                      setCurrentUser(null);
                      setOpen(false);
                      navigate("/");
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-800/50 bg-rose-950/40 px-3 py-2 text-sm font-semibold text-rose-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate("/login");
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-ink-100 transition-all duration-200 hover:border-brand-500/40 hover:bg-white/10 hover:text-brand-400"
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
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
}
