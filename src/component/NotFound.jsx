import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1535",
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "clamp(5rem, 18vw, 12rem)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", margin: "0.5rem 0 0.75rem" }}>
        Page not found
      </h1>
      <p style={{ maxWidth: 520, opacity: 0.7, margin: "0 0 2rem", lineHeight: 1.6 }}>
        The page you&apos;re looking for doesn&apos;t exist or was moved. Check the URL or head
        back to the homepage to keep exploring Enrollify.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff",
            border: "none",
            padding: "0.85rem 1.6rem",
            borderRadius: "9999px",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "0.85rem 1.6rem",
            borderRadius: "9999px",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
