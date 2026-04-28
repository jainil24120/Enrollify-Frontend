import React, { useEffect, useState } from "react";
import { listInvoicesAPI, downloadInvoicePDF } from "../api/invoiceApi";
import "./InvoicesPanel.css";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

function InvoicesPanel() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listInvoicesAPI()
      .then(setInvoices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (invoice) => {
    setDownloadingId(invoice.id);
    try {
      await downloadInvoicePDF(invoice.id, invoice.invoiceNumber);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="inv-panel">
      <div className="inv-header">
        <h2>GST Invoices</h2>
        <p className="inv-sub">Download tax invoices for every Enrollify subscription payment.</p>
      </div>

      {error && <div className="inv-error">{error}</div>}

      {loading ? (
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Plan</th>
                <th className="inv-amt">Amount</th>
                <th className="inv-action"></th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3].map((i) => (
                <tr key={i}>
                  <td><span className="inv-skeleton" style={{ width: "70%" }} /></td>
                  <td><span className="inv-skeleton" style={{ width: "60%" }} /></td>
                  <td><span className="inv-skeleton" style={{ width: "75%" }} /></td>
                  <td className="inv-amt"><span className="inv-skeleton" style={{ width: "50%" }} /></td>
                  <td className="inv-action"><span className="inv-skeleton inv-skeleton-pill" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : invoices.length === 0 ? (
        <div className="inv-empty">
          <p>No invoices yet.</p>
          <p className="inv-empty-hint">
            Once you make your first paid subscription, your tax invoice will appear here.
          </p>
        </div>
      ) : (
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Plan</th>
                <th className="inv-amt">Amount</th>
                <th className="inv-action"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="inv-num">{inv.invoiceNumber}</td>
                  <td>{formatDate(inv.date)}</td>
                  <td>{inv.subscription?.name || "Subscription"}</td>
                  <td className="inv-amt">{formatINR(inv.amount)}</td>
                  <td className="inv-action">
                    <button
                      className="inv-btn"
                      onClick={() => handleDownload(inv)}
                      disabled={downloadingId === inv.id}
                    >
                      {downloadingId === inv.id ? "Generating..." : "Download PDF"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InvoicesPanel;
