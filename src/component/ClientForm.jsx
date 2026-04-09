// ================= ENROLLIFY ULTRA SECURE CLIENT FORM =================

import React, { useState, useEffect } from "react";
import "./ClientForm.css";
import { useNavigate } from "react-router-dom";
import { registerClientProfileAPI, createOrderAPI, verifyPaymentAPI } from "../api/clientApi";
import { API_BASE } from "../api/config.js";

function ClientForm() {
  const navigate = useNavigate();

  const [paymentMode, setPaymentMode] = useState("bank");
  const [success, setSuccess] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");
  const [planIds, setPlanIds] = useState({});

  // Fetch actual subscription plan IDs from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/subscriptions`);
        if (res.ok) {
          const result = await res.json();
          const plans = Array.isArray(result) ? result : result.data || [];
          const ids = {};
          for (const plan of plans) {
            const key = plan.name?.toLowerCase();
            if (key) ids[key] = plan._id;
          }
          setPlanIds(ids);
        }
      } catch (err) {
        console.error("Failed to fetch subscription plans:", err);
      }
    };
    fetchPlans();
  }, []);

  // Dynamically load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const form = e.target.form;
      if (!form) return;
      const index = Array.from(form.elements).indexOf(e.target);
      if (index > -1 && index < form.elements.length - 1) {
        e.preventDefault();
        // Skip hidden inputs or elements that shouldn't be focused
        let nextIndex = index + 1;
        while (nextIndex < form.elements.length &&
          (form.elements[nextIndex].tagName === "BUTTON" && form.elements[nextIndex].type !== "submit" ||
            form.elements[nextIndex].type === "hidden")) {
          nextIndex++;
        }
        if (form.elements[nextIndex]) form.elements[nextIndex].focus();
      }
    }
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    subdomain: "",
    phone: "",
    email: "",
    gst: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
    upi: "",
  });

  const [errors, setErrors] = useState({});
  const [subdomainStatus, setSubdomainStatus] = useState(null); // null | "checking" | "available" | "taken"

  // Live subdomain availability check
  useEffect(() => {
    const raw = formData.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "");
    if (raw.length < 3) { setSubdomainStatus(null); return; }

    setSubdomainStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${API_BASE}/api/clientprofile/check-subdomain?subdomain=${raw}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setSubdomainStatus(data.available ? "available" : "taken");
      } catch {
        setSubdomainStatus(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.subdomain]);

  const regex = {
    name: /^[A-Za-z]+$/,
    phone: /^[0-9]{10}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    accountNumber: /^[0-9]{9,18}$/,
    upi: /^[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,64}$/,
  };

  const validateField = (name, value) => {
    let error = "";

    if (name !== "gst" && value.trim() === "") {
      if (name === "upi" && paymentMode !== "upi") {
        // Skip empty check for UPI if payment mode is not UPI
      } else if (["accountHolder", "accountNumber", "ifsc", "bankName"].includes(name) && paymentMode !== "bank") {
        // Skip empty check for bank fields if payment mode is not bank
      } else {
        error = "This field is mandatory";
      }
    }

    if (name === "firstName" || name === "lastName") {
      if (!regex.name.test(value)) error = "Only alphabets allowed";
    }

    if (name === "phone") {
      if (!regex.phone.test(value)) error = "Enter valid 10 digit phone";
    }

    if (name === "email") {
      if (!regex.email.test(value)) error = "Invalid email format";
    }

    if (name === "ifsc" && paymentMode === "bank" && value.trim() !== "") {
      if (!regex.ifsc.test(value)) error = "Invalid IFSC (e.g. ABCD0123456)";
    }

    if (name === "accountNumber" && paymentMode === "bank" && value.trim() !== "") {
      if (!regex.accountNumber.test(value)) error = "Must be 9-18 digits";
    }

    if (name === "upi" && paymentMode === "upi" && value.trim() !== "") {
      if (!regex.upi.test(value)) error = "Invalid UPI ID (e.g. name@bank)";
    }



    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = (e) => {
    e.preventDefault();




    let newErrors = {};

    // ===== SUBDOMAIN VALIDATION =====
    const cleanSub = formData.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (cleanSub.length < 3) {
      newErrors.subdomain = "Subdomain must be at least 3 characters";
    }
    if (subdomainStatus === "taken") {
      newErrors.subdomain = "This subdomain is already taken";
    }

    // ===== BASIC FIELDS VALIDATION =====
    const basicFields = [
      "firstName",
      "lastName",
      "organization",
      "phone",
      "email",
    ];

    basicFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // GST optional → validate only if filled
    if (formData.gst.trim() !== "") {
      const error = validateField("gst", formData.gst);
      if (error) newErrors.gst = error;
    }

    // ===== PAYMENT MODE BASED VALIDATION =====
    if (paymentMode === "bank") {
      const bankFields = [
        "accountHolder",
        "accountNumber",
        "ifsc",
        "bankName",
      ];

      bankFields.forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
    }

    if (paymentMode === "upi") {
      const error = validateField("upi", formData.upi);
      if (error) newErrors.upi = error;
    }

    setErrors(newErrors);

    // ===== SUCCESS CONDITION (Create Order -> Payment -> Verify) =====
    if (Object.keys(newErrors).length === 0) {
      const startPaymentProcess = async () => {
        try {
          const planIntent = (localStorage.getItem("selectedPlanIntent") || "growth").toLowerCase();

          const selectedPlanId = planIds[planIntent];
          if (!selectedPlanId) {
            setErrorStatus("Subscription plan not found. Please go back and select a plan.");
            return;
          }

          const profilePayload = {
            subscriptionId: selectedPlanId,
            subscription: selectedPlanId,
            subscription_id: selectedPlanId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            Organization_Name: formData.organization,
            subdomain: formData.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ""),
            phone: formData.phone,
            upiId: formData.upi,
            gstNumber: formData.gst,
            email: formData.email,
            paymentMode
          };

          console.log("--- CLIENT PROFILE FINAL PAYLOAD ---", profilePayload);

          console.log("Submitting Client Profile and Creating Order with Backend Schema:", profilePayload);

          // 1. Create order
          const orderResponse = await createOrderAPI(profilePayload);

          if (!orderResponse || !orderResponse.orderId) {
            throw new Error("Failed to create order");
          }

          // 2. Load Razorpay and open checkout
          const isLoaded = await loadRazorpay();
          if (!isLoaded) {
            setErrorStatus("Razorpay SDK failed to load. Are you online?");
            return;
          }

          const options = {
            key: "rzp_test_SSXUTDOiQwjhed",
            amount: orderResponse.amount,
            currency: orderResponse.currency || "INR",
            name: "Enrollify",
            description: `Payment for ${planIntent} plan`,
            order_id: orderResponse.orderId,
            handler: async (response) => {
              try {
                // 3. Verify Payment
                // Elevate subscription selectors to top level as required by backend
                const verifyRes = await verifyPaymentAPI({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  subscriptionId: profilePayload.subscriptionId,
                  subscription: profilePayload.subscription,
                  subscription_id: profilePayload.subscriptionId, // Explicit top-level snake_case
                  profileData: profilePayload
                });

                if (verifyRes.success || verifyRes) {
                  setSuccess(true);
                  localStorage.removeItem("selectedPlanIntent");
                  setTimeout(() => navigate("/dashboard"), 2000);
                }
              } catch (err) {
                console.error("Payment Verification Failed:", err);
                setErrorStatus(err.message || "Payment verification failed");
              }
            },
            prefill: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              contact: formData.phone,
            },
            theme: { color: "#3c67ff" },
          };

          const rzp1 = new window.Razorpay(options);
          rzp1.open();

        } catch (error) {
          console.error("Payment Process Error:", error);
          setErrorStatus(error.message || "Something went wrong. Please try again.");

          // Fallback simulation if backend really isn't ready (optional, but following user's "backend solve kr diya" we should trust API)
          /* 
          localStorage.setItem("clientProfile", JSON.stringify({ ...formData, paymentMode }));
          setSuccess(true);
          setTimeout(() => navigate("/create-webinar"), 2000);
          */
        }
      };
      startPaymentProcess();
    }
  };

  if (success) {
    return (
      <div className="success-screen">
        <h1>🎉 Payment Successful!</h1>
        <p>Your Enrollify account is activated.</p>
      </div>
    );
  }

  return (
    <div className="client-wrapper">

      <div className="form-card">

        <h1>Secure Registration & Payment 🔐</h1>

        <div className="step-indicator">
          <div className="step active">1</div>
          <div className="line"></div>
          <div className="step active">2</div>
          <div className="line"></div>
          <div className="step active">3</div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">

          <div className="grid">
            {["firstName", "lastName", "organization", "phone", "email", "gst"].map((field) => (
              <div key={field} className="input-group">
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)} ${field !== "gst" ? "*" : "(Optional)"}`}
                />
                {errors[field] && <span>{errors[field]}</span>}
              </div>
            ))}
          </div>

          <h2>Choose Your Subdomain</h2>
          <div className="subdomain-picker">
            <div className="subdomain-input-row">
              <span className="subdomain-prefix">https://</span>
              <input
                type="text"
                name="subdomain"
                value={formData.subdomain}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="yourname"
                className="subdomain-field"
              />
              <span className="subdomain-suffix">.enrollify.in</span>
            </div>
            {subdomainStatus === "checking" && <p className="subdomain-msg checking">Checking availability...</p>}
            {subdomainStatus === "available" && <p className="subdomain-msg available">This subdomain is available!</p>}
            {subdomainStatus === "taken" && <p className="subdomain-msg taken">This subdomain is already taken. Try another.</p>}
            {errors.subdomain && <span className="subdomain-error">{errors.subdomain}</span>}
          </div>

          <h2>Select Payment Mode</h2>

          <div className="toggle">
            <button type="button"
              className={paymentMode === "bank" ? "active-btn" : ""}
              onClick={() => setPaymentMode("bank")}>
              Bank
            </button>
            <button type="button"
              className={paymentMode === "upi" ? "active-btn" : ""}
              onClick={() => setPaymentMode("upi")}>
              UPI
            </button>
          </div>

          {paymentMode === "bank" && (
            <div className="grid">
              {["accountHolder", "accountNumber", "ifsc", "bankName"].map((field) => (
                <div key={field} className="input-group">
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={`Your ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                  /></div>
              ))}
            </div>
          )}

          {paymentMode === "upi" && (
            <div className="grid">
              <div className="input-group">
                <input 
                  name="upi" 
                  value={formData.upi}
                  placeholder="Enter UPI ID *" 
                  onChange={handleChange} 
                  onKeyDown={handleKeyDown}
                />
                {errors.upi && <span>{errors.upi}</span>}
              </div>
            </div>
          )}

          {errors.payment && <div className="error-box">{errors.payment}</div>}
          {errorStatus && <div className="error-box">{errorStatus}</div>}

          <button type="submit">Proceed To Payment 💳</button>

        </form>
      </div>
    </div>
  );
}

export default ClientForm;