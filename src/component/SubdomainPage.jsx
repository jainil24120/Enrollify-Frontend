import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Users, ArrowRight } from "lucide-react";
import { API_BASE } from "../api/config.js";
import "./TemplatePage.css";

function SubdomainPage({ subdomain }) {
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/clientprofile/by-subdomain/${subdomain}`);
        if (res.ok) {
          const data = await res.json();
          setClientData(data);

          // If client has only one webinar, redirect directly to it
          if (data.webinars && data.webinars.length === 1 && data.webinars[0].slug) {
            navigate(`/w/${data.webinars[0].slug}`, { replace: true });
            return;
          }
        } else {
          setError("Page not found");
        }
      } catch (err) {
        setError("Failed to load");
      }
      setLoading(false);
    };
    fetchClient();
  }, [subdomain, navigate]);

  if (loading) {
    return (
      <div className="v2-template-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ color: "white", fontSize: "20px" }}>Loading...</div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="v2-template-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <h1 style={{ fontSize: "64px", marginBottom: "16px" }}>404</h1>
          <p style={{ color: "#94a3b8" }}>{error || "Page not found"}</p>
        </div>
      </div>
    );
  }

  const { client, webinars = [] } = clientData;

  return (
    <div className="v2-template-wrapper">
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 20px" }}>

        {/* Client Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1 style={{ fontSize: "36px", color: "white", marginBottom: "8px" }}>{client.name}</h1>
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>Upcoming Webinars & Workshops</p>
        </div>

        {/* Webinar Cards */}
        {webinars.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
            <p style={{ fontSize: "18px" }}>No upcoming webinars at the moment.</p>
            <p>Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
            {webinars.map((webinar) => (
              <div
                key={webinar._id}
                onClick={() => webinar.slug && navigate(`/w/${webinar.slug}`)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(0,198,255,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                {/* Banner */}
                <div style={{
                  height: "180px",
                  background: webinar.bannerImage ? `url(${webinar.bannerImage}) center/cover` : "linear-gradient(135deg, #0f172a, #1e3a5f)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {!webinar.bannerImage && (
                    <span style={{ fontSize: "24px", fontWeight: 700, color: "#6574e9", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {(webinar.categories?.[0] || webinar.title || "W").substring(0, 2)}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                    {(webinar.categories || []).slice(0, 2).map((cat, i) => (
                      <span key={i} style={{ padding: "4px 10px", background: "rgba(0,198,255,0.1)", color: "#00c6ff", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>{cat}</span>
                    ))}
                    <span style={{ padding: "4px 10px", background: webinar.price > 0 ? "rgba(168,85,247,0.15)" : "rgba(16,185,129,0.15)", color: webinar.price > 0 ? "#a855f7" : "#10b981", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                      {webinar.price > 0 ? `₹${webinar.price}` : "FREE"}
                    </span>
                  </div>

                  <h3 style={{ color: "white", fontSize: "18px", marginBottom: "8px", lineHeight: "1.3" }}>{webinar.title}</h3>
                  {webinar.subtitle && <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px" }}>{webinar.subtitle}</p>}

                  <div style={{ display: "flex", gap: "16px", color: "#94a3b8", fontSize: "13px", marginBottom: "16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={14} />
                      {webinar.webinarDateTime ? new Date(webinar.webinarDateTime).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "TBD"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={14} />
                      {webinar.durationMinutes} min
                    </span>
                    {webinar.speakerName && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Users size={14} />
                        {webinar.speakerName}
                      </span>
                    )}
                  </div>

                  <button style={{
                    width: "100%", padding: "12px", background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                    border: "none", borderRadius: "10px", color: "white", fontWeight: "700",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}>
                    View Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "60px", color: "#64748b", fontSize: "13px" }}>
          Powered by <span style={{ color: "#00c6ff", fontWeight: "600" }}>Enrollify</span>
        </div>
      </div>
    </div>
  );
}

export default SubdomainPage;
