import React, { useState, useEffect } from "react";
import { fetchAllTemplates, createTemplateAPI, updateTemplateAPI, deleteTemplateAPI } from "../api/templateApi";
import { AVAILABLE_TEMPLATES } from "./templates/templateRegistry";
import { Plus, Edit2, Trash2, X, Check, AlertCircle } from "lucide-react";

const TIER_OPTIONS = ["basic", "growth", "elite"];

const AdminTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    key: "",
    description: "",
    thumbnail: "",
    minTier: "basic",
    isDefault: false,
    customizable: false,
    sortOrder: 0,
  });

  const loadTemplates = async () => {
    try {
      const data = await fetchAllTemplates();
      setTemplates(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError("Failed to load templates");
    }
    setLoading(false);
  };

  useEffect(() => { loadTemplates(); }, []);

  // Find which code templates are NOT yet registered in DB
  const registeredKeys = templates.map(t => t.key);
  const unregisteredTemplates = AVAILABLE_TEMPLATES.filter(t => !registeredKeys.includes(t.key));

  const resetForm = () => {
    setForm({ name: "", key: "", description: "", thumbnail: "", minTier: "basic", isDefault: false, customizable: false, sortOrder: 0 });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleQuickRegister = async (tmpl) => {
    setError("");
    try {
      await createTemplateAPI({
        name: tmpl.name,
        key: tmpl.key,
        description: tmpl.description,
        minTier: "basic",
        sortOrder: templates.length + 1,
      });
      setSuccess(`"${tmpl.name}" registered successfully!`);
      loadTemplates();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to register template");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.key) {
      setError("Name and Key are required");
      return;
    }

    // Validate key exists in code
    const codeKeys = AVAILABLE_TEMPLATES.map(t => t.key);
    if (!editingId && !codeKeys.includes(form.key)) {
      setError(`Key "${form.key}" doesn't exist in code. Available keys: ${codeKeys.join(", ")}`);
      return;
    }

    try {
      if (editingId) {
        await updateTemplateAPI(editingId, form);
        setSuccess("Template updated successfully");
      } else {
        await createTemplateAPI(form);
        setSuccess("Template created successfully");
      }
      resetForm();
      loadTemplates();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save template");
    }
  };

  const handleEdit = (template) => {
    setForm({
      name: template.name,
      key: template.key,
      description: template.description || "",
      thumbnail: template.thumbnail || "",
      minTier: template.minTier,
      isDefault: template.isDefault,
      customizable: template.customizable,
      sortOrder: template.sortOrder || 0,
    });
    setEditingId(template._id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete template "${name}"? This will deactivate it.`)) return;
    try {
      await deleteTemplateAPI(id);
      setSuccess("Template deleted");
      loadTemplates();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete — template may be in use");
    }
  };

  const tierBadge = (tier) => {
    const colors = { basic: "#6b7280", growth: "#6574e9", elite: "#d97706" };
    return (
      <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", background: `${colors[tier]}15`, color: colors[tier] }}>
        {tier}
      </span>
    );
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading templates...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1a1a35", marginBottom: "4px" }}>Template Management</h2>
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Register developer-built templates and assign them to subscription tiers</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", background: "#6574e9", color: "white", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "0.88rem", cursor: "pointer" }}
        >
          <Plus size={18} /> Manual Add
        </button>
      </div>

      {/* Messages */}
      {error && <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px" }}>{error}</div>}
      {success && <div style={{ padding: "12px 16px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)", borderRadius: "10px", color: "#16a34a", fontSize: "0.85rem", marginBottom: "16px" }}>{success}</div>}

      {/* Unregistered Templates Alert */}
      {unregisteredTemplates.length > 0 && (
        <div style={{ background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.15)", borderRadius: "14px", padding: "20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <AlertCircle size={18} style={{ color: "#d97706" }} />
            <h3 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1a1a35" }}>
              {unregisteredTemplates.length} New Template{unregisteredTemplates.length > 1 ? "s" : ""} Available in Code
            </h3>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: "14px" }}>
            Developer has built new templates that are not yet registered in the database. Click "Register" to make them available to clients.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {unregisteredTemplates.map((tmpl) => (
              <div key={tmpl.key} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 16px" }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "#1a1a35" }}>{tmpl.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>key: <code style={{ color: "#6574e9", background: "rgba(101,116,233,0.06)", padding: "1px 6px", borderRadius: "3px" }}>{tmpl.key}</code></div>
                </div>
                <button
                  onClick={() => handleQuickRegister(tmpl)}
                  style={{ padding: "6px 14px", background: "#6574e9", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Register
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Form */}
      {showForm && (
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "28px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "600", color: "#1a1a35" }}>{editingId ? "Edit Template" : "Add New Template"}</h3>
            <button onClick={resetForm} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>Template Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Modern Dark" style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fafafa", fontSize: "0.9rem", outline: "none", color: "#1a1a35" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>
                  Key (must match code) *
                  {!editingId && (
                    <span style={{ fontWeight: "400", textTransform: "none", marginLeft: "6px", color: "#9ca3af" }}>
                      Available: {AVAILABLE_TEMPLATES.map(t => t.key).join(", ")}
                    </span>
                  )}
                </label>
                <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="e.g. modern" disabled={!!editingId} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", background: editingId ? "#f3f4f6" : "#fafafa", fontSize: "0.9rem", outline: "none", fontFamily: "monospace", color: "#1a1a35" }} />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description for the gallery" style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fafafa", fontSize: "0.9rem", outline: "none", color: "#1a1a35" }} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>Thumbnail URL</label>
              <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://example.com/preview.png" style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fafafa", fontSize: "0.9rem", outline: "none", color: "#1a1a35" }} />
              {form.thumbnail && <img src={form.thumbnail} alt="Preview" style={{ marginTop: "8px", maxHeight: "120px", borderRadius: "8px", border: "1px solid #e5e7eb" }} />}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>Minimum Tier *</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {TIER_OPTIONS.map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, minTier: t })}
                      style={{ flex: 1, padding: "10px", borderRadius: "8px", border: form.minTier === t ? "2px solid #6574e9" : "1px solid #e5e7eb", background: form.minTier === t ? "rgba(101,116,233,0.06)" : "#fafafa", color: form.minTier === t ? "#6574e9" : "#6b7280", fontWeight: "600", fontSize: "0.82rem", cursor: "pointer", textTransform: "capitalize" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#6b7280", marginBottom: "6px", textTransform: "uppercase" }}>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fafafa", fontSize: "0.9rem", outline: "none", color: "#1a1a35" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#1a1a35" }}>
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> Default Template
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#1a1a35" }}>
                  <input type="checkbox" checked={form.customizable} onChange={(e) => setForm({ ...form, customizable: e.target.checked })} /> Customizable
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" onClick={resetForm} style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "transparent", color: "#6b7280", fontWeight: "500", cursor: "pointer" }}>Cancel</button>
              <button type="submit" style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#6574e9", color: "white", fontWeight: "600", cursor: "pointer" }}>{editingId ? "Update" : "Create"} Template</button>
            </div>
          </form>
        </div>
      )}

      {/* How It Works */}
      <div style={{ background: "rgba(101,116,233,0.03)", border: "1px solid rgba(101,116,233,0.1)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
        <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "#6574e9", marginBottom: "8px" }}>How Templates Work</h4>
        <div style={{ fontSize: "0.8rem", color: "#6b7280", lineHeight: "1.7" }}>
          <strong>1.</strong> Developer builds a new template file (e.g. <code>TemplatePremium.jsx</code>) and adds it to <code>templateRegistry.js</code><br/>
          <strong>2.</strong> After code deploy, it appears above as "New Template Available in Code"<br/>
          <strong>3.</strong> You click "Register" → set the tier (Basic/Growth/Elite) → clients can use it<br/>
          <strong>4.</strong> You can change the tier anytime by clicking "Edit"
        </div>
      </div>

      {/* Registered Templates Grid */}
      <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#1a1a35", marginBottom: "16px" }}>Registered Templates ({templates.length})</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
        {templates.map((t) => {
          const existsInCode = AVAILABLE_TEMPLATES.some(at => at.key === t.key);
          return (
            <div key={t._id} style={{ background: "#ffffff", border: `1px solid ${existsInCode ? "#e5e7eb" : "#fca5a5"}`, borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              {/* Thumbnail */}
              <div style={{ height: "140px", background: t.thumbnail ? `url(${t.thumbnail}) center/cover` : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!t.thumbnail && <span style={{ color: "#9ca3af", fontSize: "1.5rem", fontWeight: "700" }}>{t.name}</span>}
              </div>
              {/* Info */}
              <div style={{ padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#1a1a35", marginBottom: "4px" }}>{t.name}</h3>
                    <code style={{ fontSize: "0.72rem", color: "#6574e9", background: "rgba(101,116,233,0.06)", padding: "2px 8px", borderRadius: "4px" }}>{t.key}</code>
                  </div>
                  {tierBadge(t.minTier)}
                </div>
                {t.description && <p style={{ fontSize: "0.82rem", color: "#6b7280", lineHeight: "1.5", marginBottom: "12px" }}>{t.description}</p>}
                <div style={{ display: "flex", gap: "6px", fontSize: "0.72rem", marginBottom: "14px", flexWrap: "wrap" }}>
                  {t.isDefault && <span style={{ padding: "2px 8px", borderRadius: "4px", background: "rgba(22,163,74,0.08)", color: "#16a34a", fontWeight: "600" }}>Default</span>}
                  {t.customizable && <span style={{ padding: "2px 8px", borderRadius: "4px", background: "rgba(245,158,11,0.08)", color: "#d97706", fontWeight: "600" }}>Customizable</span>}
                  {!t.isActive && <span style={{ padding: "2px 8px", borderRadius: "4px", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontWeight: "600" }}>Inactive</span>}
                  {existsInCode ? (
                    <span style={{ padding: "2px 8px", borderRadius: "4px", background: "rgba(22,163,74,0.08)", color: "#16a34a", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}><Check size={10} /> Code Linked</span>
                  ) : (
                    <span style={{ padding: "2px 8px", borderRadius: "4px", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}><AlertCircle size={10} /> No Code Found</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleEdit(t)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "transparent", color: "#6b7280", cursor: "pointer", fontSize: "0.82rem" }}><Edit2 size={14} /> Edit</button>
                  {!t.isDefault && (
                    <button onClick={() => handleDelete(t._id, t.name)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)", color: "#ef4444", cursor: "pointer" }}><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>No templates registered yet</p>
          <p style={{ fontSize: "0.88rem" }}>Register the templates that developers have built using the alert above</p>
        </div>
      )}
    </div>
  );
};

export default AdminTemplateManager;
