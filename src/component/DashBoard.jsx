// ================= ENROLLIFY PREMIUM CLIENT DASHBOARD =================

import React, { useState, useEffect } from "react";
import "./DashBoard.css";
import { Search, Filter, MessageCircle, X, Download, Plus, LayoutGrid, List, Link, Edit2, BarChart2, Copy, MoreVertical, Wallet, Landmark, ArrowUpRight, DownloadCloud, CreditCard, Settings, Link2, ShieldCheck, RefreshCw, Mail, MessageSquare, Activity, CheckCircle2, User, Globe, Palette, Bell, Lock, Trash2, FileText, RotateCcw } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import { getClientDashboardAPI, getClientWebinarStatsAPI, getClientAnalyticsAPI, getClientAudienceAPI, getClientSubscriptionAPI, getClientProfileAPI, updateClientProfileAPI } from "../api/clientApi";
import { API_BASE } from "../api/config.js";
import logoImg from "../assets/Logo.jpeg";
import TemplateGallery from "./TemplateGallery";


const generateZeroTrend = (days = 30) => {
    const trend = [];
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        trend.push({ date: dateStr, earnings: 0, views: 0, registrations: 0, tickets: 0 });
    }
    return trend;
};

const CustomRevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const val = payload[0].value || 0;
        const tickets = payload[0].payload?.tickets || 0;
        return (
            <div className="custom-revenue-tooltip">
                <p className="tooltip-date">{label}</p>
                <p className="tooltip-amount mono-space">₹{val.toLocaleString()}</p>
                <p className="tooltip-tickets">({tickets} Tickets)</p>
            </div>
        );
    }
    return null;
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("--- DASHBOARD RENDERING CRASH ---", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="section-error-fallback" style={{ padding: '60px 20px', textAlign: 'center', background: '#f8f9fb', color: '#1a1a35', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                    <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#f87171' }}>Rendering Error</h2>
                    <p style={{ color: '#6b7280', maxWidth: '500px', marginBottom: '30px' }}>
                        This section failed to display due to a data processing error.
                        We've logged the details for investigation.
                    </p>
                    <button
                        className="primary-glow-btn"
                        onClick={() => this.setState({ hasError: false })}
                        style={{ padding: '12px 24px', background: '#6574e9', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Try to Recover
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre style={{ marginTop: '30px', padding: '20px', background: 'rgba(101,116,233,0.04)', borderRadius: '8px', textAlign: 'left', fontSize: '12px', overflowX: 'auto', width: '90%' }}>
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

const Sidebar = ({ activeTab, setActiveTab, selectedPlan, onLogout }) => {
    const tabs = [
        { name: "Overview", icon: "🏠" },
        { name: "Analytics", icon: "📊" },
        { name: "Webinars", icon: "🎥" },
        { name: "Templates", icon: "🎨" },
        { name: "Audience", icon: "👥" },
        { name: "Revenue", icon: "💰" },
        { name: "Billing", icon: "💳" },
        { name: "Settings", icon: "⚙" }
    ];

    const visibleTabs = selectedPlan ? tabs : [tabs[0]];

    return (
        <div className="sidebar">
            <div className="logo-container">
                <img src={logoImg} alt="Enrollify" className="dashboard-logo" />
            </div>
            <ul>
                {visibleTabs.map((tab) => (
                    <li
                        key={tab.name}
                        className={activeTab === tab.name ? "active" : ""}
                        onClick={() => setActiveTab(tab.name)}
                    >
                        {tab.icon} {tab.name}
                    </li>
                ))}
            </ul>
            <div className="sidebar-logout" style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid #e5e7eb' }}>
                <button
                    onClick={onLogout}
                    style={{ width: '100%', padding: '10px 16px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

const Topbar = ({ activeTab, profilePic, userName, onProfileClick }) => {
    const getInitials = (name) => {
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="topbar">
            <h1>
                {activeTab === "Overview" && "Client Dashboard"}
                {activeTab === "Analytics" && "Analytics & Conversion"}
                {activeTab === "Audience" && "Audience CRM"}
                {activeTab === "Webinars" && "Webinars"}
                {activeTab === "Templates" && "Template Gallery"}
                {activeTab === "Revenue" && "Revenue & Payouts"}
                {activeTab === "Billing" && "Billing / Plan"}
                {activeTab === "Settings" && "Settings"}
            </h1>
            <div className="profile" onClick={onProfileClick}>
                <div className="profile-pic-container">
                    {profilePic ? (
                        <img src={profilePic} alt="Profile" className="topbar-profile-pic" />
                    ) : (
                        <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6574e9', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                            {getInitials(userName)}
                        </div>
                    )}
                </div>
                <div className="profile-info-text">
                    <span className="welcome-tag">Welcome Back 👋</span>
                    <span className="user-display-name">{userName}</span>
                </div>
            </div>
        </div>
    );
};

const OverviewSection = ({ selectedPlan, selectPlan, subdomain, userName, clientOrg, setActiveTab, dashboardStats, subscriptionData, audienceList = [], backendPlans = [] }) => {
    const plans = backendPlans.map((plan) => {
        const f = plan.features || {};
        const features = [];
        if (f.webinarsLimit === null) features.push("Unlimited Webinars");
        else if (f.webinarsLimit) features.push(`${f.webinarsLimit} Active Webinar${f.webinarsLimit > 1 ? 's' : ''}`);
        if (f.subdomain) features.push("Enrollify Subdomain");
        if (f.customDomain) features.push("Custom Domain");
        if (f.landingPageBuilder) features.push(`${f.landingPageBuilder === 'advanced' ? 'Advanced' : 'Basic'} Landing Page Builder`);
        if (f.emailAutomation && f.whatsappAutomation) features.push("Email + WhatsApp Automation");
        else if (f.emailAutomation) features.push("Email Reminders");
        if (f.paymentGateways?.razorpay && f.paymentGateways?.stripe) features.push("Razorpay & Stripe");
        else if (f.paymentGateways?.razorpay) features.push("Razorpay Integration");
        if (f.analytics) features.push("Analytics Dashboard");
        if (f.advancedAnalytics) features.push("Advanced Revenue Analytics");
        if (f.metaPixel) features.push("Meta Pixel Tracking");
        if (f.conversionTracking) features.push("Conversion Tracking Dashboard");
        if (f.affiliateSystem) features.push("Affiliate System");
        if (f.apiAccess) features.push("API Access");
        if (f.transactionFee) features.push(`${f.transactionFee}% Transaction Fee`);
        if (f.support) features.push(`${f.support.charAt(0).toUpperCase() + f.support.slice(1)} Support`);

        return {
            name: plan.name,
            price: `₹${plan.price}`,
            features,
            btnText: plan.name === "Basic" ? "Start Basic" : plan.name === "Growth" ? "Go Growth" : "Upgrade to Elite",
            featured: plan.name === "Growth",
        };
    });

    return (
        <>
            {selectedPlan && (
                <div className="stats-grid">
                    <div className="stat-card"><h3>Total Webinars</h3><h2>{dashboardStats?.totalWebinars || dashboardStats?.total_webinars || 0}</h2></div>
                    <div className="stat-card"><h3>Total Revenue</h3><h2>₹{(dashboardStats?.totalRevenue || dashboardStats?.total_revenue || 0).toLocaleString()}</h2></div>
                    <div className="stat-card">
                        <h3>Live Enrollment Link 🔗</h3>
                        <div className="link-card-content">
                            <span className="tiny-link">https://{subdomain}.enrollify.in/template</span>
                            <button className="copy-mini-btn" onClick={() => {
                                navigator.clipboard.writeText(`https://${subdomain}.enrollify.in/template`);
                                alert("Link Copied!");
                            }}>Copy</button>
                        </div>
                    </div>
                    <div className="stat-card"><h3>Conversion Rate</h3><h2>0%</h2></div>
                    <div className="stat-card profile-summary-card" onClick={() => setActiveTab("Settings")} style={{ cursor: 'pointer' }}>
                        <h3>Client Profile 👤</h3>
                        <div className="profile-summary-content">
                            <span className="profile-name-tag">{userName || "Guest Client"}</span>
                            <span className="profile-org-tag">{clientOrg || "Personal Account"}</span>
                        </div>
                        <div className="view-profile-link">View Details →</div>
                    </div>
                </div>
            )}

            <div className={`plan-section ${!selectedPlan ? 'full-pricing' : ''}`}>
                {!selectedPlan && (
                    <div className="no-plan-welcome">
                        <h2>Welcome to Enrollify! 👋</h2>
                        <p>Choose a plan to unlock your dashboard features and start growing your webinars.</p>
                    </div>
                )}
                <h2 className="pricing-title">{selectedPlan ? "Manage Your Growth Plan 🚀" : "Select a Growth Plan 🚀"}</h2>
                <div className="pricing-container">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`pricing-card ${selectedPlan === plan.name ? "active" : ""} ${plan.featured ? "featured" : ""}`}
                        >
                            {plan.featured && <div className="popular-badge">Most Popular</div>}
                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                <h1>{plan.price}</h1>
                                <p>per month</p>
                            </div>
                            <ul className="plan-features">
                                {plan.features.map((feature, i) => (
                                    <li key={i}><CheckCircle2 size={16} className="feature-check" /> {feature}</li>
                                ))}
                            </ul>
                            <button className={`plan-btn ${selectedPlan === plan.name ? 'running' : ''}`} onClick={() => selectPlan(plan.name)}>
                                {selectedPlan === plan.name ? "Running Plan" : plan.btnText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

const AnalyticsSection = ({ selectedPlan, setActiveTab, dashboardStats, webinarStats }) => {
    const totalRegistrations = dashboardStats?.totalUsers || dashboardStats?.total_registrations || 0;
    const totalWebinars = dashboardStats?.totalWebinars || dashboardStats?.total_webinars || 0;
    const totalRevenue = dashboardStats?.totalRevenue || dashboardStats?.total_revenue || 0;
    const totalEnrollments = (webinarStats || []).reduce((acc, w) => acc + (w.enrollments || 0), 0);
    const totalWebinarRevenue = (webinarStats || []).reduce((acc, w) => acc + (w.revenue || 0), 0);

    return (
    <div className="analytics-v2-section">
        {selectedPlan === "Basic" && (
            <div className="feature-lock-overlay">
                <div className="lock-content">
                    <Lock size={48} className="lock-icon-glow" />
                    <h2>Advanced Analytics is Locked</h2>
                    <p>Upgrade to Growth or Elite plan to unlock conversion funnel, traffic sources, and device breakdown.</p>
                    <button className="primary-glow-btn" onClick={() => setActiveTab("Overview")}>Upgrade Now</button>
                </div>
            </div>
        )}
        <div className="crm-kpi-grid">
            {[
                { title: "Total Webinars", value: totalWebinars.toLocaleString(), spark: "spark-blue" },
                { title: "Total Registrations", value: (totalEnrollments || totalRegistrations).toLocaleString(), spark: "spark-purple" },
                { title: "Avg. Registrations / Webinar", value: totalWebinars > 0 ? Math.round((totalEnrollments || totalRegistrations) / totalWebinars).toString() : "0", spark: "spark-gold" },
                { title: "Total Sales / Revenue", value: `₹${(totalWebinarRevenue || totalRevenue).toLocaleString()}`, spark: "spark-green", color: "revenue-green" }
            ].map((kpi, i) => (
                <div key={i} className="crm-kpi-card glowing-card">
                    <h4>{kpi.title}</h4>
                    <div className="kpi-value">
                        <h2 className={kpi.color}>{kpi.value}</h2>
                        {kpi.trend && <span className="trend positive">{kpi.trend}</span>}
                    </div>
                    <div className={`sparkline-bg ${kpi.spark}`}></div>
                </div>
            ))}
        </div>

        <div className="analytics-chart-box">
            <h2>Sales & Conversion Funnel 🚀</h2>
            <p className="subtitle">Traffic vs Registrations over the last 30 days</p>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={(dashboardStats?.conversionTrend && dashboardStats.conversionTrend.length > 0) ? dashboardStats.conversionTrend : generateZeroTrend(7)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6574e9" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#6574e9" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a2aef7" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#a2aef7" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", color: "#1a1a35", backdropFilter: "blur(10px)", borderRadius: "12px" }}
                            itemStyle={{ color: '#1a1a35' }}
                        />
                        <Area type="monotone" dataKey="views" name="Page Views" stroke="#6574e9" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 6, strokeWidth: 0, fill: '#6574e9' }} />
                        <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#a2aef7" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" activeDot={{ r: 6, strokeWidth: 0, fill: '#a2aef7' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="analytics-grid-2col">
            <div className="analytics-card glowing-border">
                <h3>Top Traffic Sources</h3>
                <p className="subtitle">Where your leads are coming from</p>
                <div className="traffic-bars-container">
                    {(dashboardStats?.trafficSources && dashboardStats.trafficSources.length > 0 ? dashboardStats.trafficSources : [
                        { label: "Direct", percent: 100, color: "neon-blue" },
                        { label: "Social Media", percent: 0, color: "neon-purple" },
                        { label: "Referrals", percent: 0, color: "neon-green" }
                    ]).map((source, i) => (
                        <div key={i} className="traffic-bar-item">
                            <div className="bar-header">
                                <span>{source.label}</span>
                                <span className="bar-percent">{source.percent}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className={`progress-fill ${source.color}`} style={{ width: `${source.percent}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="analytics-card glowing-border">
                <h3>Device Breakdown</h3>
                <p className="subtitle">How they view your template</p>
                <div className="device-donut-container">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={(dashboardStats?.deviceData && dashboardStats.deviceData.length > 0) ? dashboardStats.deviceData : [
                                    { name: 'Desktop', value: 100, color: '#6574e9' },
                                    { name: 'Mobile', value: 0, color: '#a2aef7' }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={8}
                            >
                                {(dashboardStats?.deviceData && dashboardStats.deviceData.length > 0 ? dashboardStats.deviceData : [{ color: '#6574e9' }, { color: '#a2aef7' }]).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", color: "#1a1a35", borderRadius: "10px" }}
                                itemStyle={{ color: '#1a1a35' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center-label">
                        <Activity size={24} color="#6574e9" />
                        <span>Devices</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="crm-table-container margin-top-20">
            <h3 className="section-heading">Webinar Performance</h3>
            <table className="crm-table">
                <thead>
                    <tr>
                        <th>Webinar Name</th>
                        <th>Page Visitors</th>
                        <th>Registered Students</th>
                        <th>Drop-off Rate</th>
                        <th>Revenue Generated</th>
                    </tr>
                </thead>
                <tbody>
                    {(webinarStats && webinarStats.length > 0 ? webinarStats : []).map((wb, index) => wb && (
                        <tr key={wb.webinarId || wb.id || index} className="crm-table-row">
                            <td>
                                <div className="student-info-cell">
                                    <div className="thumbnail-placeholder emoji-thumb">
                                        {'📈'}
                                    </div>
                                    <div className="student-details">
                                        <span className="student-name">{wb.title || wb.name || "Untitled Webinar"}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="font-bold">{wb.visitors || 0}</td>
                            <td className="font-bold">{wb.enrollments !== undefined ? wb.enrollments : (wb.registered || 0)}</td>
                            <td>
                                <span className={`pill-badge`}>
                                    {wb.dropOff || "0%"}
                                </span>
                            </td>
                            <td className="revenue-green text-lg font-bold">₹{(wb.revenue || 0).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

const WebinarsSection = ({ webinarSearch, setWebinarSearch, webinarFilter, setWebinarFilter, viewType, setViewType, handleCopyLink, copiedId, setActiveTab, selectedPlan, navigate, currentWebinars = 0, webinarStats = [], subscriptionData = null }) => {
    const isPlanActive = subscriptionData?.isActive || subscriptionData?.status === 'active';
    const isPlanExpired = subscriptionData?.expiresAt && new Date(subscriptionData.expiresAt) < new Date();
    const webinarLimit = selectedPlan === "Basic" ? 1 : selectedPlan === "Growth" ? 5 : Infinity;
    const isLimitReached = currentWebinars >= webinarLimit;
    const canCreate = isPlanActive && !isPlanExpired && !isLimitReached;

    return (
        <div className="webinars-section">
            <div className="webinars-header">
                <div className="quick-stats-row">
                    <div className="mini-stat-card">
                        <span className="stat-label">Total Webinars</span>
                        <span className="stat-value">{currentWebinars}</span>
                    </div>
                    <div className="mini-stat-card">
                        <span className="stat-label">Upcoming</span>
                        <span className="stat-value text-blue">0</span>
                    </div>
                    <div className="mini-stat-card">
                        <span className="stat-label">Drafts</span>
                        <span className="stat-value text-grey">0</span>
                    </div>
                </div>
                <button
                    className={`create-webinar-btn primary-glow-btn ${!canCreate ? 'limit-reached' : ''}`}
                    onClick={() => {
                        if (!isPlanActive || isPlanExpired) {
                            alert("Your subscription has expired or is inactive. Please renew to continue.");
                            setActiveTab("Overview");
                        } else if (isLimitReached) {
                            alert("Webinar limit reached for your current plan. Please upgrade.");
                            setActiveTab("Overview");
                        } else {
                            navigate("/create-webinar");
                        }
                    }}
                >
                    {(!isPlanActive || isPlanExpired) ? <RotateCcw size={20} /> : isLimitReached ? <Lock size={20} /> : <Plus size={20} />}
                    {(!isPlanActive || isPlanExpired) ? "Renew Plan to Create" : isLimitReached ? "Upgrade to Add More" : "Create New Webinar"}
                </button>
            </div>

            <div className="crm-toolbar webinars-toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search webinars..."
                            value={webinarSearch}
                            onChange={(e) => setWebinarSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-dropdown">
                        <Filter className="filter-icon" size={18} />
                        <select
                            value={webinarFilter}
                            onChange={(e) => setWebinarFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Published">Published / Live</option>
                            <option value="Draft">Drafts</option>
                        </select>
                    </div>
                </div>
                <div className="view-toggle">
                    <button className={`toggle-btn ${viewType === 'grid' ? 'active' : ''}`} onClick={() => setViewType('grid')}><LayoutGrid size={18} /></button>
                    <button className={`toggle-btn ${viewType === 'list' ? 'active' : ''}`} onClick={() => setViewType('list')}><List size={18} /></button>
                </div>
            </div>

            <div className={`webinars-grid ${viewType === 'list' ? 'list-view' : ''}`}>
                {(webinarStats && webinarStats.length > 0 ? webinarStats : [])
                    .filter(w => w && (webinarFilter === "All" || (w.status || 'Published') === webinarFilter))
                    .filter(w => w && (w.title || '').toLowerCase().includes(webinarSearch.toLowerCase()))
                    .map((webinar) => webinar && (
                        <div key={webinar.id || webinar._id} className={`webinar-card ${webinar.status === 'Draft' ? 'is-draft' : ''}`}>
                            <div className="card-banner" style={{ background: webinar.bannerImage || webinar.thumbnail || '#e5e7eb', backgroundSize: 'cover' }}>
                                <span className="banner-emoji">{webinar.emoji || '🎥'}</span>
                                <div className={`status-badge status-${(webinar.status || 'Published').toLowerCase()}`}>
                                    <span className="status-dot"></span>
                                    {webinar.status || 'Published'}
                                </div>
                            </div>
                            <div className="card-content">
                                <h3 className="webinar-title">{webinar.title}</h3>
                                <p className="webinar-datetime">
                                    {webinar.webinarDateTime ? new Date(webinar.webinarDateTime).toLocaleDateString() : (webinar.date || 'TBD')}
                                    • {webinar.webinarDateTime ? new Date(webinar.webinarDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (webinar.time || '')}
                                </p>
                                <div className="webinar-mini-stats">
                                    <div className="stats-text-row">
                                        <span>Registrations</span>
                                        <span className="seats-count">{webinar.enrollments || webinar.registrations || 0}/{webinar.maxSeats || webinar.totalSeats || "∞"} Seats</span>
                                    </div>
                                    <div className="progress-bar-bg small">
                                        <div className={`progress-fill neon-blue`} style={{ width: `${((webinar.enrollments || 0) / (webinar.maxSeats || webinar.totalSeats || 100)) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="price-tag">₹{webinar.price || 0}</div>
                            </div>
                            <div className="card-actions">
                                <button className="action-btn" onClick={() => {
                                    const url = webinar.slug ? `${window.location.origin}/w/${webinar.slug}` : "";
                                    if (url) navigator.clipboard.writeText(url);
                                    handleCopyLink(webinar.id || webinar._id);
                                }}>
                                    {copiedId === (webinar.id || webinar._id) ? <span className="text-green text-xs">Copied!</span> : <Link size={16} />}
                                </button>
                                <button className="action-btn" onClick={() => navigate("/create-webinar", { state: { webinarToEdit: webinar } })}>
                                    <Edit2 size={16} />
                                </button>
                                <button className="action-btn" onClick={() => setActiveTab("Analytics")}><BarChart2 size={16} /></button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

const AudienceSection = ({ searchQuery, setSearchQuery, selectedWebinar, setSelectedWebinar, audienceList = [], setDrawerStudent }) => {
    const totalLeads = audienceList.length;
    const paidCustomers = audienceList.filter(s => (s.totalSpent || s.amountPaid) > 0).length;
    const totalRevenue = audienceList.reduce((acc, s) => acc + (s.totalSpent || s.amountPaid || 0), 0);
    const avgLTV = totalLeads > 0 ? Math.round(totalRevenue / totalLeads) : 0;

    return (
        <div className="crm-section">
            <div className="crm-kpi-grid">
                {[
                    { title: "Total Leads / Students", value: totalLeads.toLocaleString(), spark: "spark-blue" },
                    { title: "Total Paid Customers", value: paidCustomers.toLocaleString(), spark: "spark-purple" },
                    { title: "Avg. Lifetime Value (LTV)", value: `₹${avgLTV.toLocaleString()}`, spark: "spark-green" },
                    { title: "Engagement Score", value: totalLeads > 0 ? "High 🔥" : "0%", spark: "spark-gold" }
                ].map((kpi, i) => (
                    <div key={i} className="crm-kpi-card">
                        <h4>{kpi.title}</h4>
                        <div className="kpi-value">
                            <h2>{kpi.value}</h2>
                            {kpi.trend && <span className="trend positive">{kpi.trend}</span>}
                        </div>
                        <div className={`sparkline-bg ${kpi.spark}`}></div>
                    </div>
                ))}
            </div>

            <div className="crm-toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input type="text" placeholder="Search by name, email or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="filter-dropdown">
                        <Filter className="filter-icon" size={18} />
                        <select value={selectedWebinar} onChange={(e) => setSelectedWebinar(e.target.value)}>
                            <option value="All Webinars">All Webinars</option>
                            <option value="Marketing Masterclass">Marketing Masterclass</option>
                            <option value="UI/UX Blueprint">UI/UX Blueprint</option>
                        </select>
                    </div>
                </div>
                <button className="export-btn"><Download size={18} /> Download CSV / Excel</button>
            </div>

            <div className="crm-table-container">
                <table className="crm-table">
                    <thead>
                        <tr>
                            <th>Student Info</th>
                            <th>Phone Number</th>
                            <th>Activity</th>
                            <th>Total Spent</th>
                            <th>Joined Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(audienceList && audienceList.length > 0 ? audienceList : [])
                            .filter(s => {
                                if (!s) return false;
                                const search = searchQuery.toLowerCase();
                                const name = (s.name || `${s.firstname || ''} ${s.lastname || ''}`.trim() || '').toLowerCase();
                                const email = (s.email || '').toLowerCase();
                                const phone = (s.phone || s.phoneNumber || '').toLowerCase();
                                return name.includes(search) || email.includes(search) || phone.includes(search);
                            })
                            .map((student, index) => {
                                if (!student) return null;
                                const studentName = (student.name || student.studentName || student.user_name || student.userName || student.full_name ||
                                    ((student.firstName || student.firstname || student.first_name || '') + ' ' +
                                        (student.lastName || student.lastname || student.last_name || '')).trim() ||
                                    'Guest User').trim();
                                const studentEmail = student.email || student.user_email || student.userEmail || student.customerEmail || "N/A";
                                const studentPhone = student.phone || student.phoneNumber || student.user_phone || student.mobile || "N/A";
                                const joinedDate = student.createdAt || student.registrationDate || student.joinedDate || student.date;

                                return (
                                    <tr key={student._id || student.id || index} className="crm-table-row" onClick={() => setDrawerStudent({ ...student, name: studentName, email: studentEmail, phone: studentPhone, avatarColor: student.avatarColor || '#6574e9' })}>
                                        <td>
                                            <div className="student-info-cell">
                                                <div className="student-avatar" style={{ background: `linear-gradient(45deg, ${student.avatarColor || '#6574e9'}, #e5e7eb)` }}>
                                                    {studentName.charAt(0) || 'U'}
                                                </div>
                                                <div className="student-details">
                                                    <span className="student-name">{studentName}</span>
                                                    <span className="student-email">{studentEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="phone-cell">{studentPhone}</td>
                                        <td><span className="pill-badge">{student.webinarsAttended || student.eventsCount || 1} Webinars</span></td>
                                        <td className="spent-cell">₹{student.totalSpent || student.amountPaid || student.paid_amount || student.amount || 0}</td>
                                        <td className="date-cell">{joinedDate ? new Date(joinedDate).toLocaleDateString() : "N/A"}</td>
                                    </tr>
                                )
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const RevenueSection = ({ dashboardStats, setActiveTab, audienceList = [], subscriptionData }) => {
    const grossRevenue = dashboardStats?.totalRevenue || dashboardStats?.total_revenue || 0;
    const feePercent = subscriptionData?.subscription?.features?.transactionFee || 5;
    const netEarnings = grossRevenue * (1 - feePercent / 100);
    const availableToWithdraw = Math.max(0, netEarnings);
    const pendingClearance = 0;

    return (
        <div className="revenue-section">
            <div className="vault-kpi-grid">
                {[
                    { title: "Gross Revenue", value: `₹${grossRevenue.toLocaleString()}`, spark: "" },
                    { title: "Net Earnings", value: `₹${netEarnings.toLocaleString()}`, subtitle: "After 5% Platform Fee", spark: "highlight-card" },
                    { title: "Available to Withdraw", value: `₹${availableToWithdraw.toLocaleString()}`, spark: "core-glow-green", color: "revenue-neon-green" },
                    { title: "Pending Clearance", value: `₹${pendingClearance.toLocaleString()}`, spark: "core-glow-yellow", color: "revenue-neon-yellow" }
                ].map((kpi, i) => (
                    <div key={i} className={`vault-kpi-card glowing-card ${kpi.spark}`}>
                        <h4>{kpi.title}</h4>
                        <div className="kpi-value">
                            <h2 className={`mono-space ${kpi.color}`}>{kpi.value}</h2>
                            {kpi.trend ? <span className="trend positive">{kpi.trend}</span> : kpi.subtitle && <span className="subtitle-small">{kpi.subtitle}</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="analytics-chart-box">
                <div className="chart-header"><h2>Cashflow 💸</h2><p className="subtitle">Daily earnings over the last 30 days</p></div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={(dashboardStats?.revenueTrend && dashboardStats.revenueTrend.length > 0) ? dashboardStats.revenueTrend : generateZeroTrend(7)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs><linearGradient id="colorEarnings" x1="0" y1="1" x2="0" y2="0"><stop offset="5%" stopColor="#dcfce7" stopOpacity={1} /><stop offset="50%" stopColor="#059669" stopOpacity={1} /><stop offset="100%" stopColor="#10b981" stopOpacity={1} /></linearGradient></defs>
                            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} /><YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                            <Tooltip content={<CustomRevenueTooltip />} cursor={{ fill: 'rgba(101,116,233,0.05)' }} /><Bar dataKey="earnings" fill="url(#colorEarnings)" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Same Transaction Ledger, but potentially mapping real tx list here later */}
            <div className="revenue-grid-2col">
                <div className="revenue-card ledger-card">
                    <div className="card-header-flex"><h3>Transaction Ledger</h3><button className="text-btn outline-btn"><DownloadCloud size={14} /> Export CSV</button></div>
                    <div className="ledger-table-container">
                        <table className="ledger-table">
                            <thead><tr><th>Date & Time</th><th>Customer</th><th>Webinar</th><th>Status</th><th className="text-right">Amount</th></tr></thead>
                            <tbody>
                                {/* Build transactions from audience webinar data */}
                                {audienceList.flatMap(user =>
                                    (user.webinars || []).filter(w => w.amountPaid > 0).map((w, i) => ({
                                        _id: `${user._id}_${i}`,
                                        customerName: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Guest',
                                        email: user.email,
                                        webinarTitle: w.title,
                                        status: w.paymentStatus || 'paid',
                                        amount: w.amountPaid,
                                        createdAt: w.date
                                    }))
                                ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20).map((tx, index) => (
                                    <tr key={tx._id || index} className="ledger-row">
                                        <td className="text-muted">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "N/A"}</td>
                                        <td><div className="customer-cell"><span className="cust-name">{tx.customerName}</span><span className="cust-email">{tx.email || ""}</span></div></td>
                                        <td>{tx.webinarTitle}</td>
                                        <td><span className={`status-pill status-${(tx.status || 'paid').toLowerCase()}`}>{tx.status === 'paid' ? 'Successful' : tx.status}</span></td>
                                        <td className="text-right mono-space tx-amount">₹{(Number(tx.amount) || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {audienceList.flatMap(u => u.webinars || []).filter(w => w.amountPaid > 0).length === 0 && (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>No paid transactions yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="revenue-card wallet-card">
                    <h3>Payout Management</h3>
                    <p className="subtitle">Withdraw your earnings directly to your bank account.</p>
                    <div className="bank-account-box">
                        <div className="bank-icon-circle"><Landmark size={20} color="#6574e9" /></div>
                        <div className="bank-details">
                            <span className="bank-name">{subscriptionData?.bankDetails?.bankName || subscriptionData?.upiId || "No payout method"}</span>
                            <span className="bank-number">{subscriptionData?.bankDetails?.accountNumber ? `A/C •••• ${subscriptionData.bankDetails.accountNumber.slice(-4)}` : subscriptionData?.upiId ? `UPI: ${subscriptionData.upiId}` : "Add in Settings"}</span>
                        </div>
                        {(subscriptionData?.bankDetails?.accountNumber || subscriptionData?.upiId) && <span className="verified-pill">Verified</span>}
                    </div>
                    <div className="wallet-action-box">
                        <div className="available-wallet-bal"><span>Available Balance</span><h2 className="mono-space revenue-neon-green">₹{Math.floor(netEarnings)}</h2></div>
                        <button className="primary-glow-btn request-payout-btn">💸 Request Payout</button>
                    </div>
                </div>
            </div>
        </div>
    );
};




const BillingSection = ({ billingCycle, setBillingCycle, selectedPlan, setActiveTab, paymentMethods, onEditPayment, onAddPayment, subscriptionData, backendPlans = [] }) => (
    <div className="billing-section">
        <div className="billing-hero-card">
            <div className="billing-hero-header">
                <div className="plan-badge-area">
                    <span className="current-plan-label">CURRENT PLAN</span>
                    <h2 className="plan-name-display">{subscriptionData?.subscription?.name || selectedPlan || "Free"} Plan</h2>
                    {subscriptionData?.subscriptionValidTill && (
                        <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                            Valid till: {new Date(subscriptionData.subscriptionValidTill).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="billing-toggle-pill">
                    <button className={billingCycle === 'Monthly' ? 'active' : ''} onClick={() => setBillingCycle('Monthly')}>Monthly</button>
                    <button className={billingCycle === 'Yearly' ? 'active' : ''} onClick={() => setBillingCycle('Yearly')}>Yearly <span className="save-tag">SAVE 20%</span></button>
                </div>
            </div>

            <div className="billing-plans-selector">
                {backendPlans.map((plan) => (
                    <div key={plan.name} className={`billing-plan-mini-card ${selectedPlan === plan.name ? 'active' : ''}`}>
                        <div className="mini-plan-info">
                            <h4>{plan.name} Plan</h4>
                            <p className="mini-plan-price">
                                ₹{plan.price}
                                <span className="text-xs text-muted">/mo</span>
                            </p>
                        </div>
                        {selectedPlan === plan.name ? (
                            <div className="plan-status-running">
                                <CheckCircle2 size={14} /> Running
                            </div>
                        ) : (
                            <button className="upgrade-mini-btn" onClick={() => setActiveTab("Overview")}>
                                Upgrade to this plan
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="usage-grid">
                {[
                    { label: "Active Webinars", value: "12 / 20", percent: 60, color: "neon-blue" },
                    { label: "Monthly Attendees", value: "3,840 / 5,000", percent: 76, color: "neon-purple" },
                    { label: "Storage Used", value: "1.2GB / 5GB", percent: 24, color: "neon-green" }
                ].map((u, i) => (
                    <div key={i} className="usage-item">
                        <div className="usage-info"><span>{u.label}</span><span>{u.value}</span></div>
                        <div className="progress-bar-bg small"><div className={`progress-fill ${u.color}`} style={{ width: `${u.percent}%` }}></div></div>
                    </div>
                ))}
            </div>
        </div>
        <div className="billing-grid-2col">
            <div className="billing-card">
                <h3>Payout Details</h3>
                <div className="payment-methods-list">
                    {subscriptionData?.bankDetails?.accountNumber && (
                        <div className="payment-method-box">
                            <div className="card-icon"><Landmark size={24} /></div>
                            <div className="card-details">
                                <span>{subscriptionData.bankDetails.bankName || "Bank Account"}</span>
                                <span>A/C •••• {subscriptionData.bankDetails.accountNumber.slice(-4)}</span>
                                {subscriptionData.bankDetails.ifscCode && <span style={{ fontSize: '11px', color: '#6b7280' }}>IFSC: {subscriptionData.bankDetails.ifscCode}</span>}
                            </div>
                            <button className="edit-payment-btn" onClick={() => setActiveTab("Settings")}>Edit</button>
                        </div>
                    )}
                    {subscriptionData?.upiId && (
                        <div className="payment-method-box">
                            <div className="card-icon"><Wallet size={24} /></div>
                            <div className="card-details">
                                <span>UPI</span>
                                <span>{subscriptionData.upiId}</span>
                            </div>
                            <button className="edit-payment-btn" onClick={() => setActiveTab("Settings")}>Edit</button>
                        </div>
                    )}
                    {!subscriptionData?.bankDetails?.accountNumber && !subscriptionData?.upiId && (
                        <p style={{ color: '#6b7280', fontSize: '13px', padding: '16px 0' }}>No payout method configured. Add one in Settings.</p>
                    )}
                </div>
                <button className="add-method-btn" onClick={() => setActiveTab("Settings")}>
                    <Plus size={16} /> Manage Payout Details
                </button>
            </div>
            <div className="billing-card">
                <h3>Billing History</h3>
                <div className="history-list">
                    {[].map(inv => (
                        <div key={inv.id} className="history-item">
                            <div className="inv-info"><span>{inv.date}</span><span className="inv-id">{inv.id}</span></div>
                            <div className="inv-amount"><span>{inv.amount}</span><button className="download-icon-btn"><Download size={14} /></button></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const SettingsSection = ({ activeSettingTab, setActiveSettingTab, isSavingSettings, handleSaveSettings, subdomain, setSubdomain, isSubdomainAvailable, brandColor, setBrandColor, showToast, profilePic, handleProfilePicChange, userName, setUserName, payoutUpi, setPayoutUpi, payoutUpiError, payoutAccount, setPayoutAccount, payoutAccountError, payoutIfsc, setPayoutIfsc, payoutIfscError, clientFirstName, setClientFirstName, clientLastName, setClientLastName, clientOrg, setClientOrg, clientPhone, setClientPhone, clientEmail, setClientEmail, clientGst, setClientGst, clientPaymentMode, setClientPaymentMode, clientAccountHolder, setClientAccountHolder, clientAccountNumber, setClientAccountNumber, clientIfsc, setClientIfsc, clientBankName, setClientBankName, clientUpi, setClientUpi, passwordData, setPasswordData, passwordMsg, handleChangePassword, isChangingPassword, notifRegistration, setNotifRegistration, notifDailySummary, setNotifDailySummary }) => (
    <div className="settings-tab-layout">
        <div className="settings-page-header">
            <h1>Settings - <span className="text-muted">Manage your workspace</span></h1>
        </div>

        <div className="settings-main-container">
            <div className="settings-nav-sidebar">
                <ul className="settings-nav-list">
                    {[
                        { id: "General", icon: <User size={18} />, label: "General Profile" },
                        { id: "ClientDetails", icon: <FileText size={18} />, label: "Client Details" },
                        { id: "Branding", icon: <Globe size={18} />, label: "Branding & Domain" },
                        { id: "Payouts", icon: <Landmark size={18} />, label: "Payout Details" },
                        { id: "Security", icon: <Lock size={18} />, label: "Security" },
                        { id: "Notifications", icon: <Bell size={18} />, label: "Notifications" }
                    ].map(tab => (
                        <li key={tab.id} className={activeSettingTab === tab.id ? "active" : ""} onClick={() => setActiveSettingTab(tab.id)}>
                            {tab.icon} {tab.label}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="settings-content-area">
                {activeSettingTab === "General" && (
                    <div className="setting-content-pane">
                        <h3>General Profile</h3>
                        <div className="profile-upload-section">
                            <div
                                className="profile-photo-circle"
                                onClick={() => document.getElementById('profile-upload-input').click()}
                                style={{ cursor: 'pointer', overflow: 'hidden' }}
                            >
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={40} />
                                )}
                                <div className="photo-overlay"><Edit2 size={16} /></div>
                            </div>
                            <input
                                type="file"
                                id="profile-upload-input"
                                hidden
                                accept="image/*"
                                onChange={handleProfilePicChange}
                            />
                            <div className="upload-info">
                                <p className="font-semibold text-white">Profile Picture</p>
                                <p className="text-xs text-muted">JPG, GIF or PNG. Max size 2MB</p>
                            </div>
                        </div>

                        <div className="settings-form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="neon-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" placeholder="divas@enrollify.com" className="neon-input" />
                            </div>
                            <div className="form-group full-width">
                                <label>Bio</label>
                                <textarea placeholder="Tell your students a bit about yourself..." className="neon-input settings-bio-area"></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {activeSettingTab === "ClientDetails" && (
                    <div className="setting-content-pane">
                        <h3>Client Details</h3>
                        <p className="text-muted text-sm mb-4">View and update your registration details.</p>
                        <div className="settings-form-grid">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" value={clientFirstName} onChange={(e) => setClientFirstName(e.target.value)} placeholder="First Name" className="neon-input" />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" value={clientLastName} onChange={(e) => setClientLastName(e.target.value)} placeholder="Last Name" className="neon-input" />
                            </div>
                            <div className="form-group">
                                <label>Organization</label>
                                <input type="text" value={clientOrg} onChange={(e) => setClientOrg(e.target.value)} placeholder="Organization / Company" className="neon-input" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Phone Number" className="neon-input" />
                            </div>
                            <div className="form-group full-width">
                                <label>Email Address</label>
                                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email Address" className="neon-input" />
                            </div>
                            <div className="form-group full-width">
                                <label>GST Number (Optional)</label>
                                <input type="text" value={clientGst} onChange={(e) => setClientGst(e.target.value)} placeholder="GST Number" className="neon-input" />
                            </div>
                        </div>
                    </div>
                )}

                {activeSettingTab === "Branding" && (
                    <div className="setting-content-pane">
                        <h3>Branding & Domain</h3>

                        <div className="settings-card-sleek">
                            <h4>Workspace Subdomain</h4>
                            <p className="text-muted text-sm mb-4">Claim your unique URL where students will find your webinars.</p>
                            <div className="subdomain-claimer-wrapper">
                                <span className="domain-prefix">https://</span>
                                <input
                                    type="text"
                                    value={subdomain}
                                    onChange={(e) => setSubdomain(e.target.value)}
                                    className="subdomain-input"
                                />
                                <span className="domain-suffix">.enrollify.com</span>
                            </div>
                            <div className={`availability-text ${isSubdomainAvailable ? 'available' : 'taken'}`}>
                                {isSubdomainAvailable ? <CheckCircle2 size={14} /> : <X size={14} />}
                                {isSubdomainAvailable ? 'Available!' : 'Already taken.'}
                            </div>
                        </div>

                        <div className="settings-card-sleek mt-8">
                            <h4>Brand Primary Color</h4>
                            <p className="text-muted text-sm mb-4">This color will be used for buttons and highlights on your landing pages.</p>
                            <div className="color-picker-wrapper">
                                <div className="color-preview" style={{ backgroundColor: brandColor }}></div>
                                <input
                                    type="text"
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    className="neon-input color-input-hex"
                                />
                                <input
                                    type="color"
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    className="color-hidden-picker"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeSettingTab === "Payouts" && (
                    <div className="setting-content-pane">
                        <div className="pane-header-with-badge">
                            <h3>Payout Details</h3>
                            <span className="payout-verified-badge"><CheckCircle2 size={14} /> Verified for Payouts</span>
                        </div>

                        <div className="settings-form-grid">
                            <div className="form-group">
                                <label>Bank Account Number</label>
                                <input
                                    type="password"
                                    placeholder="**** **** **** 5678"
                                    className={`neon-input ${payoutAccountError ? 'input-error' : ''}`}
                                    value={payoutAccount}
                                    onChange={(e) => setPayoutAccount(e.target.value)}
                                />
                                {payoutAccountError && <span className="error-text text-red text-xs mt-1 block">{payoutAccountError}</span>}
                            </div>
                            <div className="form-group">
                                <label>IFSC Code</label>
                                <input
                                    type="text"
                                    placeholder="SBIN0001234"
                                    className={`neon-input ${payoutIfscError ? 'input-error' : ''}`}
                                    value={payoutIfsc}
                                    onChange={(e) => setPayoutIfsc(e.target.value)}
                                />
                                {payoutIfscError && <span className="error-text text-red text-xs mt-1 block">{payoutIfscError}</span>}
                            </div>
                            <div className="form-group full-width">
                                <label>UPI ID</label>
                                <input
                                    type="text"
                                    placeholder="divas@okhdfc"
                                    className={`neon-input ${payoutUpiError ? 'input-error' : ''}`}
                                    value={payoutUpi}
                                    onChange={(e) => setPayoutUpi(e.target.value)}
                                />
                                {payoutUpiError && <span className="error-text text-red text-xs mt-1 block">{payoutUpiError}</span>}
                            </div>
                        </div>
                        <p className="payout-trust-text"><ShieldCheck size={14} /> Your details are encrypted and stored securely.</p>
                    </div>
                )}

                {activeSettingTab === "Security" && (
                    <div className="setting-content-pane">
                        <h3>Security Preferences</h3>

                        <div className="settings-card-sleek mb-8">
                            <h4>Change Password</h4>
                            <div className="settings-form-grid">
                                <div className="form-group full-width">
                                    <label>Current Password</label>
                                    <input type="password" placeholder="••••••••" className="neon-input" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" placeholder="••••••••" className="neon-input" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input type="password" placeholder="••••••••" className="neon-input" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                                </div>
                            </div>
                            {passwordMsg && <p style={{ color: passwordMsg.includes("success") ? '#22c55e' : '#ef4444', fontSize: '13px', marginTop: '8px', fontWeight: '500' }}>{passwordMsg}</p>}
                            <button className="outline-btn-small mt-4" onClick={handleChangePassword} disabled={isChangingPassword}>
                                {isChangingPassword ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                )}

                {activeSettingTab === "Notifications" && (
                    <div className="setting-content-pane">
                        <h3>Notification Preferences</h3>

                        <div className="preference-item">
                            <div className="pref-info">
                                <p className="pref-title">Email me when a new student registers</p>
                                <p className="text-muted text-xs">Receive real-time updates for every new enrollment.</p>
                            </div>
                            <label className="ios-switch">
                                <input type="checkbox" checked={notifRegistration} onChange={(e) => {
                                    setNotifRegistration(e.target.checked);
                                    localStorage.setItem("notif_registration", e.target.checked);
                                }} />
                                <span className="switch-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="pref-info">
                                <p className="pref-title">Send me a daily sales summary</p>
                                <p className="text-muted text-xs">Get a condensed report of your workspace performance every morning.</p>
                            </div>
                            <label className="ios-switch">
                                <input type="checkbox" checked={notifDailySummary} onChange={(e) => {
                                    setNotifDailySummary(e.target.checked);
                                    localStorage.setItem("notif_daily_summary", e.target.checked);
                                }} />
                                <span className="switch-slider"></span>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Floating Save Changes Bar */}
        <div className="settings-floating-action-bar">
            <div className="bar-info text-muted text-sm">You have unsaved changes</div>
            <button
                className={`save-settings-btn ${isSavingSettings ? 'saving' : ''}`}
                onClick={handleSaveSettings}
            >
                {isSavingSettings ? <RefreshCw size={18} className="spin" /> : 'Save Changes'}
            </button>
        </div>

        {/* Toast Notification */}
        <div className={`settings-toast ${showToast ? 'show' : ''}`}>
            <div className="toast-content">
                <img src={logoImg} alt="" className="toast-mini-logo" />
                <span>Settings saved successfully!</span>
            </div>
        </div>
    </div>
);



const StudentDrawer = ({ drawerStudent, setDrawerStudent }) => drawerStudent && (
    <div className="config-drawer-overlay show" onClick={() => setDrawerStudent(null)}>
        <div className="config-drawer-content audience-drawer" onClick={e => e.stopPropagation()}>
            <button className="close-drawer-btn" onClick={() => setDrawerStudent(null)}><X size={20} /></button>
            <div className="audience-hero-header" style={{ background: `linear-gradient(135deg, ${drawerStudent.avatarColor}, #e5e7eb)` }}>
                <div className="hero-avatar-large">{drawerStudent.name.charAt(0)}</div>
                <div className="hero-info-text"><h2>{drawerStudent.name}</h2><p>{drawerStudent.email} • Joined {drawerStudent.joinedDate}</p></div>
            </div>
            <div className="drawer-scroll-body">
                <div className="audience-stat-grid">
                    <div className="a-stat-box"><h4>Revenue</h4><span className="mono-space">{drawerStudent.totalSpent}</span></div>
                    <div className="a-stat-box"><h4>Events</h4><span>{drawerStudent.webinarsAttended}</span></div>
                </div>
            </div>
        </div>
    </div>
);
const PaymentModal = ({ show, onClose, onSave, editingMethod }) => {
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");

    useEffect(() => {
        if (editingMethod) {
            setCardName(editingMethod.name || "");
            setCardNumber(editingMethod.number || `**** **** **** ${editingMethod.last4}`);
            setExpiry(editingMethod.expiry || "");
            setCvv("***");
        } else {
            setCardName("");
            setCardNumber("");
            setExpiry("");
            setCvv("");
        }
    }, [editingMethod, show]);

    if (!show) return null;

    return (
        <div className="modal-overlay show" onClick={onClose}>
            <div className="modal-content payment-modal" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}><X size={20} /></button>
                <div className="modal-header">
                    <h2>{editingMethod ? "Edit Payment Method" : "Add Payment Method"}</h2>
                    <p className="text-muted">Enter your credit or debit card details.</p>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Full Name on Card" className="neon-input" />
                    </div>
                    <div className="form-group">
                        <label>Card Number</label>
                        <div className="input-with-icon">
                            <CreditCard size={18} className="input-icon" />
                            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" className="neon-input" />
                        </div>
                    </div>
                    <div className="form-row-2col">
                        <div className="form-group">
                            <label>Expiry Date</label>
                            <input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" className="neon-input" />
                        </div>
                        <div className="form-group">
                            <label>CVV</label>
                            <input type="password" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="***" className="neon-input" />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="save-btn primary-glow-btn" onClick={() => onSave({ name: cardName, number: cardNumber, expiry: expiry })}>
                        {editingMethod ? "Save Changes" : "Add Card"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DashBoard = () => {
    console.log("--- DASHBOARD RENDER ---", { time: new Date().toISOString() });
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isProfileMissing, setIsProfileMissing] = useState(false);
    const [activeTab, setActiveTab] = useState("Overview");
    console.log("Active Tab:", activeTab);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedWebinar, setSelectedWebinar] = useState("All Webinars");
    const [drawerStudent, setDrawerStudent] = useState(null);

    // Webinars tab state
    const [webinarSearch, setWebinarSearch] = useState("");
    const [webinarFilter, setWebinarFilter] = useState("All");
    const [viewType, setViewType] = useState("grid"); // "grid" or "list"
    const [copiedId, setCopiedId] = useState(null);

    // Billing tab state
    const [billingCycle, setBillingCycle] = useState("Monthly"); // "Monthly" or "Yearly"
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);

    // DashBoard stats state
    const [dashboardStats, setDashboardStats] = useState({
        totalWebinars: 0,
        totalUsers: 0,
        totalRevenue: 0,
        activeWebinars: 0
    });
    const [webinarStats, setWebinarStats] = useState([]);
    const [audienceList, setAudienceList] = useState([]);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [backendPlans, setBackendPlans] = useState([]);
    const [showDebug, setShowDebug] = useState(false);

    const getComplex = (res) => {
        if (!res) return null;
        // Handle Promise.allSettled wrapper if present
        const result = res.status === 'fulfilled' ? res.value : (res.status === 'rejected' ? null : res);
        if (!result || result.error) return null;

        const val = (result.success && result.data) ? result.data : (result.data ? result.data : result);
        if (val && typeof val === 'object') {
            // Fuzzy mapping for common keys
            if (!val.totalRevenue && val.total_revenue) val.totalRevenue = val.total_revenue;
            if (!val.totalUsers && (val.total_registrations || val.total_users || val.registrationsCount)) val.totalUsers = val.total_registrations || val.total_users || val.registrationsCount;
            if (!val.totalWebinars && (val.total_webinars || val.webinarsCount)) val.totalWebinars = val.total_webinars || val.webinarsCount;
        }
        return val;
    };

    const getArray = (res) => {
        const val = getComplex(res);
        if (!val) return [];
        if (Array.isArray(val)) return val;

        if (typeof val === 'object') {
            // Universal scanning for arrays
            if (Array.isArray(val.table)) return val.table;
            if (Array.isArray(val.data)) return val.data;
            if (Array.isArray(val.registrations)) return val.registrations;
            if (Array.isArray(val.audience)) return val.audience;
            if (Array.isArray(val.users)) return val.users;

            for (const key in val) {
                if (Array.isArray(val[key])) return val[key];
            }
        }
        return [];
    };

    useEffect(() => {
        const fetchDashboardData = async () => {

            try {
                // Fetch subscription plans from backend
                try {
                    const plansRes = await fetch(`${API_BASE}/api/subscriptions`);
                    if (plansRes.ok) {
                        const plansData = await plansRes.json();
                        const plansList = Array.isArray(plansData) ? plansData : plansData.data || [];
                        setBackendPlans(plansList);
                    }
                } catch (e) {
                    console.error("Failed to fetch plans:", e);
                }

                const [dashboardRes, webinarStatsRes, audienceRes, subscriptionRes] = await Promise.allSettled([
                    getClientDashboardAPI(),
                    getClientWebinarStatsAPI(),
                    getClientAudienceAPI(),
                    getClientSubscriptionAPI()
                ]);

                const dData = getComplex(dashboardRes);
                if (dData) setDashboardStats(dData);

                const wData = getArray(webinarStatsRes);
                setWebinarStats(wData);

                const aData = getArray(audienceRes);
                setAudienceList(aData);

                const sData = getComplex(subscriptionRes);
                if (sData) setSubscriptionData(sData);

                const dashboardResStatus = dashboardRes.status === "rejected" ? dashboardRes.reason?.message : "";
                if (dashboardResStatus && dashboardResStatus.includes("create your client profile first")) {
                    console.warn("--- PROFILE MISSING DETECTED ---");
                    setIsProfileMissing(true);
                }

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchDashboardData();
    }, []);

    // Load payment methods from subscription data
    useEffect(() => {
        if (subscriptionData) {
            const methods = [];
            if (subscriptionData.bankDetails?.accountNumber) {
                methods.push({ id: 1, last4: subscriptionData.bankDetails.accountNumber.slice(-4), name: subscriptionData.bankDetails.bankName || "Bank Account", type: "bank" });
            }
            if (subscriptionData.upiId) {
                methods.push({ id: 2, name: subscriptionData.upiId, type: "upi" });
            }
            if (methods.length > 0) setPaymentMethods(methods);
        }
    }, [subscriptionData]);

    const handleSavePayment = (data) => {
        let updatedMethods;
        const last4 = data.number ? data.number.slice(-4) : "";

        if (editingPaymentMethod) {
            updatedMethods = paymentMethods.map(m =>
                m.id === editingPaymentMethod.id ? { ...m, ...data, last4: last4 } : m
            );
        } else {
            updatedMethods = [...paymentMethods, { ...data, id: Date.now(), last4: last4 }];
        }

        setPaymentMethods(updatedMethods);
        setIsPaymentModalOpen(false);
        setEditingPaymentMethod(null);
    };

    const openAddPayment = () => {
        setEditingPaymentMethod(null);
        setIsPaymentModalOpen(true);
    };

    const openEditPayment = (method) => {
        setEditingPaymentMethod(method);
        setIsPaymentModalOpen(true);
    };

    // Set selected plan from backend subscription data
    useEffect(() => {
        if (subscriptionData && subscriptionData.subscription) {
            const planName = subscriptionData.subscription.name;
            if (planName) setSelectedPlan(planName);
        }
    }, [subscriptionData]);

    const selectPlan = (plan) => {
        if (selectedPlan === plan && !isProfileMissing) {
            // Already running this plan AND profile exists
            alert(`You are currently on the ${plan} plan. You can create webinars directly from the Webinars tab!`);
            setActiveTab("Webinars");
            return;
        }
        localStorage.setItem("selectedPlanIntent", plan);
        navigate("/client-form");
    };

    // Settings tab state
    const [activeSettingTab, setActiveSettingTab] = useState("General");
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [subdomain, setSubdomain] = useState("divasgupta");
    const [brandColor, setBrandColor] = useState("#6574e9");
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(true);
    const [payoutUpi, setPayoutUpi] = useState("");
    const [payoutUpiError, setPayoutUpiError] = useState("");
    const [payoutAccount, setPayoutAccount] = useState("");
    const [payoutAccountError, setPayoutAccountError] = useState("");
    const [payoutIfsc, setPayoutIfsc] = useState("");
    const [payoutIfscError, setPayoutIfscError] = useState("");

    const [clientFirstName, setClientFirstName] = useState("");
    const [clientLastName, setClientLastName] = useState("");
    const [clientOrg, setClientOrg] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientGst, setClientGst] = useState("");

    const [clientPaymentMode, setClientPaymentMode] = useState("bank");
    const [clientAccountHolder, setClientAccountHolder] = useState("");
    const [clientAccountNumber, setClientAccountNumber] = useState("");
    const [clientIfsc, setClientIfsc] = useState("");
    const [clientBankName, setClientBankName] = useState("");
    const [clientUpi, setClientUpi] = useState("");

    // Profile state
    const [profilePic, setProfilePic] = useState(localStorage.getItem("userProfilePic") || null);
    const [userName, setUserName] = useState(localStorage.getItem("userName") || "");

    // Password change state
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordMsg, setPasswordMsg] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Notification preferences state
    const [notifRegistration, setNotifRegistration] = useState(() => {
        const saved = localStorage.getItem("notif_registration");
        return saved !== null ? saved === "true" : true;
    });
    const [notifDailySummary, setNotifDailySummary] = useState(() => {
        const saved = localStorage.getItem("notif_daily_summary");
        return saved !== null ? saved === "true" : true;
    });

    const handleChangePassword = async () => {
        setPasswordMsg("");
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordMsg("All fields are required");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMsg("New passwords do not match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordMsg("Password must be at least 6 characters");
            return;
        }
        setIsChangingPassword(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/password/change-password`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setPasswordMsg("Password changed successfully!");
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setPasswordMsg(data.message || "Failed to change password");
            }
        } catch (err) {
            setPasswordMsg("Network error. Please try again.");
        }
        setIsChangingPassword(false);
    };

    // Load profile from backend API (with localStorage fallback)
    useEffect(() => {
        const savedPic = localStorage.getItem("userProfilePic");
        const savedName = localStorage.getItem("userName");
        if (savedPic) setProfilePic(savedPic);
        if (savedName) setUserName(savedName);

        const loadProfile = async () => {
            try {
                const profile = await getClientProfileAPI();
                if (profile) {
                    if (profile.first_name) setClientFirstName(profile.first_name);
                    if (profile.last_name) setClientLastName(profile.last_name);
                    if (profile.Organization_Name) setClientOrg(profile.Organization_Name);
                    if (profile.phone) setClientPhone(profile.phone);
                    if (profile.user?.email) setClientEmail(profile.user.email);
                    if (profile.gstNumber) setClientGst(profile.gstNumber);
                    if (profile.subdomain) setSubdomain(profile.subdomain);
                    if (profile.upiId) {
                        setClientUpi(profile.upiId);
                        setPayoutUpi(profile.upiId);
                        setClientPaymentMode("upi");
                    }
                    if (profile.bankDetails) {
                        if (profile.bankDetails.accountHolderName) setClientAccountHolder(profile.bankDetails.accountHolderName);
                        if (profile.bankDetails.accountNumber) {
                            setClientAccountNumber(profile.bankDetails.accountNumber);
                            setPayoutAccount(profile.bankDetails.accountNumber);
                        }
                        if (profile.bankDetails.ifscCode) {
                            setClientIfsc(profile.bankDetails.ifscCode);
                            setPayoutIfsc(profile.bankDetails.ifscCode);
                        }
                        if (profile.bankDetails.bankName) setClientBankName(profile.bankDetails.bankName);
                        if (profile.bankDetails.accountHolderName || profile.bankDetails.accountNumber) {
                            setClientPaymentMode("bank");
                        }
                    }
                }
            } catch (err) {
                // Profile might not exist yet - that's OK
                console.log("No client profile found, using defaults");
            }
        };
        loadProfile();
    }, []);

    // Enforce Overview page if no plan is selected
    useEffect(() => {
        if (!selectedPlan && activeTab !== "Overview") {
            setActiveTab("Overview");
        }
    }, [selectedPlan, activeTab]);

    // Save name to localStorage when it changes
    useEffect(() => {
        if (userName) {
            localStorage.setItem("userName", userName);
        }
    }, [userName]);

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setProfilePic(base64String);
                localStorage.setItem("userProfilePic", base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    // Subdomain Availability Simulator
    useEffect(() => {
        if (!subdomain) return;
        setIsSubdomainAvailable(null); // Loading state if needed
        const timer = setTimeout(() => {
            // Simulate check: 'admin', 'google', 'meta' are taken
            const taken = ['admin', 'google', 'meta', 'test'];
            setIsSubdomainAvailable(!taken.includes(subdomain.toLowerCase()));
        }, 300);
        return () => clearTimeout(timer);
    }, [subdomain]);

    const handleSaveSettings = async () => {
        const upiRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,64}$/;
        const accountRegex = /^[0-9]{9,18}$/;
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        let hasError = false;

        if (activeSettingTab === "Payouts") {
            if (payoutUpi && !upiRegex.test(payoutUpi)) {
                setPayoutUpiError("Invalid UPI format");
                hasError = true;
            } else { setPayoutUpiError(""); }

            if (payoutAccount && !accountRegex.test(payoutAccount)) {
                setPayoutAccountError("Must be 9-18 digits");
                hasError = true;
            } else { setPayoutAccountError(""); }

            if (payoutIfsc && !ifscRegex.test(payoutIfsc)) {
                setPayoutIfscError("Invalid IFSC format");
                hasError = true;
            } else { setPayoutIfscError(""); }

            if (hasError) return;
        }

        setPayoutUpiError("");
        setPayoutAccountError("");
        setPayoutIfscError("");
        setIsSavingSettings(true);

        try {
            // Build payload matching backend schema
            const payload = {
                first_name: clientFirstName,
                last_name: clientLastName,
                Organization_Name: clientOrg,
                phone: clientPhone,
                gstNumber: clientGst,
                upiId: payoutUpi || clientUpi,
                bankDetails: {
                    accountHolderName: clientAccountHolder,
                    accountNumber: payoutAccount || clientAccountNumber,
                    ifscCode: payoutIfsc || clientIfsc,
                    bankName: clientBankName,
                },
            };

            await updateClientProfileAPI(payload);

            setIsSavingSettings(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);
            setIsSavingSettings(false);
            setPayoutAccountError(err.message || "Failed to save. Please try again.");
        }
    };

    const navigate = useNavigate();


    const handleCopyLink = (id) => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredAudience = (audienceList || []).filter(student => {
        const studentName = student.name || `${student.first_name || student.firstname || ''} ${student.last_name || student.lastname || ''}`.trim() || 'Guest User';
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = studentName.toLowerCase().includes(searchLower) ||
            (student.email || '').toLowerCase().includes(searchLower) ||
            (student.phone || '').includes(searchQuery);
        // Simple mock filter for webinar dropdown
        const matchesWebinar = selectedWebinar === "All Webinars" || (student.webinarsAttended && student.webinarsAttended > 0);
        return matchesSearch && matchesWebinar;
    });

    return (
        <div className="dashboard-wrapper">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} selectedPlan={selectedPlan} onLogout={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("loggedInUser");
                localStorage.removeItem("userName");
                localStorage.removeItem("userData");
                localStorage.removeItem("currentWebinarId");
                localStorage.removeItem("webinarData");
                localStorage.removeItem("subscriptionId");
                window.location.href = "/signup";
            }} />

            <div className="main-content">
                <Topbar
                    activeTab={activeTab}
                    profilePic={profilePic}
                    userName={userName}
                    onProfileClick={() => setActiveTab("Settings")}
                />

                {activeTab === "Overview" && (
                    <ErrorBoundary>
                        <OverviewSection
                            selectedPlan={selectedPlan}
                            selectPlan={selectPlan}
                            subdomain={subdomain}
                            userName={userName}
                            clientOrg={clientOrg}
                            setActiveTab={setActiveTab}
                            dashboardStats={dashboardStats}
                            subscriptionData={subscriptionData}
                            audienceList={audienceList}
                            backendPlans={backendPlans}
                        />
                    </ErrorBoundary>
                )}
                {activeTab === "Analytics" && (
                    <ErrorBoundary>
                        <AnalyticsSection selectedPlan={selectedPlan} setActiveTab={setActiveTab} dashboardStats={dashboardStats} webinarStats={webinarStats} />
                    </ErrorBoundary>
                )}
                {activeTab === "Webinars" && (
                    <ErrorBoundary>
                        <WebinarsSection
                            webinarSearch={webinarSearch} setWebinarSearch={setWebinarSearch}
                            webinarFilter={webinarFilter} setWebinarFilter={setWebinarFilter}
                            viewType={viewType} setViewType={setViewType}
                            handleCopyLink={handleCopyLink} copiedId={copiedId}
                            setActiveTab={setActiveTab}
                            selectedPlan={selectedPlan}
                            navigate={navigate}
                            currentWebinars={webinarStats.length}
                            webinarStats={webinarStats}
                            subscriptionData={subscriptionData}
                        />
                    </ErrorBoundary>
                )}
                {activeTab === "Templates" && (
                    <ErrorBoundary>
                        <TemplateGallery subscriptionData={subscriptionData} />
                    </ErrorBoundary>
                )}
                {activeTab === "Audience" && (
                    <ErrorBoundary>
                        <AudienceSection
                            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                            selectedWebinar={selectedWebinar} setSelectedWebinar={setSelectedWebinar}
                            audienceList={filteredAudience} setDrawerStudent={setDrawerStudent}
                        />
                    </ErrorBoundary>
                )}

                {activeTab === "Revenue" && (
                    <ErrorBoundary>
                        <RevenueSection dashboardStats={dashboardStats} setActiveTab={setActiveTab} audienceList={audienceList} subscriptionData={subscriptionData} />
                    </ErrorBoundary>
                )}
                {activeTab === "Billing" && (
                    <ErrorBoundary>
                        <BillingSection
                            billingCycle={billingCycle} setBillingCycle={setBillingCycle}
                            selectedPlan={selectedPlan}
                            setActiveTab={setActiveTab}
                            paymentMethods={paymentMethods}
                            onEditPayment={openEditPayment}
                            onAddPayment={openAddPayment}
                            subscriptionData={subscriptionData}
                            backendPlans={backendPlans}
                        />
                    </ErrorBoundary>
                )}
                {activeTab === "Settings" && (
                    <ErrorBoundary>
                        <SettingsSection
                            activeSettingTab={activeSettingTab} setActiveSettingTab={setActiveSettingTab}
                            isSavingSettings={isSavingSettings} handleSaveSettings={handleSaveSettings}
                            subdomain={subdomain} setSubdomain={setSubdomain}
                            isSubdomainAvailable={isSubdomainAvailable}
                            brandColor={brandColor} setBrandColor={setBrandColor}
                            showToast={showToast}
                            profilePic={profilePic}
                            handleProfilePicChange={handleProfilePicChange}
                            userName={userName}
                            setUserName={setUserName}
                            payoutUpi={payoutUpi}
                            setPayoutUpi={setPayoutUpi}
                            payoutUpiError={payoutUpiError}
                            payoutAccount={payoutAccount}
                            setPayoutAccount={setPayoutAccount}
                            payoutAccountError={payoutAccountError}
                            payoutIfsc={payoutIfsc}
                            setPayoutIfsc={setPayoutIfsc}
                            payoutIfscError={payoutIfscError}
                            clientFirstName={clientFirstName}
                            setClientFirstName={setClientFirstName}
                            clientLastName={clientLastName}
                            setClientLastName={setClientLastName}
                            clientOrg={clientOrg}
                            setClientOrg={setClientOrg}
                            clientPhone={clientPhone}
                            setClientPhone={setClientPhone}
                            clientEmail={clientEmail}
                            setClientEmail={setClientEmail}
                            clientGst={clientGst}
                            setClientGst={setClientGst}
                            clientPaymentMode={clientPaymentMode}
                            setClientPaymentMode={setClientPaymentMode}
                            clientAccountHolder={clientAccountHolder}
                            setClientAccountHolder={setClientAccountHolder}
                            clientAccountNumber={clientAccountNumber}
                            setClientAccountNumber={setClientAccountNumber}
                            clientIfsc={clientIfsc}
                            setClientIfsc={setClientIfsc}
                            clientBankName={clientBankName}
                            setClientBankName={setClientBankName}
                            clientUpi={clientUpi}
                            setClientUpi={setClientUpi}
                            passwordData={passwordData}
                            setPasswordData={setPasswordData}
                            passwordMsg={passwordMsg}
                            handleChangePassword={handleChangePassword}
                            isChangingPassword={isChangingPassword}
                            notifRegistration={notifRegistration}
                            setNotifRegistration={setNotifRegistration}
                            notifDailySummary={notifDailySummary}
                            setNotifDailySummary={setNotifDailySummary}
                        />
                    </ErrorBoundary>
                )}
            </div>

            <StudentDrawer drawerStudent={drawerStudent} setDrawerStudent={setDrawerStudent} />
            <PaymentModal
                show={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSave={handleSavePayment}
                editingMethod={editingPaymentMethod}
            />

            {/* DEBUG OVERLAY */}
            <button
                onClick={() => setShowDebug(!showDebug)}
                style={{ position: 'fixed', bottom: '20px', right: '20px', padding: '10px 15px', background: '#6574e9', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', zIndex: 10000, fontWeight: 'bold', boxShadow: '0 4px 15px rgba(101, 116, 233, 0.3)' }}
            >
                {showDebug ? "Close Debug ❌" : "Debug API Data 🛠️"}
            </button>

            {showDebug && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.97)', zIndex: 9999, padding: '50px', overflowY: 'auto', color: '#1a1a35', fontFamily: 'monospace', fontSize: '14px' }}>
                    <h2 style={{ color: '#fff' }}>RAW API DATA (Client Dashboard)</h2>
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#6574e9' }}>Dashboard Stats:</h4>
                        <pre>{JSON.stringify(dashboardStats, null, 2)}</pre>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#6574e9' }}>Webinar Stats:</h4>
                        <pre>{JSON.stringify(webinarStats, null, 2)}</pre>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#6574e9' }}>Audience List:</h4>
                        <pre>{JSON.stringify(audienceList, null, 2)}</pre>
                    </div>
                    <hr style={{ margin: '30px 0', borderColor: '#334155' }} />
                    <h3>Token Used:</h3>
                    <p style={{ wordBreak: 'break-all' }}>{localStorage.getItem("token")}</p>
                </div>
            )}
        </div>
    );
};

const DashBoardWithBoundary = () => (
    <ErrorBoundary>
        <DashBoard />
    </ErrorBoundary>
);

export default DashBoardWithBoundary;
