import { API_BASE } from "./config.js";

const token = () => localStorage.getItem("token") || "";

// Trigger a browser download of registrations as CSV for a given webinar.
export const downloadRegistrationsCSV = async (webinarId, webinarTitle) => {
  const res = await fetch(`${API_BASE}/api/export/registrations/${webinarId}.csv`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to export registrations");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safe = (webinarTitle || "webinar").replace(/[^a-z0-9-_]/gi, "_").slice(0, 60);
  a.download = `${safe}_registrations.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
