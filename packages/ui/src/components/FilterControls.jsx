// Shared "icon, not section" search + filter controls used on discovery
// pages (Dashboard, Opportunities, Deals): a search icon that expands into
// a pill input, and a filter icon that opens a small popover of options —
// instead of a permanently-visible boxed panel taking up page space.
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// A search icon button that expands in place into a text input. Stays
// expanded while it holds a value; collapses back to just the icon on
// blur once cleared, or immediately via its close button.
export function IconSearchToggle({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  const [open, setOpen] = useState(Boolean(value));
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div className={`flex items-center justify-end ${className}`}>
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative max-w-xs"
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={onChange}
              onBlur={() => {
                if (!value) setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  onChange({ target: { value: "" } });
                  setOpen(false);
                }
              }}
              placeholder={placeholder}
              className="w-full rounded-full border border-white/30 bg-white/60 py-2.5 pl-10 pr-9 text-sm text-ink-900 outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-ink-400 focus:border-brand-400/70 focus:bg-white/85 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.14)] dark:border-white/10 dark:bg-ink-950/55 dark:text-ink-50 dark:placeholder:text-ink-500 dark:focus:bg-ink-950/80"
            />
            <button
              type="button"
              onClick={() => {
                onChange({ target: { value: "" } });
                setOpen(false);
              }}
              className="absolute right-2.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-900/10 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="icon"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/30 bg-white/40 text-ink-600 backdrop-blur-sm transition-colors hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-ink-950/40 dark:text-ink-200 dark:hover:border-brand-400/50 dark:hover:text-brand-300"
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
            {value && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500 dark:border-ink-950" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// A filter icon button that opens a small popover of filter controls.
// Shows a badge with the active-filter count when closed.
export function FilterPopover({ activeCount = 0, children, label = "Filters" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className={`relative grid h-10 w-10 place-items-center rounded-full border backdrop-blur-sm transition-colors ${
          open || activeCount > 0
            ? "border-brand-400/60 bg-brand-500/15 text-brand-700 dark:border-brand-400/40 dark:bg-brand-400/10 dark:text-brand-300"
            : "border-white/30 bg-white/40 text-ink-600 hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-ink-950/40 dark:text-ink-200 dark:hover:border-brand-400/50 dark:hover:text-brand-300"
        }`}
        aria-label={label}
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white dark:bg-brand-400 dark:text-ink-950">
            {activeCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 z-30 mt-3 w-64 space-y-4 rounded-2xl border border-white/30 bg-white/95 p-4 shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-950/95"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// A compact labeled select for use inside a FilterPopover.
export function PopoverSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-ink-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-ink-800 outline-none transition-colors focus:border-brand-400 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
        >
          {options.map((opt) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      </div>
    </label>
  );
}

export function FilterChip({ label, onRemove }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.18 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1.5 pl-3 pr-1.5 text-xs font-semibold text-brand-700 dark:border-brand-400/30 dark:bg-brand-400/10 dark:text-brand-300"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="grid h-4 w-4 place-items-center rounded-full text-brand-500 transition-colors hover:bg-brand-600 hover:text-white dark:hover:bg-brand-400 dark:hover:text-ink-950"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </motion.span>
  );
}
