import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import PageBackground from "./PageBackground.jsx";
import { createComplaint, getComplaints } from "../api/support";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getComplaints().then((data) => setComplaints(data.complaints || [])).catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");
    try {
      const data = await createComplaint(subject, message);
      setComplaints((items) => [data.complaint, ...items]);
      setSubject("");
      setMessage("");
      setStatus("Your complaint was sent.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <PageBackground />
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        <div className="glass-panel-strong rounded-[2rem] p-6">
          <h1 className="font-display text-3xl font-bold text-white">Report a problem</h1>
          <p className="mt-2 text-sm text-white/75">Send a complaint and we will review it.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input required value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" className="w-full rounded-2xl border border-white/20 bg-white/70 px-4 py-3 text-sm outline-none" />
            <textarea required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Explain the problem" rows="6" className="w-full rounded-2xl border border-white/20 bg-white/70 px-4 py-3 text-sm outline-none" />
            <button type="submit" className="btn-primary"><Send className="h-4 w-4" /> Send complaint</button>
          </form>
          {status && <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{status}</p>}
          {error && <p className="mt-4 flex items-center gap-2 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</p>}
        </div>
        <div className="glass-panel-strong rounded-[2rem] p-6">
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">My complaints</h2>
          <div className="mt-5 space-y-3">
            {complaints.length === 0 ? <p className="text-sm text-ink-500">No complaints yet.</p> : complaints.map((complaint) => (
              <div key={complaint.id} className="rounded-2xl border border-white/20 bg-white/60 p-4">
                <div className="flex items-center justify-between gap-3"><strong className="text-sm">{complaint.subject}</strong><span className="text-xs uppercase text-brand-700">{complaint.status}</span></div>
                <p className="mt-2 text-sm text-ink-600">{complaint.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
