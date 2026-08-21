// Shared fixed background used across the app's main pages (not the
// sign-in / registration / verify-email screens, which have their own
// auth-scene background). Renders the background photo plus a gradient
// overlay tinted to match the photo's navy + amber palette, for text
// readability.
export default function PageBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/homepage-bg.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 25%, rgba(245,166,35,0.18) 0%, rgba(10,10,10,0) 60%), linear-gradient(180deg, rgba(4,9,17,0.92) 0%, rgba(6,12,20,0.55) 45%, rgba(4,9,17,0.92) 100%)",
        }}
      />
    </>
  );
}
