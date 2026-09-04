// Shared decorative overlay used across the app's product pages
// (deals, dashboard, opportunities, connect, support, admin, payment,
// profile). Sits on top of PageBackground/AURORA_BG and adds a
// finance-themed "market" layer: floating chart curves, twinkling
// ticks, drifting finance objects (candlesticks, bar chart, dollar
// badge, percentage tile, coin token, trending arrow, donut), soft
// mesh glows, and a spotlight vignette.
//
// Everything is aria-hidden + pointer-events: none so it stays
// purely aesthetic. All animations respect prefers-reduced-motion.
//
// Usage (right after <PageBackground ... />):
//   <PageDecor />
export default function PageDecor() {
  return (
    <>
      {/* Topographic / stock-curve SVG lines that softly float. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full animate-[deals-float_24s_ease-in-out_infinite]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="page-decor-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(16,185,129,0)" />
            <stop offset="35%" stopColor="rgba(16,185,129,0.55)" />
            <stop offset="65%" stopColor="rgba(245,158,11,0.35)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0)" />
          </linearGradient>
          <linearGradient id="page-decor-line-soft" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(16,185,129,0)" />
            <stop offset="50%" stopColor="rgba(16,185,129,0.28)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0)" />
          </linearGradient>
        </defs>
        <g fill="none" strokeWidth="1.2" stroke="url(#page-decor-line-soft)">
          <path d="M-20 780 C 240 720, 420 820, 700 740 S 1180 640, 1460 720" />
          <path d="M-20 700 C 260 620, 500 760, 780 660 S 1220 540, 1460 640" opacity="0.7" />
          <path d="M-20 620 C 220 560, 480 680, 760 580 S 1200 460, 1460 560" opacity="0.55" />
          <path d="M-20 540 C 260 500, 520 600, 800 500 S 1240 380, 1460 480" opacity="0.4" />
          <path d="M-20 460 C 240 420, 500 520, 780 420 S 1220 300, 1460 400" opacity="0.28" />
        </g>
        <path
          d="M-20 680 C 260 580, 520 780, 820 620 S 1240 480, 1460 600"
          fill="none"
          stroke="url(#page-decor-line)"
          strokeWidth="1.8"
        />
      </svg>

      {/* Floating finance objects. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* Candlestick cluster — top-right */}
        <svg
          className="absolute right-[6%] top-[14%] h-32 w-32 opacity-[0.22] animate-[deals-bob_9s_ease-in-out_infinite]"
          viewBox="0 0 120 120"
          fill="none"
        >
          <line x1="20" y1="20" x2="20" y2="90" stroke="rgba(16,185,129,0.8)" strokeWidth="1.5" />
          <rect x="12" y="35" width="16" height="40" fill="rgba(16,185,129,0.35)" stroke="rgba(16,185,129,0.9)" strokeWidth="1.2" />
          <line x1="50" y1="10" x2="50" y2="100" stroke="rgba(245,158,11,0.8)" strokeWidth="1.5" />
          <rect x="42" y="25" width="16" height="55" fill="rgba(245,158,11,0.30)" stroke="rgba(245,158,11,0.9)" strokeWidth="1.2" />
          <line x1="80" y1="18" x2="80" y2="85" stroke="rgba(16,185,129,0.8)" strokeWidth="1.5" />
          <rect x="72" y="28" width="16" height="45" fill="rgba(16,185,129,0.35)" stroke="rgba(16,185,129,0.9)" strokeWidth="1.2" />
        </svg>

        {/* Rising bar chart — bottom-left */}
        <svg
          className="absolute left-[5%] bottom-[16%] h-28 w-32 opacity-[0.20] animate-[deals-bob_11s_ease-in-out_infinite] [animation-delay:1.5s]"
          viewBox="0 0 120 100"
          fill="none"
        >
          <rect x="10" y="70" width="14" height="25" rx="2" fill="rgba(16,185,129,0.5)" />
          <rect x="32" y="55" width="14" height="40" rx="2" fill="rgba(16,185,129,0.55)" />
          <rect x="54" y="40" width="14" height="55" rx="2" fill="rgba(16,185,129,0.6)" />
          <rect x="76" y="25" width="14" height="70" rx="2" fill="rgba(245,158,11,0.6)" />
          <rect x="98" y="10" width="14" height="85" rx="2" fill="rgba(245,158,11,0.7)" />
          <line x1="4" y1="96" x2="118" y2="96" stroke="rgba(16,185,129,0.5)" strokeWidth="1" />
        </svg>

        {/* Dollar sign badge — mid-left */}
        <svg
          className="absolute left-[12%] top-[38%] h-20 w-20 opacity-[0.18] animate-[deals-spin_60s_linear_infinite]"
          viewBox="0 0 80 80"
          fill="none"
        >
          <circle cx="40" cy="40" r="36" stroke="rgba(16,185,129,0.7)" strokeWidth="1.5" strokeDasharray="3 4" />
          <circle cx="40" cy="40" r="26" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontSize="34"
            fontWeight="700"
            fill="rgba(16,185,129,0.75)"
          >
            $
          </text>
        </svg>

        {/* Percentage / growth badge — right mid */}
        <svg
          className="absolute right-[10%] top-[52%] h-24 w-24 opacity-[0.20] animate-[deals-bob_13s_ease-in-out_infinite] [animation-delay:2.5s]"
          viewBox="0 0 96 96"
          fill="none"
        >
          <rect x="6" y="6" width="84" height="84" rx="16" stroke="rgba(245,158,11,0.6)" strokeWidth="1.4" />
          <path
            d="M20 68 L38 50 L52 60 L76 32"
            stroke="rgba(16,185,129,0.85)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M64 32 L76 32 L76 44"
            stroke="rgba(16,185,129,0.85)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        {/* Coin / hex token — top-left */}
        <svg
          className="absolute left-[42%] top-[8%] h-20 w-20 opacity-[0.17] animate-[deals-spin_45s_linear_infinite_reverse]"
          viewBox="0 0 80 80"
          fill="none"
        >
          <polygon
            points="40,6 68,22 68,58 40,74 12,58 12,22"
            stroke="rgba(245,158,11,0.75)"
            strokeWidth="1.5"
            fill="rgba(245,158,11,0.08)"
          />
          <polygon
            points="40,18 58,28 58,52 40,62 22,52 22,28"
            stroke="rgba(16,185,129,0.6)"
            strokeWidth="1"
            fill="none"
          />
        </svg>

        {/* Trending-up arrow ribbon — mid-bottom-right */}
        <svg
          className="absolute right-[24%] bottom-[10%] h-24 w-32 opacity-[0.18] animate-[deals-bob_10s_ease-in-out_infinite] [animation-delay:1s]"
          viewBox="0 0 128 96"
          fill="none"
        >
          <path
            d="M8 80 Q 32 70, 48 56 T 92 28 L 116 16"
            stroke="rgba(16,185,129,0.85)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M100 12 L 120 12 L 120 32"
            stroke="rgba(16,185,129,0.85)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="8" cy="80" r="3" fill="rgba(16,185,129,0.9)" />
          <circle cx="48" cy="56" r="2.5" fill="rgba(245,158,11,0.9)" />
          <circle cx="92" cy="28" r="2.5" fill="rgba(245,158,11,0.9)" />
        </svg>

        {/* Donut — bottom center-ish */}
        <svg
          className="absolute left-[52%] bottom-[24%] h-16 w-16 opacity-[0.18] animate-[deals-spin_75s_linear_infinite]"
          viewBox="0 0 64 64"
          fill="none"
        >
          <circle cx="32" cy="32" r="24" stroke="rgba(16,185,129,0.5)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r="24"
            stroke="rgba(245,158,11,0.85)"
            strokeWidth="6"
            strokeDasharray="55 200"
            transform="rotate(-90 32 32)"
          />
        </svg>
      </div>

      {/* Twinkling market-tick dots scattered across the page. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        {[
          { l: "8%",  t: "22%", d: "0s",   dur: "3.2s" },
          { l: "22%", t: "12%", d: "0.7s", dur: "4.1s" },
          { l: "34%", t: "34%", d: "1.4s", dur: "3.6s" },
          { l: "46%", t: "18%", d: "0.3s", dur: "4.6s" },
          { l: "58%", t: "40%", d: "1.9s", dur: "3.4s" },
          { l: "68%", t: "24%", d: "0.9s", dur: "4.2s" },
          { l: "78%", t: "14%", d: "1.1s", dur: "3.8s" },
          { l: "88%", t: "36%", d: "0.4s", dur: "4.4s" },
          { l: "14%", t: "60%", d: "2.1s", dur: "3.9s" },
          { l: "28%", t: "72%", d: "0.6s", dur: "4.5s" },
          { l: "44%", t: "66%", d: "1.6s", dur: "3.3s" },
          { l: "62%", t: "78%", d: "0.8s", dur: "4.7s" },
          { l: "82%", t: "68%", d: "1.3s", dur: "3.7s" },
          { l: "92%", t: "56%", d: "0.2s", dur: "4.0s" },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute h-[3px] w-[3px] rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(16,185,129,0.75)] animate-[deals-twinkle_3s_ease-in-out_infinite]"
            style={{
              left: s.l,
              top: s.t,
              animationDelay: s.d,
              animationDuration: s.dur,
            }}
          />
        ))}
      </div>

      {/* Soft mesh glows for depth. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[6rem] h-[26rem] w-[26rem] rounded-full bg-emerald-500/25 blur-[120px]" />
        <div className="absolute right-[-6rem] top-[18rem] h-[22rem] w-[22rem] rounded-full bg-gold-300/18 blur-[110px]" />
        <div className="absolute left-1/2 bottom-[-8rem] h-[30rem] w-[36rem] -translate-x-1/2 rounded-full bg-emerald-600/22 blur-[130px]" />
      </div>

      {/* Center spotlight vignette — brightens the middle, darkens edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 42%, rgba(16,185,129,0.05) 0%, rgba(2,10,8,0) 55%, rgba(2,10,8,0.55) 100%)",
        }}
      />

      <style>{`
        @keyframes deals-twinkle {
          0%,100% { opacity: 0.15; transform: scale(0.85); }
          50%     { opacity: 1;    transform: scale(1.4);  }
        }
        @keyframes deals-float {
          0%   { transform: translate3d(0, 0, 0); }
          50%  { transform: translate3d(-1.5%, -1%, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes deals-bob {
          0%,100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50%     { transform: translate3d(0, -14px, 0) rotate(2deg); }
        }
        @keyframes deals-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-[deals-"] { animation: none !important; }
        }
      `}</style>
    </>
  );
}
