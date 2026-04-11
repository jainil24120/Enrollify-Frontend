import React, { useState, useEffect } from "react";
import { CheckCircle2, Star, Users, Calendar, Clock, Globe, Laptop, Gift, Instagram, Youtube, Linkedin, Twitter, ExternalLink, ChevronDown, ChevronUp, Target, BookOpen, HelpCircle, List } from "lucide-react";
import { API_BASE } from "../../api/config.js";
import "./TemplateBold.css";

const imgUrl = (src) => {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  return API_BASE + src;
};

function TemplateBold({ data, onRegister }) {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    bannerImage, speakerName, speakerBio,
    speakerImage, speakerSocials = {},
    learningOutcomes = [], targetAudience = [],
    faqs = [], agenda = [], testimonials = [],
    ctaText, bonusText, trustLogos = [],
    registrationCount = 0,
  } = data;

  const isFree = price === 0;
  const displayImage = imgUrl(speakerImage) || imgUrl(bannerImage) || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
  const ctaLabel = ctaText || (isFree ? "Register for FREE" : `Register Now at \u20B9${price}/-`);
  const deadlineText = registrationDeadline
    ? new Date(registrationDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : webinarDateTime
      ? new Date(new Date(webinarDateTime).getTime() - 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      : "";

  let sectionCounter = 0;
  const nextSection = () => { sectionCounter += 1; return String(sectionCounter).padStart(2, "0"); };

  return (
    <div className="template-bold">

      {/* Hero — Full Width */}
      <div className="tb-hero">
        <div className="tb-hero-badge">
          {Math.floor(durationMinutes / 60)}-Hour {isFree ? "Free" : "Exclusive"} Workshop
        </div>

        {registrationCount > 0 && (
          <p className="tb-registered-count">{registrationCount}+ Already Registered</p>
        )}

        <h1 className="tb-hero-title">{title}</h1>
        <p className="tb-hero-subtitle">{subtitle || (description && description.substring(0, 150) + "...")}</p>

        <button className="tb-hero-cta" onClick={onRegister}>{ctaLabel}</button>

        <div className="tb-hero-meta">
          <span className="tb-hero-meta-item"><Calendar size={18} className="tb-hero-meta-icon" /> {webinarDateTime ? new Date(webinarDateTime).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "TBD"}</span>
          <span className="tb-hero-meta-item"><Clock size={18} className="tb-hero-meta-icon" /> {webinarDateTime ? new Date(webinarDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "TBD"}</span>
          <span className="tb-hero-meta-item"><Globe size={18} className="tb-hero-meta-icon" /> {language}</span>
          <span className="tb-hero-meta-item"><Laptop size={18} className="tb-hero-meta-icon" /> Online</span>
        </div>
      </div>

      {/* Speaker Card */}
      <div className="tb-speaker">
        <div className="tb-speaker-card">
          <div className="tb-speaker-img-wrap">
            <img src={displayImage} alt={speakerName || "Speaker"} className="tb-speaker-img" />
          </div>
          <div className="tb-speaker-info">
            <div className="tb-speaker-label">Your Host</div>
            <h2 className="tb-speaker-name">{speakerName || "Workshop Host"}</h2>
            {speakerBio && <p className="tb-speaker-bio">{speakerBio}</p>}
            {categories.length > 0 && <p style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: 600, marginBottom: "12px" }}>{categories.join(" / ")}</p>}
            <div className="tb-speaker-socials">
              {speakerSocials?.instagram && <a href={speakerSocials.instagram} target="_blank" rel="noopener noreferrer" className="tb-social-pill"><Instagram size={14} /> Instagram</a>}
              {speakerSocials?.youtube && <a href={speakerSocials.youtube} target="_blank" rel="noopener noreferrer" className="tb-social-pill"><Youtube size={14} /> YouTube</a>}
              {speakerSocials?.linkedin && <a href={speakerSocials.linkedin} target="_blank" rel="noopener noreferrer" className="tb-social-pill"><Linkedin size={14} /> LinkedIn</a>}
              {speakerSocials?.twitter && <a href={speakerSocials.twitter} target="_blank" rel="noopener noreferrer" className="tb-social-pill"><Twitter size={14} /> Twitter</a>}
              {speakerSocials?.website && <a href={speakerSocials.website} target="_blank" rel="noopener noreferrer" className="tb-social-pill"><ExternalLink size={14} /> Website</a>}
            </div>
          </div>
        </div>
      </div>

      {/* Countdown */}
      {(countdown.days > 0 || countdown.hours > 0 || countdown.mins > 0) && (
        <div className="tb-countdown-bar">
          {[{ val: countdown.days, label: "Days" }, { val: countdown.hours, label: "Hours" }, { val: countdown.mins, label: "Mins" }, { val: countdown.secs, label: "Secs" }].map((t, i) => (
            <div key={i} className="tb-countdown-item">
              <div className="tb-countdown-val">{String(t.val).padStart(2, "0")}</div>
              <div className="tb-countdown-label">{t.label}</div>
            </div>
          ))}
        </div>
      )}
      {deadlineText && <p className="tb-deadline-text">Registrations close <span className="tb-deadline-red">{deadlineText}</span></p>}

      {/* Details Grid */}
      <div className="tb-details-section">
        <div className="tb-details-grid">
          <div className="tb-detail-card">
            <Calendar className="tb-detail-card-icon" />
            <div className="tb-detail-card-label">Date</div>
            <div className="tb-detail-card-value">{webinarDateTime ? new Date(webinarDateTime).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBD"}</div>
          </div>
          <div className="tb-detail-card">
            <Clock className="tb-detail-card-icon" />
            <div className="tb-detail-card-label">Time</div>
            <div className="tb-detail-card-value">{webinarDateTime ? new Date(webinarDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "TBD"}</div>
          </div>
          <div className="tb-detail-card">
            <div className="tb-detail-card-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2rem" }}>{isFree ? "\u2605" : "\u20B9"}</div>
            <div className="tb-detail-card-label">Joining Fee</div>
            <div className="tb-detail-card-value">
              {isFree ? "FREE" : `\u20B9${price}/-`}
              {originalPrice > price && <span className="tb-orig-price">\u20B9{originalPrice}</span>}
            </div>
          </div>
          <div className="tb-detail-card">
            <Globe className="tb-detail-card-icon" />
            <div className="tb-detail-card-label">Language</div>
            <div className="tb-detail-card-value">{language}</div>
          </div>
          <div className="tb-detail-card">
            <Laptop className="tb-detail-card-icon" />
            <div className="tb-detail-card-label">Format</div>
            <div className="tb-detail-card-value">Online Session</div>
          </div>
          {maxSeats && (
            <div className="tb-detail-card">
              <Users className="tb-detail-card-icon" />
              <div className="tb-detail-card-label">Seats</div>
              <div className="tb-detail-card-value">{maxSeats - registrationCount > 0 ? `${maxSeats - registrationCount} left` : "Almost Full!"}</div>
            </div>
          )}
        </div>

        {bonusText && (
          <div className="tb-bonus">
            <Gift size={20} /> <span>{bonusText}</span>
          </div>
        )}
      </div>

      {/* About */}
      <div className="tb-section">
        <div className="tb-section-header">
          <span className="tb-section-number">{nextSection()}</span>
          <h2 className="tb-section-title">About this Webinar</h2>
        </div>
        <div className="tb-description">{description}</div>
      </div>

      {/* Target Audience — Bento Grid */}
      {targetAudience.length > 0 && (
        <div className="tb-section">
          <div className="tb-section-header">
            <span className="tb-section-number">{nextSection()}</span>
            <h2 className="tb-section-title">Who Is This For?</h2>
          </div>
          <div className="tb-bento-grid">
            {targetAudience.map((item, i) => (
              <div key={i} className="tb-bento-item">
                <Target size={22} className="tb-bento-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Outcomes — Bento Grid */}
      {learningOutcomes.length > 0 && (
        <div className="tb-section">
          <div className="tb-section-header">
            <span className="tb-section-number">{nextSection()}</span>
            <h2 className="tb-section-title">What You'll Learn</h2>
          </div>
          <div className="tb-bento-grid">
            {learningOutcomes.map((item, i) => (
              <div key={i} className="tb-bento-item">
                <CheckCircle2 size={22} className="tb-bento-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda — Bold Numbered */}
      {agenda.length > 0 && (
        <div className="tb-section">
          <div className="tb-section-header">
            <span className="tb-section-number">{nextSection()}</span>
            <h2 className="tb-section-title">Session Agenda</h2>
          </div>
          <div className="tb-agenda">
            {agenda.map((item, i) => (
              <div key={i} className="tb-agenda-item">
                <div className="tb-agenda-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="tb-agenda-time">{item.time}</div>
                <div className="tb-agenda-topic">{item.topic}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Logos */}
      {trustLogos.length > 0 && (
        <div className="tb-trust">
          <div className="tb-section-header" style={{ justifyContent: "center" }}>
            <h2 className="tb-section-title">Trusted by Professionals from</h2>
          </div>
          <div className="tb-trust-grid">
            {trustLogos.map((name, i) => (
              <div key={i} className="tb-trust-chip">{name}</div>
            ))}
          </div>
          <button className="tb-hero-cta" onClick={onRegister} style={{ fontSize: "1.1rem", padding: "16px 40px" }}>{ctaLabel}</button>
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="tb-section" style={{ marginTop: "80px" }}>
          <div className="tb-section-header">
            <span className="tb-section-number">{nextSection()}</span>
            <h2 className="tb-section-title">What Attendees Say</h2>
          </div>
          <div className="tb-testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="tb-testimonial-card">
                <p className="tb-testimonial-text">{t.text}</p>
                <div className="tb-testimonial-author">
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="tb-testimonial-avatar" />
                  ) : (
                    <div className="tb-testimonial-avatar-placeholder">{t.name?.charAt(0)}</div>
                  )}
                  <div>
                    <div className="tb-testimonial-name">{t.name}</div>
                    <div className="tb-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <div className="tb-section" style={{ marginTop: "60px" }}>
          <div className="tb-section-header">
            <span className="tb-section-number">{nextSection()}</span>
            <h2 className="tb-section-title">Frequently Asked Questions</h2>
          </div>
          <div className="tb-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="tb-faq-item">
                <button className="tb-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.question}
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === i && (
                  <div className="tb-faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="tb-final-cta">
        <h2 className="tb-final-title">{isFree ? "Don't Miss This FREE Session!" : `Enroll Now for Just \u20B9${price}/-`}</h2>
        {originalPrice > price && <p className="tb-final-price-note">Regular Price: <span style={{ textDecoration: "line-through" }}>\u20B9{originalPrice}</span></p>}
        <button className="tb-final-btn" onClick={onRegister}>{ctaLabel}</button>
      </div>

      {/* Sticky Bar */}
      <div className={`tb-sticky-bar ${scrolled ? "visible" : ""}`}>
        <div className="tb-sticky-content">
          <div className="tb-sticky-info">
            {maxSeats && registrationCount >= maxSeats * 0.7 && <span className="tb-sticky-label">Almost Full</span>}
            <span className="tb-sticky-price">{isFree ? "Free Workshop" : `\u20B9${price}/-`}</span>
            {deadlineText && <span className="tb-sticky-deadline">Closes <strong>{deadlineText}</strong></span>}
          </div>
          <button className="tb-sticky-cta" onClick={onRegister}>{ctaLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default TemplateBold;
