import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import Loading from "./components/common/Loading";

const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CropDemandPage = lazy(() => import("./pages/CropDemandPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const FormPage = lazy(() => import("./pages/FormPage"));
const TicketStatusPage = lazy(() => import("./pages/TicketStatusPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));

function AuthRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

function AdminRoute({ children }) {
  return localStorage.getItem("farmy_admin_token") ? children : <Navigate to="/admin/login" replace />;
}

function RouteContent({ children }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute><RouteContent><RegisterPage /></RouteContent></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RouteContent><RegisterPage /></RouteContent></AuthRoute>} />
      <Route path="/login" element={<AuthRoute><RouteContent><LoginPage /></RouteContent></AuthRoute>} />
      <Route path="/admin/login" element={<RouteContent><AdminLoginPage /></RouteContent>} />
      <Route path="/dashboard" element={<ProtectedRoute><RouteContent><LandingPage /></RouteContent></ProtectedRoute>} />
      <Route path="/slots" element={<ProtectedRoute><RouteContent><DashboardPage /></RouteContent></ProtectedRoute>} />
      <Route path="/form" element={<ProtectedRoute><RouteContent><FormPage /></RouteContent></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute><RouteContent><TicketStatusPage /></RouteContent></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><RouteContent><AdminDashboardPage /></RouteContent></AdminRoute>} />
      <Route path="/demand" element={<RouteContent><CropDemandPage /></RouteContent>} />
      <Route path="/schedule" element={<RouteContent><SchedulePage /></RouteContent>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
