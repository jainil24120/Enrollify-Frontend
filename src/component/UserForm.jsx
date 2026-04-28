import React, { useState, useEffect } from "react";
import { User, Mail, MapPin, Phone, CreditCard, ArrowRight, CheckCircle2, Tag } from "lucide-react";
import "./UserForm.css";
import { registerUserAPI, verifyPaymentAPI, validateCouponAPI } from "../api/userApi";

// Capture UTM + referrer from URL on first load (also persists via sessionStorage so navigation doesn't lose them)
const captureUtm = () => {
  try {
    const cached = sessionStorage.getItem("utmData");
    if (cached) return JSON.parse(cached);

    const params = new URLSearchParams(window.location.search);
    const utm = {
      source: params.get("utm_source") || "",
      medium: params.get("utm_medium") || "",
      campaign: params.get("utm_campaign") || "",
      term: params.get("utm_term") || "",
      content: params.get("utm_content") || "",
      referrer: document.referrer || "",
      landingUrl: window.location.href,
    };
    sessionStorage.setItem("utmData", JSON.stringify(utm));
    return utm;
  } catch {
    return {};
  }
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function UserForm() {
  // Check if user is logged in
  const token = localStorage.getItem("token");
  const storedUser = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("userData")) || null;
      // Don't pre-fill if logged in as client/admin (they're not the attendee)
      if (u && (u.role === "client" || u.role === "admin")) return null;
      return u;
    } catch {
      return null;
    }
  })();
  const isLoggedIn = !!(token && storedUser);

  const [formData, setFormData] = useState({
    firstName: storedUser?.firstname || "",
    lastName: storedUser?.lastname || "",
    email: storedUser?.email || "",
    city: "",
    phone: storedUser?.phone || "",
    paymentMethod: "upi",
    upiId: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const webinarData = JSON.parse(localStorage.getItem("webinarData")) || {};
  const price = webinarData.price || "0";
  const isPaid = price !== "0" && price !== 0;
  const webinarId = webinarData.id || webinarData._id || localStorage.getItem("currentWebinarId") || "";

  // Custom fields defined by the host on this webinar
  const customFields = Array.isArray(webinarData.customFields) ? webinarData.customFields : [];

  // Custom field responses (keyed by fieldId)
  const [customResponses, setCustomResponses] = useState({});

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState(null); // null | "checking" | "valid" | "invalid"
  const [couponInfo, setCouponInfo] = useState(null); // { discountAmount, finalPrice, message }
  const [couponError, setCouponError] = useState("");

  // UTM captured once on mount
  const [utmData] = useState(() => captureUtm());

  const handleCustomChange = (fieldId, value) => {
    setCustomResponses((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleCustomCheckbox = (fieldId, option, checked) => {
    setCustomResponses((prev) => {
      const current = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      const next = checked ? [...current, option] : current.filter((o) => o !== option);
      return { ...prev, [fieldId]: next };
    });
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Enter a coupon code");
      return;
    }
    setCouponError("");
    setCouponStatus("checking");
    try {
      const res = await validateCouponAPI({ code, webinarId });
      if (res.valid) {
        setCouponStatus("valid");
        setCouponInfo({
          discountAmount: res.discountAmount,
          finalPrice: res.finalPrice,
          message: res.message || `${res.discountAmount} off applied`,
        });
      } else {
        setCouponStatus("invalid");
        setCouponInfo(null);
        setCouponError(res.message || "Invalid coupon");
      }
    } catch (err) {
      setCouponStatus("invalid");
      setCouponInfo(null);
      setCouponError(err.message || "Could not validate coupon");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const form = e.target.form;
      if (!form) return;
      const index = Array.from(form.elements).indexOf(e.target);
      if (index > -1 && index < form.elements.length - 1) {
        e.preventDefault();
        let nextIndex = index + 1;
        while (nextIndex < form.elements.length &&
          (form.elements[nextIndex].tagName === "BUTTON" && form.elements[nextIndex].type !== "submit" ||
            form.elements[nextIndex].type === "hidden" ||
            form.elements[nextIndex].type === "radio" ||
            form.elements[nextIndex].disabled)) {
          nextIndex++;
        }
        if (form.elements[nextIndex]) form.elements[nextIndex].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let newErrors = {};
    const upiRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,64}$/;
    const cardRegex = /^[0-9]{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    const cvvRegex = /^[0-9]{3,4}$/;

    // Validate required fields for guests
    if (!isLoggedIn) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    }

    // Validate required custom fields
    customFields.forEach((field) => {
      if (!field.required) return;
      const val = customResponses[field.fieldId];
      const empty = val === undefined || val === null || val === "" ||
        (Array.isArray(val) && val.length === 0);
      if (empty) newErrors[`cf_${field.fieldId}`] = `${field.label} is required`;
    });

    if (isPaid) {
      if (formData.paymentMethod === "upi") {
        if (!formData.upiId || formData.upiId.trim() === "") {
          newErrors.upiId = "UPI ID is required";
        } else if (!upiRegex.test(formData.upiId)) {
          newErrors.upiId = "Invalid UPI ID (e.g. name@bank)";
        }
      } else if (formData.paymentMethod === "card") {
        if (!cardRegex.test(formData.cardNumber.replace(/\s/g, ''))) {
          newErrors.cardNumber = "Valid 16-digit card required";
        }
        if (!expiryRegex.test(formData.cardExpiry)) {
          newErrors.cardExpiry = "Valid MM/YY required";
        }
        if (!cvvRegex.test(formData.cardCvv)) {
          newErrors.cardCvv = "Valid 3-4 digit CVV required";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const registrationPayload = {
      webinarId: webinarId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      paymentMethod: formData.paymentMethod,
      upiId: formData.upiId,
      cardNumber: formData.cardNumber,
      customResponses,
      utm: utmData,
      ...(couponStatus === "valid" && couponCode ? { couponCode: couponCode.trim().toUpperCase() } : {}),
      // Link to existing user account if logged in
      ...(isLoggedIn && storedUser?.id ? { userId: storedUser.id } : {})
    };

    try {
      const response = await registerUserAPI(registrationPayload);

      if (response.already) {
        setErrors({ api: "You are already registered for this webinar." });
        setIsLoading(false);
        return;
      }

      if (response.type === "free") {
        setSubmitted(true);
      } else if (response.type === "paid") {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          setErrors({ api: "Failed to load Razorpay SDK. Please check your connection." });
          setIsLoading(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_SSXUTDOiQwjhed",
          amount: response.amount,
          currency: "INR",
          name: "Enrollify",
          description: "Webinar Registration Payment",
          order_id: response.orderId,
          handler: async function (paymentResponse) {
            try {
              const verifyPayload = {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                webinarId: response.webinarId,
                guestData: response.guestData
              };
              await verifyPaymentAPI(verifyPayload);
              setSubmitted(true);
            } catch (err) {
              setErrors({ api: err.message || "Payment verification failed. Please contact support." });
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: "#0284c7"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function () {
          setErrors({ api: "Payment failed. Please try again." });
          setIsLoading(false);
        });
        rzp.open();
      } else {
        setSubmitted(true);
      }
    } catch (error) {
      setErrors({ api: error.message || "Registration failed. Please try again." });
    }
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <div className="registration-success-wrapper">
        <div className="success-card">
          <div className="success-icon-circle">
            <CheckCircle2 size={48} color="#16a34a" />
          </div>
          <h1>Registration Successful!</h1>
          <p>
            {isPaid
              ? "Thank you for your payment. You will receive a confirmation email with the joining details shortly."
              : "You have successfully registered for free. The joining link will be sent to your email."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {webinarData?.slug && (
              <button className="back-home-btn" onClick={() => window.location.href = `/w/${webinarData.slug}`}>
                View Webinar Page
              </button>
            )}
            <button className="back-home-btn" style={{ background: "#f3f4f6", color: "#374151" }} onClick={() => window.location.href = "/"}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-form-wrapper">
      <div className="user-form-card">
        <div className="form-header">
          <h1>{isPaid ? "Complete Your Registration" : "Free Registration"}</h1>
          <p>{isPaid ? "Join the masterclass and unlock your potential" : "Grab your free spot before it's gone!"}</p>
        </div>

        {/* Show logged-in user info summary instead of re-asking */}
        {isLoggedIn && (
          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} color="#3b82f6" />
              <span style={{ fontWeight: '600', color: '#3b82f6', fontSize: '14px' }}>Registering as</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
              {formData.firstName} {formData.lastName}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              {formData.email} {formData.phone ? `| ${formData.phone}` : ""}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="premium-form" autoComplete="off">
          {/* Only show name/email/phone fields for guests (not logged-in users) */}
          {!isLoggedIn && (
            <>
              <div className="form-grid">
                <div className="input-group">
                  <label><User size={16} /> First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    placeholder="First Name"
                    required
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className={errors.firstName ? "input-error" : ""}
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>
                <div className="input-group">
                  <label><User size={16} /> Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    placeholder="Last Name"
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              <div className="input-group">
                <label><Mail size={16} /> Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="Email Address"
                  required
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="input-group">
                <label><Phone size={16} /> Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  placeholder="Phone Number"
                  required
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={errors.phone ? "input-error" : ""}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </>
          )}

          {/* City is always shown - not part of user profile */}
          <div className="input-group">
            <label><MapPin size={16} /> City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              placeholder="City"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* ===== HOST-DEFINED CUSTOM FIELDS ===== */}
          {customFields.length > 0 && (
            <div className="custom-fields-block">
              {customFields
                .slice()
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((field) => {
                  const errKey = `cf_${field.fieldId}`;
                  const errClass = errors[errKey] ? "input-error" : "";
                  const value = customResponses[field.fieldId] ?? "";

                  if (field.type === "textarea") {
                    return (
                      <div key={field.fieldId} className="input-group">
                        <label>{field.label}{field.required ? " *" : ""}</label>
                        <textarea
                          rows={3}
                          value={value}
                          placeholder={field.placeholder || ""}
                          onChange={(e) => handleCustomChange(field.fieldId, e.target.value)}
                          className={errClass}
                        />
                        {field.helpText && <small style={{ color: "#6b7280" }}>{field.helpText}</small>}
                        {errors[errKey] && <span className="error-text">{errors[errKey]}</span>}
                      </div>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <div key={field.fieldId} className="input-group">
                        <label>{field.label}{field.required ? " *" : ""}</label>
                        <select
                          value={value}
                          onChange={(e) => handleCustomChange(field.fieldId, e.target.value)}
                          className={errClass}
                        >
                          <option value="">Select...</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        {field.helpText && <small style={{ color: "#6b7280" }}>{field.helpText}</small>}
                        {errors[errKey] && <span className="error-text">{errors[errKey]}</span>}
                      </div>
                    );
                  }

                  if (field.type === "radio") {
                    return (
                      <div key={field.fieldId} className="input-group">
                        <label>{field.label}{field.required ? " *" : ""}</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                          {(field.options || []).map((opt) => (
                            <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                              <input
                                type="radio"
                                name={`cf_${field.fieldId}`}
                                value={opt}
                                checked={value === opt}
                                onChange={() => handleCustomChange(field.fieldId, opt)}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                        {field.helpText && <small style={{ color: "#6b7280" }}>{field.helpText}</small>}
                        {errors[errKey] && <span className="error-text">{errors[errKey]}</span>}
                      </div>
                    );
                  }

                  if (field.type === "checkbox") {
                    const arr = Array.isArray(customResponses[field.fieldId]) ? customResponses[field.fieldId] : [];
                    return (
                      <div key={field.fieldId} className="input-group">
                        <label>{field.label}{field.required ? " *" : ""}</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                          {(field.options || []).map((opt) => (
                            <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                value={opt}
                                checked={arr.includes(opt)}
                                onChange={(e) => handleCustomCheckbox(field.fieldId, opt, e.target.checked)}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                        {field.helpText && <small style={{ color: "#6b7280" }}>{field.helpText}</small>}
                        {errors[errKey] && <span className="error-text">{errors[errKey]}</span>}
                      </div>
                    );
                  }

                  // text | number | email | tel
                  return (
                    <div key={field.fieldId} className="input-group">
                      <label>{field.label}{field.required ? " *" : ""}</label>
                      <input
                        type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
                        value={value}
                        placeholder={field.placeholder || ""}
                        onChange={(e) => handleCustomChange(field.fieldId, e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={errClass}
                      />
                      {field.helpText && <small style={{ color: "#6b7280" }}>{field.helpText}</small>}
                      {errors[errKey] && <span className="error-text">{errors[errKey]}</span>}
                    </div>
                  );
                })}
            </div>
          )}

          {/* ===== COUPON CODE (only for paid webinars) ===== */}
          {isPaid && (
            <div className="input-group">
              <label><Tag size={16} /> Coupon Code (optional)</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={couponCode}
                  placeholder="Enter coupon"
                  onChange={(e) => { setCouponCode(e.target.value); setCouponStatus(null); setCouponInfo(null); setCouponError(""); }}
                  style={{ flex: 1, textTransform: "uppercase" }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponStatus === "checking" || !couponCode.trim()}
                  style={{ padding: "0 16px", background: "#6574e9", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                >
                  {couponStatus === "checking" ? "Checking..." : "Apply"}
                </button>
              </div>
              {couponStatus === "valid" && couponInfo && (
                <small style={{ color: "#16a34a", marginTop: "4px", display: "block" }}>
                  ✓ {couponInfo.message} (Final: ₹{couponInfo.finalPrice})
                </small>
              )}
              {couponError && <span className="error-text">{couponError}</span>}
            </div>
          )}

          {isPaid && (
            <>
              <div className="input-group">
                <label><CreditCard size={16} /> Payment Method</label>
                <div className="payment-options">
                  <label className={`payment-option ${formData.paymentMethod === 'upi' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleChange}
                    />
                    <span>UPI</span>
                  </label>
                  <label className={`payment-option ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                    />
                    <span>Card</span>
                  </label>
                </div>
              </div>

              {formData.paymentMethod === "upi" && (
                <div className="input-group animate-reveal">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    placeholder="Enter UPI ID"
                    required
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className={errors.upiId ? "input-error" : ""}
                  />
                  {errors.upiId && <span className="error-text">{errors.upiId}</span>}
                </div>
              )}

              {formData.paymentMethod === "card" && (
                <div className="card-details-grid animate-reveal">
                  <div className="input-group" style={{ gridColumn: "span 2" }}>
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      placeholder="Card Number"
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      className={errors.cardNumber ? "input-error" : ""}
                    />
                    {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                  </div>
                  <div className="input-group">
                    <label>Expiry (MM/YY)</label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      placeholder="MM/YY"
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      className={errors.cardExpiry ? "input-error" : ""}
                    />
                    {errors.cardExpiry && <span className="error-text">{errors.cardExpiry}</span>}
                  </div>
                  <div className="input-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      name="cardCvv"
                      value={formData.cardCvv}
                      placeholder="CVV"
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      className={errors.cardCvv ? "input-error" : ""}
                    />
                    {errors.cardCvv && <span className="error-text">{errors.cardCvv}</span>}
                  </div>
                </div>
              )}
            </>
          )}

          {errors.api && (
            <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.9rem', marginBottom: '16px', fontWeight: '500', textAlign: 'center' }}>
              {errors.api}
            </div>
          )}

          <button type="submit" className="complete-reg-btn" disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : isPaid ? "Complete Registration" : "Register For Free"
            } {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="form-footer">
          By registering, you agree to our <span>Terms</span> and <span>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

export default UserForm;
