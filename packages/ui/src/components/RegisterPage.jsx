import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { apiRegister } from "../api/auth";
import "./AuthCard.css";

export default function RegisterPage({ navigate }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [bgImageError, setBgImageError] = useState(false);

  const pupilRefs = useRef([]);
  const submitBtnRef = useRef(null);

  const eyesClosed = passwordFocused && !showPassword;

  // Card 3D tilt + eye tracking, following the pointer anywhere on screen
  useEffect(() => {
    const handleMouseMove = (event) => {
      const xAxis = (window.innerWidth / 2 - event.clientX) / 25;
      const yAxis = (window.innerHeight / 2 - event.clientY) / 25;
      setTilt({ x: xAxis, y: yAxis });

      if (eyesClosed) return;

      pupilRefs.current.forEach((pupil) => {
        if (!pupil) return;
        const rect = pupil.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;
        const angle = Math.atan2(event.clientY - eyeY, event.clientX - eyeX);
        const distance = Math.min(4, Math.hypot(event.clientX - eyeX, event.clientY - eyeY) / 30);
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;
        pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };

    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    window.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [eyesClosed]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRipple = (event) => {
    const button = submitBtnRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ib-ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRegister(form.name, form.email, form.password);
      localStorage.setItem("pendingVerificationEmail", form.email);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/verify-email-pending?email=${encodeURIComponent(form.email)}`);
      }, 1400);
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ib-auth-scene">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,_rgba(255,247,214,0.28),_transparent_30%),radial-gradient(circle_at_18%_80%,_rgba(255,255,255,0.16),_transparent_22%),linear-gradient(180deg,_rgba(15,23,42,0.18),_rgba(15,23,42,0.52))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-95 dark:opacity-85">
        {!bgImageError ? (
          <img
            src="/investBridge.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-[center_34%]"
            onError={() => setBgImageError(true)}
          />
        ) : (
          <div className="h-full w-full bg-ink-950" />
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="absolute right-[-4rem] top-16 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute left-[-5rem] bottom-12 h-72 w-72 rounded-full bg-gold-200/30 blur-3xl" />
      </div>

      <motion.button
        type="button"
        className="ib-back-home"
        onClick={() => navigate("/")}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ x: -3 }}
      >
        ← Back home
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
      <div
        className={`ib-auth-container${eyesClosed ? " hide-password" : ""}${success ? " success" : ""}`}
        style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
      >
        <div className="ib-success-overlay">
          <div className="ib-success-checkmark">
            <Check className="h-10 w-10" strokeWidth={3} />
          </div>
          <h2>Account Created!</h2>
          <p>Redirecting to verify your email...</p>
        </div>

        <div className="ib-avatar-area">
          <div className="ib-face">
            <div className="ib-eye">
              <div className="ib-pupil" ref={(el) => (pupilRefs.current[0] = el)} />
            </div>
            <div className="ib-eye">
              <div className="ib-pupil" ref={(el) => (pupilRefs.current[1] = el)} />
            </div>
          </div>
        </div>

        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="ib-input-group">
            <User className="ib-input-icon h-4 w-4" />
            <input
              type="text"
              name="name"
              placeholder=" "
              autoComplete="off"
              value={form.name}
              onChange={handleChange}
              required
            />
            <label htmlFor="name">Full Name</label>
          </div>

          <div className="ib-input-group">
            <Mail className="ib-input-icon h-4 w-4" />
            <input
              type="email"
              name="email"
              placeholder=" "
              autoComplete="off"
              value={form.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="email">Email Address</label>
          </div>

          <div className="ib-input-group">
            <Lock className="ib-input-icon h-4 w-4" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder=" "
              value={form.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              minLength={8}
              required
            />
            <label htmlFor="password">Password</label>
            <button
              type="button"
              className="ib-toggle-password"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <p className="ib-hint">Use at least 8 characters.</p>

          <button
            ref={submitBtnRef}
            type="submit"
            className="ib-submit-btn"
            disabled={loading}
            onClick={handleRipple}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {error && <p className="ib-error-msg">{error}</p>}

        <div className="ib-footer-links">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")}>
            Sign in
          </button>
        </div>
      </div>
      </motion.div>
    </section>
  );
}
