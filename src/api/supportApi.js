import { API_BASE } from "./config.js";

const getToken = () => localStorage.getItem("token") || "";
const headers = () => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" });

const handleRes = async (res) => {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.msg || data?.message || `Request failed: ${res.status}`);
  return data;
};

export const createTicketAPI = async (ticketData) => {
  const res = await fetch(`${API_BASE}/api/support`, { method: "POST", headers: headers(), body: JSON.stringify(ticketData) });
  return handleRes(res);
};

export const getMyTicketsAPI = async () => {
  const res = await fetch(`${API_BASE}/api/support/my`, { headers: headers() });
  return handleRes(res);
};

export const getAllTicketsAPI = async () => {
  const res = await fetch(`${API_BASE}/api/support/all`, { headers: headers() });
  return handleRes(res);
};

export const updateTicketAPI = async (id, updateData) => {
  const res = await fetch(`${API_BASE}/api/support/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(updateData) });
  return handleRes(res);
};
