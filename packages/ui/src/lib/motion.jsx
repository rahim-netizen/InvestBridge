// Shared framer-motion primitives used across pages: scroll-reveal variants,
// a cursor-tilt hook for cards, a page-scroll progress bar, and a count-up
// hook for stat numbers. Centralized here so every page gets the same feel
// instead of re-implementing it per file.
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Same reveal as fadeUp but with a soft focus-pull — used for section/page
// headers so the page feels like it's resolving into focus as you scroll.
export const fadeUpBlur = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

// Lighter, faster stagger for dense lists/grids of many small cards.
export const staggerFast = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

// Simple scale+fade used for modals/dialogs.
export const modalPanel = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.97,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

// Tracks an element's scroll position as it moves through the viewport.
// Progress is 0 when the element's top hits the bottom of the viewport and
// 1 when its bottom passes the top — a parallax lane the element travels along.
export function useViewportScroll(offset = ["start end", "end start"]) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });
  return { ref, scrollYProgress };
}

// Cursor-driven 3D tilt for cards. Tracks pointer position within the
// element and springs a subtle rotateX/rotateY toward it; resets to flat
// on mouse leave. Disabled (flat) when the user prefers reduced motion.
export function useTilt(strength = 7) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const amount = prefersReducedMotion ? 0 : strength;
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [amount, -amount]), {
    stiffness: 260,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-amount, amount]), {
    stiffness: 260,
    damping: 22,
  });

  const handleMouseMove = (e) => {
    if (prefersReducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    px.set(0);
    py.set(0);
  };

  return {
    ref,
    style: { rotateX, rotateY, transformPerspective: 900 },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}

// Animates a stat string ("$240M+", "3,400+", "92%") from zero up to its
// target once it scrolls into view, preserving any prefix/suffix and comma
// formatting.
export function useCountUp(target, isInView) {
  const match = target.match(/^(\D*)([\d,.]+)(.*)$/);
  const prefix = match ? match[1] : "";
  const numStr = match ? match[2] : "";
  const suffix = match ? match[3] : "";
  const hasComma = numStr.includes(",");
  const numericValue = match ? parseFloat(numStr.replace(/,/g, "")) : NaN;
  const [display, setDisplay] = useState(
    Number.isNaN(numericValue) ? target : `${prefix}0${suffix}`,
  );

  useEffect(() => {
    if (!isInView || Number.isNaN(numericValue)) return;
    const controls = animate(0, numericValue, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate(v) {
        const rounded = Math.round(v);
        const formatted = hasComma
          ? rounded.toLocaleString("en-US")
          : String(rounded);
        setDisplay(`${prefix}${formatted}${suffix}`);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return display;
}

export function Parallax({ children, range = 48, className }) {
  const { ref, scrollYProgress } = useViewportScroll();
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// Thin gradient bar pinned to the top of the viewport that fills with
// overall page scroll progress. Mounted once in PageLayout so every route
// gets it for free.
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-gold-400"
      style={{ scaleX }}
    />
  );
}

export { useInView };
