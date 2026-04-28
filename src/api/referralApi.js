import { API_BASE } from "./config.js";

const BASE = `${API_BASE}/api/referrals`;
const token = () => localStorage.getItem("token") || "";

export const getMyReferralAPI = async () => {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).msg || "Failed to load referral");
  return res.json();
};

export const listReferralEventsAPI = async () => {
  const res = await fetch(`${BASE}/events`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) return [];
  return res.json();
};

// Public — call from the signup completion handler with the ?ref= code.
export const trackReferralAPI = async ({ code, referredUserId, metadata }) => {
  const res = await fetch(`${BASE}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, referredUserId, metadata }),
  });
  return res.json().catch(() => ({}));
};
