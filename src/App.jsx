import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./component/LandingPage";
import SignUpform from "./component/SignUpform";
import DashBoard from "./component/DashBoard";
import ClientForm from "./component/ClientForm";
import CreateWebinar from "./component/CreateWebinar";
import TemplatePage from "./component/TemplatePage";
import AdminDashboard from "./component/AdminDashboard";
import AdminLogin from "./component/AdminLogin";
import UserForm from "./component/UserForm";

// Protected route for authenticated clients
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/signup" replace />;
  }
  return children;
};

// Protected route for admin
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("isAdminAuth") === "true";
  const token = localStorage.getItem("token");
  if (!isAdmin || !token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpform />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
        <Route path="/client-form" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
        <Route path="/create-webinar" element={<ProtectedRoute><CreateWebinar /></ProtectedRoute>} />
        <Route path="/w/:slug" element={<TemplatePage />} />
        <Route path="/template" element={<TemplatePage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/register" element={<UserForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
