// ================= ENROLLIFY CREATE WEBINAR FORM =================

import { useState, useEffect } from "react";
import "./CreateWebinar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { createWebinarAPI, updateWebinarAPI } from "../api/webinarApi";
import { getClientSubscriptionAPI } from "../api/clientApi";
import { fetchMyTierTemplates } from "../api/templateApi";

function CreateWebinar() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.webinarToEdit;
  const isEditMode = !!editData;

  const [errorMsg, setErrorMsg] = useState("");
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [createdUrl, setCreatedUrl] = useState("");
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(editData?.template?._id || editData?.template || null);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const data = await getClientSubscriptionAPI();
        if (data?.subscription?._id) setSubscriptionId(data.subscription._id);
        else if (data?.subscription) setSubscriptionId(data.subscription);
      } catch (err) {
        console.error("Failed to fetch subscription:", err);
      }
    };
    const fetchTemplates = async () => {
      try {
        const res = await fetchMyTierTemplates();
        const list = Array.isArray(res) ? res : res.templates || res.data || [];
        setAvailableTemplates(list);
        if (!selectedTemplate) {
          const defaultT = list.find(t => t.isDefault);
          if (defaultT) setSelectedTemplate(defaultT._id);
        }
      } catch (err) {
        // If tier fetch fails, try fetching all templates as fallback
        try {
          const { fetchAllTemplates } = await import("../api/templateApi");
          const allRes = await fetchAllTemplates();
          const list = Array.isArray(allRes) ? allRes : allRes.data || [];
          setAvailableTemplates(list);
          if (!selectedTemplate && list.length > 0) {
            const defaultT = list.find(t => t.isDefault);
            if (defaultT) setSelectedTemplate(defaultT._id);
          }
        } catch (e) {
          console.error("Failed to fetch templates:", e);
        }
      }
    };
    fetchSub();
    fetchTemplates();
  }, []);

  const [formData, setFormData] = useState({
    // Step 1: Basics
    title: editData?.title || "",
    subtitle: editData?.subtitle || "",
    slug: editData?.slug || "",
    description: editData?.description || "",
    categories: editData?.categories || [],
    pricingType: editData?.price === 0 || editData?.price === "Free" ? "free" : (editData?.price > 0 ? "paid" : "free"),
    price: editData?.price || 0,
    originalPrice: editData?.originalPrice || "",
    webinarDateTime: editData?.webinarDateTime ? new Date(editData.webinarDateTime).toISOString().slice(0, 16) : "",
    durationMinutes: editData?.durationMinutes || "60",
    registrationDeadline: editData?.registrationDeadline ? new Date(editData.registrationDeadline).toISOString().slice(0, 16) : "",
    language: editData?.language || "English",
    maxSeats: editData?.maxSeats || "",
    bannerImage: editData?.bannerImage || "",
    bannerImageFile: null,
    meetingLink: editData?.meetingLink || "",
    status: editData?.status?.toLowerCase() || "published",

    // Step 2: Speaker
    speakerName: editData?.speakerName || "",
    speakerBio: editData?.speakerBio || "",
    speakerImage: editData?.speakerImage || "",
    speakerSocials: editData?.speakerSocials || { instagram: "", youtube: "", linkedin: "", twitter: "", website: "" },

    // Step 3: Content
    learningOutcomes: editData?.learningOutcomes || [""],
    targetAudience: editData?.targetAudience || [""],
    agenda: editData?.agenda?.map(({ _id, ...rest }) => rest) || [{ time: "", topic: "" }],
    faqs: editData?.faqs?.map(({ _id, ...rest }) => rest) || [{ question: "", answer: "" }],

    // Step 4: Social Proof
    testimonials: editData?.testimonials?.map(({ _id, ...rest }) => rest) || [{ name: "", role: "", text: "", image: "" }],
    trustLogos: editData?.trustLogos || [""],
    ctaText: editData?.ctaText || "",
    bonusText: editData?.bonusText || "",
  });

  const categoriesList = [
    "Marketing", "Business", "Technology", "Finance",
    "Startup", "Design", "Health", "Education"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (cat) => {
    if (formData.categories.includes(cat)) {
      setFormData({ ...formData, categories: formData.categories.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, categories: [...formData.categories, cat] });
    }
  };

  // Dynamic array helpers
  const addArrayItem = (key, template) => {
    setFormData({ ...formData, [key]: [...formData[key], template] });
  };

  const removeArrayItem = (key, index) => {
    const arr = [...formData[key]];
    // Required fields (outcomes, audience) must keep at least 1 item
    const requiredArrays = ["learningOutcomes", "targetAudience"];
    if (requiredArrays.includes(key) && arr.length <= 1) return;
    // Optional fields can be fully emptied
    if (arr.length <= 1 && !requiredArrays.includes(key)) {
      // Remove last item — set to empty array
      setFormData({ ...formData, [key]: [] });
      return;
    }
    arr.splice(index, 1);
    setFormData({ ...formData, [key]: arr });
  };

  const updateArrayItem = (key, index, value) => {
    const arr = [...formData[key]];
    arr[index] = value;
    setFormData({ ...formData, [key]: arr });
  };

  const updateObjectArrayItem = (key, index, field, value) => {
    const arr = [...formData[key]];
    arr[index] = { ...arr[index], [field]: value };
    setFormData({ ...formData, [key]: arr });
  };

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!subscriptionId) {
      setErrorMsg("No active subscription found. Please purchase a plan first.");
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.webinarDateTime || !formData.durationMinutes || formData.categories.length === 0) {
      setErrorMsg("Please fill all required fields (Title, Description, Date, Duration, Categories).");
      setCurrentStep(1);
      return;
    }

    const finalData = {
      title: formData.title,
      subtitle: formData.subtitle,
      slug: formData.slug || undefined,
      description: formData.description,
      categories: formData.categories,
      webinarDateTime: formData.webinarDateTime,
      durationMinutes: Number(formData.durationMinutes),
      price: formData.pricingType === "free" ? 0 : Number(formData.price || 0),
      originalPrice: Number(formData.originalPrice || 0),
      registrationDeadline: formData.registrationDeadline || undefined,
      meetingLink: formData.meetingLink,
      language: formData.language || "English",
      maxSeats: formData.maxSeats ? Number(formData.maxSeats) : undefined,
      status: formData.status,
      subscriptionId,
      subscription: subscriptionId,
      subscription_id: subscriptionId,
      templateId: selectedTemplate || undefined,

      // Speaker
      speakerName: formData.speakerName,
      speakerBio: formData.speakerBio,
      speakerImage: formData.speakerImage,
      speakerSocials: formData.speakerSocials,

      // Content
      learningOutcomes: formData.learningOutcomes.filter(o => o.trim()),
      targetAudience: formData.targetAudience.filter(a => a.trim()),
      agenda: formData.agenda.filter(a => a.topic.trim()),
      faqs: formData.faqs.filter(f => f.question.trim()),

      // Social Proof
      testimonials: formData.testimonials.filter(t => t.name.trim() && t.text.trim()),
      trustLogos: formData.trustLogos.filter(l => l.trim()),
      ctaText: formData.ctaText,
      bonusText: formData.bonusText,
    };

    if (formData.bannerImageFile) {
      finalData.bannerImageFile = formData.bannerImageFile;
    } else if (formData.bannerImage) {
      finalData.bannerImage = formData.bannerImage;
    }

    try {
      const token = localStorage.getItem("token") || "";
      let responseData;
      if (isEditMode) {
        responseData = await updateWebinarAPI(editData.id || editData._id, finalData, token);
      } else {
        responseData = await createWebinarAPI(finalData, token);
      }

      if (isEditMode) {
        // After edit, go back to dashboard
        navigate("/dashboard");
      } else {
        // Show success page with webinar link
        const slug = responseData?.webinar?.slug || "";
        if (slug) {
          // Use current origin so the link works in both dev and production
          setCreatedUrl(`${window.location.origin}/w/${slug}`);
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error.message?.includes("create your client profile first")) {
        setErrorMsg("Profile setup required! Redirecting...");
        setTimeout(() => navigate("/client-form"), 2000);
      } else {
        setErrorMsg(error.message || `Failed to ${isEditMode ? "update" : "create"} webinar.`);
      }
    }
  };

  const steps = [
    { num: 1, label: "Basics" },
    { num: 2, label: "Speaker" },
    { num: 3, label: "Content" },
    { num: 4, label: "Social Proof" },
  ];

  // Success screen
  if (createdUrl) {
    return (
      <div className="webinar-wrapper">
        <div className="form-card" style={{ textAlign: "center", padding: "60px 40px" }}>
          <div style={{ marginBottom: "16px" }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6574e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
          <h2 style={{ marginBottom: "12px" }}>Webinar {isEditMode ? "Updated" : "Created"} Successfully!</h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>Your webinar landing page is live at:</p>
          <div style={{ background: "rgba(101,116,233,0.1)", border: "1px solid rgba(101,116,233,0.3)", borderRadius: "12px", padding: "16px", marginBottom: "24px", wordBreak: "break-all" }}>
            <a href={createdUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#6574e9", fontSize: "18px", fontWeight: "600", textDecoration: "none" }}>
              {createdUrl}
            </a>
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { navigator.clipboard.writeText(createdUrl); }} style={{ padding: "12px 24px", background: "#6574e9", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "600" }}>
              Copy Link
            </button>
            <button onClick={() => window.open(createdUrl, "_blank")} style={{ padding: "12px 24px", background: "#e5e7eb", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#1a1a35", cursor: "pointer", fontWeight: "600" }}>
              Preview Page
            </button>
            <button onClick={() => navigate("/dashboard")} style={{ padding: "12px 24px", background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#6b7280", cursor: "pointer", fontWeight: "600" }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="webinar-wrapper">
      <div className="form-card">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          type="button"
          className="cw-back-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </button>
        <h1>{isEditMode ? "Edit Your Webinar" : "Create Your Webinar"}</h1>

        {/* Step Indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "30px", justifyContent: "center" }}>
          {steps.map((s) => (
            <button key={s.num} type="button"
              onClick={() => setCurrentStep(s.num)}
              style={{
                padding: "8px 20px", borderRadius: "20px", border: "1px solid",
                borderColor: currentStep === s.num ? "#6574e9" : "#e5e7eb",
                background: currentStep === s.num ? "rgba(101,116,233,0.15)" : "transparent",
                color: currentStep === s.num ? "#6574e9" : "#6b7280",
                cursor: "pointer", fontWeight: "600", fontSize: "13px",
              }}
            >
              {s.num}. {s.label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", padding: "15px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: "600", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} autoComplete="off" onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") e.preventDefault(); }}>

          {/* ===== STEP 1: BASICS ===== */}
          {currentStep === 1 && (
            <>
              {/* Template Picker */}
              {availableTemplates.length > 0 && (
                <>
                  <h2>Choose Template</h2>
                  <p style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: "16px" }}>
                    Select a design for your webinar landing page.
                    <a href="/preview/classic" target="_blank" rel="noopener noreferrer" style={{ color: "#6574e9", fontWeight: "500", marginLeft: "4px" }}>Preview templates</a>
                  </p>
                  <div style={{ display: "flex", gap: "14px", marginBottom: "28px", overflowX: "auto", paddingBottom: "8px" }}>
                    {availableTemplates.map((t) => {
                      const isSelected = selectedTemplate === t._id;
                      return (
                        <div
                          key={t._id}
                          onClick={() => setSelectedTemplate(t._id)}
                          style={{
                            minWidth: "180px", maxWidth: "200px", padding: "14px", borderRadius: "14px", cursor: "pointer",
                            border: isSelected ? "2px solid #6574e9" : "1px solid #e5e7eb",
                            background: isSelected ? "rgba(101,116,233,0.04)" : "#fafafa",
                            textAlign: "center", transition: "all 0.2s ease", position: "relative",
                          }}
                        >
                          {t.thumbnail ? (
                            <img src={t.thumbnail} alt={t.name} style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />
                          ) : (
                            <div style={{ width: "100%", height: "90px", background: t.minTier === "elite" ? "linear-gradient(135deg, #ff6b35, #f72585)" : t.minTier === "growth" ? "linear-gradient(135deg, #0f172a, #1e293b)" : "linear-gradient(135deg, #f8f9fb, #e5e7eb)", borderRadius: "8px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: t.minTier === "basic" ? "#6b7280" : "white", fontSize: "0.78rem", fontWeight: "600" }}>{t.name}</div>
                          )}
                          <div style={{ fontWeight: "600", fontSize: "0.88rem", color: "#1a1a35" }}>{t.name}</div>
                          <div style={{ fontSize: "0.68rem", color: "#9ca3af", textTransform: "uppercase", marginTop: "2px", letterSpacing: "0.04em" }}>{t.minTier} plan</div>
                          {isSelected && (
                            <div style={{ fontSize: "0.72rem", color: "#6574e9", fontWeight: "700", marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              Selected
                            </div>
                          )}
                          {t.description && (
                            <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "4px", lineHeight: "1.4" }}>{t.description.substring(0, 50)}...</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Title & Subtitle */}
              <div className="grid">
                <div className="cw-field">
                  <label className="cw-label">Webinar Title <span className="cw-req">*</span></label>
                  <input name="title" value={formData.title} placeholder="e.g. Master AI: Build Apps with ChatGPT" required onChange={handleChange} />
                </div>
                <div className="cw-field">
                  <label className="cw-label">Subtitle / Tagline</label>
                  <input name="subtitle" value={formData.subtitle} placeholder="e.g. From Zero to AI Products in 90 Minutes" onChange={handleChange} />
                </div>
              </div>

              <div className="cw-field">
                <label className="cw-label">URL Slug <span className="cw-hint">(auto-generated if empty)</span></label>
                <input name="slug" value={formData.slug} placeholder="e.g. ai-masterclass-chatgpt" onChange={handleChange} />
              </div>

              <div className="cw-field">
                <label className="cw-label">Description <span className="cw-req">*</span></label>
                <textarea name="description" value={formData.description} placeholder="Tell attendees what this webinar is about, what they'll learn, and why they should join..." required onChange={handleChange} rows={4} />
              </div>

              {/* Categories */}
              <div className="cw-field">
                <label className="cw-label">Categories <span className="cw-req">*</span> <span className="cw-hint">(select one or more)</span></label>
                <div className="category-grid">
                  {categoriesList.map(cat => (
                    <div key={cat} className={`category ${formData.categories.includes(cat) ? "active-cat" : ""}`} onClick={() => handleCategoryChange(cat)}>
                      {cat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="cw-field">
                <label className="cw-label">Pricing</label>
                <div className="toggle pricing-toggle">
                  <button type="button" className={formData.pricingType === "free" ? "active-btn" : ""} onClick={() => setFormData({ ...formData, pricingType: "free" })}>Free</button>
                  <button type="button" className={formData.pricingType === "paid" ? "active-btn" : ""} onClick={() => setFormData({ ...formData, pricingType: "paid" })}>Paid</button>
                </div>
              </div>

              {formData.pricingType === "paid" && (
                <div className="grid">
                  <div className="cw-field">
                    <label className="cw-label">Price (₹) <span className="cw-req">*</span></label>
                    <input name="price" value={formData.price} type="number" placeholder="e.g. 199" required onChange={handleChange} />
                  </div>
                  <div className="cw-field">
                    <label className="cw-label">Original Price (₹) <span className="cw-hint">(shows strikethrough)</span></label>
                    <input name="originalPrice" value={formData.originalPrice} type="number" placeholder="e.g. 999" onChange={handleChange} />
                  </div>
                </div>
              )}

              {/* Schedule */}
              <h2>Schedule</h2>
              <div className="grid">
                <div className="cw-field">
                  <label className="cw-label">Webinar Date & Time <span className="cw-req">*</span></label>
                  <p className="cw-desc">When will the webinar take place?</p>
                  <input name="webinarDateTime" value={formData.webinarDateTime} type="datetime-local" required onChange={handleChange} />
                </div>
                <div className="cw-field">
                  <label className="cw-label">Duration (Minutes) <span className="cw-req">*</span></label>
                  <p className="cw-desc">How long will the session last?</p>
                  <input name="durationMinutes" value={formData.durationMinutes} type="number" placeholder="e.g. 90" required onChange={handleChange} />
                </div>
              </div>

              <div className="grid">
                <div className="cw-field">
                  <label className="cw-label">Registration Deadline <span className="cw-hint">(optional)</span></label>
                  <p className="cw-desc">Last date users can register. Leave empty to allow registration until the webinar starts.</p>
                  <input name="registrationDeadline" value={formData.registrationDeadline} type="datetime-local" onChange={handleChange} />
                </div>
                <div className="cw-field">
                  <label className="cw-label">Max Seats <span className="cw-hint">(optional)</span></label>
                  <p className="cw-desc">Leave empty for unlimited seats.</p>
                  <input name="maxSeats" value={formData.maxSeats} type="number" placeholder="e.g. 500" onChange={handleChange} />
                </div>
              </div>

              {/* Additional */}
              <h2>Additional Details</h2>
              <div className="grid">
                <div className="cw-field">
                  <label className="cw-label">Language</label>
                  <input name="language" value={formData.language} placeholder="e.g. English" onChange={handleChange} />
                </div>
                <div className="cw-field">
                  <label className="cw-label">Meeting Link <span className="cw-hint">(Zoom / Google Meet)</span></label>
                  <input name="meetingLink" value={formData.meetingLink} placeholder="https://meet.google.com/..." onChange={handleChange} />
                </div>
              </div>

              <div className="grid">
                <div className="cw-field">
                  <label className="cw-label">Banner Image</label>
                  <p className="cw-desc">Upload a cover image for your webinar page. {formData.bannerImage && formData.bannerImage.startsWith("data:") ? "Image uploaded" : ""}</p>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData(prev => ({ ...prev, bannerImage: reader.result, bannerImageFile: null }));
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
                <div className="cw-field">
                  <label className="cw-label">Status</label>
                  <div className="toggle">
                    <button type="button" className={formData.status === "draft" ? "active-btn" : ""} onClick={() => setFormData({ ...formData, status: "draft" })}>Draft</button>
                    <button type="button" className={formData.status === "published" ? "active-btn" : ""} onClick={() => setFormData({ ...formData, status: "published" })}>Published</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===== STEP 2: SPEAKER ===== */}
          {currentStep === 2 && (
            <>
              <h2>Speaker / Host Details</h2>
              <p className="cw-section-desc">Add details about the person hosting the webinar. This info appears on the public landing page.</p>
              <div className="grid">
                <div className="cw-field">
                  <label className="cw-label">Speaker Name</label>
                  <input name="speakerName" value={formData.speakerName} placeholder="e.g. Arjun Verma" onChange={handleChange} />
                </div>
                <div className="cw-field">
                  <label className="cw-label">Speaker Image</label>
                  <p className="cw-desc">Upload an image or paste a direct image URL. {formData.speakerImage && formData.speakerImage.startsWith("data:") ? "Image uploaded" : ""}</p>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData(prev => ({ ...prev, speakerImage: reader.result }));
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <input name="speakerImage" value={formData.speakerImage && !formData.speakerImage.startsWith("data:") ? formData.speakerImage : ""} placeholder="Or paste URL: https://example.com/photo.jpg" onChange={handleChange} style={{ marginTop: "8px" }} />
                </div>
              </div>

              <div className="cw-field">
                <label className="cw-label">Speaker Bio</label>
                <textarea name="speakerBio" value={formData.speakerBio} placeholder="e.g. Senior AI Engineer with 8+ years experience. TEDx Speaker. Built products used by 2M+ users." onChange={handleChange} rows={3} />
              </div>

              <h2>Social Links</h2>
              <p className="cw-section-desc">Add speaker's social media profiles. These will appear as clickable links on the webinar page.</p>
              <div className="grid">
                <div className="cw-field"><label className="cw-label">Instagram</label><input placeholder="https://instagram.com/..." value={formData.speakerSocials.instagram} onChange={(e) => setFormData({ ...formData, speakerSocials: { ...formData.speakerSocials, instagram: e.target.value } })} /></div>
                <div className="cw-field"><label className="cw-label">YouTube</label><input placeholder="https://youtube.com/..." value={formData.speakerSocials.youtube} onChange={(e) => setFormData({ ...formData, speakerSocials: { ...formData.speakerSocials, youtube: e.target.value } })} /></div>
                <div className="cw-field"><label className="cw-label">LinkedIn</label><input placeholder="https://linkedin.com/in/..." value={formData.speakerSocials.linkedin} onChange={(e) => setFormData({ ...formData, speakerSocials: { ...formData.speakerSocials, linkedin: e.target.value } })} /></div>
                <div className="cw-field"><label className="cw-label">Twitter / X</label><input placeholder="https://twitter.com/..." value={formData.speakerSocials.twitter} onChange={(e) => setFormData({ ...formData, speakerSocials: { ...formData.speakerSocials, twitter: e.target.value } })} /></div>
                <div className="cw-field"><label className="cw-label">Website</label><input placeholder="https://yoursite.com" value={formData.speakerSocials.website} onChange={(e) => setFormData({ ...formData, speakerSocials: { ...formData.speakerSocials, website: e.target.value } })} /></div>
              </div>
            </>
          )}

          {/* ===== STEP 3: CONTENT ===== */}
          {currentStep === 3 && (
            <>
              <h2>What Will Attendees Learn?</h2>
              {formData.learningOutcomes.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input value={item} placeholder={`Outcome ${i + 1}`} onChange={(e) => updateArrayItem("learningOutcomes", i, e.target.value)} style={{ flex: 1 }} />
                  <button type="button" onClick={() => removeArrayItem("learningOutcomes", i)} style={{ padding: "8px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "none", borderRadius: "8px", cursor: "pointer" }}>X</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem("learningOutcomes", "")} style={{ padding: "8px 16px", background: "rgba(101,116,233,0.1)", color: "#6574e9", border: "1px solid rgba(101,116,233,0.3)", borderRadius: "8px", cursor: "pointer", marginBottom: "24px", fontSize: "13px" }}>+ Add Outcome</button>

              <h2>Target Audience</h2>
              {formData.targetAudience.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input value={item} placeholder={`e.g. Beginners in ${formData.categories[0] || "Marketing"}`} onChange={(e) => updateArrayItem("targetAudience", i, e.target.value)} style={{ flex: 1 }} />
                  <button type="button" onClick={() => removeArrayItem("targetAudience", i)} style={{ padding: "8px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "none", borderRadius: "8px", cursor: "pointer" }}>X</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem("targetAudience", "")} style={{ padding: "8px 16px", background: "rgba(101,116,233,0.1)", color: "#6574e9", border: "1px solid rgba(101,116,233,0.3)", borderRadius: "8px", cursor: "pointer", marginBottom: "24px", fontSize: "13px" }}>+ Add Audience</button>

              <h2>Session Agenda</h2>
              {formData.agenda.map((item, i) => (
                <div key={i} className="grid" style={{ marginBottom: "8px", alignItems: "center" }}>
                  <input value={item.time} placeholder="Time (e.g. 10:00 AM)" onChange={(e) => updateObjectArrayItem("agenda", i, "time", e.target.value)} />
                  <input value={item.topic} placeholder="Topic" onChange={(e) => updateObjectArrayItem("agenda", i, "topic", e.target.value)} />
                  <button type="button" onClick={() => removeArrayItem("agenda", i)} style={{ padding: "8px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "none", borderRadius: "8px", cursor: "pointer", width: "40px" }}>X</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem("agenda", { time: "", topic: "" })} style={{ padding: "8px 16px", background: "rgba(101,116,233,0.1)", color: "#6574e9", border: "1px solid rgba(101,116,233,0.3)", borderRadius: "8px", cursor: "pointer", marginBottom: "24px", fontSize: "13px" }}>+ Add Agenda Item</button>

              <h2>FAQs</h2>
              {formData.faqs.map((item, i) => (
                <div key={i} style={{ marginBottom: "12px", background: "#fafafa", padding: "12px", borderRadius: "8px" }}>
                  <input value={item.question} placeholder="Question" onChange={(e) => updateObjectArrayItem("faqs", i, "question", e.target.value)} style={{ marginBottom: "8px" }} />
                  <textarea value={item.answer} placeholder="Answer" onChange={(e) => updateObjectArrayItem("faqs", i, "answer", e.target.value)} rows={2} />
                  <button type="button" onClick={() => removeArrayItem("faqs", i)} style={{ padding: "4px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginTop: "8px" }}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem("faqs", { question: "", answer: "" })} style={{ padding: "8px 16px", background: "rgba(101,116,233,0.1)", color: "#6574e9", border: "1px solid rgba(101,116,233,0.3)", borderRadius: "8px", cursor: "pointer", marginBottom: "24px", fontSize: "13px" }}>+ Add FAQ</button>
            </>
          )}

          {/* ===== STEP 4: SOCIAL PROOF ===== */}
          {currentStep === 4 && (
            <>
              <h2>Testimonials</h2>
              {formData.testimonials.map((item, i) => (
                <div key={i} style={{ marginBottom: "12px", background: "#fafafa", padding: "12px", borderRadius: "8px" }}>
                  <div className="grid">
                    <input value={item.name} placeholder="Name" onChange={(e) => updateObjectArrayItem("testimonials", i, "name", e.target.value)} />
                    <input value={item.role} placeholder="Role / Company" onChange={(e) => updateObjectArrayItem("testimonials", i, "role", e.target.value)} />
                  </div>
                  <textarea value={item.text} placeholder="Testimonial text" onChange={(e) => updateObjectArrayItem("testimonials", i, "text", e.target.value)} rows={2} />
                  <input value={item.image} placeholder="Photo URL (optional)" onChange={(e) => updateObjectArrayItem("testimonials", i, "image", e.target.value)} />
                  <button type="button" onClick={() => removeArrayItem("testimonials", i)} style={{ padding: "4px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginTop: "8px" }}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem("testimonials", { name: "", role: "", text: "", image: "" })} style={{ padding: "8px 16px", background: "rgba(101,116,233,0.1)", color: "#6574e9", border: "1px solid rgba(101,116,233,0.3)", borderRadius: "8px", cursor: "pointer", marginBottom: "24px", fontSize: "13px" }}>+ Add Testimonial</button>

              <h2>Trust / Company Logos</h2>
              <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "12px" }}>Add company names whose employees have attended (e.g. Google, Microsoft)</p>
              {formData.trustLogos.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input value={item} placeholder="Company Name" onChange={(e) => updateArrayItem("trustLogos", i, e.target.value)} style={{ flex: 1 }} />
                  <button type="button" onClick={() => removeArrayItem("trustLogos", i)} style={{ padding: "8px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "none", borderRadius: "8px", cursor: "pointer" }}>X</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem("trustLogos", "")} style={{ padding: "8px 16px", background: "rgba(101,116,233,0.1)", color: "#6574e9", border: "1px solid rgba(101,116,233,0.3)", borderRadius: "8px", cursor: "pointer", marginBottom: "24px", fontSize: "13px" }}>+ Add Company</button>

              <h2>Customization</h2>
              <div className="grid">
                <input name="ctaText" value={formData.ctaText} placeholder="Custom CTA Button Text (e.g. Reserve My Spot)" onChange={handleChange} />
                <input name="bonusText" value={formData.bonusText} placeholder="Bonus Text (e.g. FREE E-book Included)" onChange={handleChange} />
              </div>
            </>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", gap: "12px" }}>
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep(currentStep - 1)}
                style={{ padding: "14px 28px", background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: "10px", color: "#6b7280", cursor: "pointer", fontWeight: "600" }}>
                Back
              </button>
            )}
            <div style={{ marginLeft: "auto" }}>
              {currentStep < 4 ? (
                <button type="button" onClick={() => setCurrentStep(currentStep + 1)}
                  style={{ padding: "14px 28px", background: "linear-gradient(135deg, #6574e9, #6574e9)", border: "none", borderRadius: "10px", color: "white", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>
                  Next Step
                </button>
              ) : (
                <button type="button" onClick={handleSubmit}
                  style={{ padding: "14px 32px", background: "linear-gradient(135deg, #6574e9, #4f5cd4)", border: "none", borderRadius: "10px", color: "white", cursor: "pointer", fontWeight: "700", fontSize: "16px" }}>
                  {isEditMode ? "Update Webinar" : "Create Webinar"}
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateWebinar;
