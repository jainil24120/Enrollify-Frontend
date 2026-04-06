import { API_BASE } from "./config.js";

const API_BASE_URL = `${API_BASE}/api`;

export const createWebinarAPI = async (webinarData, token) => {
  if (!token) {
    throw new Error("Authentication token missing. Please log out and log back in to your account.");
  }

  // Use FormData to support file upload
  const formData = new FormData();

  // Handle banner image file separately
  if (webinarData.bannerImageFile) {
    formData.append("bannerImage", webinarData.bannerImageFile);
  }

  // Append all other fields (excluding the File object)
  const fieldsToSend = { ...webinarData };
  delete fieldsToSend.bannerImageFile;

  for (const [key, value] of Object.entries(fieldsToSend)) {
    if (value === undefined || value === null || value === "") continue;
    // Stringify arrays and objects for FormData
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  }

  const response = await fetch(`${API_BASE_URL}/webinars`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    },
    body: formData,
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

  // Use FormData to support file upload
  const formData = new FormData();

  if (webinarData.bannerImageFile) {
    formData.append("bannerImage", webinarData.bannerImageFile);
  }

  const fieldsToSend = { ...webinarData };
  delete fieldsToSend.bannerImageFile;

  for (const [key, value] of Object.entries(fieldsToSend)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  }

  const response = await fetch(`${API_BASE_URL}/webinars/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => {
    throw new Error(`Server returned invalid response: ${response.status}`);
  });

  if (!response.ok) {
    const errorMsg = data.message || data.error || `Update failed: ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};
