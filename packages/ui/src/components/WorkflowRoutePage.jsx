import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
  Upload,
} from "lucide-react";

export default function WorkflowRoutePage({ navigate, content, variant }) {
  const Icon = content.icon;

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-20 transition-colors duration-300 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(45,97,255,0.18),_transparent_34%),radial-gradient(circle_at_80%_15%,_rgba(245,158,11,0.12),_transparent_24%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] dark:bg-gradient-to-br dark:from-ink-950 dark:via-ink-950 dark:to-ink-900" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-[-6rem] top-20 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute right-[-5rem] bottom-12 h-80 w-80 rounded-full bg-gold-200/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div>
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            {content.eyebrow}
          </span>
          <div className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:border-brand-400/30 dark:bg-brand-400/10 dark:text-brand-300">
            {content.badge}
          </div>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-600 dark:text-ink-300">
            {content.description}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            {content.summary}
          </p>

          <ul className="mt-8 space-y-3 text-sm text-ink-600 dark:text-ink-300">
            {content.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/30 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                {content.statLabel}
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                {content.statValue}
              </p>
            </div>
            <div className="rounded-3xl border border-white/30 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Next step
              </p>
              <p className="mt-2 text-sm font-medium text-ink-700 dark:text-ink-200">
                {content.steps[0]}
              </p>
            </div>
            <div className="rounded-3xl border border-white/30 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/55">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Focus area
              </p>
              <p className="mt-2 text-sm font-medium text-ink-700 dark:text-ink-200">
                {content.checklist[0]}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(content.primaryRoute)}
              className="btn-primary"
            >
              {content.primaryAction}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate(content.secondaryRoute)}
              className="btn-ghost"
            >
              <ArrowLeft className="h-4 w-4" />
              {content.secondaryAction}
            </button>
          </div>
        </div>

        <div className="glass-panel-strong holo-card rounded-[2rem] p-8">
          <div className="flex items-center justify-between">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600/90 text-white shadow-soft backdrop-blur-sm">
              <Icon className="h-6 w-6" />
            </div>
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
              {variant}
            </span>
          </div>

          {variant === "connect" ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-white/20 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/45">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                      Live thread
                    </p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      NovaVet AI · Series A discussion
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    3 online
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="max-w-[82%] rounded-3xl bg-ink-950 px-4 py-3 text-sm text-white shadow-soft">
                    Founder: We’ve uploaded the latest traction update and deck.
                  </div>
                  <div className="ml-auto max-w-[82%] rounded-3xl bg-brand-600 px-4 py-3 text-sm text-white shadow-soft">
                    Investor: Great. Please add the revenue summary and a Q&A
                    note.
                  </div>
                  <div className="max-w-[88%] rounded-3xl border border-white/20 bg-white px-4 py-3 text-sm text-ink-700 shadow-soft dark:border-white/10 dark:bg-ink-950/55 dark:text-ink-200">
                    Shared note: diligence call scheduled for Thursday at 2 PM.
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-400/10 dark:text-brand-200">
                  <MessageSquare className="h-5 w-5" />
                  <p className="mt-2 font-semibold">Threads</p>
                  <p className="mt-1 text-xs leading-relaxed">
                    Keep every conversation tied to a deal.
                  </p>
                </div>
                <div className="rounded-3xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-400/10 dark:text-brand-200">
                  <FileText className="h-5 w-5" />
                  <p className="mt-2 font-semibold">Notes</p>
                  <p className="mt-1 text-xs leading-relaxed">
                    Pin reminders, context, and file references.
                  </p>
                </div>
                <div className="rounded-3xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-400/10 dark:text-brand-200">
                  <Upload className="h-5 w-5" />
                  <p className="mt-2 font-semibold">Files</p>
                  <p className="mt-1 text-xs leading-relaxed">
                    Share decks and updates without leaving the chat.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/45">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                  {content.detailsTitle}
                </p>
                <div className="mt-4 grid gap-3">
                  {content.steps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-ink-700 shadow-soft dark:bg-ink-950/55 dark:text-ink-200"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/30 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/45">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                  Required info
                </p>
                <ul className="mt-4 space-y-3 text-sm text-ink-600 dark:text-ink-300">
                  {content.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-500 to-brand-700" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
