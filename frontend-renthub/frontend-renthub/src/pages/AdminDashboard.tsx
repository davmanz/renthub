import api from "../api/api";
import endpoints from "../api/endpoints";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userResponse = await api.get(endpoints.auth.me);
        const role = userResponse.data.role;
        setUserRole(role);

        if (role !== "admin" && role !== "superadmin") {
          navigate("/dashboard/user");
          return;
        }

        const response = await api.get(endpoints.dashboard.admin);
        setData(response.data);
      } catch (error: any) {
        if (error.response?.status === 403) {
          navigate("/dashboard/user");
        } else {
          console.error("Error al obtener el dashboard del administrador", error);
          setError("Hubo un error al cargar los datos.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <p>Tu rol es: {userRole}</p>
      <h1>Dashboard del Administrador</h1>
      <button onClick={logout}>Cerrar Sesión</button>
      <h2>Pagos Vencidos / No Verificados</h2>
      <ul>
        {data?.unverified_payments?.map((payment: any) => (
          <li key={payment.id}>
            Pago {payment.id} - Usuario: {payment.user} - Estado: {payment.status}
          </li>
        ))}
      </ul>
      <h2>Pagos de Arriendo</h2>
      <ul>
        {data?.rental_payments?.map((rental: any) => (
          <li key={rental.id}>
            Habitación {rental.room_number} - Fecha: {rental.payment_date} - Periodo: {rental.month_paid}
          </li>
        ))}
      </ul>
      <h2>Pagos por Lavadora</h2>
      <ul>
        {data?.laundry_payments?.map((laundry: any) => (
          <li key={laundry.id}>
            Habitación {laundry.room_number} - Fecha: {laundry.payment_date} - Hora: {laundry.time_selected}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
