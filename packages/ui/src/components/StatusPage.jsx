import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Status from "./Status.jsx";
import { getConnectedOpportunities, getConnectionsForOpportunity } from "../api/connected.js";
import {
  getMyOpportunities,
  getMyTransactions,
  getOpportunityInvestors,
} from "../api/opportunities.js";

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("investbridgeSessionUser") || "null");
  } catch {
    return null;
  }
}

export default function StatusPage({ navigate }) {
  const { id } = useParams();
  const location = useLocation();
  const [user] = useState(() => getStoredUser());
  const [payResult, setPayResult] = useState(null);
  const [opp, setOpp] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // A post is reached either as a founder (one of their own posts) or as an
    // investor (one of the posts they saved), so resolve both sources.
    Promise.all([
      getMyOpportunities().catch(() => ({ opportunities: [] })),
      getConnectedOpportunities().catch(() => ({ connections: [] })),
    ])
      .then(([own, connected]) => {
        if (cancelled) return;

        const ownMatch = (own.opportunities || []).find(
          (o) => String(o.id) === String(id),
        );
        const savedMatch = (connected.connections || []).find(
          (c) => c.opportunity && String(c.opportunity.id) === String(id),
        );

        if (!ownMatch && !savedMatch) {
          setNotFound(true);
          return;
        }

        const o = ownMatch || savedMatch.opportunity;
        const mine = Boolean(ownMatch);

        // The entrepreneur who posted this round, so the investor can see who
        // they are funding. Falls back to the post's own contact fields.
        const posterUser = o.user || null;
        const posterProfile = posterUser?.profile || null;
        const posterName =
          posterProfile?.full_name ||
          posterUser?.name ||
          posterUser?.email ||
          "Unknown";

        setIsOwner(mine);
        setOpp({
          id: o.id,
          title: o.title,
          company: o.company,
          sector: o.sector,
          location: o.location || "TBD",
          goal: o.funding_goal || "$0",
          blurb: o.description || "",
          image: o.image || null,
          timeline: o.timeline || "TBD",
          postedBy: posterUser?.email || null,
          postedByName: posterName,
          status: o.status || "Active",
          investedAmount: Number(o.invested_amount) || 0,
          myInvestment: Number(savedMatch?.investment_amount) || 0,
          payoutStatus: savedMatch?.status || "NA",
          // Escrow figures for this investor's saved post.
          myPayout: Number(savedMatch?.payout_amount) || 0,
          myShare: Number(savedMatch?.investor_share) || 0,
          paidAt: savedMatch?.paid_at || null,
          // Present only when the founder paid nothing into escrow.
          submission: savedMatch?.submission || null,
          // The entrepreneur's own record for this post.
          entrepreneur: {
            name: posterName,
            email: posterUser?.email || null,
            company: posterProfile?.company_name || o.company || null,
            position: posterProfile?.position || null,
            industry: posterProfile?.industry || o.sector || null,
            website: posterProfile?.website || null,
            mission: posterProfile?.mission || null,
            avatar: posterProfile?.profile_image || null,
          },
        });

        if (mine) {
          getOpportunityInvestors(o.id)
            .then((result) => {
              if (!cancelled) setInvestors(result.investors || []);
            })
            .catch(() => {
              if (!cancelled) setInvestors([]);
            });

          getConnectionsForOpportunity(o.id)
            .then((result) => {
              if (!cancelled) setConnections(result.connections || []);
            })
            .catch(() => {
              if (!cancelled) setConnections([]);
            });
        } else {
          // The investor's own payment records for this saved post.
          getMyTransactions(o.id)
            .then((result) => {
              if (!cancelled) setTransactions(result.transactions || []);
            })
            .catch(() => {
              if (!cancelled) setTransactions([]);
            });
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // The gateway returns the founder here with ?pay=success|fail|cancel.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payStatus = params.get("pay");
    if (!payStatus) return;
    setPayResult({ status: payStatus, tranId: params.get("tran_id") });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.search, location.pathname, navigate]);

  if (!user) {
    return (
      <section className="dark relative min-h-screen px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/40 bg-white/70 p-8 shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">
            No active session
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">
            Please sign in first
          </h1>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-primary mt-6"
          >
            Go to sign in
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="dark relative min-h-screen px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/40 bg-white/70 p-8 text-center shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
          <p className="text-ink-600 dark:text-ink-300">
            Loading project status...
          </p>
        </div>
      </section>
    );
  }

  if (notFound || !opp) {
    return (
      <section className="dark relative min-h-screen px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/40 bg-white/70 p-8 shadow-lift backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/70 dark:text-ink-50">
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
            Project not found
          </h1>
          <p className="mt-3 text-ink-600 dark:text-ink-300">
            This project is not one of your posts or saved opportunities, or it
            may have been removed.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-primary mt-6"
          >
            Back to dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <Status
      opp={opp}
      isOwner={isOwner}
      transactions={transactions}
      investors={investors}
      connections={connections}
      payResult={payResult}
      onClose={() => navigate("/dashboard")}
      navigate={navigate}
    />
  );
}