import React, { useState, useRef } from "react";
import "./SignUpform.css";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api/config.js";
import logoImg from "../assets/Logo.jpeg";

function SignUpform() {
  const [isSignup, setIsSignup] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const navigate = useNavigate();

  const otpRefs = useRef([]);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    role: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: ["", "", "", "", "", ""],
    newPassword: "",
    confirmNewPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleSignup = async () => {
    if (!data.firstName || !data.lastName || !data.gender || !data.phone || !data.email || !data.password || !data.confirmPassword) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/registers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: data.firstName,
          lastname: data.lastName,
          gender: data.gender.toLowerCase(),
          role: "client",
          phone: data.phone,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword
        }),
      });

      if (response.ok) {
        setIsSignup(false);
        setIsLoading(false);
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMsg(errorData.message || "Signup failed. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMsg("Unable to connect to server. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSignin = async () => {
    if (!data.email || !data.password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        localStorage.setItem("loggedInUser", data.email);
        const fetchedName = result.user?.firstname
          ? `${result.user.firstname} ${result.user.lastname || ''}`
          : result.firstname
              ? `${result.firstname} ${result.lastname || ''}`
              : result.fullname || data.email.split('@')[0];
        localStorage.setItem("userName", fetchedName.trim());

        if (result.user) {
          localStorage.setItem("userData", JSON.stringify({
            id: result.user._id || result.user.id,
            firstname: result.user.firstname,
            lastname: result.user.lastname || "",
            email: result.user.email,
            phone: result.user.phone || ""
          }));
        }

        setIsLoading(false);
        navigate("/dashboard");
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMsg(errorData.message || "Incorrect email or password.");
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMsg("Unable to connect to server. Please try again.");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!data.email) {
      setErrorMsg("Please enter your registered email.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/password/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (response.ok) {
        setOtpStep(true);
        setIsLoading(false);
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMsg(errorData.message || "Failed to send OTP. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      const response = await fetch(`${API_BASE}/api/password/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (response.ok) {
        setErrorMsg("");
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMsg(errorData.message || "Failed to resend OTP.");
      }
    } catch (error) {
      setErrorMsg("Unable to connect to server.");
    }
  };

  const handleResetPassword = async () => {
    if (data.otp.includes("")) {
      setErrorMsg("Please enter the complete OTP.");
      return;
    }

    if (!data.newPassword || !data.confirmNewPassword) {
      setErrorMsg("Please fill in both password fields.");
      return;
    }

    if (data.newPassword !== data.confirmNewPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
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
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMsg(errorData.message || "Invalid OTP or reset failed.");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getHeading = () => {
    if (forgot && otpStep) return "Reset Password";
    if (forgot) return "Forgot Password";
    if (isSignup) return "Create Account";
    return "Welcome Back";
  };

  const getSubtitle = () => {
    if (forgot && otpStep) return "Enter the OTP sent to your email and set a new password";
    if (forgot) return "Enter your email and we'll send you a reset code";
    if (isSignup) return "Start your journey with Enrollify";
    return "Sign in to your Enrollify account";
  };

  return (
    <div className="auth-wrapper">
      {/* Decorative elements */}
      <div className="auth-deco auth-deco-1"></div>
      <div className="auth-deco auth-deco-2"></div>
      <div className="auth-deco auth-deco-3"></div>

      <div className="auth-container">
        {/* Back to home */}
        <button className="auth-back" onClick={() => navigate("/")} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Home
        </button>

        <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="auth-card">
          {/* Logo */}
          <div className="auth-logo-container">
            <img src={logoImg} alt="Enrollify" className="auth-logo" />
          </div>

          {/* Heading */}
          <h2>{getHeading()}</h2>
          <p className="auth-subtitle">{getSubtitle()}</p>

          {/* Error */}
          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          {/* SIGN IN */}
          {!isSignup && !forgot && (
            <>
              <div className="auth-field">
                <label>Email</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input type="email" name="email" value={data.email} placeholder="you@example.com" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="off" />
                </div>
              </div>
              <div className="auth-field">
                <label>Password</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showPassword ? "text" : "password"} name="password" value={data.password} placeholder="Enter your password" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="new-password" />
                  <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-btn" onClick={handleSignin} disabled={isLoading}>
                {isLoading ? <span className="auth-spinner"></span> : null}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
              <div className="auth-links">
                <span onClick={() => { setIsSignup(true); setErrorMsg(""); }}>Create Account</span>
                <span onClick={() => { setForgot(true); setErrorMsg(""); }}>Forgot Password?</span>
              </div>
            </>
          )}

          {/* SIGN UP */}
          {isSignup && (
            <>
              <div className="auth-row">
                <div className="auth-field">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={data.firstName} placeholder="John" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="disabled" />
                </div>
                <div className="auth-field">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={data.lastName} placeholder="Doe" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="disabled" />
                </div>
              </div>
              <div className="auth-field">
                <label>Gender</label>
                <select name="gender" value={data.gender} onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="off">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="auth-field">
                <label>Phone</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <input type="tel" name="phone" value={data.phone} placeholder="+91 98765 43210" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="off" />
                </div>
              </div>
              <div className="auth-field">
                <label>Email</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input type="email" name="email" value={data.email} placeholder="you@example.com" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="off" />
                </div>
              </div>
              <div className="auth-field">
                <label>Password</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showPassword ? "text" : "password"} name="password" value={data.password} placeholder="Min 6 characters" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="new-password" />
                  <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label>Confirm Password</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={data.confirmPassword} placeholder="Re-enter password" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="new-password" />
                  <button type="button" className="auth-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-btn" onClick={handleSignup} disabled={isLoading}>
                {isLoading ? <span className="auth-spinner"></span> : null}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              <div className="auth-links" style={{ justifyContent: 'center' }}>
                <span onClick={() => { setIsSignup(false); setErrorMsg(""); }}>Already have an account? Sign In</span>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD — email step */}
          {forgot && !otpStep && (
            <>
              <div className="auth-field">
                <label>Email</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input type="email" name="email" value={data.email} placeholder="you@example.com" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="off" />
                </div>
              </div>
              <button type="submit" className="auth-btn" onClick={handleForgotPassword} disabled={isLoading}>
                {isLoading ? <span className="auth-spinner"></span> : null}
                {isLoading ? "Sending OTP..." : "Send Reset Code"}
              </button>
              <div className="auth-links">
                <span onClick={() => { setForgot(false); setErrorMsg(""); }}>Back to Sign In</span>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD — OTP + new password step */}
          {forgot && otpStep && (
            <>
              <p className="otp-label">Enter 6-digit code sent to <strong>{data.email}</strong></p>
              <div className="otp-box">
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
                    }}
                  />
                ))}
              </div>

              <div className="auth-field">
                <label>New Password</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type="password" name="newPassword" value={data.newPassword} placeholder="New password" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="new-password" />
                </div>
              </div>
              <div className="auth-field">
                <label>Confirm New Password</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type="password" name="confirmNewPassword" value={data.confirmNewPassword} placeholder="Re-enter new password" onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="new-password" />
                </div>
              </div>
              <button type="submit" className="auth-btn" onClick={handleResetPassword} disabled={isLoading}>
                {isLoading ? <span className="auth-spinner"></span> : null}
                {isLoading ? 'Verifying...' : 'Reset Password'}
              </button>
              <div className="auth-links">
                <span onClick={handleResendOtp} style={resendCooldown > 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                <span onClick={() => { setOtpStep(false); setErrorMsg(""); }}>Back</span>
              </div>
            </>
          )}

          {/* Divider */}
          <div className="auth-divider">
            <span>Secured by Enrollify</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUpform;
