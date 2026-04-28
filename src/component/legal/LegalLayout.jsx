import React from "react";
import { useNavigate } from "react-router-dom";
import "./legal.css";

const LegalLayout = ({ title, lastUpdated, children }) => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <header className="legal-nav">
        <button className="legal-brand" onClick={() => navigate("/")} aria-label="Go to homepage">
          <span className="legal-brand-mark" aria-hidden>E</span>
          <span>Enrollify</span>
        </button>
        <button className="legal-back" onClick={() => navigate(-1)}>&larr; Back</button>
      </header>

      <main className="legal-shell">
        <p className="legal-eyebrow">Enrollify Legal</p>
        <h1 className="legal-title">{title}</h1>
        {lastUpdated && <p className="legal-updated">Last updated: {lastUpdated}</p>}
        <div className="legal-content">{children}</div>
      </main>

      <footer className="legal-footer">
        <p>&copy; {new Date().getFullYear()} Enrollify. All rights reserved.</p>
        <nav>
          <a href="/privacy-policy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/refund-policy">Refund</a>
          <a href="/contact">Contact</a>
        </nav>
      </footer>
    </div>
  );
};

export default LegalLayout;
