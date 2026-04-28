import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { 
  fetchAdminAnalytics, 
  fetchAdminUsers, 
  fetchAdminWebinars, 
  fetchAdminRegistrations, 
  fetchAdminRevenue, 
  fetchAdminSubscriptions,
  fetchSubscriptionPlans,
  getAdminSettings,
  saveAdminSettings
} from "../api/adminApi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminTemplateManager from "./AdminTemplateManager";
import WhatsAppPanel from "./WhatsAppPanel";
import SupportPage from "./SupportPage";
import CouponManager from "./CouponManager";
import logoImg from "../assets/Logo.jpeg";
import { AVAILABLE_TEMPLATES } from "./templates/templateRegistry";
import { fetchAllTemplates } from "../api/templateApi";
import { IndianRupee, Users, Ticket, Crown, CheckCircle, Plus, Download, AlertCircle, Search, Filter, MoreVertical, X, User, ChevronLeft, ChevronRight, UserX, Unlock, LogOut, Video, Calendar, Eye, Activity, Ban, Settings, Key, Shield, Bell, Save, ToggleLeft, ToggleRight, Smartphone, Mail, CreditCard, Lock, BarChart3, TrendingUp, Globe, Monitor, Share2, MapPin, ClipboardList, Tag } from 'lucide-react';



const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem("isAdminAuth");
    if (isAuth !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [unregisteredCount, setUnregisteredCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  // Users States (Fixed missing states)
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);

  // Webinar State
  const [webinarSearch, setWebinarSearch] = useState("");
  const [webinarStatus, setWebinarStatus] = useState("All");
  const [webinarType, setWebinarType] = useState("All");
  const [webinarCategory, setWebinarCategory] = useState("All");
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [currentWebinarPage, setCurrentWebinarPage] = useState(1);
  const [webinarsPerPage, setWebinarsPerPage] = useState(10);

  // Revenue State
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [revenueTimeFilter, setRevenueTimeFilter] = useState("30 Days");

  // Analytics State
  const [analyticsRange, setAnalyticsRange] = useState("Last 30 Days");

  // Subscriptions State
  const [subSearchQuery, setSubSearchQuery] = useState("");
  const [subPlanFilter, setSubPlanFilter] = useState("All");
  const [subStatusFilter, setSubStatusFilter] = useState("All");
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [currentSubPage, setCurrentSubPage] = useState(1);
  const [subsPerPage, setSubsPerPage] = useState(10);

  const [pricingPlans, setPricingPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingPlanData, setEditingPlanData] = useState(null);

  const handleEditPlanClick = (plan) => {
    setEditingPlan(plan.id);
    setEditingPlanData(JSON.parse(JSON.stringify(plan))); // Deep copy for editing
  };

  const handleSavePlanSettings = () => {
    if (editingPlan === 'new') {
      const newPlan = { ...editingPlanData, id: `plan-${Date.now()}` };
      setPricingPlans([...pricingPlans, newPlan]);
    } else {
      setPricingPlans(prev => prev.map(p => p.id === editingPlanData.id ? editingPlanData : p));
    }
    setEditingPlan(null);
    setEditingPlanData(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Settings State
  const [activeSettingsTab, setActiveSettingsTab] = useState("general");
  const [platformFee, setPlatformFee] = useState(5);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [globalAlertText, setGlobalAlertText] = useState("");
  const [showToast, setShowToast] = useState(false);

  // API Data State
  const [data, setData] = useState({
    analytics: {},
    usersData: { stats: {}, table: [] },
    webinars: [],
    registrations: [],
    revenueData: { cards: {}, charts: { revenueTrend: [], revenueSplit: [] }, table: [] },
    subscriptionsData: { stats: {}, table: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    
    if (!token) {
      setError("Authentication token missing. Please log in.");
      setLoading(false);
      return;
    }

    const loadingTimeout = setTimeout(() => {
      setLoading(false); // Drop loading screen after 5s if API is slow
    }, 5000);

    try {
      const [analytics, users, webinars, registrations, revenue, subscriptions] = await Promise.all([
        fetchAdminAnalytics(token).catch(e => null),
        fetchAdminUsers(token).catch(e => null),
        fetchAdminWebinars(token).catch(e => null),
        fetchAdminRegistrations(token).catch(e => null),
        fetchAdminRevenue(token).catch(e => null),
        fetchAdminSubscriptions(token).catch(e => null)
      ]);
      
      clearTimeout(loadingTimeout);


      // Extract .data from API response
      const getComplex = (res) => {
        if (!res || res.error || (res.success === false && !res.data)) return null;
        return (res.success && res.data) ? res.data : (res.data ? res.data : res);
      };
      // Generic array extractor for basic endpoints
      const getArray = (res) => {
        const val = getComplex(res);
        if (Array.isArray(val)) return val;
        if (val && (Array.isArray(val.table) || Array.isArray(val.data))) return (val.table || val.data);
        return [];
      };

      // Extract and set data with safe fallbacks
      const analyticsRaw = getComplex(analytics) || {};
      const revenueRaw = getComplex(revenue) || {};

      setData({
        analytics: {
          ...analyticsRaw,
          ...(analyticsRaw.cards || {}),
        },
        usersData: getComplex(users) || { stats: {}, table: [] },
        webinars: getArray(webinars),
        registrations: getArray(registrations),
        revenueData: {
          cards: revenueRaw.cards || {},
          charts: revenueRaw.charts || { revenueTrend: [], revenueSplit: [] },
          table: revenueRaw.table || [],
        },
        subscriptionsData: getComplex(subscriptions) || { stats: {}, table: [] }
      });
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin profile from token
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    fetchAllData();

    // Fetch subscription plans from backend
    fetchSubscriptionPlans().then(res => {
      const plans = Array.isArray(res) ? res : res?.data || [];
      if (plans.length > 0) {
        setPricingPlans(plans.map(p => ({
          id: p._id,
          name: p.name,
          desc: p.description || "",
          price: p.price || 0,
          fee: p.transactionFee || p.features?.transactionFee || 5,
          popular: p.popular || false,
          features: p.features?.list || p.featuresList || [],
        })));
      }
    }).catch(() => {});

    // Check for unregistered templates
    fetchAllTemplates().then(dbTemplates => {
      const registered = (Array.isArray(dbTemplates) ? dbTemplates : dbTemplates?.data || []).map(t => t.key);
      const unregistered = AVAILABLE_TEMPLATES.filter(t => !registered.includes(t.key));
      setUnregisteredCount(unregistered.length);
    }).catch(() => {});

    // Load admin profile from localStorage
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      setAdminName(`${userData.firstname || ""} ${userData.lastname || ""}`.trim() || "Admin");
      setAdminEmail(userData.email || localStorage.getItem("adminEmail") || "");
    } catch {
      setAdminEmail(localStorage.getItem("adminEmail") || "");
    }

    // Load platform settings from backend
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    if (token) {
      getAdminSettings(token).then(res => {
        const s = res?.data || {};
        if (s.globalAlertText !== undefined) setGlobalAlertText(s.globalAlertText);
        if (s.platformFee !== undefined) setPlatformFee(Number(s.platformFee));
        if (s.isMaintenanceMode !== undefined) setIsMaintenanceMode(s.isMaintenanceMode);
        if (s.isLiveMode !== undefined) setIsLiveMode(s.isLiveMode);
      }).catch(() => {});
    }
  }, [fetchAllData]);

  // Registrations State
  const [regSearchQuery, setRegSearchQuery] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState("All");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [currentRegPage, setCurrentRegPage] = useState(1);
  const [regsPerPage, setRegsPerPage] = useState(10);

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      await saveAdminSettings({
        globalAlertText,
        platformFee,
        isMaintenanceMode,
        isLiveMode,
      }, token);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  // Revenue pagination
  const [currentRevPage, setCurrentRevPage] = useState(1);
  const [revPerPage, setRevPerPage] = useState(10);

  // Reusable pagination component with rows-per-page selector
  const PaginationBar = ({ currentPage, setCurrentPage, totalItems, perPage, setPerPage, label = "items" }) => {
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);

    return (
      <div className="pagination-controls" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", padding: "12px 0", borderTop: "1px solid #e5e7eb", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.82rem", color: "#6b7280" }}>
          <span>Showing {startItem} to {endItem} of {totalItems} {label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Rows:</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "0.82rem", cursor: "pointer" }}
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="action-btn" style={{ padding: "6px 10px" }}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let page;
            if (totalPages <= 5) page = i + 1;
            else if (currentPage <= 3) page = i + 1;
            else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
            else page = currentPage - 2 + i;
            return (
              <button key={page} onClick={() => setCurrentPage(page)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid", borderColor: currentPage === page ? "#6574e9" : "#e5e7eb", background: currentPage === page ? "#6574e9" : "transparent", color: currentPage === page ? "#fff" : "#6b7280", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer" }}>
                {page}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className="action-btn" style={{ padding: "6px 10px" }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    try {
      if (loading) {
        return (
          <div className="dashboard-loading">
            <div className="loader"></div>
            <p>Loading Platform Data...</p>
          </div>
        );
      }

      if (error) {
        return (
          <div className="dashboard-error">
            <AlertCircle size={40} className="text-red" />
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button className="action-btn primary mt-20" onClick={fetchAllData}>
              Retry Connection
            </button>
          </div>
        );
      }

      switch (activeTab) {
        case "analytics": {
        // Analytics uses backend pre-calculated totals straight from the analytics API endpoint.
        const stats = {
          traffic: data.analytics?.totalClients || data.analytics?.total_clients || 0,
          conversion: (data.analytics?.totalRegistrations || data.analytics?.total_registrations) > 0 ? (((data.analytics.totalRegistrations || data.analytics.total_registrations) / (data.analytics.totalUsers || data.analytics.total_users || 1)) * 100).toFixed(1) + "%" : "0%",
          gmv: `₹ ${((data.analytics?.totalRevenue || data.analytics?.total_revenue || 0) / 1000).toFixed(1)}k`,
          churn: data.subscriptionsData?.stats?.churnRate ? `${data.subscriptionsData.stats.churnRate}%` : "0%"
        };

        const activeCreatorsCount = data.analytics?.totalClients || data.analytics?.total_clients || 0;

        return (
          <div className="analytics-page fade-in">
            <div className="analytics-header">
              <div className="date-picker-container">
                <Calendar size={18} className="text-gray" />
                <select 
                  value={analyticsRange} 
                  onChange={(e) => setAnalyticsRange(e.target.value)}
                  className="analytics-date-select"
                >
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Last 6 Months">Last 6 Months</option>
                  <option value="Last Year">Last Year</option>
                </select>
              </div>
            </div>

            <div className="kpi-cards mt-20">
              <div className="kpi-card glowing-border">
                <div className="kpi-header">
                  <div className="kpi-icon platforms-bg"><Globe size={20} className="platforms-icon" /></div>
                  <span className="kpi-growth positive">Platform Live</span>
                </div>
                <div className="kpi-title">Active Creators</div>
                <div className="kpi-value">{activeCreatorsCount}</div>
              </div>
              <div className="kpi-card glowing-border">
                <div className="kpi-header">
                  <div className="kpi-icon conversion-bg"><TrendingUp size={20} className="conversion-icon" /></div>
                </div>
                <div className="kpi-title">Global Conversion Rate</div>
                <div className="kpi-value">{stats.conversion}</div>
                <span className="kpi-subtext">Powerful Templates! </span>
              </div>
              <div className="kpi-card glowing-border">
                <div className="kpi-header">
                  <div className="kpi-icon gmv-bg"><IndianRupee size={20} className="gmv-icon" /></div>
                </div>
                <div className="kpi-title">Total GMV</div>
                <div className="kpi-value">{stats.gmv}</div>
                <span className="kpi-subtext">Creator Turnover</span>
              </div>
              <div className="kpi-card glowing-border-error">
                <div className="kpi-header">
                  <div className="kpi-icon churn-bg"><CheckCircle size={20} className="churn-icon" /></div>
                </div>
                <div className="kpi-title">Platform Status</div>
                <div className="kpi-value text-green">Online</div>
                <span className="kpi-tag-success">Secure</span>
              </div>
            </div>

            <div className="charts-container mt-20">
              <div className="chart-card wide-chart">
                <div className="chart-header">
                  <h3>Recent Platform Activity</h3>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="dot creators"></span> Signups</div>
                    <div className="legend-item"><span className="dot students"></span> Enrollments</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={(() => {
                    // Group registrations by date for real chart data
                    const byDate = {};
                    (data.registrations || []).forEach(r => {
                      const d = r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;
                      if (d) { byDate[d] = (byDate[d] || 0) + 1; }
                    });
                    const entries = Object.entries(byDate).slice(-10);
                    if (entries.length === 0) return [{ name: "No data", enrollments: 0 }];
                    let cumulative = 0;
                    return entries.map(([date, count]) => {
                      cumulative += count;
                      return { name: date, enrollments: count, signups: cumulative };
                    });
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      itemStyle={{ color: '#1a1a35' }}
                    />
                    <Line type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="enrollments" stroke="#6574e9" strokeWidth={3} dot={{ r: 4, fill: '#6574e9' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                 <h3>Category Breakdown</h3>
                 {(() => {
                   const catCounts = {};
                   (data.webinars || []).forEach(w => (w.categories || []).forEach(c => { catCounts[c] = (catCounts[c] || 0) + 1; }));
                   const entries = Object.entries(catCounts);
                   if (entries.length === 0) return <div className="text-gray text-small py-40 text-center">No webinar categories yet.</div>;
                   return (
                     <div style={{ padding: "16px 0" }}>
                       {entries.sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                         <div key={cat} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                           <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a1a35", minWidth: "100px" }}>{cat}</span>
                           <div style={{ flex: 1, height: "8px", background: "#f3f4f6", borderRadius: "4px", overflow: "hidden" }}>
                             <div style={{ width: `${Math.round((count / (data.webinars.length || 1)) * 100)}%`, height: "100%", background: "#6574e9", borderRadius: "4px" }} />
                           </div>
                           <span style={{ fontSize: "0.78rem", color: "#6b7280", minWidth: "30px" }}>{count}</span>
                         </div>
                       ))}
                     </div>
                   );
                 })()}
              </div>
            </div>

            <div className="leaderboard-section mt-20">
              <div className="section-header"><h3>Creator Leaderboard</h3></div>
              <div className="table-container mt-15">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Creator Info</th>
                      <th>Total Webinars</th>
                      <th>Revenue Generated</th>
                      <th className="text-neon-green">Platform Cut ({platformFee}%)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.usersData?.table?.slice(0, 5).map(creator => (
                      <tr key={creator.id}>
                        <td>
                          <div className="creator-cell">
                            <div className="creator-avatar" style={{background: '#6574e9'}}>{creator.userInfo?.avatar || 'C'}</div>
                            <div className="creator-details">
                              <span className="creator-name">{(creator.userInfo?.name || '').trim()}</span>
                              <span className="creator-email">{(creator.userInfo?.email || '').trim()}</span>
                            </div>
                          </div>
                        </td>
                        <td>{creator.stats?.webinars || 0}</td>
                        <td className="font-mono">₹ {(creator.stats?.revenue || 0).toLocaleString()}</td>
                        <td className="text-neon-green fw-700 font-mono">₹ {((creator.stats?.revenue || 0) * (platformFee / 100)).toLocaleString()}</td>
                        <td><button className="view-profile-btn"><Eye size={14} /> View Profile</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      case "registrations": {
        const filteredRegs = [...data.registrations].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).filter(reg => {
          const searchLower = regSearchQuery.toLowerCase();
          const fname = String(reg.user?.firstname || reg.firstname || "");
          const lname = String(reg.user?.lastname || reg.lastname || "");
          const email = String(reg.user?.email || reg.email || "");
          
          const matchesSearch = fname.toLowerCase().includes(searchLower) || 
                                lname.toLowerCase().includes(searchLower) ||
                                email.toLowerCase().includes(searchLower) ||
                                (reg.webinar?.title && reg.webinar.title.toLowerCase().includes(searchLower)) ||
                                (searchLower === '');
          const matchesPaymentStatus = regStatusFilter === "All" || (reg.paymentStatus && reg.paymentStatus.toLowerCase() === regStatusFilter.toLowerCase());
          const matchesRegStatus = statusFilter === "All" || reg.status === statusFilter;
          return matchesSearch && matchesPaymentStatus && matchesRegStatus;
        });

        const indexOfLastReg = currentRegPage * regsPerPage;
        const indexOfFirstReg = indexOfLastReg - regsPerPage;
        const currentRegs = filteredRegs.slice(indexOfFirstReg, indexOfLastReg);
        const totalRegPages = Math.ceil(filteredRegs.length / regsPerPage);

        const totalRevenue = data.registrations.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
        const paidCount = data.registrations.filter(r => r.paymentStatus === 'paid').length;
        
        return (
          <div className="registrations-page fade-in">
            <div className="kpi-cards">
              <div className="kpi-card glowing-border">
                <div className="kpi-header"><div className="kpi-icon platforms-bg"><ClipboardList size={20} className="platforms-icon" /></div></div>
                <div className="kpi-title">Total Registrations</div>
                <div className="kpi-value">{data.registrations.length}</div>
                <span className="kpi-growth positive text-small">{paidCount} Successful Payments</span>
              </div>
              <div className="kpi-card glowing-border">
                <div className="kpi-header"><div className="kpi-icon gmv-bg"><IndianRupee size={20} className="gmv-icon" /></div></div>
                <div className="kpi-title">Registration Revenue</div>
                <div className="kpi-value">₹ {totalRevenue.toLocaleString()}</div>
                <span className="kpi-subtext">Direct Platform GMV</span>
              </div>
              <div className="kpi-card glowing-border">
                <div className="kpi-header"><div className="kpi-icon conversion-bg"><Users size={20} className="conversion-icon" /></div></div>
                <div className="kpi-title">Avg Ticket Size</div>
                <div className="kpi-value">₹ {data.registrations.length ? (totalRevenue / data.registrations.length).toFixed(0) : 0}</div>
              </div>
            </div>

            <div className="smart-toolbar mt-20">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="Search user or webinar..." 
                  value={regSearchQuery}
                  onChange={(e) => { setRegSearchQuery(e.target.value); setCurrentRegPage(1); }}
                />
              </div>
              <div className="toolbar-actions">
                <div className="filter-dropdown">
                  <Filter size={16} />
                  <select value={regStatusFilter} onChange={(e) => { setRegStatusFilter(e.target.value); setCurrentRegPage(1); }}>
                    <option value="All">All Payments</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div className="filter-dropdown">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Registration Status</option>
                    <option value="registered">Registered</option>
                    <option value="attended">Attended</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="table-container mt-20">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Webinar Information</th>
                    <th>Amount Paid</th>
                    <th>Payment Status</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRegs.map(reg => (
                    <tr key={reg._id} onClick={() => setSelectedRegistration(reg)} className="cursor-pointer hover-row">
                      <td>
                        <div className="creator-cell">
                          <div className="creator-avatar">{(reg.user?.firstname || reg.firstname || 'U')[0]}{(reg.user?.lastname || reg.lastname || ' ')[0]}</div>
                          <div className="creator-details">
                            <span className="creator-name">{(reg.user?.firstname || reg.firstname || '').trim()} {(reg.user?.lastname || reg.lastname || '').trim()}</span>
                            <span className="creator-email">{(reg.user?.email || reg.email || '').trim()}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="webinar-cell">
                          <span className="webinar-title block fw-600">{reg.webinar?.title}</span>
                          <span className="webinar-date text-gray text-small">
                            {reg.webinar?.webinarDateTime ? new Date(reg.webinar.webinarDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono fw-600">₹ {reg.amountPaid}</td>
                      <td>
                        <span className={`status-pill ${reg.paymentStatus}`}>
                          <span className={`status-dot-inline ${reg.paymentStatus === 'paid' ? 'dot-green' : 'dot-orange'}`}></span> {reg.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="text-gray">
                        {reg.createdAt ? new Date(reg.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                      </td>
                      <td><button className="icon-btn" onClick={(e) => {e.stopPropagation(); setSelectedRegistration(reg);}}><MoreVertical size={18} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <PaginationBar currentPage={currentRegPage} setCurrentPage={setCurrentRegPage} totalItems={filteredRegs.length} perPage={regsPerPage} setPerPage={setRegsPerPage} label="registrations" />
            </div>

            {selectedRegistration && (
              <>
                <div className="drawer-overlay" onClick={() => setSelectedRegistration(null)}></div>
                <div className="slide-over-drawer">
                  <div className="drawer-header">
                    <h3>Registration Details</h3>
                    <button className="close-btn" onClick={() => setSelectedRegistration(null)}><X size={20} /></button>
                  </div>
                  <div className="drawer-body">
                    <div className="profile-hero p-20" style={{ background: '#fafafa', borderRadius: '12px' }}>
                      <h4 className="m-0 mb-10 text-blue">Transaction ID: {selectedRegistration._id}</h4>
                      <div className="flex-between">
                        <span className="text-gray">Status:</span>
                        <span className={`status-pill ${selectedRegistration.paymentStatus || 'pending'}`}>{(selectedRegistration.paymentStatus || 'pending').toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="profile-section mt-20">
                      <h4>User Info</h4>
                      <div className="info-row"><span className="text-gray">Name:</span> <span className="text-white">{(selectedRegistration.user?.firstname || selectedRegistration.firstname || '').trim()} {(selectedRegistration.user?.lastname || selectedRegistration.lastname || '').trim()}</span></div>
                      <div className="info-row"><span className="text-gray">Email:</span> <span className="text-white">{(selectedRegistration.user?.email || selectedRegistration.email || '').trim()}</span></div>
                      <div className="info-row"><span className="text-gray">Reg. Status:</span> <span className={`status-pill ${selectedRegistration.status}`}>{selectedRegistration.status?.toUpperCase()}</span></div>
                    </div>

                    <div className="profile-section mt-20">
                      <h4>Webinar Info</h4>
                      <div className="info-row"><span className="text-gray">Title:</span> <span className="text-white">{selectedRegistration.webinar?.title}</span></div>
                      <div className="info-row">
                        <span className="text-gray">Date:</span> 
                        <span className="text-white">{selectedRegistration.webinar?.webinarDateTime ? new Date(selectedRegistration.webinar.webinarDateTime).toLocaleString() : 'TBD'}</span>
                      </div>
                    </div>

                    <div className="profile-section mt-20">
                      <h4>Financials</h4>
                      <div className="info-row"><span className="text-gray">Amount Paid:</span> <span className="text-white font-mono">₹ {selectedRegistration.amountPaid}</span></div>
                      <div className="info-row"><span className="text-gray">Platform Tax:</span> <span className="text-red font-mono">-₹ {(selectedRegistration.amountPaid * 0.18).toFixed(2)}</span></div>
                    </div>

                    <div className="danger-zone mt-20">
                       <button className="action-btn secondary w-100"><Download size={16}/> Download Invoice</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      }

      case "dashboard": {
        // For dashboard trends, use the pre-calculated revenue trend from backend if available
        const revenueData = data.revenueData?.charts?.revenueTrend?.length > 0
          ? data.revenueData.charts.revenueTrend.map(r => ({ name: r.date, revenue: r.amount }))
          : [
              { name: 'Day 1', revenue: 0 },
              { name: 'Today', revenue: 0 }
            ];

        const subscriptionData = data.revenueData?.charts?.revenueSplit?.length > 0
          ? data.revenueData.charts.revenueSplit.map(s => ({ name: s.label, value: s.value }))
          : [
              { name: 'Webinars', value: 0 },
              { name: 'Subscriptions', value: 0 }
            ];
        const COLORS = ['#6574e9', '#8b5cf6', '#ec4899'];
        
        const totalRevenue = data.revenueData?.cards?.totalRevenue || data.revenueData?.cards?.total_revenue || 0;
        const activeUsersCount = data.analytics?.totalClients || data.analytics?.total_clients || 0;
        const totalWebinars = data.analytics?.totalWebinars || data.analytics?.total_webinars || 0;

        return (
          <div className="dashboard-content fade-in">
            <div className="kpi-cards">
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon revenue-bg"><IndianRupee size={20} className="revenue-icon" /></div>
                  <span className="kpi-growth positive">Live Platform GMV</span>
                </div>
                <div className="kpi-title">Total Revenue</div>
                <div className="kpi-value">₹ {(totalRevenue || 0).toLocaleString()}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon creators-bg"><Users size={20} className="creators-icon" /></div>
                </div>
                <div className="kpi-title">Active Clients</div>
                <div className="kpi-value">{activeUsersCount}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon registrations-bg"><Ticket size={20} className="registrations-icon" /></div>
                </div>
                <div className="kpi-title">Total Registrations</div>
                <div className="kpi-value">{data.analytics?.totalRegistrations || data.analytics?.total_registrations || 0}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon subscriptions-bg"><Crown size={20} className="subscriptions-icon" /></div>
                </div>
                <div className="kpi-title">Total Webinars</div>
                <div className="kpi-value">{totalWebinars}</div>
              </div>
            </div>

            {/* Layer 2: Visual Analytics & Charts */}
            <div className="charts-container mt-20">
              <div className="chart-card">
                <h3>Revenue Trend (Last 30 Days)</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1a1a35' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#ffffff', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="chart-card">
                <h3>Subscription Distribution</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1a1a35' }}
                        itemStyle={{ color: '#1a1a35' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Layer 3 & Layer 4: Bottom Section */}
            <div className="dashboard-bottom mt-20">
              {/* Layer 3: Recent Live Activity */}
              <div className="activity-section">
                <h3>Recent Live Activity</h3>
                
                <div className="activity-list">
                  <h4>Latest Transactions</h4>
                  {data.registrations && data.registrations.length > 0 ? (
                    [...data.registrations].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5).map(reg => (
                      <div key={reg._id} className="activity-item">
                        <div className="activity-info">
                          <strong>{(reg.user?.firstname || reg.firstname || 'Guest').trim()} {(reg.user?.lastname || reg.lastname || '').trim()}</strong> paid <span>₹{reg.amountPaid}</span> for {(reg.webinar?.title || 'a Webinar').trim()}
                        </div>
                        <div className="activity-meta">
                          <span className="time">{reg.createdAt ? new Date(reg.createdAt).toLocaleTimeString() : 'Recently'}</span>
                          <span className={`status ${reg.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                            {reg.paymentStatus === 'paid' ? <CheckCircle size={14}/> : <AlertCircle size={14}/>} {reg.paymentStatus || 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray py-10 text-small">No recent transactions.</div>
                  )}
                </div>
                
                <div className="activity-list mt-20">
                  <h4>New Webinars Created</h4>
                  {data.webinars && data.webinars.length > 0 ? (
                    [...data.webinars].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5).map(webinar => (
                      <div key={webinar._id} className="activity-item">
                        <div className="activity-info">
                          <strong>{(webinar.title || '').trim()}</strong> by <strong>{(webinar.createdBy?.firstname || 'Creator').trim()}</strong>
                        </div>
                        <div className="activity-meta">
                          <span className="time">Scheduled: {webinar.webinarDateTime ? new Date(webinar.webinarDateTime).toLocaleDateString() : 'TBD'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray py-10 text-small">No recent webinars.</div>
                  )}
                </div>
              </div>

              {/* Layer 4: Admin Alerts & Quick Actions */}
              <div className="alerts-section">
                <h3>Platform Health & Actions</h3>
                
                <div className="alerts-list">
                  <h4>Real-time Status</h4>
                  <div className="alert-item success">
                    <CheckCircle size={16} /> All systems operational
                  </div>
                  <div className="alert-item warning">
                    <AlertCircle size={16} /> {data.usersData?.stats?.bannedUsers || 0} Suspended accounts
                  </div>
                </div>

                <div className="quick-actions mt-20">
                  <h4>Quick Actions</h4>
                  <button className="action-btn primary" onClick={() => setActiveTab("users")}>
                    <Users size={16} /> View All Clients
                  </button>
                  <button className="action-btn secondary" onClick={() => {
                    // Export dashboard data as CSV
                    const rows = [["Metric", "Value"], ["Total Revenue", totalRevenue], ["Active Clients", activeUsersCount], ["Total Registrations", data.analytics?.totalRegistrations || 0], ["Total Webinars", totalWebinars]];
                    const csv = rows.map(r => r.join(",")).join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `enrollify-report-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
                  }}>
                    <Download size={16} /> Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "users": {
        const tableUsers = (data.usersData?.table || [])
          .slice().sort((a, b) => new Date(b.joinedDate || 0) - new Date(a.joinedDate || 0));
        const filteredUsers = tableUsers.filter(user => {
          if (!user) return false;
          const name = String(user.userInfo?.name || '').toLowerCase();
          const query = userSearchQuery.toLowerCase();
          const matchesSearch = name.includes(query) ||
                                (user.userInfo?.email && String(user.userInfo.email).toLowerCase().includes(query));
          const matchesPlan = userPlanFilter === "All" || String(user.plan || '').includes(userPlanFilter);
          const matchesStatus = userStatusFilter === "All" || String(user.status || '') === userStatusFilter;
          return matchesSearch && matchesPlan && matchesStatus;
        });

        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
        const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

        return (
          <div className="users-page relative">
            {/* Layer 1: Top User Metrics */}
            <div className="kpi-cards">
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon creators-bg"><Users size={20} className="creators-icon" /></div>
                </div>
                <div className="kpi-title">Total Creators</div>
                <div className="kpi-value">{data.usersData?.stats?.totalCreators || 0} <span className="kpi-growth positive text-small">Active Hub</span></div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon subs-bg"><Crown size={20} className="subs-icon" /></div>
                </div>
                <div className="kpi-title">Active Subscriptions</div>
                <div className="kpi-value">{data.usersData?.stats?.activeSubscriptions || 0}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon students-bg"><Plus size={20} className="students-icon" /></div>
                  <span className="kpi-growth positive">Live</span>
                </div>
                <div className="kpi-title">New Signups (Last 30 Days)</div>
                <div className="kpi-value">
                  {data.usersData?.stats?.newSignups || 0}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon error-bg"><UserX size={20} className="error-icon" /></div>
                </div>
                <div className="kpi-title">Banned / Suspended</div>
                <div className="kpi-value">{data.usersData?.stats?.bannedUsers || 0}</div>
              </div>
            </div>

            {/* Layer 2: The Smart Toolbar */}
            <div className="smart-toolbar mt-20">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by Name, Email or Phone..." 
                  value={userSearchQuery}
                  onChange={(e) => {setUserSearchQuery(e.target.value); setCurrentPage(1);}}
                  className="search-input"
                />
              </div>
              <div className="toolbar-actions">
                <div className="filter-dropdown">
                  <Filter size={16} className="text-gray" />
                  <select value={userPlanFilter} onChange={(e) => {setUserPlanFilter(e.target.value); setCurrentPage(1);}}>
                    <option value="All">All Plans</option>
                    <option value="Free">Free</option>
                    {pricingPlans.map(p => (
                      <option key={p.id || p.name} value={p.name}>{p.name} ({p.price > 0 ? `₹${p.price}` : "Free"})</option>
                    ))}
                  </select>
                </div>
                <div className="filter-dropdown">
                  <select value={userStatusFilter} onChange={(e) => {setUserStatusFilter(e.target.value); setCurrentPage(1);}}>
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Payment Failed">Payment Failed</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <button className="action-btn secondary">
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>

            {/* Layer 3: The Premium Data Table */}
            <div className="table-container mt-20">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>User Info</th>
                    <th>Current Plan</th>
                    <th>Joined Date</th>
                    <th>Total Webinars</th>
                    <th>Revenue Generated</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => {
                    if (!user) return null;
                    return (
                    <tr key={user.id || Math.random()} onClick={() => setSelectedUser(user)} className="cursor-pointer hover-row">
                      <td>
                        <div className="user-info-cell">
                          <div className="avatar" style={{background: '#6574e9'}}>
                            {user.userInfo?.avatar || 'U'}
                          </div>
                          <div className="user-details">
                            <span className="user-name">{(user.userInfo?.name || '').trim()}</span>
                            <span className="user-email">{(user.userInfo?.email || '').trim()}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`plan-pill ${String(user.plan || 'Free').toLowerCase()}`}>
                          {user.plan || 'Free'}
                        </span>
                      </td>
                      <td className="text-gray">{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="font-mono">{(user.stats?.webinars || 0)}</td>
                      <td className="font-mono">₹ {(user.stats?.revenue || 0).toLocaleString()}</td>
                      <td>
                        <span className={`status-pill ${String(user.status || 'Inactive').toLowerCase().replace(' ', '-')}`}>
                          <span className={`status-dot-inline ${user.status === 'Active' ? 'dot-green' : 'dot-red'}`}></span> {user.status || 'Inactive'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); /* Menu logic */ }}>
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                  {currentUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-40 text-gray">No users found matching your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              <PaginationBar currentPage={currentPage} setCurrentPage={setCurrentPage} totalItems={filteredUsers.length} perPage={usersPerPage} setPerPage={setUsersPerPage} label="users" />
            </div>

            {/* Layer 4: Slide-Over Profile Drawer */}
            {selectedUser && (
              <>
                <div className="drawer-overlay" onClick={() => setSelectedUser(null)}></div>
                <div className="slide-over-drawer">
                  <div className="drawer-header">
                    <h3>User Profile</h3>
                    <button className="close-btn" onClick={() => setSelectedUser(null)}><X size={20} /></button>
                  </div>
                  <div className="drawer-body">
                    <div className="profile-hero">
                      <div className="avatar-large">{selectedUser.firstname?.[0]}{selectedUser.lastname?.[0]}</div>
                      <h2>{(selectedUser.firstname || '').trim()} {(selectedUser.lastname || '').trim()}</h2>
                      <p className="text-gray">{(selectedUser.email || '').trim()}</p>
                      {selectedUser.subdomain ? (
                        <a href={`https://${selectedUser.subdomain}.enrollify.com`} target="_blank" rel="noreferrer" className="subdomain-link">
                          {selectedUser.subdomain}.enrollify.com
                        </a>
                      ) : (
                        <span className="text-gray text-small">No subdomain set</span>
                      )}
                    </div>
                    
                    <div className="profile-section mt-20">
                      <h4>Subscription Details</h4>
                      <div className="info-row">
                        <span>Current Plan</span>
                        <span className={`admin-badge plan-${(selectedUser.plan || 'free').toLowerCase()}`}>{selectedUser.plan || 'Free'}</span>
                      </div>
                      <div className="info-row">
                        <span>Status</span>
                        <span className={`status-pill ${(selectedUser.status || 'Inactive').toLowerCase().replace(' ', '-')}`}>{selectedUser.status || 'Inactive'}</span>
                      </div>
                      <div className="info-row">
                        <span>Subscription Valid Till</span>
                        <span className="text-gray">{selectedUser.subscriptionValidTill ? new Date(selectedUser.subscriptionValidTill).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="profile-section mt-20">
                      <h4>Recent Webinars ({selectedUser.webinarsCount || 0})</h4>
                      {selectedUser.recentWebinars && selectedUser.recentWebinars.length > 0 ? (
                        <div className="mini-list">
                          {selectedUser.recentWebinars.map((w, idx) => (
                            <div key={idx} className="mini-list-item">
                              <div>{w.title}</div>
                              <div className="text-gray text-small">{w.date}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray text-small">No recent activity found.</p>
                      )}
                    </div>

                    <div className="danger-zone mt-20">
                      <h4>Admin Actions</h4>
                      <button className="danger-btn w-100"><UserX size={16}/> Suspend Account</button>
                      <button className="warning-btn mt-10 w-100"><Unlock size={16}/> Reset Password</button>
                      <button className="action-btn primary mt-10 w-100"><Crown size={16}/> Manual Plan Upgrade</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      }

      case "webinars": {
        // Map frontend filter labels to backend status enum
        const statusMap = { "Upcoming": ["scheduled", "published"], "Live Now": ["live"], "Completed": ["completed"], "Draft": ["draft"] };
        const filteredWebinars = [...data.webinars].sort((a, b) => new Date(b.createdAt || b.webinarDateTime || 0) - new Date(a.createdAt || a.webinarDateTime || 0)).filter(w => {
          const searchLower = webinarSearch.toLowerCase();
          const titleMatches = w.title ? w.title.toLowerCase().includes(searchLower) : false;
          const creatorMatches = (w.createdBy?.firstname || w.creator?.firstname || "").toLowerCase().includes(searchLower);
          const matchesSearch = titleMatches || creatorMatches;
          const matchesStatus = webinarStatus === "All" || (statusMap[webinarStatus] ? statusMap[webinarStatus].includes(w.status) : w.status === webinarStatus);
          const matchesType = webinarType === "All" || (webinarType === "Free" ? (!w.price || w.price === 0) : w.price > 0);
          const matchesCat = webinarCategory === "All" || (w.categories || []).includes(webinarCategory);
          return matchesSearch && matchesStatus && matchesType && matchesCat;
        });

        const indexOfLastWebinar = currentWebinarPage * webinarsPerPage;
        const indexOfFirstWebinar = indexOfLastWebinar - webinarsPerPage;
        const currentWebinars = filteredWebinars.slice(indexOfFirstWebinar, indexOfLastWebinar);
        const totalWebinarPages = Math.ceil(filteredWebinars.length / webinarsPerPage);

        // Fallback initials or default abstract logic for thumbnail
        const getThumbnailInitial = (title) => {
          return title ? title.substring(0, 2).toUpperCase() : 'WB';
        };

        if (selectedWebinar) {
          return (
            <div className="webinar-detail-page relative">
              <button 
                className="action-btn secondary mb-20" 
                onClick={() => setSelectedWebinar(null)}
                style={{ width: 'fit-content' }}
              >
                <ChevronLeft size={16} /> Back to Webinars
              </button>

              <div className="profile-hero" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '30px', marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={`thumbnail-large thumb-${(selectedWebinar.category || 'tech').toLowerCase()}`}>
                  {selectedWebinar.img ? <img src={selectedWebinar.img} alt={selectedWebinar.title} /> : <span>{getThumbnailInitial(selectedWebinar.title)}</span>}
                </div>
                <h2>{selectedWebinar.title || 'Untitled Webinar'}</h2>
                <span className={`status-pill mt-10 ${selectedWebinar.status || 'draft'}`}>{selectedWebinar.status === 'scheduled' || selectedWebinar.status === 'published' ? 'Upcoming' : selectedWebinar.status === 'live' ? 'Live' : selectedWebinar.status === 'completed' ? 'Completed' : 'Draft'}</span>
                
                <div className="quick-links mt-20" style={{ display: 'flex', gap: '12px' }}>
                  <button className="action-btn secondary">
                    <Eye size={16} /> View Live Landing Page
                  </button>
                  <button className="danger-btn"><Ban size={16}/> Unpublish / Ban</button>
                </div>
              </div>

              <div className="dashboard-bottom mt-20" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
                <div className="profile-section" style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Event Details</h4>
                  <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #e5e7eb' }}>
                    <span style={{ color: '#6b7280' }}>Creator</span>
                    <span className="fw-500 text-white">{(selectedWebinar.creator?.firstname || 'Creator').trim()}</span>
                  </div>
                  <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #e5e7eb' }}>
                    <span style={{ color: '#6b7280' }}>Schedule</span>
                    <span className="text-white">{selectedWebinar.webinarDateTime ? new Date(selectedWebinar.webinarDateTime).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #e5e7eb' }}>
                    <span style={{ color: '#6b7280' }}>Registrations</span>
                    <span className="text-white">{selectedWebinar.registrationsCount || 0}{selectedWebinar.maxSeats ? ` / ${selectedWebinar.maxSeats}` : ' (Unlimited)'}</span>
                  </div>
                  <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                    <span style={{ color: '#6b7280' }}>Revenue Generated</span>
                    <span className="text-green fw-500">₹ {(selectedWebinar.revenue || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="profile-section" style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Attendees</h4>
                  {selectedWebinar.registrationsCount > 0 ? (
                    <div className="mini-list" style={{ border: 'none', background: 'transparent' }}>
                      <div className="text-gray py-20 text-center text-small">Attendee names are only available in the Participant List.</div>
                      <div className="mini-list-item justify-center mt-10" style={{ padding: '12px', background: '#f8f9fb', borderRadius: '8px', textAlign: 'center' }}>
                        <span className="text-blue text-small cursor-pointer">View Participant List ({selectedWebinar.registrationsCount})</span>
                      </div>
                      <button className="warning-btn mt-20 w-100" style={{ marginTop: '20px' }}><IndianRupee size={16}/> Issue Bulk Refund</button>
                    </div>
                  ) : (
                    <p className="text-gray text-small">No attendees yet.</p>
                  )}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="webinars-page relative">
            {/* Layer 1: Top Webinar Metrics */}
            <div className="kpi-cards">
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon creators-bg"><Video size={20} className="creators-icon" /></div>
                </div>
                <div className="kpi-title">Total Webinars Created</div>
                <div className="kpi-value">{data.webinars.length}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon subs-bg"><Calendar size={20} className="subs-icon" /></div>
                </div>
                <div className="kpi-title">Upcoming / Live Webinars</div>
                <div className="kpi-value">{data.webinars.filter(w => ['scheduled', 'published', 'live'].includes(w.status)).length}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon students-bg"><Users size={20} className="students-icon" /></div>
                  <span className="kpi-growth positive">+{data.registrations.length} Total</span>
                </div>
                <div className="kpi-title">Total Registrations</div>
                <div className="kpi-value">{data.webinars.reduce((acc, w) => acc + (w.registrationsCount || 0), 0)}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon revenue-bg"><Activity size={20} className="revenue-icon" /></div>
                </div>
                <div className="kpi-title">Free vs Paid Ratio</div>
                <div className="kpi-value">{(() => {
                  const total = data.webinars.length || 1;
                  const free = data.webinars.filter(w => !w.price || w.price === 0).length;
                  const paid = total - free;
                  return `${Math.round((free / total) * 100)}% / ${Math.round((paid / total) * 100)}%`;
                })()}</div>
              </div>
            </div>

            {/* Layer 2: Advanced Search & Filter (Smart Toolbar) */}
            <div className="smart-toolbar mt-20">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by Title or Creator..." 
                  value={webinarSearch}
                  onChange={(e) => {setWebinarSearch(e.target.value); setCurrentWebinarPage(1);}}
                  className="search-input"
                />
              </div>
              <div className="toolbar-actions">
                <div className="filter-dropdown">
                  <Filter size={16} className="text-gray" />
                  <select value={webinarStatus} onChange={(e) => {setWebinarStatus(e.target.value); setCurrentWebinarPage(1);}}>
                    <option value="All">All Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Live Now">Live Now</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="filter-dropdown">
                  <select value={webinarType} onChange={(e) => {setWebinarType(e.target.value); setCurrentWebinarPage(1);}}>
                    <option value="All">All Types</option>
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="filter-dropdown">
                  <select value={webinarCategory} onChange={(e) => {setWebinarCategory(e.target.value); setCurrentWebinarPage(1);}}>
                    <option value="All">All Categories</option>
                    {[...new Set(data.webinars.flatMap(w => w.categories || []))].filter(Boolean).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Layer 3: The Premium Data Table */}
            <div className="table-container mt-20">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Webinar Info</th>
                    <th>Creator / Host</th>
                    <th>Schedule</th>
                    <th>Pricing & Revenue</th>
                    <th>Seats Filled</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {currentWebinars.map(webinar => {
                    const progressPercent = webinar.maxSeats ? Math.min(100, Math.round(((webinar.registrationsCount || 0) / webinar.maxSeats) * 100)) : null;
                    return (
                      <tr key={webinar._id} onClick={() => setSelectedWebinar(webinar)} className="cursor-pointer hover-row">
                        <td>
                          <div className="webinar-info-cell">
                            <div className={`thumbnail thumb-${(webinar.category || 'tech').toLowerCase()}`}>
                              {webinar.img ? <img src={webinar.img} alt={webinar.title} /> : <span>{getThumbnailInitial(webinar.title)}</span>}
                            </div>
                            <div className="webinar-details">
                              <span className="webinar-title">{webinar.title}</span>
                              <span className="webinar-id text-gray font-mono">ID: {webinar._id ? webinar._id.slice(-6) : 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="user-details">
                            <span className="user-name">{(webinar.creator?.firstname || 'Creator').trim()}</span>
                          </div>
                        </td>
                        <td>
                          <div className="user-details">
                            <span className="user-name">{webinar.webinarDateTime ? new Date(webinar.webinarDateTime).toLocaleDateString() : 'TBD'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="user-details">
                            <span className={`admin-badge ${(!webinar.price || webinar.price === 0) ? 'plan-free' : 'plan-elite'}`}>{(!webinar.price || webinar.price === 0) ? 'Free' : `₹${webinar.price}`}</span>
                            <span className="user-email mt-1">Rev: ₹{(webinar.revenue || 0).toLocaleString()}</span>
                          </div>
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-text text-gray text-small">
                              <span>{webinar.registrationsCount || 0}{webinar.maxSeats ? ` / ${webinar.maxSeats}` : ' (Unlimited)'}</span>
                              {progressPercent !== null && <span>{progressPercent}%</span>}
                            </div>
                            {progressPercent !== null && (
                              <div className="progress-bar-bg">
                                <div className={`progress-bar-fill ${progressPercent >= 100 ? 'full' : ''}`} style={{ width: `${Math.min(100, progressPercent)}%` }}></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${(webinar.status || 'draft').toLowerCase().replace(' ', '-')}`}>
                            <span className={`status-dot-inline ${['scheduled', 'published'].includes(webinar.status) ? 'dot-blue' : webinar.status === 'live' ? 'dot-red blink' : webinar.status === 'completed' ? 'dot-green' : 'dot-gray'}`}></span> {webinar.status === 'scheduled' || webinar.status === 'published' ? 'Upcoming' : webinar.status === 'live' ? 'Live' : webinar.status === 'completed' ? 'Completed' : 'Draft'}
                          </span>
                        </td>
                        <td className="text-right">
                          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); }}>
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {currentWebinars.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-40 text-gray">No webinars found matching your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <PaginationBar currentPage={currentWebinarPage} setCurrentPage={setCurrentWebinarPage} totalItems={filteredWebinars.length} perPage={webinarsPerPage} setPerPage={setWebinarsPerPage} label="webinars" />
            </div>
          </div>
        );
      }

      case "revenue": {
        const revenueTrendData = data.revenueData?.charts?.revenueTrend?.length > 0 
          ? data.revenueData.charts.revenueTrend.map(r => ({ date: r.date, revenue: r.amount }))
          : [
            { date: 'Start', revenue: 0 },
            { date: 'Today', revenue: 0 }
          ];
      
        const revenueSplitData = data.revenueData?.charts?.revenueSplit?.length > 0
          ? data.revenueData.charts.revenueSplit.map(s => ({ name: s.label, value: s.value }))
          : [
            { name: 'Direct Sales', value: 0 },
            { name: 'Subscription', value: 0 },
          ];
        const SPLIT_COLORS = ['#6574e9', '#8b5cf6'];

        return (
          <div className="revenue-page relative">
            {/* Layer 1: Top Financial Metrics */}
            {(() => {
              const razorpayFee = 2; // Razorpay charges ~2%
              const webinarGMV = data.revenueData?.cards?.webinarRevenue || 0;
              const subGMV = data.revenueData?.cards?.subscriptionRevenue || 0;
              const totalGMV = webinarGMV + subGMV;

              // Razorpay takes 2% from everything
              const razorpayCut = Math.round(totalGMV * (razorpayFee / 100));

              // From webinar revenue: platform takes X%, creator gets rest
              const platformCommission = Math.round(webinarGMV * (platformFee / 100));
              const creatorPayout = webinarGMV - platformCommission;

              // From subscriptions: 100% to admin (after Razorpay)
              const subAfterRazorpay = Math.round(subGMV * (1 - razorpayFee / 100));
              const commissionAfterRazorpay = Math.round(platformCommission * (1 - razorpayFee / 100));

              // Total admin take-home
              const totalAdminTakeHome = subAfterRazorpay + commissionAfterRazorpay;

              return (
                <>
                <div className="kpi-cards">
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <div className="kpi-icon revenue-bg"><IndianRupee size={20} className="revenue-icon" /></div>
                    </div>
                    <div className="kpi-title">Total GMV (All Transactions)</div>
                    <div className="kpi-value font-mono">₹ {totalGMV.toLocaleString()}</div>
                    <span className="text-gray text-small">Webinars: ₹{webinarGMV.toLocaleString()} + Subs: ₹{subGMV.toLocaleString()}</span>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <div className="kpi-icon subs-bg"><Crown size={20} className="subs-icon" /></div>
                    </div>
                    <div className="kpi-title">Admin Take-Home</div>
                    <div className="kpi-value font-mono text-green">₹ {totalAdminTakeHome.toLocaleString()}</div>
                    <span className="text-gray text-small">After Razorpay {razorpayFee}% cut</span>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <div className="kpi-icon creators-bg"><Activity size={20} className="creators-icon" /></div>
                    </div>
                    <div className="kpi-title">Razorpay Cut ({razorpayFee}%)</div>
                    <div className="kpi-value font-mono text-red">- ₹ {razorpayCut.toLocaleString()}</div>
                    <span className="text-gray text-small">Payment gateway fee on all txns</span>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <div className="kpi-icon error-bg"><AlertCircle size={20} className="error-icon" /></div>
                    </div>
                    <div className="kpi-title">Creator Payouts</div>
                    <div className="kpi-value font-mono text-orange">₹ {creatorPayout.toLocaleString()}</div>
                    <span className="text-gray text-small">{100 - platformFee}% of webinar GMV</span>
                  </div>
                </div>

                {/* Revenue Breakdown Table */}
                <div style={{ background: "#f8f9fb", borderRadius: "12px", padding: "20px", marginTop: "16px", fontSize: "0.85rem" }}>
                  <h4 style={{ marginBottom: "12px", color: "#1a1a35" }}>Revenue Breakdown</h4>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left", color: "#6b7280", fontSize: "0.78rem", textTransform: "uppercase" }}>
                        <th style={{ padding: "8px 0" }}>Source</th>
                        <th>GMV</th>
                        <th>Razorpay ({razorpayFee}%)</th>
                        <th>Platform Fee</th>
                        <th>Creator Gets</th>
                        <th style={{ color: "#10b981" }}>Admin Gets</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 0", fontWeight: 600 }}>Subscriptions</td>
                        <td>₹{subGMV.toLocaleString()}</td>
                        <td style={{ color: "#ef4444" }}>- ₹{Math.round(subGMV * razorpayFee / 100).toLocaleString()}</td>
                        <td>100%</td>
                        <td>₹0</td>
                        <td style={{ color: "#10b981", fontWeight: 700 }}>₹{subAfterRazorpay.toLocaleString()}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 0", fontWeight: 600 }}>Webinar Transactions</td>
                        <td>₹{webinarGMV.toLocaleString()}</td>
                        <td style={{ color: "#ef4444" }}>- ₹{Math.round(webinarGMV * razorpayFee / 100).toLocaleString()}</td>
                        <td>{platformFee}%</td>
                        <td>₹{creatorPayout.toLocaleString()}</td>
                        <td style={{ color: "#10b981", fontWeight: 700 }}>₹{commissionAfterRazorpay.toLocaleString()}</td>
                      </tr>
                      <tr style={{ fontWeight: 700, borderTop: "2px solid #e5e7eb" }}>
                        <td style={{ padding: "10px 0" }}>Total</td>
                        <td>₹{totalGMV.toLocaleString()}</td>
                        <td style={{ color: "#ef4444" }}>- ₹{razorpayCut.toLocaleString()}</td>
                        <td></td>
                        <td>₹{creatorPayout.toLocaleString()}</td>
                        <td style={{ color: "#10b981", fontSize: "1rem" }}>₹{totalAdminTakeHome.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                </>
              );
            })()}

            {/* Layer 2: Cashflow Analytics (Smart Charts) */}
            <div className="charts-container mt-20">
              <div className="chart-card">
                <div className="flex-between mb-10">
                  <h3>Revenue Trend (Last 30 Days)</h3>
                  <select className="reusable-select" value={revenueTimeFilter} onChange={(e) => setRevenueTimeFilter(e.target.value)}>
                    <option>7 Days</option>
                    <option>30 Days</option>
                    <option>Yearly</option>
                  </select>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={revenueTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1a1a35' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#ffffff', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="chart-card">
                <h3>Revenue Split</h3>
                <div className="chart-wrapper mt-10">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={revenueSplitData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {revenueSplitData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SPLIT_COLORS[index % SPLIT_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1a1a35' }}
                        itemStyle={{ color: '#1a1a35' }}
                        formatter={(value) => `${value}%`}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Layer 3: The Master Ledger */}
            <div className="table-container mt-20">
              <div className="table-header-flex">
                <h3>The Master Ledger</h3>
                <button className="action-btn secondary"><Download size={16}/> Export Ledger</button>
              </div>
              <table className="premium-table ledger-table mt-10">
                <thead>
                  <tr>
                    <th>Transaction ID & Date</th>
                    <th>Entity</th>
                    <th>Type</th>
                    <th>Amount & Fee</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const sorted = (data.revenueData?.table || []).slice().sort((a, b) => new Date(b.transaction?.date || 0) - new Date(a.transaction?.date || 0));
                    const start = (currentRevPage - 1) * revPerPage;
                    return sorted.slice(start, start + revPerPage);
                  })().map(txn => (
                    <tr key={txn.id} onClick={() => setSelectedTransaction(txn)} className="cursor-pointer hover-row">
                      <td>
                        <div className="txn-id-cell">
                          <span className="txn-id font-mono">#{txn.transaction?.id ? String(txn.transaction.id).slice(-8).toUpperCase() : 'N/A'}</span>
                          <span className="text-gray text-small block mt-1">{txn.transaction?.date ? new Date(txn.transaction.date).toLocaleString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="user-info-cell">
                          <div className="user-details">
                            <span className="user-name">{(txn.entity?.name || '').trim()}</span>
                            <span className="user-email text-gray">{(txn.entity?.type || '').trim()}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="txn-amount-cell">
                          <span className="txn-type block fw-600">{txn.item || txn.type}</span>
                        </div>
                      </td>
                      <td>
                        <div className="txn-amount-cell">
                          <span className="txn-amount font-mono fw-600">₹ {(txn.amount || 0).toLocaleString()}</span>
                          {txn.type === "Webinar" && <span className="text-red text-small">Fee: ₹ {((txn.amount || 0) * (platformFee / 100)).toFixed(2)}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${(txn.status || 'Pending').toLowerCase()}`}>
                          {txn.status === 'Success' ? 'Success' : '' + (txn.status || 'Pending')}
                        </span>
                      </td>
                      <td className="text-right">
                        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setSelectedTransaction(txn); }}><MoreVertical size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {(!data.revenueData?.table || data.revenueData.table.length === 0) && (
                    <tr>
                      <td colSpan="6" className="text-center py-40 text-gray">No transactions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <PaginationBar currentPage={currentRevPage} setCurrentPage={setCurrentRevPage} totalItems={(data.revenueData?.table || []).length} perPage={revPerPage} setPerPage={setRevPerPage} label="transactions" />
            </div>

            {/* Layer 4: Payout Management (Slide-over Action Panel) */}
            {selectedTransaction && (
              <>
                <div className="drawer-overlay" onClick={() => setSelectedTransaction(null)}></div>
                <div className="slide-over-drawer">
                  <div className="drawer-header">
                    <h3>Transaction Details</h3>
                    <button className="close-btn" onClick={() => setSelectedTransaction(null)}><X size={20} /></button>
                  </div>
                  <div className="drawer-body">
                    <div className="profile-hero" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                      <div className="flex-between w-100 mb-10">
                        <span className="txn-id text-gray font-mono">#{selectedTransaction.transaction?.id ? String(selectedTransaction.transaction.id).slice(-8).toUpperCase() : 'N/A'}</span>
                        <span className={`status-pill ${String(selectedTransaction.status || 'Pending').toLowerCase()}`}>
                          {selectedTransaction.status === 'Success' ? 'Success' : '' + (selectedTransaction.status || 'Pending')}
                        </span>
                      </div>
                      <h2 className={`mt-10 font-mono text-large ${selectedTransaction.status === 'Success' ? 'text-green' : 'text-orange'}`}>₹ {(selectedTransaction.amount || 0).toLocaleString()}</h2>
                      <p className="text-gray text-small mt-1">{selectedTransaction.item || 'Revenue Transaction'}</p>
                    </div>
                    
                    <div className="profile-section mt-20">
                      <h4>Entity Details</h4>
                      <div className="info-row">
                        <span className="text-gray">Name</span>
                        <div className="flex-align-center gap-10">
                            <span className="fw-500 text-white">{(selectedTransaction.entity?.name || '').trim()}</span>
                            <span className={`admin-badge ${selectedTransaction.entity?.type === 'Creator' ? 'plan-elite' : 'plan-basic'}`}>{(selectedTransaction.entity?.type || '').trim()}</span>
                        </div>
                      </div>
                      <div className="info-row">
                        <span className="text-gray">Transaction Date</span>
                        <span className="text-white">{new Date(selectedTransaction.transaction?.date).toLocaleString()}</span>
                      </div>
                      <div className="info-row">
                        <span className="text-gray">{selectedTransaction.type === "Webinar" ? `Platform Fee (${platformFee}%)` : "Subscription Gross"}</span>
                        <span className="text-red font-mono">{selectedTransaction.type === "Webinar" ? `-₹ ${((selectedTransaction.amount || 0) * (platformFee / 100)).toFixed(2)}` : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="danger-zone mt-20">
                      <h4>Action Hub</h4>
                      <button className="action-btn secondary w-100 mt-10"><Download size={16}/> Download Invoice</button>
                      <button className="warning-btn mt-10 w-100"><IndianRupee size={16} /> Process Refund</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      }

      case "subscriptions": {
        const tableSubscriptions = (data.subscriptionsData?.table || [])
          .slice().sort((a, b) => new Date(b.nextBilling || 0) - new Date(a.nextBilling || 0));
        const filteredSubs = tableSubscriptions.filter(sub => {
          const name = String(sub.creatorInfo?.name || '').toLowerCase();
          const matchesSearch = name.includes(subSearchQuery.toLowerCase()) || 
                                String(sub.creatorInfo?.email || '').toLowerCase().includes(subSearchQuery.toLowerCase());
          const matchesPlan = subPlanFilter === "All" || sub.plan === subPlanFilter;
          const matchesStatus = subStatusFilter === "All" || sub.status === subStatusFilter;
          return matchesSearch && matchesPlan && matchesStatus;
        });

        const indexOfLastSub = currentSubPage * subsPerPage;
        const indexOfFirstSub = indexOfLastSub - subsPerPage;
        const currentSubs = filteredSubs.slice(indexOfFirstSub, indexOfLastSub);
        const totalSubPages = Math.ceil(filteredSubs.length / subsPerPage);

        return (
          <div className="subscriptions-page relative">
            
            {/* Layer 0: Active Plan / Demo Change Section */}
            <div className="admin-plan-section mb-20 fade-in">
              <div className="flex-between mb-16">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Platform Pricing Plans</h3>
                  <p className="text-gray text-small mt-1">Configure the subscription packages available to creators.</p>
                </div>
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    setEditingPlan('new');
                    setEditingPlanData({
                      id: 'new',
                      name: '',
                      desc: '',
                      price: 0,
                      fee: 5,
                      popular: false,
                      features: ['New Feature']
                    });
                  }}
                >
                  <Plus size={16} className="mr-2 inline-icon"/> Add New Plan
                </button>
              </div>

              <div className="pricing-demo-grid mt-20">
                {pricingPlans.map(plan => (
                  <div key={plan.id} className={`pricing-demo-card ${plan.popular ? 'popular' : ''}`}>
                    {plan.popular && <div className="popular-header">MOST POPULAR</div>}
                    <div className={plan.popular ? "card-body" : ""}>
                      <h4 className="plan-name">{plan.name}</h4>
                      <p className="plan-desc">{plan.desc}</p>
                      
                      <div className="price-area">
                        <div className="current-price">₹{plan.price}<span>/mo</span></div>
                      </div>

                      <ul className="plan-features-list mb-20 text-small text-gray">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex-align-center gap-10 mb-10">
                            <CheckCircle size={14} className="text-green"/> {feature}
                          </li>
                        ))}
                      </ul>

                      <button className={`pricing-demo-btn ${plan.popular ? 'solid' : 'outline'}`} onClick={() => handleEditPlanClick(plan)}>
                        <Settings size={16} className="inline-icon mr-2"/> Edit Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-top mb-20 mt-20"></div>

            {/* Layer 1: Top Subscription Metrics */}
            <div className="kpi-cards mb-20">
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon creators-bg"><Users size={20} className="creators-icon" /></div>
                </div>
                <div className="kpi-title">Active Subscriptions</div>
                <div className="kpi-value">{data.subscriptionsData?.stats?.activeSubscriptions || 0} <span className="kpi-growth positive text-small">Live Status</span></div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon revenue-bg"><IndianRupee size={20} className="revenue-icon" /></div>
                </div>
                <div className="kpi-title">MRR (Monthly Recurring)</div>
                <div className="kpi-value font-mono">₹ {(data.subscriptionsData?.stats?.mrr || 0).toLocaleString()} <span className="kpi-growth positive text-small">Steady Growth</span></div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon error-bg"><AlertCircle size={20} className="error-icon" /></div>
                </div>
                <div className="kpi-title">Expired / Canceled</div>
                <div className="kpi-value text-red">{data.subscriptionsData?.stats?.expiredCount || 0} <span className="text-gray text-small block mt-1">Churn Rate: {data.subscriptionsData?.stats?.churnRate || 0}%</span></div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <div className="kpi-icon subs-bg"><Crown size={20} className="subs-icon" /></div>
                </div>
                <div className="kpi-title">Most Popular Plan</div>
                <div className="kpi-value text-medium mt-1">⭐ {data.subscriptionsData?.stats?.mostPopularPlan?.name || 'N/A'} <span className="text-gray text-small block mt-1">{data.subscriptionsData?.stats?.mostPopularPlan?.percentage || 0}% of users</span></div>
              </div>
            </div>

            {/* Layer 2: Advanced Search & Filter */}
            <div className="smart-toolbar mt-20">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="Search creator name, email or ID..." 
                  value={subSearchQuery}
                  onChange={(e) => { setSubSearchQuery(e.target.value); setCurrentSubPage(1); }}
                />
              </div>
              <div className="toolbar-actions">
                <div className="filter-dropdown">
                  <Filter size={16} />
                  <select value={subPlanFilter} onChange={(e) => { setSubPlanFilter(e.target.value); setCurrentSubPage(1); }}>
                    <option value="All">All Plans</option>
                    {pricingPlans.map(p => (
                      <option key={p.id || p.name} value={p.name}>{p.name} ({p.price > 0 ? `₹${p.price}` : "Free"})</option>
                    ))}
                    <option value="Free">Free / No Plan</option>
                  </select>
                </div>
                <div className="filter-dropdown">
                  <Filter size={16} />
                  <select value={subStatusFilter} onChange={(e) => { setSubStatusFilter(e.target.value); setCurrentSubPage(1); }}>
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Past Due">Past Due</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Layer 3: The Premium Data Table */}
            <div className="table-container mt-20">
              <table className="premium-table subscriptions-table mt-10">
                <thead>
                  <tr>
                    <th>Creator Info</th>
                    <th>Current Plan</th>
                    <th>Billing Cycle</th>
                    <th>Next Billing</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {currentSubs.map(sub => {
                    const statusStr = sub.status || 'Active';
                    const isExpiringSoon = false; // We can add complex logic based on sub.nextBilling date
                    
                    return (
                      <tr 
                        key={sub.id || Math.random()} 
                        onClick={() => setSelectedSubscription(sub)} 
                        className={`cursor-pointer hover-row ${isExpiringSoon ? 'expiring-row' : ''}`}
                      >
                        <td>
                          <div className="creator-cell">
                            <div className="creator-avatar" style={{background: '#6574e9'}}>
                              {sub.creatorInfo?.avatar || 'U'}
                            </div>
                            <div className="creator-details">
                              <span className="creator-name">
                                {(sub.creatorInfo?.name || 'Unknown').trim()} {sub.isUpgraded && <span title="Recently Upgraded" className="upgrade-icon"></span>}
                              </span>
                              <span className="creator-email text-gray">{(sub.creatorInfo?.email || 'No email').trim()}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`plan-pill ${(sub.plan || 'Free').toLowerCase()}`}>
                            {sub.plan || 'Free'}
                          </span>
                        </td>
                        <td>
                          <div className="txn-amount-cell">
                            <span className="txn-amount font-mono fw-600">{sub.billing || '₹0'}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`${isExpiringSoon ? 'text-orange fw-600' : 'text-gray txt-normal'}`}>
                            {sub.nextBilling ? new Date(sub.nextBilling).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${(statusStr).toLowerCase().replace(' ', '-')}`}>
                            <span className={`status-dot-inline ${statusStr === 'Active' ? 'dot-green' : statusStr === 'Past Due' ? 'dot-orange' : 'dot-red'}`}></span> {statusStr}
                          </span>
                        </td>
                        <td className="text-right">
                          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setSelectedSubscription(sub); }}>
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {currentSubs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-40 text-gray">No subscriptions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              <PaginationBar currentPage={currentSubPage} setCurrentPage={setCurrentSubPage} totalItems={filteredSubs.length} perPage={subsPerPage} setPerPage={setSubsPerPage} label="subscriptions" />
            </div>

            {/* Layer 4: Plan Management (Slide-over Action Panel) */}
            {selectedSubscription && (
              <>
                <div className="drawer-overlay" onClick={() => setSelectedSubscription(null)}></div>
                <div className="slide-over-drawer">
                  <div className="drawer-header">
                    <h3>Plan Management</h3>
                    <button className="close-btn" onClick={() => setSelectedSubscription(null)}><X size={20} /></button>
                  </div>
                  <div className="drawer-body">
                    
                    {/* User Mini Profile */}
                    <div className="profile-hero" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                      <div className="creator-cell mb-10">
                        <div className="creator-avatar" style={{width: '48px', height: '48px', fontSize: '1.2rem', background: '#6574e9'}}>
                          {selectedSubscription.creatorInfo?.avatar || 'U'}
                        </div>
                        <div className="creator-details">
                          <span className="creator-name text-large">{(selectedSubscription.creatorInfo?.name || '').trim()}</span>
                          <span className="creator-email text-gray">{(selectedSubscription.creatorInfo?.email || '').trim()}</span>
                        </div>
                      </div>
                      <div className="flex-between w-100 mt-10">
                        <span className={`plan-pill ${(selectedSubscription.plan || 'Free').toLowerCase()}`}>👑 {selectedSubscription.plan} Plan</span>
                        <span className={`status-pill ${String(selectedSubscription.status || 'Active').toLowerCase().replace(' ', '-')}`}>{selectedSubscription.status || 'Active'}</span>
                      </div>
                    </div>
                    
                    {/* Subscription History Timeline */}
                    <div className="profile-section mt-20">
                      <h4>Subscription History</h4>
                      <div className="history-timeline mt-10">
                        {(selectedSubscription.history || ['Plan Activated']).map((h, idx) => (
                          <div key={idx} className="timeline-step">
                            <div className={`step-dot ${idx === (selectedSubscription.history?.length || 1) - 1 ? 'active' : ''}`}></div>
                            <span className="step-label">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="profile-section mt-20">
                      <h4>Billing Details</h4>
                      <div className="info-row">
                        <span className="text-gray">Joined Date</span>
                        <span className="text-white">{selectedSubscription.startDate ? new Date(selectedSubscription.startDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <span className="text-gray">Next Billing</span>
                        <span className="text-white">{selectedSubscription.nextBilling ? new Date(selectedSubscription.nextBilling).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <span className="text-gray">Amount</span>
                        <span className="font-mono text-white">{selectedSubscription.billing || '₹0'}</span>
                      </div>
                    </div>

                    {/* Admin Overrides */}
                    <div className="danger-zone mt-20">
                      <h4>Admin Overrides (Superpowers)</h4>
                      
                      <button className="danger-btn w-100 mt-20">
                        <Ban size={16}/> Force Cancel Subscription
                      </button>
                      
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Layer 5: Edit Pricing Plan Panel */}
            {editingPlan && editingPlanData && (
              <>
                <div className="center-modal-overlay" onClick={() => setEditingPlan(null)}>
                  <div className="center-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>{editingPlan === 'new' ? 'Create New Pricing Plan' : `Manage ${editingPlanData.name} Plan`}</h2>
                      <button className="icon-btn" onClick={() => setEditingPlan(null)}><X size={24} /></button>
                    </div>
                    
                    <div className="modal-content">
                      <div className="form-group mb-20">
                        <label>Plan Name</label>
                        <input type="text" className="form-input" value={editingPlanData.name} onChange={(e) => setEditingPlanData({...editingPlanData, name: e.target.value})} />
                      </div>

                      <div className="form-group mb-20">
                        <label>Monthly Price (₹)</label>
                        <input type="number" className="form-input" value={editingPlanData.price} onChange={(e) => setEditingPlanData({...editingPlanData, price: e.target.value})} />
                      </div>

                      <div className="form-group mb-20">
                        <label>Plan Description</label>
                        <input type="text" className="form-input" value={editingPlanData.desc} onChange={(e) => setEditingPlanData({...editingPlanData, desc: e.target.value})} />
                      </div>

                      <div className="form-group mb-20">
                        <label>Transaction Fee (%)</label>
                        <input type="number" className="form-input" value={editingPlanData.fee} onChange={(e) => setEditingPlanData({...editingPlanData, fee: e.target.value})} />
                      </div>

                      <h4 className="border-bottom pb-10 mb-10">Plan Features Details</h4>
                      
                      {editingPlanData.features.map((feature, idx) => (
                        <div key={idx} className="form-group mb-10 flex-align-center gap-10">
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{flex: 1}} 
                            value={feature} 
                            onChange={(e) => {
                              const newFeatures = [...editingPlanData.features];
                              newFeatures[idx] = e.target.value;
                              setEditingPlanData({...editingPlanData, features: newFeatures});
                            }}
                          />
                          <button 
                            className="icon-btn text-red"
                            onClick={() => {
                              const newFeatures = editingPlanData.features.filter((_, i) => i !== idx);
                              setEditingPlanData({...editingPlanData, features: newFeatures});
                            }}
                          ><X size={18}/></button>
                        </div>
                      ))}
                      
                      <button 
                        className="action-btn secondary w-100 mt-10 mb-20"
                        onClick={() => setEditingPlanData({...editingPlanData, features: [...editingPlanData.features, "New Feature"]})}
                      ><Plus size={16}/> Add New Feature</button>

                      <button className="action-btn primary w-100 mt-20" onClick={handleSavePlanSettings}>
                        <Save size={16}/> Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      }

      case "templates": {
        return <AdminTemplateManager />;
      }

      case "whatsapp": {
        return <WhatsAppPanel isAdmin={true} />;
      }

      case "support": {
        return <SupportPage isAdmin={true} />;
      }

      case "coupons": {
        return <CouponManager />;
      }

      case "settings": {
        return (
          <div className="settings-page">
            <div className="settings-header mb-20">
              <h2>Platform Settings</h2>
              <p className="text-gray mt-1">Manage billing, integrations, and global preferences.</p>
            </div>

            <div className="settings-layout">
              {/* Vertical Menu */}
              <div className="settings-sidebar">
                <ul className="settings-menu">
                  <li className={activeSettingsTab === "general" ? "active" : ""} onClick={() => setActiveSettingsTab("general")}>
                    <Settings size={18} /> General
                  </li>
                  <li className={activeSettingsTab === "integrations" ? "active" : ""} onClick={() => setActiveSettingsTab("integrations")}>
                    <Key size={18} /> Integrations & APIs
                  </li>
                  <li className={activeSettingsTab === "security" ? "active" : ""} onClick={() => setActiveSettingsTab("security")}>
                    <Shield size={18} /> Security & Profile
                  </li>
                  <li className={activeSettingsTab === "alerts" ? "active" : ""} onClick={() => setActiveSettingsTab("alerts")}>
                    <Bell size={18} /> Global Alerts
                  </li>
                </ul>
              </div>

              {/* Settings Content Area */}
              <div className="settings-content-area">
                
                {/* Layer 1: Global Platform Settings */}
                {activeSettingsTab === "general" && (
                  <div className="settings-panel fade-in">
                    <h3>Control Center</h3>
                    
                    <div className="form-group mt-20">
                      <label> Commission (%)</label>
                      <input 
                        type="number" 
                        value={platformFee} 
                        onChange={(e) => setPlatformFee(e.target.value)} 
                        className="form-input"
                      />
                      <small className="text-gray">This fee is automatically deducted from all creator revenue.</small>
                    </div>

                    <div className="form-group mt-20">
                      <label>Support Contact Email</label>
                      <input type="email" defaultValue={adminEmail || "support@enrollify.com"} className="form-input" />
                    </div>

                    <div className="form-group mt-20">
                      <label>Maintenance Mode</label>
                      <div className="flex-between w-100 p-16" style={{ background: '#f8f9fb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div>
                          <span className="fw-500 block">Enable Maintenance Mode</span>
                          <span className="text-gray text-small">Shows an "Upgrading" screen to all users except Admins.</span>
                        </div>
                        <button 
                          className={`icon-btn ${isMaintenanceMode ? 'text-orange' : 'text-gray'}`}
                          onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                        >
                          {isMaintenanceMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                        </button>
                      </div>
                    </div>

                    <button className="action-btn primary mt-20" onClick={handleSaveSettings}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                )}

                {/* Layer 2: Integrations & API Keys */}
                {activeSettingsTab === "integrations" && (
                  <div className="settings-panel fade-in">
                    <h3>Integrations & API Keys</h3>

                    {/* Payment Gateways */}
                    <div className="integration-card mt-20 p-20" style={{ background: '#f8f9fb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div className="flex-between mb-16">
                        <div className="flex-align-center gap-10">
                          <CreditCard size={20} className="text-blue" />
                          <h4 style={{ margin: 0 }}>Razorpay Payments</h4>
                        </div>
                        <div className="flex-align-center gap-10">
                          <span className="text-small fw-600">{isLiveMode ? 'Live Mode' : 'Test Mode'}</span>
                          <button 
                            className={`icon-btn ${isLiveMode ? 'text-green' : 'text-gray'}`}
                            onClick={() => setIsLiveMode(!isLiveMode)}
                          >
                            {isLiveMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="text-small">API Key ID</label>
                        <input type="password" placeholder="Enter Razorpay API Key ID" className="form-input mb-10" />
                        <label className="text-small">API Key Secret</label>
                        <input type="password" placeholder="Enter Razorpay API Key Secret" className="form-input" />
                      </div>
                    </div>

                    {/* WhatsApp API */}
                    <div className="integration-card mt-20 p-20" style={{ background: '#f8f9fb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div className="flex-align-center gap-10 mb-16">
                        <Smartphone size={20} className="text-green" />
                        <h4 style={{ margin: 0 }}>WhatsApp (Twilio/Interakt)</h4>
                      </div>
                      <div className="form-group">
                        <label className="text-small">Auth Token</label>
                        <input type="password" placeholder="Enter WhatsApp API token" className="form-input" />
                      </div>
                    </div>

                    <button className="action-btn primary mt-20" onClick={handleSaveSettings}>
                      <Save size={16} /> Save Integrations
                    </button>
                  </div>
                )}

                {/* Layer 3: Security & Admin Profile */}
                {activeSettingsTab === "security" && (
                  <div className="settings-panel fade-in">
                    <h3>Security & Profile</h3>

                    <div className="form-group mt-20">
                      <label>Admin Name</label>
                      <input type="text" defaultValue={adminName} className="form-input mb-10" />

                      <label>Admin Email</label>
                      <input type="email" defaultValue={adminEmail} className="form-input" disabled />
                    </div>

                    <h4 className="mt-20 border-top pt-20">Change Password</h4>
                    <div className="form-group mt-10">
                      <label className="text-small">Current Password</label>
                      <input type="password" placeholder="••••••••" className="form-input mb-10" />
                      
                      <label className="text-small">New Password</label>
                      <input type="password" placeholder="••••••••" className="form-input" />
                    </div>

                    <button className="action-btn primary mt-20" onClick={handleSaveSettings}>
                      <Lock size={16} /> Update Security Profile
                    </button>
                  </div>
                )}

                {/* Layer 4: Global Alerts */}
                {activeSettingsTab === "alerts" && (
                  <div className="settings-panel fade-in">
                    <h3>Global Announcements</h3>
                    <p className="text-gray text-small">This banner will be displayed across all creator and student dashboards.</p>

                    <div className="form-group mt-20">
                      <label>Dashboard Banner Text</label>
                      <textarea 
                        className="form-input" 
                        rows={4}
                        placeholder='e.g., "Enrollify Elite Plan is now live! Upgrade today for custom domains."'
                        value={globalAlertText}
                        onChange={(e) => setGlobalAlertText(e.target.value)}
                      ></textarea>
                    </div>

                    {/* Preview Area */}
                    {globalAlertText && (
                      <div className="alert-preview mt-20 p-16" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '8px' }}>
                        <span className="text-small text-blue fw-600 mb-10 block">BANNER PREVIEW</span>
                        <div className="text-white text-center">{globalAlertText}</div>
                      </div>
                    )}

                    <button className="action-btn primary mt-20" onClick={handleSaveSettings}>
                      <Bell size={16} /> Publish Banner
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Global Toast Notification */}
            {showToast && (
              <div className="toast-notification">
                <CheckCircle size={20} className="text-green" /> 
                <span>Settings Saved Successfully</span>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
      }
    } catch (renderError) {
      console.error("Dashboard Rendering Error:", renderError);
      return (
        <div style={{ color: 'red', padding: '50px', background: '#fff', borderRadius: '12px', margin: '20px' }}>
          <h2 style={{ color: 'red' }}>UI Crash Detected</h2>
          <p>An unexpected error occurred while drawing the data.</p>
          <pre style={{ color: '#000', fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {renderError.toString()}
          </pre>
          <pre style={{ color: '#555', fontSize: '10px', overflowX: 'auto', marginTop: '10px' }}>
            {renderError.stack}
          </pre>
          <button className="action-btn primary mt-20" onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <div className="logo-container">
          <img src={logoImg} alt="Enrollify" className="dashboard-logo" />
        </div>
        <ul>
          <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
            <Activity size={20} /> Dashboard
          </li>
          <li className={activeTab === "analytics" ? "active" : ""} onClick={() => setActiveTab("analytics")}>
            <BarChart3 size={20} /> Analytics
          </li>
          <li className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
            <Users size={20} /> Client
          </li>
          <li className={activeTab === "webinars" ? "active" : ""} onClick={() => setActiveTab("webinars")}>
            <Video size={20} /> Webinars
          </li>
          <li className={activeTab === "registrations" ? "active" : ""} onClick={() => setActiveTab("registrations")}>
            <ClipboardList size={20} /> Registrations
          </li>
          <li className={activeTab === "revenue" ? "active" : ""} onClick={() => setActiveTab("revenue")}>
            <IndianRupee size={20} /> Revenue
          </li>
          <li className={activeTab === "subscriptions" ? "active" : ""} onClick={() => setActiveTab("subscriptions")}>
            <Crown size={20} /> Subscriptions
          </li>
          <li className={activeTab === "templates" ? "active" : ""} onClick={() => setActiveTab("templates")} style={{ position: "relative" }}>
            <ClipboardList size={20} /> Templates
            {unregisteredCount > 0 && (
              <span style={{ position: "absolute", top: "6px", right: "10px", width: "20px", height: "20px", borderRadius: "50%", background: "#ef4444", color: "white", fontSize: "0.68rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {unregisteredCount}
              </span>
            )}
          </li>
          <li className={activeTab === "whatsapp" ? "active" : ""} onClick={() => setActiveTab("whatsapp")}>
            <Smartphone size={20} /> WhatsApp
          </li>
          <li className={activeTab === "coupons" ? "active" : ""} onClick={() => setActiveTab("coupons")}>
            <Tag size={20} /> Coupons
          </li>
          <li className={activeTab === "support" ? "active" : ""} onClick={() => setActiveTab("support")}>
            <Shield size={20} /> Support
          </li>
          <li className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
            <Settings size={20} /> Settings
          </li>
        </ul>
        <div style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={() => {
              localStorage.removeItem("isAdminAuth");
              localStorage.removeItem("adminEmail");
              localStorage.removeItem("adminToken");
              localStorage.removeItem("token");
              window.location.href = "/admin";
            }}
            style={{ width: '100%', padding: '10px 16px', background: 'rgba(239,68,68,0.06)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="topbar">
          <h1>
            {activeTab === "dashboard" && "Admin Dashboard"}
            {activeTab === "analytics" && "Platform Analytics"}
            {activeTab === "users" && "Client Management"}
            {activeTab === "webinars" && "Webinar Control"}
            {activeTab === "registrations" && "Registrations"}
            {activeTab === "revenue" && "Platform Revenue"}
            {activeTab === "subscriptions" && "Subscriptions"}
            {activeTab === "templates" && "Templates"}
            {activeTab === "whatsapp" && "WhatsApp Management"}
            {activeTab === "coupons" && "Coupons"}
            {activeTab === "support" && "Support Tickets"}
            {activeTab === "settings" && "Admin Settings"}
          </h1>
          <div className="profile">
            <div className="profile-pic-container">
              <div className="avatar">{adminName.charAt(0).toUpperCase() || "A"}</div>
            </div>
            <div className="profile-info-text">
              <span className="welcome-tag">Super Admin</span>
              <span className="user-display-name">{adminName.split(" ")[0] || "Admin"}</span>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>

    </div>
  );
};

export default AdminDashboard;