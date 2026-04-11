import { API_BASE } from "./config.js";

const API_BASE_URL = `${API_BASE}/api/clientprofile`;

const getAuthToken = () => {
  return localStorage.getItem("token") || "";
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const registerClientProfileAPI = async (profileData) => {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token. Please log in again.");

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
};

export const getClientProfileAPI = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");

  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const updateClientProfileAPI = async (profileData) => {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");

  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
};

export const createOrderAPI = async (orderData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/subscriptions/create-order`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData),
  });
  return handleResponse(response);
};

export const verifyPaymentAPI = async (paymentData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/subscriptions/verify`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(paymentData),
  });
  return handleResponse(response);
};

export const getClientDashboardAPI = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");

  const response = await fetch(`${API_BASE}/api/client/dashboard`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getClientWebinarStatsAPI = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");

  const response = await fetch(`${API_BASE}/api/client/webinar-stats`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  return handleResponse(response);
};

export const getClientAnalyticsAPI = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");

  const response = await fetch(`${API_BASE}/api/client/analytics`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  return handleResponse(response);
};

export const getClientAudienceAPI = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");

  const response = await fetch(`${API_BASE}/api/client/audience`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  return handleResponse(response);
};

export const getClientSubscriptionAPI = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");

  const response = await fetch(`${API_BASE}/api/client/subscription`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  return handleResponse(response);
};
