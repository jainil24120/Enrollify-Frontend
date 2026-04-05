// ================= ENROLLIFY CREATE WEBINAR FORM =================

import { useState, useEffect } from "react";
import "./CreateWebinar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { createWebinarAPI, updateWebinarAPI } from "../api/webinarApi";
import { getClientSubscriptionAPI } from "../api/clientApi";

function CreateWebinar() {

  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.webinarToEdit;
  const isEditMode = !!editData;

  const [errorMsg, setErrorMsg] = useState("");
  const [subscriptionId, setSubscriptionId] = useState(null);

  // Fetch active subscription from backend
  useEffect(() => {
    const fetchSub = async () => {
      try {
        const data = await getClientSubscriptionAPI();
        if (data?.subscription?._id) {
          setSubscriptionId(data.subscription._id);
        } else if (data?.subscription) {
          setSubscriptionId(data.subscription);
        }
      } catch (err) {
        console.error("Failed to fetch subscription:", err);
      }
    };
    fetchSub();
  }, []);

  const [formData, setFormData] = useState({
    title: editData?.title || "",
    subtitle: editData?.subtitle || "",
    description: editData?.description || "",
    categories: editData?.categories || [],
    price: editData ? (typeof editData.price === 'string' ? editData.price.replace(/[^0-9]/g, '') : editData.price) : 0,
    pricingType: editData?.price === "Free" || editData?.price === 0 ? "free" : "paid",
    webinarDateTime: editData?.date ? new Date(editData.date).toISOString().slice(0, 16) : "",
    durationMinutes: editData?.durationMinutes || "60",
    language: editData?.language || "English",
    maxSeats: editData?.totalSeats || "",
    bannerImage: editData?.bannerImage || "",
    meetingLink: editData?.meetingLink || "",
    status: editData?.status?.toLowerCase() || "published",
  });

  // If editData is the mock data format, try to reconcile specific fields
  useEffect(() => {
    if (editData && !formData.webinarDateTime && editData.date !== "TBD") {
        // Mock dates like "24 April 2024" aren't ISO, but we'll try to set them if possible
        // For now, if it fails, the user can just re-select.
        try {
            const d = new Date(editData.date);
            if (!isNaN(d.getTime())) {
                setFormData(prev => ({ ...prev, webinarDateTime: d.toISOString().slice(0, 16) }));
            }
        } catch (e) {}
    }
  }, [editData]);

  const categoriesList = [
    "Marketing", "Business", "Technology", "Finance",
    "Startup", "Design", "Health", "Education"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (cat) => {
    if (formData.categories.includes(cat)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c !== cat)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, cat]
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const form = e.target.form;
      if (!form) return;
      const index = Array.from(form.elements).indexOf(e.target);
      if (index > -1 && index < form.elements.length - 1) {
        e.preventDefault();
        let nextIndex = index + 1;
        // Skip buttons that aren't submit
        while(nextIndex < form.elements.length && 
              (form.elements[nextIndex].tagName === "BUTTON" && form.elements[nextIndex].type !== "submit" || 
               form.elements[nextIndex].type === "hidden")) {
          nextIndex++;
        }
        if (form.elements[nextIndex]) form.elements[nextIndex].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const token = localStorage.getItem("token") || "";

    if (!subscriptionId) {
      setErrorMsg("No active subscription found. Please purchase a plan first.");
      return;
    }
    const subId = subscriptionId;

    const finalData = {
      title: formData.title,
      subtitle: formData.subtitle || "",
      description: formData.description,
      webinarDateTime: formData.webinarDateTime,
      durationMinutes: formData.durationMinutes,
      meetingLink: formData.meetingLink || "",
      categories: formData.categories || [],
      subscriptionId: subId,
      subscription: subId,
      subscription_id: subId,
      price: formData.pricingType === "free" ? "0" : (formData.price || "99"),
      maxSeats: formData.maxSeats || "",
      language: formData.language || "English",
    };

    // Attach banner image file if selected
    if (formData.bannerImageFile) {
      finalData.bannerImageFile = formData.bannerImageFile;
    } else if (formData.bannerImage) {
      finalData.bannerImage = formData.bannerImage;
    }

    console.log("--- CREATE WEBINAR FINAL PAYLOAD ---", finalData);

    try {
      let responseData;
      if (isEditMode) {
        responseData = await updateWebinarAPI(editData.id, finalData, token);
        console.log("Webinar Updated:", responseData);
      } else {
        responseData = await createWebinarAPI(finalData, token);
        console.log("Webinar Created:", responseData);
      }
      
      const createdId = responseData?.webinar?._id || responseData?._id || responseData?.data?._id || editData?.id;
      if (createdId) {
        finalData._id = createdId;
        finalData.id = createdId;
        localStorage.setItem("currentWebinarId", createdId);
      }

      localStorage.setItem("webinarData", JSON.stringify(finalData));
      navigate("/template");
    } catch (error) {
      console.warn("API Error:", error);
      const isMissingProfile = error.message && error.message.includes("create your client profile first");
      
      if (isMissingProfile) {
        setErrorMsg("One-time Profile Setup Required! Redirecting to registration...");
        setTimeout(() => {
          navigate("/client-form");
        }, 3000);
      } else {
        setErrorMsg(error.message || `Failed to ${isEditMode ? 'update' : 'create'} webinar. Please try again.`);
      }
    }
  };

  return (
    <div className="webinar-wrapper">

      <div className="form-card">

        <h1>{isEditMode ? "Edit Your Webinar ✏️" : "Create Your Webinar 🎤"}</h1>

        {errorMsg && (
          <div style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "15px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: "600", textAlign: "center" }}>
            ❌ Error: {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">

          <div className="grid">
            <input name="title" value={formData.title} placeholder="Title *" required onChange={handleChange} onKeyDown={handleKeyDown} />
            <input name="subtitle" value={formData.subtitle} placeholder="Subtitle" onChange={handleChange} onKeyDown={handleKeyDown} />
          </div>

          <textarea
            name="description"
            value={formData.description}
            placeholder="Description *"
            required
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <h2>Select Categories *</h2>

          <div className="category-grid">
            {categoriesList.map(cat => (
              <div
                key={cat}
                className={`category ${formData.categories.includes(cat) ? "active-cat" : ""}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </div>
            ))}
          </div>

          <h2>Pricing Model *</h2>
          <div className="toggle pricing-toggle">
            <button type="button"
              className={formData.pricingType === "free" ? "active-btn" : ""}
              onClick={() => setFormData({ ...formData, pricingType: "free" })}>
              Free Webinar
            </button>
            <button type="button"
              className={formData.pricingType === "paid" ? "active-btn" : ""}
              onClick={() => setFormData({ ...formData, pricingType: "paid" })}>
              Paid Webinar
            </button>
          </div>

          <div className="grid">
            {formData.pricingType === "paid" && (
              <input name="price" value={formData.price} type="number" placeholder="Set Price (₹)" required onChange={handleChange} onKeyDown={handleKeyDown} />
            )}
            <input name="webinarDateTime" value={formData.webinarDateTime} type="datetime-local" required onChange={handleChange} onKeyDown={handleKeyDown} />
            <input name="durationMinutes" value={formData.durationMinutes} type="number" placeholder="Duration (Minutes)*" required onChange={handleChange} onKeyDown={handleKeyDown} />
            <input name="maxSeats" value={formData.maxSeats} type="number" placeholder="Max Seats" onChange={handleChange} onKeyDown={handleKeyDown} />
          </div>

          <div className="grid">
            <input name="language" value={formData.language} placeholder="Language" onChange={handleChange} onKeyDown={handleKeyDown} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                Banner Image {formData.bannerImageFile ? `(${formData.bannerImageFile.name})` : ''}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setFormData({ ...formData, bannerImageFile: e.target.files[0], bannerImage: "" });
                  }
                }}
                style={{ fontSize: '13px' }}
              />
            </div>
            <input name="meetingLink" value={formData.meetingLink} placeholder="Meeting Link" onChange={handleChange} onKeyDown={handleKeyDown} />
          </div>

          <div className="toggle">
            <button type="button"
              className={formData.status === "draft" ? "active-btn" : ""}
              onClick={() => setFormData({ ...formData, status: "draft" })}>
              Draft
            </button>
            <button type="button"
              className={formData.status === "published" ? "active-btn" : ""}
              onClick={() => setFormData({ ...formData, status: "published" })}>
              Published
            </button>
          </div>

          <button type="submit">Create Webinar 🚀</button>

        </form>

      </div>
    </div>
  );
}

export default CreateWebinar;