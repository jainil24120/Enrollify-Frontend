import { API_BASE } from "./config.js";

const getToken = () => localStorage.getItem("token") || "";

const headers = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

const handleRes = async (res) => {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.msg || data?.error || `Request failed: ${res.status}`);
  return data;
};

export const connectWhatsAppAPI = async () => {
  const res = await fetch(`${API_BASE}/api/whatsapp/connect`, {
    method: "POST",
    headers: headers(),
  });
  return handleRes(res);
};

export const disconnectWhatsAppAPI = async () => {
  const res = await fetch(`${API_BASE}/api/whatsapp/disconnect`, {
    method: "POST",
    headers: headers(),
  });
  return handleRes(res);
};

export const getWhatsAppStatusAPI = async () => {
  const res = await fetch(`${API_BASE}/api/whatsapp/status`, {
    headers: headers(),
  });
  return handleRes(res);
};

export const broadcastWhatsAppAPI = async (webinarId, message) => {
  const res = await fetch(`${API_BASE}/api/whatsapp/broadcast`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ webinarId, message }),
  });
  return handleRes(res);
};

export const scheduleWhatsAppAPI = async (webinarId, message, scheduledFor, preset) => {
  const res = await fetch(`${API_BASE}/api/whatsapp/schedule`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ webinarId, message, scheduledFor, preset }),
  });
  return handleRes(res);
};

export const getWhatsAppHistoryAPI = async (webinarId) => {
  const res = await fetch(`${API_BASE}/api/whatsapp/history/${webinarId}`, {
    headers: headers(),
  });
  return handleRes(res);
};

export const getAllWhatsAppSessionsAPI = async () => {
  const res = await fetch(`${API_BASE}/api/whatsapp/sessions`, {
    headers: headers(),
  });
  return handleRes(res);
};
