// Shared building blocks for the large inline opportunity panels
// (Post opportunity, Edit opportunity, deal details).

export const OPEN_FOR_DAYS = [7, 14, 30, 60];

export const formInputClassName =
  "h-11 w-full rounded-xl border border-white/[0.12] bg-[rgba(5,9,15,0.5)] px-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)] focus-visible:border-brand-500 focus-visible:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]";
export const formLabelClassName = "flex flex-col gap-1.5 text-[13px] font-semibold text-white/85";

export const panelClassName =
  "mb-8 flex flex-col gap-7 rounded-[28px] border border-brand-500/25 bg-gradient-to-b from-brand-500/[0.08] to-[rgba(5,9,15,0.4)] p-5 backdrop-blur sm:p-8";

// One numbered block of the form: outlined number + title/hint on the left,
// fields on the right. Stacks on small screens.
export function FormSection({ n, title, hint, last = false, children }) {
  return (
    <div
      className={`grid gap-5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8 ${
        last ? "" : "border-b border-white/[0.08] pb-7"
      }`}
    >
      <div>
        <span className="text-[34px] font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_rgba(110,231,183,0.5)]">
          {n}
        </span>
        <p className="mt-2.5 text-base font-semibold text-white">{title}</p>
        <p className="mt-1 text-[13px] leading-normal text-white/55">{hint}</p>
      </div>
      {children}
    </div>
  );
}
