import React, { useState, useRef } from "react";
import "./AdminLogin.css";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api/config.js";
import logoImg from "../assets/Logo.jpeg";

function AdminLogin() {
  const [forgot, setForgot] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const navigate = useNavigate();

  const otpRefs = useRef([]);

  const [data, setData] = useState({
    email: "",
    password: "",
    otp: ["", "", "", "", "", ""],
    newPassword: "",
    confirmNewPassword: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
               form.elements[nextIndex].disabled)) {
          nextIndex++;
        }
        if (form.elements[nextIndex]) form.elements[nextIndex].focus();
      }
    }
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    const newOtp = [...data.otp];

    if (value.length > 1) {
      value.split("").slice(0, 6).forEach((d, i) => (newOtp[i] = d));
      setData({ ...data, otp: newOtp });
      otpRefs.current[5]?.focus();
      return;
    }

    newOtp[index] = value;
    setData({ ...data, otp: newOtp });

    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !data.otp[index] && index > 0) {
      const newOtp = [...data.otp];
      newOtp[index - 1] = "";
      setData({ ...data, otp: newOtp });
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSignin = async () => {
    if (!data.email || !data.password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (response.ok) {
        const result = await response.json();
        const userRole = result.user?.role || result.role;

        if (userRole !== "admin") {
          setIsLoading(false);
          setErrorMsg("Access denied. Admin privileges required.");
          return;
        }

        localStorage.setItem("isAdminAuth", "true");
        localStorage.setItem("adminEmail", data.email);
        if (result.token) localStorage.setItem("token", result.token);

        setIsLoading(false);
        navigate("/admin-dashboard");
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        setIsLoading(false);
        setErrorMsg(errorData.message || "Invalid Admin Credentials.");
        return;
      }
    } catch (error) {
      console.warn("API fail:", error);
    }

    setIsLoading(false);
    setErrorMsg("Unable to connect to server. Please try again.");
  };

  const handleForgotPassword = async () => {
    if (!data.email) {
      setErrorMsg("Please enter your admin email");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE}/api/password/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (response.ok) {
        setOtpStep(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMsg(errorData.message || "Failed to send OTP.");
      }
    } catch (error) {
      setErrorMsg("Network error. Try again.");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    if (data.otp.includes("")) {
      setErrorMsg("Enter complete OTP");
      return;
    }
    if (!data.newPassword || !data.confirmNewPassword) {
      setErrorMsg("Fill new password fields");
      return;
    }
    if (data.newPassword !== data.confirmNewPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    const otpString = data.otp.join("");

    try {
      const verifyRes = await fetch(`${API_BASE}/api/password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, otp: otpString }),
      });

      const response = await fetch(`${API_BASE}/api/password/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          otp: otpString,
          newPassword: data.newPassword,
          confirmPassword: data.confirmNewPassword
        }),
      });

      if (response.ok && verifyRes.ok) {
        setForgot(false);
        setOtpStep(false);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
    }
    
    setIsLoading(false);
    setErrorMsg("Failed to update password. Invalid OTP.");
  };

  return (
    <div className="admin-auth-wrapper">
      <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="admin-auth-card">
        <div className="admin-logo-container">
          <img src={logoImg} alt="Enrollify" className="admin-logo" />
        </div>
        
        <h2>{forgot ? "Admin Recovery" : "Admin Portal"}</h2>
        <p className="admin-subtitle">Secure Gateway Access</p>

        {errorMsg && (
            <div style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px", fontWeight: "600" }}>
              {errorMsg}
            </div>
        )}

        {/* SIGN IN */}
        {!forgot && (
          <>
            <input type="email" name="email" value={data.email} placeholder="Admin Email" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="off" />
            <input type="password" name="password" value={data.password} placeholder="Password" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="new-password" />
            <button type="submit" onClick={handleSignin} disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </button>

            <div className="admin-links">
              <span onClick={() => { setForgot(true); setErrorMsg(""); }}>Forgot Password?</span>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD */}
        {forgot && !otpStep && (
          <>
            <input type="email" name="email" value={data.email} placeholder="Admin Email address" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="off" />
            <button type="submit" onClick={handleForgotPassword} disabled={isLoading}>
              {isLoading ? "Sending OTP..." : "Send OTP Verification"}
            </button>
            <div className="admin-links">
              <span onClick={() => { setForgot(false); setErrorMsg(""); }}>Cancel Request</span>
            </div>
          </>
        )}

        {/* OTP */}
        {forgot && otpStep && (
          <>
            <p className="otp-text">Enter 6-digit Security Code</p>
            <div className="admin-otp-box">
              {data.otp.map((d, i) => (
                <input
                  key={i}
                  maxLength="1"
                  value={d}
                  ref={(el) => (otpRefs.current[i] = el)}
                  onChange={(e) => handleOtpChange(e, i)}
                  onKeyDown={(e) => {
                    handleOtpKeyDown(e, i);
                    if (e.key === "Enter") handleKeyDown(e);
                  }} />
              ))}
            </div>

            <input type="password" name="newPassword" value={data.newPassword} placeholder="New Master Password" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="new-password" />
            <input type="password" name="confirmNewPassword" value={data.confirmNewPassword} placeholder="Confirm Master Password" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="new-password" />
            <button type="submit" onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? 'Resetting Password...' : 'Verify & Reset Access'}
            </button>
            <div className="admin-links">
              <span onClick={() => { setOtpStep(false); setErrorMsg(""); }}>Cancel Reset</span>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default AdminLogin;
