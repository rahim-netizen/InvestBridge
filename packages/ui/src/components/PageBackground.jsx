// Deeper "emerald aurora" backdrop — a near-black base with a strong emerald
// aurora rising from the top-left and bottom, lifted by a faint gold glow
// top-right. Shared by the product pages (deals, dashboard, opportunities,
// connect, support, admin) via `<PageBackground image={false} gradient={AURORA_BG} />`
// so they all read from one value and stay easy to tune in one place.
export const AURORA_BG =
  "radial-gradient(52% 44% at 12% 4%, rgba(16,185,129,0.34) 0%, rgba(16,185,129,0) 60%)," +
  "radial-gradient(44% 38% at 93% 8%, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0) 56%)," +
  "radial-gradient(70% 60% at 50% 112%, rgba(16,185,129,0.30) 0%, rgba(6,95,70,0) 66%)," +
  "linear-gradient(158deg, #05090f 0%, #081512 34%, #0a1f19 68%, #04231b 100%)";

// Shared fixed background used across the app's main pages (not the
// sign-in / registration / verify-email screens, which have their own
// auth-scene background). By default renders the background photo plus a
// gradient overlay tinted to match the photo's navy + amber palette, for
// text readability. Pass `image={false}` to skip the photo and use a
// premium dark mesh gradient instead (deep ink navy fading into the
// brand emerald, lifted by soft emerald + gold glows). Pass `src` to swap
// in a different photo (defaults to `/homepage-bg.jpg`), e.g. the homepage's
// dark luxury abstract background.
export default function PageBackground({
  image = true,
  src = "/homepage-bg.jpg",
  gradient,
}) {
  return (
    <>
      {image && (
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${src}')`,
            filter: "brightness(1.65) contrast(1.1) saturate(1.15)",
          }}
        />
      )}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10"
        style={
          image
            ? {
                backgroundImage:
                  "radial-gradient(55% 45% at 50% 15%, rgba(245,166,35,0.16) 0%, rgba(10,10,10,0) 65%), linear-gradient(180deg, rgba(4,9,17,0.4) 0%, rgba(4,9,17,0) 25%, rgba(4,9,17,0) 65%, rgba(4,9,17,0.5) 100%)",
              }
            : {
                backgroundImage:
                  gradient ||
                  "radial-gradient(45% 38% at 12% 8%, rgba(16,185,129,0.24) 0%, rgba(16,185,129,0) 60%), radial-gradient(40% 35% at 90% 12%, rgba(245,158,11,0.14) 0%, rgba(245,158,11,0) 60%), radial-gradient(55% 45% at 50% 100%, rgba(6,95,70,0.35) 0%, rgba(6,95,70,0) 65%), linear-gradient(160deg, #0b1119 0%, #10192a 30%, #16332a 65%, #022c22 100%)",
              }
        }
      />
    </>
  );
}
