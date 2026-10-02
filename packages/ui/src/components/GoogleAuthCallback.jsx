import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { apiGoogleHandoff } from "../api/auth";

// Where the backend sends the browser after Google answers. It parks a
// one-time code here, which is swapped for a Sanctum token so the real token
// never travels in a URL.
export default function GoogleAuthCallback({ navigate }) {
  const location = useLocation();
  const [error, setError] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const code = params.get("code");

    const fail = (message) => {
      setError(message);
      setTimeout(() => navigate("/login"), 3000);
    };

    if (status !== "ok") {
      const reasons = {
        error: "Google sign-in was cancelled or denied.",
        state: "That sign-in attempt could not be verified. Please try again.",
        code: "Google did not return an authorization code. Please try again.",
        gateway: "Could not reach Google. Please try again.",
        account: "Google did not share a usable email address.",
        domain: "Only @gmail.com accounts are allowed on InvestBridge.",
      };
      fail(reasons[status] || "Google sign-in failed. Please try again.");
      return;
    }

    if (!code) {
      fail("Google sign-in was incomplete. Please try again.");
      return;
    }

    apiGoogleHandoff(code)
      .then((data) => {
        const destination =
          data.user?.role === "admin" ? "/admin" : "/profile";
        navigate(destination, { replace: true });
      })
      .catch((err) =>
        fail(err.message || "Google sign-in failed. Please try again."),
      );
  }, [location.search, navigate]);

  if (error) {
    return (
      <section className="dark relative min-h-screen px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-white/40 bg-white/70 p-10 text-center shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
          <AlertTriangle className="h-10 w-10 text-rose-500" />
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
            Sign-in failed
          </h1>
          <p className="text-sm text-ink-600 dark:text-ink-300">{error}</p>
          <p className="text-xs text-ink-500">Returning to sign in...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dark relative min-h-screen px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-white/40 bg-white/70 p-10 text-center shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
          Signing you in
        </h1>
        <p className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
          <Check className="h-4 w-4 text-emerald-500" />
          Finishing up with Google...
        </p>
      </div>
    </section>
  );
}