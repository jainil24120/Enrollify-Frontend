import React, { useState, useEffect } from "react";
import { CheckCircle2, Star, Users, Calendar, Clock, Globe, Laptop, Gift, Instagram, Youtube, Linkedin, Twitter, ExternalLink, ChevronDown, ChevronUp, Target, BookOpen, HelpCircle, List } from "lucide-react";
import "./TemplateModern.css";

function TemplateModern({ data, onRegister }) {
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
  const displayImage = speakerImage || bannerImage || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
  const ctaLabel = ctaText || (isFree ? "Register for FREE" : `Register Now at \u20B9${price}/-`);
  const deadlineText = registrationDeadline
    ? new Date(registrationDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : webinarDateTime
      ? new Date(new Date(webinarDateTime).getTime() - 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      : "";

  return (
    <div className="template-modern">

      {/* Floating Header */}
      <div className="tm-header">
        <div className="tm-header-badge">
          <span className="tm-header-title">{title}</span>
          <span className="tm-header-sub">{Math.floor(durationMinutes / 60)}-Hour {isFree ? "Free" : "Exclusive"} Workshop</span>
        </div>
      </div>

      {/* Hero: Split Layout */}
      <div className="tm-hero">
        {/* Left: Speaker Image */}
        <div className="tm-hero-left">
          <div className="tm-hero-img-wrap">
            <img src={displayImage} alt={speakerName || "Speaker"} className="tm-hero-img" />
            <div className="tm-speaker-overlay">
              <div className="tm-speaker-name">{speakerName || "Workshop Host"}</div>
              {speakerBio && <div className="tm-speaker-bio-short">{speakerBio.substring(0, 80)}</div>}
              {categories.length > 0 && (
                <div className="tm-speaker-categories">
                  {categories.map((cat, i) => (
                    <span key={i} className="tm-category-tag">{cat}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="tm-social-row">
            {speakerSocials?.instagram && (
              <a href={speakerSocials.instagram} target="_blank" rel="noopener noreferrer" className="tm-social-link">
                <Instagram size={14} /> Instagram
              </a>
            )}
            {speakerSocials?.youtube && (
              <a href={speakerSocials.youtube} target="_blank" rel="noopener noreferrer" className="tm-social-link">
                <Youtube size={14} /> YouTube
              </a>
            )}
            {speakerSocials?.linkedin && (
              <a href={speakerSocials.linkedin} target="_blank" rel="noopener noreferrer" className="tm-social-link">
                <Linkedin size={14} /> LinkedIn
              </a>
            )}
            {speakerSocials?.twitter && (
              <a href={speakerSocials.twitter} target="_blank" rel="noopener noreferrer" className="tm-social-link">
                <Twitter size={14} /> Twitter
              </a>
            )}
            {speakerSocials?.website && (
              <a href={speakerSocials.website} target="_blank" rel="noopener noreferrer" className="tm-social-link">
                <ExternalLink size={14} /> Website
              </a>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="tm-hero-right">
          {registrationCount > 0 && (
            <div className="tm-registered-badge">
              {registrationCount}+ Already Registered
            </div>
          )}

          <h1 className="tm-main-title">{title}</h1>
          <p className="tm-subtitle">{subtitle || (description && description.substring(0, 150) + "...")}</p>

          <div className="tm-details-card">
            <div className="tm-details-title">Session Details</div>
            <div className="tm-details-grid">
              <div className="tm-detail-item">
                <Calendar className="tm-detail-icon" />
                <div>
                  <span className="tm-detail-label">Date</span>
                  <strong className="tm-detail-value">{webinarDateTime ? new Date(webinarDateTime).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "TBD"}</strong>
                </div>
              </div>
              <div className="tm-detail-item">
                <Clock className="tm-detail-icon" />
                <div>
                  <span className="tm-detail-label">Time</span>
                  <strong className="tm-detail-value">{webinarDateTime ? new Date(webinarDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "TBD"}</strong>
                </div>
              </div>
              <div className="tm-detail-item">
                <Laptop className="tm-detail-icon" />
                <div>
                  <span className="tm-detail-label">Format</span>
                  <strong className="tm-detail-value">Online Session</strong>
                </div>
              </div>
              <div className="tm-detail-item">
                <Globe className="tm-detail-icon" />
                <div>
                  <span className="tm-detail-label">Language</span>
                  <strong className="tm-detail-value">{language}</strong>
                </div>
              </div>
              <div className="tm-detail-item tm-price-highlight">
                <div className="tm-detail-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.1rem" }}>{isFree ? "\u2605" : "\u20B9"}</div>
                <div>
                  <span className="tm-detail-label">Joining Fee</span>
                  <strong className="tm-detail-value">
                    {isFree ? "FREE" : `\u20B9${price}/-`}
                    {originalPrice > price && <span className="tm-strike">\u20B9{originalPrice}</span>}
                  </strong>
                </div>
              </div>
              {maxSeats && (
                <div className="tm-detail-item">
                  <Users className="tm-detail-icon" />
                  <div>
                    <span className="tm-detail-label">Seats</span>
                    <strong className="tm-detail-value">{maxSeats - registrationCount > 0 ? `${maxSeats - registrationCount} left` : "Almost Full!"}</strong>
                  </div>
                </div>
              )}
            </div>

            {bonusText && (
              <div className="tm-bonus">
                <Gift size={18} /> <span>{bonusText}</span>
              </div>
            )}

            <button className="tm-cta" onClick={onRegister}>{ctaLabel}</button>

            {/* Countdown */}
            {(countdown.days > 0 || countdown.hours > 0 || countdown.mins > 0) && (
              <div className="tm-countdown" style={{ marginTop: "20px" }}>
                {[{ val: countdown.days, label: "Days" }, { val: countdown.hours, label: "Hours" }, { val: countdown.mins, label: "Mins" }, { val: countdown.secs, label: "Secs" }].map((t, i) => (
                  <div key={i} className="tm-countdown-item">
                    <div className="tm-countdown-val">{String(t.val).padStart(2, "0")}</div>
                    <div className="tm-countdown-label">{t.label}</div>
                  </div>
                ))}
              </div>
            )}

            {deadlineText && <p className="tm-deadline">Registrations close <span className="tm-deadline-red">{deadlineText}</span></p>}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="tm-section">
        <div className="tm-glass-section">
          <h2 className="tm-section-title">About this <span className="tm-accent">Webinar</span></h2>
          <p className="tm-description">{description}</p>
        </div>
      </div>

      {/* Speaker Bio */}
      {speakerName && speakerBio && (
        <div className="tm-section">
          <div className="tm-glass-section">
            <h2 className="tm-section-title">Meet Your <span className="tm-accent">Host</span></h2>
            <div className="tm-speaker-section">
              {(speakerImage || bannerImage) && (
                <img src={speakerImage || bannerImage} alt={speakerName} className="tm-speaker-avatar" />
              )}
              <div style={{ flex: 1, minWidth: "250px" }}>
                <div className="tm-speaker-full-name">{speakerName}</div>
                <p className="tm-speaker-full-bio">{speakerBio}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Audience */}
      {targetAudience.length > 0 && (
        <div className="tm-section">
          <h2 className="tm-section-title"><Target size={24} className="tm-accent" /> Who Is This <span className="tm-accent">For?</span></h2>
          <div className="tm-items-grid">
            {targetAudience.map((item, i) => (
              <div key={i} className="tm-item">
                <CheckCircle2 size={22} className="tm-item-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Outcomes */}
      {learningOutcomes.length > 0 && (
        <div className="tm-section" style={{ marginTop: "60px" }}>
          <h2 className="tm-section-title"><BookOpen size={24} className="tm-accent" /> What You'll <span className="tm-accent">Learn</span></h2>
          <div className="tm-items-grid">
            {learningOutcomes.map((item, i) => (
              <div key={i} className="tm-item">
                <CheckCircle2 size={22} className="tm-item-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda — Timeline */}
      {agenda.length > 0 && (
        <div className="tm-section" style={{ marginTop: "60px" }}>
          <div className="tm-glass-section">
            <h2 className="tm-section-title"><List size={24} className="tm-accent" /> Session <span className="tm-accent">Agenda</span></h2>
            <div className="tm-timeline">
              {agenda.map((item, i) => (
                <div key={i} className="tm-timeline-item">
                  <div className="tm-timeline-time">{item.time}</div>
                  <div className="tm-timeline-topic">{item.topic}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trust Logos */}
      {trustLogos.length > 0 && (
        <div className="tm-trust-section">
          <h2 className="tm-section-title" style={{ justifyContent: "center" }}>Trusted by <span className="tm-accent">Professionals</span></h2>
          <div className="tm-trust-grid">
            {trustLogos.map((name, i) => (
              <div key={i} className="tm-trust-card">{name}</div>
            ))}
          </div>
          <button className="tm-secondary-cta" onClick={onRegister}>{ctaLabel}</button>
        </div>
      )}

      {/* Testimonials — Horizontal Scroll */}
      {testimonials.length > 0 && (
        <div className="tm-section" style={{ marginTop: "60px", maxWidth: "1200px" }}>
          <h2 className="tm-section-title">What Attendees <span className="tm-accent">Say</span></h2>
          <div className="tm-testimonials-scroll">
            {testimonials.map((t, i) => (
              <div key={i} className="tm-testimonial">
                <div className="tm-testimonial-quote">"</div>
                <p className="tm-testimonial-text">{t.text}</p>
                <div className="tm-testimonial-author">
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="tm-testimonial-avatar" />
                  ) : (
                    <div className="tm-testimonial-avatar-placeholder">{t.name?.charAt(0)}</div>
                  )}
                  <div>
                    <div className="tm-testimonial-name">{t.name}</div>
                    <div className="tm-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <div className="tm-section" style={{ marginTop: "60px" }}>
          <div className="tm-glass-section">
            <h2 className="tm-section-title"><HelpCircle size={24} className="tm-accent" /> Frequently Asked <span className="tm-accent">Questions</span></h2>
            <div className="tm-faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className="tm-faq-item">
                  <button className="tm-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {faq.question}
                    {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {openFaq === i && (
                    <div className="tm-faq-answer">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="tm-final-cta">
        <h2 className="tm-final-title">{isFree ? "Don't Miss This FREE Session!" : `Enroll Now for Just \u20B9${price}/-`}</h2>
        {originalPrice > price && <p className="tm-final-price-note">Regular Price: <span style={{ textDecoration: "line-through" }}>\u20B9{originalPrice}</span></p>}
        <button className="tm-secondary-cta" onClick={onRegister} style={{ fontSize: "1.2rem", padding: "18px 50px" }}>{ctaLabel}</button>
      </div>

      {/* Sticky Bar */}
      <div className={`tm-sticky-bar ${scrolled ? "visible" : ""}`}>
        <div className="tm-sticky-content">
          <div className="tm-sticky-info">
            {maxSeats && registrationCount >= maxSeats * 0.7 && <span className="tm-sticky-label" style={{ color: "#f87171" }}>Almost Full</span>}
            <span className="tm-sticky-price">{isFree ? "Free Workshop" : `\u20B9${price}/-`}</span>
            {deadlineText && <span className="tm-sticky-deadline">Closes <strong>{deadlineText}</strong></span>}
          </div>
          <button className="tm-sticky-cta" onClick={onRegister}>{ctaLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default TemplateModern;
