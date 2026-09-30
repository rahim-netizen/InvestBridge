// Founder-only submission dialog opened from the Pay button on the status
// page. An image and a description are always required; the founder either
// pays an amount through SSLCommerz or submits without paying, in which case
// the recorded amount is zero.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Image as ImageIcon, Receipt, X } from "lucide-react";
import {
  getEntrepreneurTransaction,
  submitEntrepreneurTransaction,
} from "../api/entrepreneur";
import { modalOverlay, modalPanel } from "../lib/motion.jsx";

const STATUS_LABELS = {
  waived: "Submitted without payment",
  pending: "Payment pending",
  validated: "Paid",
  failed: "Payment failed",
  cancelled: "Payment cancelled",
};

const STATUS_STYLES = {
  waived: "border-white/15 bg-white/5 text-white/70",
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  validated: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  failed: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  cancelled: "border-white/15 bg-white/5 text-white/55",
};

// Same client-side downscale the post form uses, so the base64 payload we
// upload to Cloudinary stays small.
function resizeImage(file, maxDim = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file is not a valid image."));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function EntrepreneurSubmitModal({ opp, open, onClose, onSubmitted }) {
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [wantsToPay, setWantsToPay] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    getEntrepreneurTransaction(opp.id)
      .then((data) => setExisting(data.transaction || null))
      .catch(() => setExisting(null));
  }, [open, opp.id]);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setErrors((current) => ({ ...current, image: "" }));
    try {
      setImage(await resizeImage(file));
    } catch (error) {
      setErrors((current) => ({ ...current, image: error.message }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!image) {
      nextErrors.image = "An image is required.";
    }
    if (!description.trim()) {
      nextErrors.description = "A description is required.";
    }
    if (wantsToPay) {
      const value = parseFloat(amount);
      if (!amount || Number.isNaN(value) || value <= 0) {
        nextErrors.amount = "Enter an amount greater than $0.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = await submitEntrepreneurTransaction(opp.id, {
        image,
        description: description.trim(),
        amount: wantsToPay ? parseFloat(amount) : 0,
        pay: wantsToPay,
      });

      if (data.gateway_url) {
        window.location.href = data.gateway_url;
        return;
      }

      setExisting(data.transaction || null);
      onSubmitted?.(data.transaction || null);
      onClose();
    } catch (error) {
      setErrors((current) => ({
        ...current,
        form: error.message || "Could not submit.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const alreadySubmitted = Boolean(existing);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-ink-950/60 px-4 py-10 backdrop-blur-sm"
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="glass-panel-strong holo-card w-full max-w-lg rounded-[2rem] p-6 sm:p-8"
            variants={modalPanel}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600/90 text-white shadow-soft">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">
                    Project submission
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">
                    {opp.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-ink-400 hover:text-ink-700 dark:text-ink-500 dark:hover:text-ink-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {alreadySubmitted ? (
              <div className="mt-6 space-y-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[existing.status] || STATUS_STYLES.waived}`}
                >
                  {STATUS_LABELS[existing.status] || existing.status}
                </span>
                {existing.image ? (
                  <img
                    src={existing.image}
                    alt="Your submission"
                    className="h-48 w-full rounded-2xl object-cover"
                  />
                ) : null}
                <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                  {existing.description}
                </p>
                <div className="rounded-2xl bg-brand-50 p-4 text-center dark:bg-brand-400/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    Amount paid
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                    ${Number(existing.amount || 0).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  This project accepts one submission, and yours is already in.
                </p>
              </div>
            ) : (
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center">
                  <label className="group relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                    <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50 transition group-hover:border-brand-400 group-hover:bg-brand-50 dark:border-ink-600 dark:bg-ink-800 dark:group-hover:border-brand-500 dark:group-hover:bg-brand-900/20">
                      {image ? (
                        <img
                          src={image}
                          alt="Submission preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-ink-400 dark:text-ink-500">
                          <ImageIcon className="h-8 w-8" />
                          <span className="text-xs font-medium">
                            Upload an image (required)
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                  {errors.image && (
                    <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {errors.image}
                    </p>
                  )}
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-ink-700 dark:text-ink-300">
                    Description (required)
                  </span>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe what this submission covers..."
                    className="w-full resize-none rounded-2xl border border-white/20 bg-white/35 px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 backdrop-blur-sm dark:border-white/10 dark:bg-ink-950/35 dark:text-ink-50 dark:placeholder:text-ink-500"
                  />
                  {errors.description && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {errors.description}
                    </p>
                  )}
                </label>

                <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4 dark:border-ink-800 dark:bg-ink-900/40">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                      Pay with SSLCommerz
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={wantsToPay}
                      onClick={() => setWantsToPay((value) => !value)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${wantsToPay ? "bg-brand-500" : "bg-ink-300 dark:bg-ink-700"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${wantsToPay ? "left-[22px]" : "left-0.5"}`}
                      />
                    </button>
                  </div>

                  {wantsToPay ? (
                    <div className="mt-4">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-ink-700 dark:text-ink-300">
                          Amount (USD)
                        </span>
                        <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/35 px-4 py-3 dark:border-white/10 dark:bg-ink-950/35">
                          <span className="text-sm font-semibold text-ink-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={(event) =>
                              setAmount(event.target.value.replace(/[^0-9.]/g, ""))
                            }
                            placeholder="e.g., 250"
                            className="w-full border-none bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50"
                          />
                        </div>
                      </label>
                      {errors.amount && (
                        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                          {errors.amount}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-ink-500 dark:text-ink-400">
                      Submitting without paying records this project with an
                      amount of $0.
                    </p>
                  )}
                </div>

                {errors.form && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.form}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CreditCard className="h-4 w-4" />
                    {submitting
                      ? "Submitting..."
                      : wantsToPay
                        ? "Submit and pay"
                        : "Submit without payment"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-center text-xs text-ink-400 dark:text-ink-500">
                  One submission per project — this can only be sent once.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
