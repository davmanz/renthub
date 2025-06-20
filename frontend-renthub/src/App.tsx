import { useState } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard'; // O el ícono que prefieras
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="renthub-header">
        <div className="renthub-logo">
          <DashboardIcon sx={{
            fontSize: 60,
            color: "#64b5f6",
            filter: "drop-shadow(0 4px 12px #64b5f699)"
          }} />
          <span className="renthub-title">
            RENT<span style={{ color: "#64b5f6" }}>HUB</span>
          </span>
        </div>
      </div>
      <h1>Bienvenido a RENTHUB</h1>
      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
        <p>
          Edita <code>src/App.tsx</code> y guarda para ver cambios en vivo
        </p>
      </div>
      <p className="read-the-docs">
        Plataforma de gestión de contratos, pagos y servicios.
      </p>
    </>
  );
}

export default App;
