import { API_BASE } from "./config.js";

const BASE = `${API_BASE}/api/invoices`;
const token = () => localStorage.getItem("token") || "";

export const listInvoicesAPI = async () => {
  const res = await fetch(BASE, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).msg || "Failed to load invoices");
  return res.json();
};

export const getInvoiceAPI = async (paymentId) => {
  const res = await fetch(`${BASE}/${paymentId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).msg || "Invoice not found");
  return res.json();
};

// Trigger a browser download of the invoice PDF.
export const downloadInvoicePDF = async (paymentId, invoiceNumber) => {
  const res = await fetch(`${BASE}/${paymentId}/pdf`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to download invoice");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoiceNumber || "invoice"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
