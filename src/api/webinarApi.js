import { API_BASE } from "./config.js";

const API_BASE_URL = `${API_BASE}/api`;

export const createWebinarAPI = async (webinarData, token) => {
  if (!token) {
    throw new Error("Authentication token missing. Please log out and log back in to your account.");
  }

  // Always send as JSON — images are base64 encoded in the payload
  const fieldsToSend = { ...webinarData };
  delete fieldsToSend.bannerImageFile;

  const response = await fetch(`${API_BASE_URL}/webinars`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fieldsToSend),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.message || errorData.msg || errorData.error || `Failed with status code: ${response.status}`;
    throw new Error(errorMsg);
  }

  return await response.json();
};

export const updateWebinarAPI = async (id, webinarData, token) => {
  if (!token) {
    throw new Error("Authentication token missing. Please log out and log back in.");
  }

  // Always send as JSON — images are base64 encoded in the payload
  const fieldsToSend = { ...webinarData };
  delete fieldsToSend.bannerImageFile;

  const response = await fetch(`${API_BASE_URL}/webinars/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fieldsToSend),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const errorMsg = data?.message || data?.msg || data?.error
      || (response.status === 413 ? "Payload too large — try using a smaller image" : `Update failed: ${response.status}`);
    throw new Error(errorMsg);
  }

  const data = await response.json();

  return data;
};
