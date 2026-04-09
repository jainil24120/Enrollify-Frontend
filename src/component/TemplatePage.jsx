import React, { useState, useEffect, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../api/config.js";
import { getTemplateComponent } from "./templates/templateRegistry.js";

function TemplatePage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        if (slug) {
          const res = await fetch(`${API_BASE}/api/webinars/s/${slug}`);
          if (res.ok) {
            const webinar = await res.json();
            setData(webinar);
          } else {
            setError("Webinar not found");
          }
        }
      } catch (err) {
        setError("Failed to load webinar");
      }
      setLoading(false);
    };
    fetchWebinar();
  }, [slug]);

  const handleRegister = () => {
    if (data) {
      localStorage.setItem("currentWebinarId", data._id);
      localStorage.setItem("webinarData", JSON.stringify(data));
      navigate("/register");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8f9fb", color: "#1a1a35" }}>
        <div style={{ textAlign: "center", fontSize: "1.2rem" }}>Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8f9fb", color: "#1a1a35" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "4rem", marginBottom: "16px" }}>404</h1>
          <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>{error || "Webinar not found"}</p>
        </div>
      </div>
    );
  }

  const templateKey = data.template?.key || "classic";
  const TemplateComponent = getTemplateComponent(templateKey);

  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>Loading template...</div>}>
      <TemplateComponent data={data} onRegister={handleRegister} />
    </Suspense>
  );
}

export default TemplatePage;
