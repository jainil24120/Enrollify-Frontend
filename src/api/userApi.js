import { API_BASE } from "./config.js";

export const registerUserAPI = async (userData) => {
  const response = await fetch(`${API_BASE}/api/payment/enroll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.msg || `Registration failed with status ${response.status}`);
  }

  return await response.json();
};

export const verifyPaymentAPI = async (verificationData) => {
  const response = await fetch(`${API_BASE}/api/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(verificationData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.msg || `Verification failed with status ${response.status}`);
  }

  return await response.json();
};

// Validate a coupon for a webinar before checkout. Returns:
// { valid: bool, discountAmount, finalPrice, message }
export const validateCouponAPI = async ({ code, webinarId }) => {
  const response = await fetch(`${API_BASE}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, webinarId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { valid: false, message: errorData.message || `Coupon check failed (${response.status})` };
  }

  return await response.json();
};
