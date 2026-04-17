import React, { useState, useEffect } from "react";
import { createTicketAPI, getMyTicketsAPI, getAllTicketsAPI, updateTicketAPI } from "../api/supportApi";
import "./SupportPage.css";

const TICKET_TYPES = [
  { value: "bug", label: "Bug Report", desc: "Something is broken or not working as expected" },
  { value: "feature_request", label: "Feature Request", desc: "Suggest a new feature or improvement" },
  { value: "payment_issue", label: "Payment Issue", desc: "Problem with payments, refunds, or billing" },
  { value: "account_issue", label: "Account Issue", desc: "Login, profile, or subscription problems" },
  { value: "general", label: "General Inquiry", desc: "Questions about the platform" },
  { value: "other", label: "Other", desc: "Anything else" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "#9ca3af" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#f97316" },
  { value: "critical", label: "Critical", color: "#ef4444" },
];

const STATUS_COLORS = { open: "#3b82f6", in_progress: "#f59e0b", resolved: "#10b981", closed: "#9ca3af" };

function SupportPage({ isAdmin = false }) {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    type: "bug",
    priority: "medium",
    subject: "",
    description: "",
    screenshot: "",
  });

  // Admin response
  const [adminNote, setAdminNote] = useState("");
  const [adminStatus, setAdminStatus] = useState("");

  useEffect(() => {
    loadTickets();
  }, [isAdmin]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = isAdmin ? await getAllTicketsAPI() : await getMyTicketsAPI();
      setTickets(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      setTickets([]);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitLoading(true);
    try {
      await createTicketAPI(form);
      setForm({ type: "bug", priority: "medium", subject: "", description: "", screenshot: "" });
      setShowForm(false);
      setSuccessMsg("Ticket submitted successfully. You will receive a confirmation email.");
      setTimeout(() => setSuccessMsg(""), 5000);
      loadTickets();
    } catch (e) {
      alert(e.message);
    }
    setSubmitLoading(false);
  };

  const handleAdminUpdate = async (ticketId) => {
    try {
      await updateTicketAPI(ticketId, { status: adminStatus || undefined, adminNote: adminNote || undefined });
      setSelectedTicket(null);
      setAdminNote("");
      setAdminStatus("");
      loadTickets();
    } catch (e) {
      alert(e.message);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="sp-container">

      {/* Header */}
      <div className="sp-header">
        <div>
          <h2 className="sp-title">{isAdmin ? "Support Tickets" : "Help & Support"}</h2>
          <p className="sp-subtitle">{isAdmin ? "Manage all client and user support requests" : "Report an issue or request a feature. We typically respond within 24 hours."}</p>
        </div>
        {!isAdmin && (
          <button className="sp-btn sp-btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "New Ticket"}
          </button>
        )}
      </div>

      {successMsg && <div className="sp-success">{successMsg}</div>}

      {/* New Ticket Form */}
      {showForm && !isAdmin && (
        <div className="sp-form-card">
          <h3 className="sp-form-title">Submit a Ticket</h3>

          <div className="sp-form-group">
            <label>Issue Type</label>
            <div className="sp-type-grid">
              {TICKET_TYPES.map((t) => (
                <div key={t.value} className={`sp-type-card ${form.type === t.value ? "active" : ""}`} onClick={() => setForm({ ...form, type: t.value })}>
                  <span className="sp-type-label">{t.label}</span>
                  <span className="sp-type-desc">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sp-form-group">
            <label>Priority</label>
            <div className="sp-priority-row">
              {PRIORITIES.map((p) => (
                <button key={p.value} type="button" className={`sp-priority-btn ${form.priority === p.value ? "active" : ""}`}
                  style={{ "--dot-color": p.color }} onClick={() => setForm({ ...form, priority: p.value })}>
                  <span className="sp-priority-dot"></span> {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sp-form-group">
            <label>Subject</label>
            <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief summary of the issue" className="sp-input" />
          </div>

          <div className="sp-form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail. Include steps to reproduce if it's a bug." rows={5} className="sp-input sp-textarea" />
          </div>

          <div className="sp-form-group">
            <label>Screenshot URL (optional)</label>
            <input type="text" value={form.screenshot} onChange={(e) => setForm({ ...form, screenshot: e.target.value })} placeholder="Paste a link to a screenshot if applicable" className="sp-input" />
          </div>

          <button className="sp-btn sp-btn-primary sp-btn-submit" onClick={handleSubmit} disabled={submitLoading || !form.subject.trim() || !form.description.trim()}>
            {submitLoading ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="sp-loading">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="sp-empty">
          <div className="sp-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <p>{isAdmin ? "No support tickets yet." : "No tickets submitted yet. Click 'New Ticket' to report an issue."}</p>
        </div>
      ) : (
        <div className="sp-tickets-list">
          {tickets.map((t) => (
            <div key={t._id} className={`sp-ticket-row ${selectedTicket?._id === t._id ? "expanded" : ""}`} onClick={() => setSelectedTicket(selectedTicket?._id === t._id ? null : t)}>
              <div className="sp-ticket-main">
                <div className="sp-ticket-left">
                  <span className="sp-ticket-status-dot" style={{ background: STATUS_COLORS[t.status] || "#9ca3af" }}></span>
                  <div>
                    <div className="sp-ticket-subject">{t.subject}</div>
                    <div className="sp-ticket-meta">
                      <span className="sp-ticket-id">#{t._id?.toString().slice(-6).toUpperCase()}</span>
                      <span className="sp-ticket-type">{t.type?.replace("_", " ")}</span>
                      {isAdmin && <span className="sp-ticket-from">{t.name || t.user?.firstname || "Unknown"} ({t.role})</span>}
                      <span className="sp-ticket-date">{formatDate(t.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="sp-ticket-right">
                  <span className="sp-badge" style={{ background: PRIORITIES.find(p => p.value === t.priority)?.color + "18", color: PRIORITIES.find(p => p.value === t.priority)?.color }}>{t.priority}</span>
                  <span className="sp-badge" style={{ background: STATUS_COLORS[t.status] + "18", color: STATUS_COLORS[t.status] }}>{t.status?.replace("_", " ")}</span>
                </div>
              </div>

              {selectedTicket?._id === t._id && (
                <div className="sp-ticket-detail" onClick={(e) => e.stopPropagation()}>
                  <div className="sp-detail-section">
                    <h4>Description</h4>
                    <p className="sp-detail-desc">{t.description}</p>
                    {t.screenshot && <a href={t.screenshot} target="_blank" rel="noreferrer" className="sp-screenshot-link">View Screenshot</a>}
                  </div>

                  {t.adminNote && (
                    <div className="sp-detail-section sp-admin-response">
                      <h4>Admin Response</h4>
                      <p>{t.adminNote}</p>
                    </div>
                  )}

                  {t.resolvedAt && (
                    <p className="sp-resolved-at">Resolved on {formatDate(t.resolvedAt)}</p>
                  )}

                  {isAdmin && (
                    <div className="sp-admin-actions">
                      <div className="sp-form-group">
                        <label>Update Status</label>
                        <select value={adminStatus} onChange={(e) => setAdminStatus(e.target.value)} className="sp-input">
                          <option value="">-- No change --</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div className="sp-form-group">
                        <label>Response to User</label>
                        <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Write a response (user will be notified via email)" rows={3} className="sp-input sp-textarea" />
                      </div>
                      <button className="sp-btn sp-btn-primary" onClick={() => handleAdminUpdate(t._id)}>Send Update</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SupportPage;
