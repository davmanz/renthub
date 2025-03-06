import api from "../api/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        navigate("/login"); // Redirige al login si no hay token
        return;
      }

      try {
        const response = await api.get("/user-dashboard/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch (error) {
        console.error("Error al obtener el dashboard", error);
        setError("Hubo un error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login"); // Redirige al Login
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Dashboard del Usuario</h1>
      <button onClick={logout} style={{ background: "red", color: "white", padding: "8px 16px", border: "none", cursor: "pointer" }}>
        Cerrar Sesión
      </button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default UserDashboard;
