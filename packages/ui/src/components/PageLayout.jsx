import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { ScrollProgressBar } from "../lib/motion.jsx";

// Fade + slight rise on every route change — applied here once so it's
// consistent across every page without each page having to opt in.
const routeTransition = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
};

export default function PageLayout({ children, navigate, theme, toggleTheme }) {
  const location = useLocation();

  // Smoothly scroll back to the top on every route change, so a page
  // reached while scrolled down doesn't leave the next one mid-scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <>
      <ScrollProgressBar />
      <Navbar navigate={navigate} theme={theme} toggleTheme={toggleTheme} />
      <main>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={routeTransition}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer navigate={navigate} />
    </>
  );
}
