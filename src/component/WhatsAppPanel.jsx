import React, { useState, useEffect, useCallback } from "react";
import { connectWhatsAppAPI, disconnectWhatsAppAPI, getWhatsAppStatusAPI, broadcastWhatsAppAPI, scheduleWhatsAppAPI, getWhatsAppHistoryAPI, getAllWhatsAppSessionsAPI } from "../api/whatsappApi";
import { getClientWebinarStatsAPI } from "../api/clientApi";
import { API_BASE } from "../api/config.js";
import io from "socket.io-client";
import "./WhatsAppPanel.css";

function WhatsAppPanel({ isAdmin = false }) {
  const [adminSessions, setAdminSessions] = useState([]);
  const [status, setStatus] = useState("disconnected"); // disconnected | qr_pending | connected
  const [phone, setPhone] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  // Broadcast state
  const [webinars, setWebinars] = useState([]);
  const [selectedWebinar, setSelectedWebinar] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Schedule state
  const [scheduleMsg, setScheduleMsg] = useState("");
  const [scheduleWebinar, setScheduleWebinar] = useState("");
  const [schedulePreset, setSchedulePreset] = useState("1_day_before");
  const [scheduleCustomTime, setScheduleCustomTime] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduleResult, setScheduleResult] = useState(null);

  // History state
  const [historyWebinar, setHistoryWebinar] = useState("");
  const [history, setHistory] = useState([]);

  // Fetch initial status and webinars
  useEffect(() => {
    if (isAdmin) {
      // Admin: show all client sessions
      getAllWhatsAppSessionsAPI().then((data) => {
        setAdminSessions(Array.isArray(data) ? data : []);
      }).catch(() => {});
    } else {
      // Client: show own status
      getWhatsAppStatusAPI().then((data) => {
        setStatus(data.status || "disconnected");
        setPhone(data.phone || "");
      }).catch(() => {});

      getClientWebinarStatsAPI().then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setWebinars(list);
      }).catch(() => {});
    }
  }, [isAdmin]);

  // Socket.io for real-time QR and status updates
  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("userData") || "{}")?.id
      || JSON.parse(localStorage.getItem("userData") || "{}")?._id;
    if (!userId) return;

    const socket = io(API_BASE, { transports: ["polling", "websocket"], reconnectionAttempts: 5, timeout: 10000 });
    socket.on("connect_error", () => {}); // Suppress connection warnings
    socket.emit("join", userId);

    socket.on("whatsapp-qr", ({ qrImage: qr }) => {
      setQrImage(qr);
      setStatus("qr_pending");
      setConnecting(false);
    });

    socket.on("whatsapp-ready", ({ phone: p }) => {
      setStatus("connected");
      setPhone(p);
      setQrImage("");
      setConnecting(false);
    });

    socket.on("whatsapp-disconnected", () => {
      setStatus("disconnected");
      setPhone("");
      setQrImage("");
    });

    return () => socket.disconnect();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError("");
    setQrImage("");
    // Optimistic: flip status so the loading skeleton renders immediately
    // instead of waiting for the server response.
    setStatus("qr_pending");
    try {
      await connectWhatsAppAPI();
    } catch (err) {
      setError(err.message);
      setConnecting(false);
      setStatus("disconnected");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWhatsAppAPI();
      setStatus("disconnected");
      setPhone("");
      setQrImage("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBroadcast = async () => {
    if (!selectedWebinar || !broadcastMsg.trim()) return;
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const result = await broadcastWhatsAppAPI(selectedWebinar, broadcastMsg);
      setBroadcastResult(result);
    } catch (err) {
      setBroadcastResult({ error: err.message });
    }
    setBroadcasting(false);
  };

  const handleSchedule = async () => {
    if (!scheduleWebinar || !scheduleMsg.trim()) return;
    setScheduling(true);
    setScheduleResult(null);
    try {
      const result = await scheduleWhatsAppAPI(
        scheduleWebinar,
        scheduleMsg,
        schedulePreset === "custom" ? scheduleCustomTime : null,
        schedulePreset !== "custom" ? schedulePreset : null
      );
      setScheduleResult(result);
    } catch (err) {
      setScheduleResult({ error: err.message });
    }
    setScheduling(false);
  };

  const loadHistory = useCallback(async (webinarId) => {
    if (!webinarId) { setHistory([]); return; }
    try {
      const data = await getWhatsAppHistoryAPI(webinarId);
      setHistory(Array.isArray(data) ? data : []);
    } catch { setHistory([]); }
  }, []);

  useEffect(() => {
    if (historyWebinar) loadHistory(historyWebinar);
  }, [historyWebinar, loadHistory]);

  const insertVariable = (setter, variable) => {
    setter((prev) => prev + `{${variable}}`);
  };

  // Admin view — show all client sessions
  if (isAdmin) {
    return (
      <div className="wa-panel">
        <div className="wa-section">
          <h2 className="wa-section-title"><span className="wa-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span> WhatsApp Sessions (All Clients)</h2>
          <p className="wa-section-desc">View all client WhatsApp connections. Clients manage their own sessions from their dashboard.</p>
          {adminSessions.length === 0 ? (
            <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px" }}>No clients have connected WhatsApp yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              {adminSessions.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", background: "#f8f9fb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                  <div className={`wa-status-dot ${s.status}`}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a35" }}>
                      {s.clientId?.Organization_Name || s.userId?.firstname || "Unknown Client"}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                      {s.userId?.email || ""} {s.phone ? `• +${s.phone}` : ""}
                    </div>
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: s.status === "connected" ? "#25D366" : "#9ca3af", textTransform: "capitalize" }}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wa-panel">

      {/* ===== CONNECTION STATUS ===== */}
      <div className="wa-section wa-status-section">
        <h2 className="wa-section-title">
          <span className="wa-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span> WhatsApp Connection
        </h2>

        {/*
          Effective status: treat a qr_pending DB record without a live QR
          AND without an active connect attempt as "disconnected" in the UI.
          Otherwise a stale qr_pending record from a previous server run shows
          "Waiting for QR scan..." with no button — the user is stuck.
        */}
        {(() => {
          const effectiveStatus =
            status === "qr_pending" && !qrImage && !connecting ? "disconnected" : status;
          return (
        <div className="wa-status-card">
          <div className="wa-status-row">
            <div className={`wa-status-dot ${effectiveStatus}`}></div>
            <div className="wa-status-info">
              <span className="wa-status-label">
                {effectiveStatus === "connected"
                  ? "Connected"
                  : effectiveStatus === "qr_pending"
                  ? (qrImage ? "Scan QR to connect" : "Generating QR code...")
                  : "Disconnected"}
              </span>
              {phone && <span className="wa-phone">+{phone}</span>}
            </div>
            <div className="wa-status-actions">
              {effectiveStatus === "disconnected" && (
                <button className="wa-btn wa-btn-connect" onClick={handleConnect} disabled={connecting}>
                  {connecting ? "Initializing..." : "Connect WhatsApp"}
                </button>
              )}
              {effectiveStatus === "connected" && (
                <button className="wa-btn wa-btn-disconnect" onClick={handleDisconnect}>Disconnect</button>
              )}
            </div>
          </div>

          {/* QR Code Display */}
          {effectiveStatus === "qr_pending" && qrImage && (
            <div className="wa-qr-container">
              <p className="wa-qr-instruction">Open WhatsApp on your phone &gt; Settings &gt; Linked Devices &gt; Link a Device</p>
              <div className="wa-qr-wrapper">
                <img src={qrImage} alt="Scan QR Code" className="wa-qr-image" />
              </div>
              <p className="wa-qr-note">QR code refreshes automatically. Keep this page open.</p>
            </div>
          )}

          {effectiveStatus === "qr_pending" && !qrImage && connecting && (
            <div className="wa-qr-container">
              <p className="wa-qr-instruction">Booting WhatsApp Web... QR appears in 5-15 seconds.</p>
              <div className="wa-qr-skeleton" aria-hidden />
            </div>
          )}

          {error && <div className="wa-error">{error}</div>}
        </div>
          );
        })()}
      </div>

      {/* Only show features when connected */}
      {status === "connected" && (
        <>
          {/* ===== BROADCAST ===== */}
          <div className="wa-section">
            <h2 className="wa-section-title">
              <span className="wa-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></span> Broadcast Message
            </h2>
            <p className="wa-section-desc">Send a WhatsApp message to all registrants of a webinar.</p>

            <div className="wa-form-group">
              <label>Select Webinar</label>
              <select value={selectedWebinar} onChange={(e) => setSelectedWebinar(e.target.value)}>
                <option value="">-- Choose webinar --</option>
                {webinars.map((w) => (
                  <option key={w._id || w.webinarId} value={w._id || w.webinarId}>
                    {w.title} ({w.enrollments || 0} registrants)
                  </option>
                ))}
              </select>
            </div>

            <div className="wa-form-group">
              <label>Message</label>
              <div className="wa-variable-btns">
                <button type="button" onClick={() => insertVariable(setBroadcastMsg, "name")}>{"{name}"}</button>
                <button type="button" onClick={() => insertVariable(setBroadcastMsg, "webinar_title")}>{"{webinar_title}"}</button>
                <button type="button" onClick={() => insertVariable(setBroadcastMsg, "date")}>{"{date}"}</button>
              </div>
              <textarea
                rows={4}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder={"Hi {name}! Reminder about {webinar_title} on {date}. See you there!"}
              />
            </div>

            <button
              className="wa-btn wa-btn-send"
              onClick={handleBroadcast}
              disabled={broadcasting || !selectedWebinar || !broadcastMsg.trim()}
            >
              {broadcasting ? "Sending..." : "Send Broadcast"}
            </button>

            {broadcastResult && (
              <div className={`wa-result ${broadcastResult.error || broadcastResult.failed > 0 ? "wa-result-error" : "wa-result-success"}`}>
                {broadcastResult.error
                  ? broadcastResult.error
                  : `Sent: ${broadcastResult.sent} | Failed: ${broadcastResult.failed} | Total: ${broadcastResult.total}`}
                {broadcastResult.errors && broadcastResult.errors.length > 0 && (
                  <div style={{ marginTop: "8px", fontSize: "12px" }}>
                    {broadcastResult.errors.map((e, i) => (
                      <div key={i}>{e.phone}: {e.error}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== SCHEDULE ===== */}
          <div className="wa-section">
            <h2 className="wa-section-title">
              <span className="wa-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span> Schedule Message
            </h2>
            <p className="wa-section-desc">Schedule WhatsApp messages to be sent before your webinar.</p>

            <div className="wa-form-group">
              <label>Select Webinar</label>
              <select value={scheduleWebinar} onChange={(e) => setScheduleWebinar(e.target.value)}>
                <option value="">-- Choose webinar --</option>
                {webinars.map((w) => (
                  <option key={w._id || w.webinarId} value={w._id || w.webinarId}>
                    {w.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="wa-form-group">
              <label>When to send</label>
              <div className="wa-preset-btns">
                {[
                  { value: "1_day_before", label: "1 Day Before" },
                  { value: "1_hour_before", label: "1 Hour Before" },
                  { value: "15_min_before", label: "15 Min Before" },
                  { value: "custom", label: "Custom Time" },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className={`wa-preset-btn ${schedulePreset === p.value ? "active" : ""}`}
                    onClick={() => setSchedulePreset(p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {schedulePreset === "custom" && (
                <input
                  type="datetime-local"
                  value={scheduleCustomTime}
                  onChange={(e) => setScheduleCustomTime(e.target.value)}
                  style={{ marginTop: "8px" }}
                />
              )}
            </div>

            <div className="wa-form-group">
              <label>Message</label>
              <div className="wa-variable-btns">
                <button type="button" onClick={() => insertVariable(setScheduleMsg, "name")}>{"{name}"}</button>
                <button type="button" onClick={() => insertVariable(setScheduleMsg, "webinar_title")}>{"{webinar_title}"}</button>
                <button type="button" onClick={() => insertVariable(setScheduleMsg, "date")}>{"{date}"}</button>
              </div>
              <textarea
                rows={4}
                value={scheduleMsg}
                onChange={(e) => setScheduleMsg(e.target.value)}
                placeholder={"Hey {name}! {webinar_title} starts soon on {date}. Don't miss it!"}
              />
            </div>

            <button
              className="wa-btn wa-btn-schedule"
              onClick={handleSchedule}
              disabled={scheduling || !scheduleWebinar || !scheduleMsg.trim()}
            >
              {scheduling ? "Scheduling..." : "Schedule Messages"}
            </button>

            {scheduleResult && (
              <div className={`wa-result ${scheduleResult.error ? "wa-result-error" : "wa-result-success"}`}>
                {scheduleResult.error
                  ? scheduleResult.error
                  : `${scheduleResult.count} messages scheduled for ${new Date(scheduleResult.scheduledFor).toLocaleString()}`}
              </div>
            )}
          </div>

          {/* ===== MESSAGE HISTORY ===== */}
          <div className="wa-section">
            <h2 className="wa-section-title">
              <span className="wa-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span> Message History
            </h2>

            <div className="wa-form-group">
              <select value={historyWebinar} onChange={(e) => setHistoryWebinar(e.target.value)}>
                <option value="">-- Select webinar to view history --</option>
                {webinars.map((w) => (
                  <option key={w._id || w.webinarId} value={w._id || w.webinarId}>{w.title}</option>
                ))}
              </select>
            </div>

            {history.length > 0 && (
              <div className="wa-history-table-wrap">
                <table className="wa-history-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Recipients</th>
                      <th>Status</th>
                      <th>Scheduled For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={i}>
                        <td><span className={`wa-type-badge wa-type-${h.type}`}>{h.type === "broadcast" ? "Broadcast" : h.type === "scheduled_custom" ? "Scheduled" : h.type}</span></td>
                        <td className="wa-msg-preview">{h.body?.substring(0, 80)}{h.body?.length > 80 ? "..." : ""}</td>
                        <td>{h.count}</td>
                        <td>
                          <span className={`wa-status-badge wa-status-${h.sentCount === h.count ? "sent" : h.failedCount > 0 ? "partial" : "pending"}`}>
                            {h.sentCount === h.count ? "Sent" : h.sentCount > 0 ? `${h.sentCount}/${h.count}` : "Pending"}
                          </span>
                        </td>
                        <td>{h.scheduledFor ? new Date(h.scheduledFor).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {historyWebinar && history.length === 0 && (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: "24px" }}>No WhatsApp messages found for this webinar.</p>
            )}
          </div>
        </>
      )}

      {/* Disconnected hint */}
      {status === "disconnected" && !connecting && (
        <div className="wa-section wa-hint-section">
          <div className="wa-hint-card">
            <h3>What you can do with WhatsApp Automation</h3>
            <ul>
              <li><strong>Auto Seat Confirmation</strong> — When someone registers, they get a WhatsApp confirmation instantly</li>
              <li><strong>Broadcast</strong> — Send a custom message to all registrants of any webinar</li>
              <li><strong>Scheduled Reminders</strong> — Auto-send reminders 1 day, 1 hour, or 15 min before your webinar</li>
            </ul>
            <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "12px" }}>Connect your WhatsApp to get started. Your personal messages stay private — only messages you send through this panel are automated.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatsAppPanel;
