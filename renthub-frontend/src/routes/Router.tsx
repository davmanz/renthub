import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext, ReactElement } from "react";
import { AuthContext } from "../context/AuthContext.tsx";
import { DashboardProvider } from "../components/shared/DashboardContext.tsx";

// Pages
import LoginPage from "../pages/Login";
import UserDashboard from "../pages/users/UserDashboard.tsx";
import AdminDashboard from "../pages/admins/AdminDashboard.tsx";
import UserManagement from "../pages/admins/UserManagement";
import ContractManagement from "../pages/admins/ContractManagement.tsx";
import SitesManagement from "../pages/admins/SitesManagement.tsx";
import LaundryManagement from "../pages/admins/LaundryManagement.tsx";
import UserPaymentHistory from "../pages/admins/UserPaymentHistory";
import VerifyAccountPage from "../pages/VerifyAccountPage";
import ChangeRequestsAdmin from "../pages/admins/ChangeRequestsAdmin";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFound from "../pages/NotFound";
import { Box, CircularProgress } from "@mui/material";
import ProfilePage from "../pages/admins/ProfilePage.tsx";

// Ruta protegida: solo para usuarios autenticados
const ProtectedRoute = ({ element }: { element: ReactElement }) => {
  const { isAuthenticated } = useContext(AuthContext)!;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

// Ruta pública: solo para usuarios NO autenticados
const PublicRoute = ({ element }: { element: ReactElement }) => {
  const { isAuthenticated, user } = useContext(AuthContext)!;
  if (isAuthenticated) {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/dashboard/user" replace />;
  }
  return element;
};

const AppRoutes = () => {
  const { isLoading } = useContext(AuthContext)!;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={
            <PublicRoute element={<LoginPage />} />
          }
        />

        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        <Route
          path="/dashboard/user"
          element={
            <ProtectedRoute
              element={
                <DashboardProvider>
                  <UserDashboard />
                </DashboardProvider>
              }
            />
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute element={<AdminDashboard />} />
          }
        />

        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute element={<UserManagement />} />
          }
        />

        <Route
          path="/dashboard/admin/contract"
          element={
            <ProtectedRoute element={<ContractManagement />} />
          }
        />

        <Route
          path="/dashboard/admin/sites"
          element={
            <ProtectedRoute element={<SitesManagement />} />
          }
        />

        <Route
          path="/dashboard/admin/laundry"
          element={
            <ProtectedRoute element={<LaundryManagement />} />
          }
        />

        <Route
          path="/dashboard/admin/payment-history"
          element={<ProtectedRoute element={<UserPaymentHistory />} />}
        />

        <Route
          path="/dashboard/admin/change-requests"
          element={<ProtectedRoute element={<ChangeRequestsAdmin />} />}
        />

        <Route
          path="/dashboard/admin/profile"
          element={<ProtectedRoute element={<ProfilePage />} />}
        />

        <Route
          path="/verify-account/:token"
          element={<VerifyAccountPage />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
