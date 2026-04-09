import { API_BASE } from "./config.js";

const getAuthToken = () => localStorage.getItem("token") || "";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.msg || `API Error: ${response.status}`);
  }
  return response.json();
};

export const fetchAllTemplates = async () => {
  const response = await fetch(`${API_BASE}/api/templates`);
  return handleResponse(response);
};

export const fetchMyTierTemplates = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/templates/my-tier`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return handleResponse(response);
};

export const createTemplateAPI = async (data) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/templates`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateTemplateAPI = async (id, data) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/templates/${id}`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteTemplateAPI = async (id) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/templates/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  return handleResponse(response);
};
