import React, { useState, useEffect } from "react";
import { CheckCircle2, Star, Users, Calendar, Clock, Globe, Laptop, Gift, ArrowRight, Instagram, Youtube, Linkedin, Twitter, ExternalLink, ChevronDown, ChevronUp, Target, BookOpen, HelpCircle, List } from "lucide-react";
import { API_BASE } from "../../api/config.js";
import "../TemplatePage.css";

const imgUrl = (src) => {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  return API_BASE + src;
};

function TemplateClassic({ data, onRegister }) {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Countdown timer
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    if (!data?.webinarDateTime) return;
    const target = new Date(data.registrationDeadline || data.webinarDateTime).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) { clearInterval(interval); return; }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const {
    title, subtitle, description, categories = [],
    webinarDateTime, durationMinutes, language, maxSeats,
    price = 0, originalPrice = 0, registrationDeadline,
    bannerImage, meetingLink, speakerName, speakerBio,
    speakerImage, speakerSocials = {},
    learningOutcomes = [], targetAudience = [],
    faqs = [], agenda = [], testimonials = [],
    ctaText, bonusText, trustLogos = [],
    registrationCount = 0, _id,
  } = data;

  const isFree = price === 0;
  const displayImage = imgUrl(speakerImage) || imgUrl(bannerImage) || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
  const ctaLabel = ctaText || (isFree ? "Register for FREE" : `Register Now at \u20B9${price}/-`);
  const deadlineText = registrationDeadline
    ? new Date(registrationDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : webinarDateTime
      ? new Date(new Date(webinarDateTime).getTime() - 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      : "";

  return (
    <div className="v2-template-wrapper">

      {/* Floating Header */}
      <div className="v2-floating-header">
        <div className="v2-badge-box">
          <span className="v2-badge-main">{title}</span>
          <span className="v2-badge-sub">{Math.floor(durationMinutes / 60)}-Hour {isFree ? "Free" : "Exclusive"} Workshop</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="v2-hero-section">
        {registrationCount > 0 && (
          <p className="v2-participants-count">
            <strong>{registrationCount}+ Registered</strong> Join our growing community
          </p>
        )}

        <h1 className="v2-main-title">{title}</h1>
        <p className="v2-subtitle">{subtitle || (description && description.substring(0, 150) + "...")}</p>

        <div className="v2-hero-grid">
          {/* Left: Speaker */}
          <div className="v2-speaker-container">
            <div className="v2-speaker-circle dynamic-banner-container">
              <img src={displayImage} alt={speakerName || "Speaker"} className="v2-speaker-img dynamic-banner-img" />

              {/* Social cards */}
              {speakerSocials?.instagram && (
                <a href={speakerSocials.instagram} target="_blank" rel="noopener noreferrer" className="v2-social-card v2-insta">
                  <Instagram size={16} className="v2-icon-insta" />
                  <div className="v2-social-info">
                    <span className="v2-handle">Instagram</span>
                  </div>
                </a>
              )}
              {speakerSocials?.youtube && (
                <a href={speakerSocials.youtube} target="_blank" rel="noopener noreferrer" className="v2-social-card v2-yt">
                  <Youtube size={16} className="v2-icon-yt" />
                  <div className="v2-social-info">
                    <span className="v2-handle">YouTube</span>
                  </div>
                </a>
              )}

              <div className="v2-speaker-badge">
                <span className="v2-name">{speakerName || "Workshop Host"}</span>
                {speakerBio && <span className="v2-achievements">{speakerBio.substring(0, 80)}</span>}
                <span className="v2-role">{categories.join(" | ")}</span>
              </div>
            </div>

            {/* Social Links Row */}
            {(speakerSocials?.linkedin || speakerSocials?.twitter || speakerSocials?.website) && (
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "12px", flexWrap: "wrap" }}>
                {speakerSocials.linkedin && <a href={speakerSocials.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#0077b5", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", textDecoration: "none" }}><Linkedin size={16} /> LinkedIn</a>}
                {speakerSocials.twitter && <a href={speakerSocials.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "#1da1f2", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", textDecoration: "none" }}><Twitter size={16} /> Twitter</a>}
                {speakerSocials.website && <a href={speakerSocials.website} target="_blank" rel="noopener noreferrer" style={{ color: "#6574e9", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", textDecoration: "none" }}><ExternalLink size={16} /> Website</a>}
              </div>
            )}

            <div className="v2-trust-row">
              <div className="v2-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />)}
                <span>Trusted by {registrationCount || "100"}+ Students</span>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="v2-details-container">
            <h3 className="v2-details-title">Webinar Details</h3>

            <div className="v2-details-grid">
              <div className="v2-detail-box">
                <Calendar className="v2-detail-icon" />
                <div>
                  <label>Date</label>
                  <strong>{webinarDateTime ? new Date(webinarDateTime).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "TBD"}</strong>
                </div>
              </div>
              <div className="v2-detail-box">
                <Clock className="v2-detail-icon" />
                <div>
                  <label>Time</label>
                  <strong>{webinarDateTime ? new Date(webinarDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "TBD"}</strong>
                </div>
              </div>
              <div className="v2-detail-box">
                <Laptop className="v2-detail-icon" />
                <div>
                  <label>Format</label>
                  <strong>Online Session</strong>
                </div>
              </div>
              <div className="v2-detail-box">
                <Globe className="v2-detail-icon" />
                <div>
                  <label>Language</label>
                  <strong>{language}</strong>
                </div>
              </div>
              <div className="v2-detail-box v2-price-box">
                <div className="v2-detail-icon price-icon">{isFree ? "\u2605" : "\u20B9"}</div>
                <div>
                  <label>Joining Fee</label>
                  <strong>
                    {isFree ? "FREE" : `\u20B9${price}/-`}
                    {originalPrice > price && <span className="v2-strike" style={{ marginLeft: "8px", textDecoration: "line-through", color: "#6b7280", fontSize: "14px" }}>\u20B9{originalPrice}</span>}
                  </strong>
                </div>
              </div>
              {maxSeats && (
                <div className="v2-detail-box">
                  <Users className="v2-detail-icon" />
                  <div>
                    <label>Seats</label>
                    <strong>{maxSeats - registrationCount > 0 ? `${maxSeats - registrationCount} left` : "Almost Full!"}</strong>
                  </div>
                </div>
              )}
            </div>

            {bonusText && (
              <div className="v2-bonus-box">
                <Gift size={20} /> <span>{bonusText}</span>
              </div>
            )}

            <button className="v2-cta-button" onClick={onRegister}>{ctaLabel}</button>

            {/* Countdown Timer */}
            {(countdown.days > 0 || countdown.hours > 0 || countdown.mins > 0) && (
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
                {[{ val: countdown.days, label: "Days" }, { val: countdown.hours, label: "Hours" }, { val: countdown.mins, label: "Mins" }, { val: countdown.secs, label: "Secs" }].map((t, i) => (
                  <div key={i} style={{ textAlign: "center", background: "rgba(101,116,233,0.06)", padding: "8px 14px", borderRadius: "8px", minWidth: "55px" }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#6574e9" }}>{String(t.val).padStart(2, "0")}</div>
                    <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase" }}>{t.label}</div>
                  </div>
                ))}
              </div>
            )}

            {deadlineText && <p className="v2-timer-text">Registrations close <span className="text-red">{deadlineText}</span></p>}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="v2-about-section">
        <div className="v2-about-container">
          <h2>About this Webinar</h2>
          <p className="v2-description-text" style={{ whiteSpace: "pre-line" }}>{description}</p>
        </div>
      </div>

      {/* Speaker Bio Section */}
      {speakerName && speakerBio && (
        <div className="v2-about-section" style={{ background: "rgba(101,116,233,0.03)" }}>
          <div className="v2-about-container">
            <h2>Meet Your Host</h2>
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
              {(speakerImage || bannerImage) && (
                <img src={imgUrl(speakerImage) || imgUrl(bannerImage)} alt={speakerName} style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(101,116,233,0.2)" }} />
              )}
              <div style={{ flex: 1, minWidth: "250px" }}>
                <h3 style={{ fontSize: "22px", marginBottom: "8px", color: "#1a1a35" }}>{speakerName}</h3>
                <p style={{ color: "#4b5563", lineHeight: "1.7", whiteSpace: "pre-line" }}>{speakerBio}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Audience */}
      {targetAudience.length > 0 && (
        <div className="v2-outcomes-section">
          <h2><Target size={24} style={{ verticalAlign: "middle", marginRight: "8px" }} />Who Is This For?</h2>
          <div className="v2-outcomes-list">
            {targetAudience.map((item, i) => (
              <div key={i} className="v2-outcome-item">
                <CheckCircle2 size={24} className="v2-check-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Outcomes */}
      {learningOutcomes.length > 0 && (
        <div className="v2-outcomes-section">
          <h2><BookOpen size={24} style={{ verticalAlign: "middle", marginRight: "8px" }} />What You'll Learn</h2>
          <div className="v2-outcomes-list">
            {learningOutcomes.map((item, i) => (
              <div key={i} className="v2-outcome-item">
                <CheckCircle2 size={24} className="v2-check-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda */}
      {agenda.length > 0 && (
        <div className="v2-about-section">
          <div className="v2-about-container">
            <h2><List size={24} style={{ verticalAlign: "middle", marginRight: "8px" }} />Session Agenda</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {agenda.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "16px", padding: "16px 0", borderBottom: i < agenda.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                  <div style={{ minWidth: "100px", color: "#6574e9", fontWeight: "700", fontSize: "14px" }}>{item.time}</div>
                  <div style={{ color: "#374151", fontSize: "15px" }}>{item.topic}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trust Section */}
      {trustLogos.length > 0 && (
        <div className="v2-corporate-section">
          <h2>Trusted by Professionals from</h2>
          <div className="v2-logo-grid">
            {trustLogos.map((name, i) => (
              <div key={i} className="v2-logo-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "#4b5563", letterSpacing: "1px" }}>
                {name}
              </div>
            ))}
          </div>
          <button className="v2-secondary-cta" onClick={onRegister}>{ctaLabel}</button>
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="v2-testimonials-section">
          <h2>WHAT ATTENDEES SAY</h2>
          <div className="v2-testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="v2-testimonial-card">
                <div className="v2-quote-icon">"</div>
                <p className="v2-testimonial-text">{t.text}</p>
                <div className="v2-testimonial-author">
                  {t.image ? <img src={t.image} alt={t.name} /> : <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #6574e9, #a2aef7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a35", fontWeight: "700", fontSize: "18px" }}>{t.name?.charAt(0)}</div>}
                  <div className="v2-author-info">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <div className="v2-about-section">
          <div className="v2-about-container">
            <h2><HelpCircle size={24} style={{ verticalAlign: "middle", marginRight: "8px" }} />Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ background: "#fafafa", borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "none", border: "none", color: "#1a1a35", cursor: "pointer", textAlign: "left", fontSize: "15px", fontWeight: "600" }}
                  >
                    {faq.question}
                    {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: "0 20px 16px", color: "#4b5563", lineHeight: "1.7", fontSize: "14px" }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="v2-corporate-section" style={{ paddingTop: "40px" }}>
        <h2>{isFree ? "Don't Miss This FREE Session!" : `Enroll Now for Just \u20B9${price}/-`}</h2>
        {originalPrice > price && <p style={{ color: "#6b7280", fontSize: "18px", marginBottom: "16px" }}>Regular Price: <span style={{ textDecoration: "line-through" }}>\u20B9{originalPrice}</span></p>}
        <button className="v2-secondary-cta" onClick={onRegister} style={{ fontSize: "18px", padding: "18px 48px" }}>{ctaLabel}</button>
      </div>

      {/* Sticky Bar */}
      <div className={`v2-sticky-bar ${scrolled ? "visible" : ""}`}>
        <div className="v2-sticky-content">
          <div className="v2-urgency-info">
            {maxSeats && registrationCount >= maxSeats * 0.7 && <span className="v2-urgency-main text-red">Almost Full</span>}
            <span className="v2-urgency-sub">{isFree ? "Free Workshop" : `\u20B9${price}/-`}</span>
            {deadlineText && <span className="v2-urgency-timer">Closes <strong>{deadlineText}</strong></span>}
          </div>
          <button className="v2-sticky-cta" onClick={onRegister}>{ctaLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default TemplateClassic;
