import React, { useState, useEffect } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { fetchAllTemplates, fetchMyTierTemplates } from "../api/templateApi.js";
import "./TemplateGallery.css";

const THUMB_CLASS_MAP = {
  classic: "tg-thumb-classic",
  modern: "tg-thumb-modern",
  bold: "tg-thumb-bold",
};

const TIER_CLASS_MAP = {
  basic: "tg-tier-basic",
  growth: "tg-tier-growth",
  elite: "tg-tier-elite",
};

function TemplateGallery({ subscriptionData }) {
  const [allTemplates, setAllTemplates] = useState([]);
  const [myTemplateIds, setMyTemplateIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const [allRes, myRes] = await Promise.all([
          fetchAllTemplates().catch(() => []),
          fetchMyTierTemplates().catch(() => []),
        ]);

        const allList = Array.isArray(allRes) ? allRes : allRes?.templates || [];
        const myList = Array.isArray(myRes) ? myRes : myRes?.templates || [];

        setAllTemplates(allList);
        setMyTemplateIds(new Set(myList.map((t) => t._id || t.key)));
      } catch (err) {
        setError("Failed to load templates");
      }
      setLoading(false);
    };

    loadTemplates();
  }, []);

  const isAvailable = (template) => {
    return myTemplateIds.has(template._id) || myTemplateIds.has(template.key);
  };

  if (loading) {
    return (
      <div className="template-gallery">
        <div className="tg-loading">Loading templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="template-gallery">
        <div className="tg-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="template-gallery">
      <div className="tg-header">
        <h2 className="tg-title">Template Gallery</h2>
        <p className="tg-subtitle">Choose a template for your webinar landing page. Upgrade your plan to unlock premium designs.</p>
      </div>

      <div className="tg-grid">
        {allTemplates.map((template) => {
          const available = isAvailable(template);
          const thumbClass = THUMB_CLASS_MAP[template.key] || "tg-thumb-default";
          const tierClass = TIER_CLASS_MAP[(template.tier || "basic").toLowerCase()] || "tg-tier-basic";
          const tierLabel = (template.tier || "BASIC").toUpperCase();

          return (
            <div key={template._id || template.key} className={`tg-card ${available ? "" : "tg-locked"}`}>
              {/* Thumbnail */}
              <div className={`tg-thumb ${thumbClass}`}>
                <span className="tg-thumb-label">{template.name || template.key}</span>
                {!available && (
                  <div className="tg-lock-overlay">
                    <div className="tg-lock-icon"><Lock size={20} /></div>
                    <span className="tg-lock-text">Upgrade to {tierLabel} to unlock</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="tg-card-body">
                <div className="tg-card-top">
                  <span className="tg-card-name">{template.name || template.key}</span>
                  <span className={`tg-tier-badge ${tierClass}`}>{tierLabel}</span>
                </div>
                {template.description && <p className="tg-card-desc">{template.description}</p>}
                {available && (
                  <span className="tg-available-badge">
                    <CheckCircle2 size={14} /> Available
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allTemplates.length === 0 && !loading && (
        <div className="tg-loading" style={{ color: "#9ca3af" }}>No templates available yet.</div>
      )}
    </div>
  );
}

export default TemplateGallery;
