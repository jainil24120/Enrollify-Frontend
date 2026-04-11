import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./component/LandingPage";
import SignUpform from "./component/SignUpform";
import DashBoard from "./component/DashBoard";
import ClientForm from "./component/ClientForm";
import CreateWebinar from "./component/CreateWebinar";
import TemplatePage from "./component/TemplatePage";
import SubdomainPage from "./component/SubdomainPage";
import AdminDashboard from "./component/AdminDashboard";
import AdminLogin from "./component/AdminLogin";
import UserForm from "./component/UserForm";
import TemplatePreview from "./component/TemplatePreview";

// Detect subdomain: yoga.enrollify.xyz → "yoga"
const getSubdomain = () => {
  const host = window.location.hostname;
  // Match *.enrollify.xyz or *.enrollify.com
  const match = host.match(/^([a-z0-9-]+)\.enrollify\.(xyz|com)$/i);
  if (match && match[1] !== "www") return match[1];
  return null;
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/signin" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("isAdminAuth") === "true";
  const token = localStorage.getItem("token");
  if (!isAdmin || !token) return <Navigate to="/admin" replace />;
  return children;
};

function App() {
  const subdomain = getSubdomain();

  // If accessing via subdomain (e.g. yoga.enrollify.xyz), show client's webinar page
  if (subdomain) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/w/:slug" element={<TemplatePage />} />
          <Route path="/register" element={<UserForm />} />
          <Route path="*" element={<SubdomainPage subdomain={subdomain} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Main app (enrollify.xyz)
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignUpform />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
        <Route path="/client-form" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
        <Route path="/create-webinar" element={<ProtectedRoute><CreateWebinar /></ProtectedRoute>} />
        <Route path="/w/:slug" element={<TemplatePage />} />
        <Route path="/template" element={<TemplatePage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/preview/:templateKey" element={<TemplatePreview />} />
        <Route path="/register" element={<UserForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
