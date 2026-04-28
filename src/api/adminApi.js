import { API_BASE } from "./config.js";

const API_BASE_URL = `${API_BASE}/api/admin`;

const getAdminHeaders = (token) => ({
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json",
});

export const fetchAdminAnalytics = async (token) => {
  const response = await fetch(`${API_BASE_URL}/analytics`, {
    method: "GET",
    headers: getAdminHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch analytics");
  return await response.json();
};

export const fetchAdminUsers = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: getAdminHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return await response.json();
};

export const fetchAdminWebinars = async (token) => {
  const response = await fetch(`${API_BASE_URL}/webinars`, {
    method: "GET",
    headers: getAdminHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch webinars");
  return await response.json();
};

export const fetchAdminRegistrations = async (token) => {
  const response = await fetch(`${API_BASE_URL}/registrations`, {
    method: "GET",
    headers: getAdminHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch registrations");
  return await response.json();
};

export const fetchAdminRevenue = async (token) => {
  const response = await fetch(`${API_BASE_URL}/revenue`, {
    method: "GET",
    headers: getAdminHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch revenue data");
  return await response.json();
};

export const fetchAdminSubscriptions = async (token) => {
  const response = await fetch(`${API_BASE_URL}/subscriptions`, {
    method: "GET",
    headers: getAdminHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch subscriptions");
  return await response.json();
};

export const fetchSubscriptionPlans = async () => {
  const response = await fetch(`${API_BASE}/api/subscriptions`);
  if (!response.ok) throw new Error("Failed to fetch subscription plans");
  return await response.json();
};

export const createSubscriptionPlan = async (planData, token) => {
  const response = await fetch(`${API_BASE}/api/subscriptions`, {
    method: "POST",
    headers: getAdminHeaders(token),
    body: JSON.stringify(planData),
  });
  if (!response.ok) throw new Error("Failed to create subscription plan");
  return await response.json();
};

export const getAdminSettings = async (token) => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    headers: getAdminHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to fetch settings");
  return await response.json();
};

export const saveAdminSettings = async (settings, token) => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: "PUT",
    headers: getAdminHeaders(token),
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error("Failed to save settings");
  return await response.json();
};

export const updateSubscriptionPlan = async (planId, planData, token) => {
  const response = await fetch(`${API_BASE}/api/subscriptions/${planId}`, {
    method: "PUT",
    headers: getAdminHeaders(token),
    body: JSON.stringify(planData),
  });
  if (!response.ok) throw new Error("Failed to update subscription plan");
  return await response.json();
};

// ===== COUPONS =====
export const fetchCoupons = async (token) => {
  const res = await fetch(`${API_BASE}/api/coupons`, {
    headers: getAdminHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch coupons");
  }
  return res.json();
};

export const createCouponAPI = async (data, token) => {
  const res = await fetch(`${API_BASE}/api/coupons`, {
    method: "POST",
    headers: getAdminHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create coupon");
  }
  return res.json();
};

export const updateCouponAPI = async (id, data, token) => {
  const res = await fetch(`${API_BASE}/api/coupons/${id}`, {
    method: "PUT",
    headers: getAdminHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update coupon");
  }
  return res.json();
};

export const deleteCouponAPI = async (id, token) => {
  const res = await fetch(`${API_BASE}/api/coupons/${id}`, {
    method: "DELETE",
    headers: getAdminHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete coupon");
  }
  return res.json();
};
