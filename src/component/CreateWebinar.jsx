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
        const templates = await fetchMyTierTemplates();
        setAvailableTemplates(Array.isArray(templates) ? templates : templates.data || []);
        // Auto-select default template if none selected
        if (!selectedTemplate) {
          const defaultT = (Array.isArray(templates) ? templates : templates.data || []).find(t => t.isDefault);
          if (defaultT) setSelectedTemplate(defaultT._id);
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err);
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
    agenda: editData?.agenda || [{ time: "", topic: "" }],
    faqs: editData?.faqs || [{ question: "", answer: "" }],

    // Step 4: Social Proof
    testimonials: editData?.testimonials || [{ name: "", role: "", text: "", image: "" }],
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
    if (arr.length <= 1) return;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const webinarUrl = responseData?.webinarUrl || "";
      const slug = responseData?.webinar?.slug || "";

      if (webinarUrl || slug) {
        setCreatedUrl(webinarUrl || `/w/${slug}`);
      } else {
        navigate("/dashboard");
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
          <h1 style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</h1>
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

        <form onSubmit={handleSubmit} autoComplete="off">

          {/* ===== STEP 1: BASICS ===== */}
          {currentStep === 1 && (
            <>
              {/* Template Picker */}
              {availableTemplates.length > 0 && (
                <>
                  <h2>Choose Template</h2>
                  <div style={{ display: "flex", gap: "14px", marginBottom: "28px", overflowX: "auto", paddingBottom: "8px" }}>
                    {availableTemplates.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTemplate(t._id)}
                        style={{
                          minWidth: "160px", padding: "14px", borderRadius: "14px", cursor: "pointer",
                          border: selectedTemplate === t._id ? "2px solid #6574e9" : "1px solid #e5e7eb",
                          background: selectedTemplate === t._id ? "rgba(101,116,233,0.04)" : "#fafafa",
                          textAlign: "center", transition: "all 0.2s ease",
                        }}
                      >
                        {t.thumbnail ? (
                          <img src={t.thumbnail} alt={t.name} style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />
                        ) : (
                          <div style={{ width: "100%", height: "80px", background: "#e5e7eb", borderRadius: "8px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.8rem" }}>{t.name}</div>
                        )}
                        <div style={{ fontWeight: "600", fontSize: "0.88rem", color: "#1a1a35" }}>{t.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#6b7280", textTransform: "uppercase", marginTop: "2px" }}>{t.minTier}</div>
                        {selectedTemplate === t._id && <div style={{ fontSize: "0.72rem", color: "#6574e9", fontWeight: "600", marginTop: "4px" }}>Selected</div>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="grid">
                <input name="title" value={formData.title} placeholder="Webinar Title *" required onChange={handleChange} />
                <input name="subtitle" value={formData.subtitle} placeholder="Subtitle / Tagline" onChange={handleChange} />
              </div>

              <input name="slug" value={formData.slug} placeholder="URL Slug (auto-generated if empty, e.g. yoga-masterclass)" onChange={handleChange} style={{ marginBottom: "16px" }} />

              <textarea name="description" value={formData.description} placeholder="Full Description *" required onChange={handleChange} rows={4} />

              <h2>Categories *</h2>
              <div className="category-grid">
                {categoriesList.map(cat => (
                  <div key={cat} className={`category ${formData.categories.includes(cat) ? "active-cat" : ""}`} onClick={() => handleCategoryChange(cat)}>
                    {cat}
                  </div>
                ))}
              </div>

              <h2>Pricing</h2>
              <div className="toggle pricing-toggle">
                <button type="button" className={formData.pricingType === "free" ? "active-btn" : ""} onClick={() => setFormData({ ...formData, pricingType: "free" })}>Free</button>
                <button type="button" className={formData.pricingType === "paid" ? "active-btn" : ""} onClick={() => setFormData({ ...formData, pricingType: "paid" })}>Paid</button>
              </div>

              <div className="grid">
                {formData.pricingType === "paid" && (
                  <>
                    <input name="price" value={formData.price} type="number" placeholder="Price (₹) *" required onChange={handleChange} />
                    <input name="originalPrice" value={formData.originalPrice} type="number" placeholder="Original Price (₹) for strikethrough" onChange={handleChange} />
                  </>
                )}
                <input name="webinarDateTime" value={formData.webinarDateTime} type="datetime-local" required onChange={handleChange} />
                <input name="durationMinutes" value={formData.durationMinutes} type="number" placeholder="Duration (Minutes) *" required onChange={handleChange} />
              </div>

              <div className="grid">
                <input name="registrationDeadline" value={formData.registrationDeadline} type="datetime-local" onChange={handleChange} placeholder="Registration Deadline" />
                <input name="maxSeats" value={formData.maxSeats} type="number" placeholder="Max Seats" onChange={handleChange} />
                <input name="language" value={formData.language} placeholder="Language" onChange={handleChange} />
              </div>

              <div className="grid">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", color: "#6b7280" }}>Banner Image {formData.bannerImageFile ? `(${formData.bannerImageFile.name})` : ""}</label>
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) setFormData({ ...formData, bannerImageFile: e.target.files[0], bannerImage: "" }); }} style={{ fontSize: "13px" }} />
                </div>
                <input name="meetingLink" value={formData.meetingLink} placeholder="Meeting Link (Zoom/Google Meet)" onChange={handleChange} />
              </div>

              <div className="toggle">
                <button type="button" className={formData.status === "draft" ? "active-btn" : ""} onClick={() => setFormData({ ...formData, status: "draft" })}>Draft</button>
                <button type="button" className={formData.status === "published" ? "active-btn" : ""} onClick={() => setFormData({ ...formData, status: "published" })}>Published</button>
              </div>
            </>
          )}

          {/* ===== STEP 2: SPEAKER ===== */}
          {currentStep === 2 && (
            <>
              <h2>Speaker / Host Details</h2>
              <div className="grid">
                <input name="speakerName" value={formData.speakerName} placeholder="Speaker Full Name" onChange={handleChange} />
                <input name="speakerImage" value={formData.speakerImage} placeholder="Speaker Image URL" onChange={handleChange} />
              </div>

              <textarea name="speakerBio" value={formData.speakerBio} placeholder="Speaker Bio / Credentials (e.g. 10+ years in Digital Marketing, TEDx Speaker...)" onChange={handleChange} rows={3} />

              <h2>Social Links</h2>
              <div className="grid">
                <input placeholder="Instagram URL" value={formData.speakerSocials.instagram} onChange={(e) => setFormData({ ...formData, speakerSocials: { ...formData.speakerSocials, instagram: e.target.value } })} />
                <input placeholder="YouTube URL" value={formData.speakerSocials.youtube} onChange={(e) => setFormData({ ...formData, speakerSocials: { ...formData.speakerSocials, youtube: e.target.value } })} />
                <input placeholder="LinkedIn URL" value={formData.speakerSocials.linkedin} onChange={(e) => setFormData({ ...formData, speakerSocials: { ...formData.speakerSocials, linkedin: e.target.value } })} />
                <input placeholder="Twitter / X URL" value={formData.speakerSocials.twitter} onChange={(e) => setFormData({ ...formData, speakerSocials: { ...formData.speakerSocials, twitter: e.target.value } })} />
                <input placeholder="Personal Website" value={formData.speakerSocials.website} onChange={(e) => setFormData({ ...formData, speakerSocials: { ...formData.speakerSocials, website: e.target.value } })} />
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
                <button type="submit"
                  style={{ padding: "14px 32px", background: "linear-gradient(135deg, #6574e9, #4f5cd4)", border: "none", borderRadius: "10px", color: "white", cursor: "pointer", fontWeight: "700", fontSize: "16px" }}>
                  {isEditMode ? "Update Webinar" : "Create Webinar"} 🚀
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
