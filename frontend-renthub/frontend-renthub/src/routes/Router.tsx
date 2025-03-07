import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext, ReactElement } from "react"; // 🔹 Importa ReactElement
import { AuthContext } from "../context/AuthContext";
import Login from "../pages/Login";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import CreateTenant from "../pages/CreateTenant";
import NotFound from "../pages/NotFound";

const ProtectedRoute = ({ element }: { element: ReactElement }) => {
  const { user } = useContext(AuthContext)!;
  return user ? element : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/user" element={<ProtectedRoute element={<UserDashboard />} />} />
        <Route path="/dashboard/admin" element={<ProtectedRoute element={<AdminDashboard />} />} />
        <Route path="/dashboard/admin/create-tenant" element={<ProtectedRoute element={<CreateTenant />} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
