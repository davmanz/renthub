import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/Router";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(

    <AuthProvider>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>

);
