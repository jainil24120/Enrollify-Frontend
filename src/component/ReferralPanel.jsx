import React, { useEffect, useState } from "react";
import { getMyReferralAPI, listReferralEventsAPI } from "../api/referralApi";
import "./ReferralPanel.css";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n || 0);

// Default placeholder so the panel always renders something usable, even
// before the API responds or if the request fails.
const DEFAULT_DATA = {
  code: null,
  shareUrl: null,
  commissionPercent: 20,
  stats: { signups: 0, conversions: 0, earned: 0, paid: 0, pending: 0 },
};

function ReferralPanel() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [warning, setWarning] = useState("");
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setWarning("");

    // Run both fetches independently — a failure in one shouldn't blank the
    // whole panel. listReferralEventsAPI already returns [] on error.
    Promise.allSettled([getMyReferralAPI(), listReferralEventsAPI()]).then(
      ([codeRes, eventsRes]) => {
        if (cancelled) return;
        if (codeRes.status === "fulfilled" && codeRes.value) {
          setData({ ...DEFAULT_DATA, ...codeRes.value });
        } else {
          // Fall back to defaults and surface a soft, non-alarming hint.
          setWarning(
            "Couldn't load your referral code right now. We'll show defaults until the connection recovers."
          );
        }
        setEvents(
          eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value)
            ? eventsRes.value
            : []
        );
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  const copyLink = async () => {
    if (!data?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setWarning("Could not copy. Long-press the link to copy manually.");
    }
  };

  return (
    <div className="ref-panel">
      <div className="ref-header">
        <h2>Refer & Earn</h2>
        <p className="ref-sub">
          Earn <strong>{data?.commissionPercent ?? 20}%</strong> on every paid subscription from
          creators you refer to Enrollify. Lifetime, no caps.
        </p>
      </div>

      {warning && (
        <div className="ref-warning">
          <span>{warning}</span>
          <button className="ref-warning-retry" onClick={() => setRetryTick((t) => t + 1)}>
            Retry
          </button>
        </div>
      )}

      <div className="ref-grid">
        <div className="ref-card ref-share">
          <p className="ref-label">YOUR REFERRAL LINK</p>
          {loading ? (
            <>
              <div className="ref-skeleton ref-skeleton-link" />
              <p className="ref-code-hint" style={{ marginTop: 12 }}>
                <span className="ref-skeleton ref-skeleton-line" style={{ width: "70%" }} />
              </p>
            </>
          ) : data.shareUrl ? (
            <>
              <div className="ref-link-row">
                <code className="ref-link">{data.shareUrl}</code>
                <button className="ref-btn ref-btn-primary" onClick={copyLink}>
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
              <p className="ref-code-hint">
                Code: <code className="ref-code">{data.code}</code> &middot; share via WhatsApp,
                email, or paste anywhere.
              </p>
            </>
          ) : (
            <div className="ref-link-row">
              <code className="ref-link ref-link-placeholder">
                Generating your unique referral link...
              </code>
            </div>
          )}
        </div>

        {[
          { label: "Signups", key: "signups", isMoney: false, accent: false },
          { label: "Conversions", key: "conversions", isMoney: false, accent: false },
          { label: "Pending payout", key: "pending", isMoney: true, accent: true },
          { label: "Lifetime earned", key: "earned", isMoney: true, accent: false },
        ].map((s) => (
          <div key={s.key} className={`ref-stat ${s.accent ? "ref-stat-accent" : ""}`}>
            <p className="ref-stat-label">{s.label}</p>
            {loading ? (
              <div className="ref-skeleton ref-skeleton-block" />
            ) : (
              <p className="ref-stat-value">
                {s.isMoney ? formatINR(data?.stats?.[s.key]) : (data?.stats?.[s.key] ?? 0)}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="ref-events">
        <h3>Recent activity</h3>
        {loading ? (
          <div className="ref-table-wrap" style={{ padding: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="ref-skeleton ref-skeleton-row" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="ref-empty">
            <p>No referrals yet.</p>
            <p className="ref-empty-hint">
              Share your link above. You&apos;ll see new signups and conversions appear here.
            </p>
          </div>
        ) : (
          <div className="ref-table-wrap">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Commission</th>
                  <th>Landed</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e._id}>
                    <td>
                      {e.referredUser
                        ? `${e.referredUser.firstname || ""} ${e.referredUser.lastname || ""}`.trim() ||
                          e.referredUser.email
                        : "Anonymous visitor"}
                    </td>
                    <td>
                      <span className={`ref-badge ref-${e.status}`}>{e.status}</span>
                    </td>
                    <td>{formatINR(e.commissionAmount)}</td>
                    <td>{new Date(e.landedAt || e.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReferralPanel;
