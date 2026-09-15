import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import PropertiesPage from "./pages/PropertiesPage.jsx";
import PropertyPage from "./pages/PropertyPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import ActivationPage from "./pages/ActivationPage.jsx";
import AddPropertyPage from "./pages/AddPropertyPage.jsx";
import { useAuthStore } from "./store/authStore.js";
function Protected({ roles, children }) {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
function AdminProtected({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  if (!user || user.role !== "platform_admin")
    return <Navigate to="/admin/login" replace />;
  return children;
}
export default function App() {
  const loadUser = useAuthStore((state) => state.loadUser);
  useEffect(() => {
    loadUser();
  }, [loadUser]);
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/*"
        element={
          <AdminProtected>
            <AdminPage />
          </AdminProtected>
        }
      />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:slug" element={<PropertyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/how-it-works" element={<HomePage compact />} />
        <Route
          path="/billing"
          element={
            <Protected roles={["owner", "agent", "agency_admin"]}>
              <ActivationPage />
            </Protected>
          }
        />
        <Route
          path="/account"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Protected
              roles={["owner", "agent", "agency_admin", "agency_agent"]}
            >
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/dashboard/properties/new"
          element={
            <Protected roles={["owner", "agency_admin"]}>
              <AddPropertyPage />
            </Protected>
          }
        />
      </Route>
    </Routes>
  );
}
