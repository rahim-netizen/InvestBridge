import { useEffect, useState } from "react";
import { apiGoogleSignIn, isGoogleAuthEnabled } from "../api/auth";

// Google's brand mark. Inline so there is no extra network request or icon
// dependency just for one button.
function GoogleMark() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

/**
 * "Continue with Gmail" button, shared by the login and register pages.
 *
 * The button is always shown so the sign-in option is discoverable. When the
 * backend has no Google credentials configured it explains that instead of
 * sending the user to a consent screen that cannot complete.
 */
export default function GoogleAuthButton({ label = "Continue with Gmail" }) {
  const [enabled, setEnabled] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    isGoogleAuthEnabled()
      .then((result) => {
        if (!cancelled) setEnabled(result);
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = () => {
    if (enabled === false) {
      setNotice(
        "Google sign-in is not configured on the server yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the backend .env file.",
      );
      return;
    }
    apiGoogleSignIn();
  };

  return (
    <div className="mt-5">
      <div className="ib-divider">
        <span>or</span>
      </div>

      <button type="button" className="ib-google-btn" onClick={handleClick}>
        <GoogleMark />
        {label}
      </button>

      {notice ? (
        <p className="ib-error-msg mt-3">{notice}</p>
      ) : (
        <p className="ib-hint mt-3 text-center">
          Your name, Gmail address and photo come from your Google account.
        </p>
      )}
    </div>
  );
}
