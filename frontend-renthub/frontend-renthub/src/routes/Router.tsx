import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext, ReactElement } from "react"; // 🔹 Importa ReactElement
import { AuthContext } from "../context/AuthContext";
import Login from "../pages/Login";
import UserDashboard from "../pages/users/UserDashboard";
import AdminDashboard from "../pages/admins/AdminDashboard";
import UserManagement from "../pages/admins/UserManagement";
import ContractManagement from "../pages/admins/ContractManagement.tsx";
import Sites from "../pages/admins/Sites";
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
        <Route path="/dashboard/admin/users" element={<ProtectedRoute element={<UserManagement />} />} />
        <Route path="/dashboard/admin/contract" element={<ProtectedRoute element={<ContractManagement />} />} />
        <Route path="/dashboard/admin/create-sites" element={<ProtectedRoute element={<Sites />} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
