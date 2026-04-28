import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Eagerly loaded: landing, sign-in, 404 — first paint critical paths.
import LandingPage from "./component/LandingPage";
import SignUpform from "./component/SignUpform";
import NotFound from "./component/NotFound";

// Lazy-loaded: heavy authenticated/admin/template routes split into their own
// chunks so the initial bundle stays small for marketing visitors.
const DashBoard = lazy(() => import("./component/DashBoard"));
const ClientForm = lazy(() => import("./component/ClientForm"));
const CreateWebinar = lazy(() => import("./component/CreateWebinar"));
const TemplatePage = lazy(() => import("./component/TemplatePage"));
const SubdomainPage = lazy(() => import("./component/SubdomainPage"));
const AdminDashboard = lazy(() => import("./component/AdminDashboard"));
const AdminLogin = lazy(() => import("./component/AdminLogin"));
const UserForm = lazy(() => import("./component/UserForm"));
const TemplatePreview = lazy(() => import("./component/TemplatePreview"));
const PrivacyPolicy = lazy(() => import("./component/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./component/legal/TermsOfService"));
const RefundPolicy = lazy(() => import("./component/legal/RefundPolicy"));
const About = lazy(() => import("./component/legal/About"));
const Contact = lazy(() => import("./component/legal/Contact"));
const Careers = lazy(() => import("./component/legal/Careers"));

const RouteFallback = () => (
  <div
    style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#6366f1",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "0.95rem",
    }}
  >
    Loading...
  </div>
);

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
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<SubdomainPage subdomain={subdomain} />} />
            <Route path="/w/:slug" element={<TemplatePage />} />
            <Route path="/register" element={<UserForm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
  }

  // Main app (enrollify.xyz)
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignUpform />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/signup" element={<Navigate to="/signin" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
          <Route path="/client-form" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
          <Route path="/create-webinar" element={<ProtectedRoute><CreateWebinar /></ProtectedRoute>} />
          <Route path="/w/:slug" element={<TemplatePage />} />
          <Route path="/template" element={<TemplatePage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/preview/:templateKey" element={<TemplatePreview />} />
          <Route path="/register" element={<UserForm />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
