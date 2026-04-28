import React, { useState, useEffect } from "react";
import { Tag, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { fetchCoupons, createCouponAPI, updateCouponAPI, deleteCouponAPI } from "../api/adminApi";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  maxDiscount: 0,
  minOrderAmount: 0,
  validFrom: "",
  validTo: "",
  usageLimit: 0,
  isActive: true,
};

function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token") || "";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCoupons(token);
      setCoupons(data.coupons || []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({
      code: c.code,
      description: c.description || "",
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxDiscount: c.maxDiscount || 0,
      minOrderAmount: c.minOrderAmount || 0,
      validFrom: c.validFrom ? new Date(c.validFrom).toISOString().slice(0, 10) : "",
      validTo: c.validTo ? new Date(c.validTo).toISOString().slice(0, 10) : "",
      usageLimit: c.usageLimit || 0,
      isActive: c.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        maxDiscount: Number(form.maxDiscount) || 0,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        usageLimit: Number(form.usageLimit) || 0,
      };
      if (editingId) {
        // code is not editable; remove it from payload
        const { code, ...editPayload } = payload;
        await updateCouponAPI(editingId, editPayload, token);
      } else {
        await createCouponAPI(payload, token);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon? This cannot be undone.")) return;
    try {
      await deleteCouponAPI(id, token);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const formatDiscount = (c) =>
    c.discountType === "percentage"
      ? `${c.discountValue}%${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}`
      : `₹${c.discountValue}`;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#1a1a35" }}>
            <Tag size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />
            Coupons
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "13px" }}>
            Create and manage discount codes for paid webinars.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ padding: "10px 18px", background: "#6574e9", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fef2f2", color: "#dc2626", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading…</div>
      ) : coupons.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6b7280", border: "1px dashed #e5e7eb", borderRadius: 12 }}>
          No coupons yet. Click "New Coupon" to create your first one.
        </div>
      ) : (
        <div style={{ overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "#f8f9fb" }}>
              <tr>
                <th style={{ textAlign: "left", padding: 12, color: "#6b7280", fontWeight: 600 }}>Code</th>
                <th style={{ textAlign: "left", padding: 12, color: "#6b7280", fontWeight: 600 }}>Discount</th>
                <th style={{ textAlign: "left", padding: 12, color: "#6b7280", fontWeight: 600 }}>Usage</th>
                <th style={{ textAlign: "left", padding: 12, color: "#6b7280", fontWeight: 600 }}>Valid Till</th>
                <th style={{ textAlign: "left", padding: 12, color: "#6b7280", fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: "right", padding: 12 }}></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: 12, fontWeight: 600, color: "#6574e9" }}>{c.code}</td>
                  <td style={{ padding: 12 }}>{formatDiscount(c)}</td>
                  <td style={{ padding: 12 }}>
                    {c.usageCount || 0}{c.usageLimit > 0 ? ` / ${c.usageLimit}` : " / ∞"}
                  </td>
                  <td style={{ padding: 12 }}>
                    {c.validTo ? new Date(c.validTo).toLocaleDateString() : "No expiry"}
                  </td>
                  <td style={{ padding: 12 }}>
                    {c.isActive ? (
                      <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 12 }}>● Active</span>
                    ) : (
                      <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: 12 }}>● Inactive</span>
                    )}
                  </td>
                  <td style={{ padding: 12, textAlign: "right" }}>
                    <button onClick={() => openEdit(c)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#6574e9" }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(c._id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#ef4444" }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
             onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", padding: 28, borderRadius: 16, maxWidth: 540, width: "92%", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{editingId ? "Edit Coupon" : "New Coupon"}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Code</label>
                <input
                  required
                  disabled={!!editingId}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="LAUNCH50"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, textTransform: "uppercase" }}
                />
                {editingId && <small style={{ color: "#9ca3af" }}>Code can't be changed after creation</small>}
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="50% off launch promo"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat ₹</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>
                    Value {form.discountType === "percentage" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    required type="number" min={0} max={form.discountType === "percentage" ? 100 : undefined}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                  />
                </div>
              </div>

              {form.discountType === "percentage" && (
                <div>
                  <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Max discount cap (₹, 0 = no cap)</label>
                  <input
                    type="number" min={0}
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Min order amount (₹)</label>
                <input
                  type="number" min={0}
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Valid from</label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Valid till</label>
                  <input
                    type="date"
                    value={form.validTo}
                    onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Usage limit (0 = unlimited)</label>
                <input
                  type="number" min={0}
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span>Active</span>
              </label>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: "12px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 2, padding: "12px", background: "#6574e9", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Check size={16} /> {saving ? "Saving…" : editingId ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CouponManager;
