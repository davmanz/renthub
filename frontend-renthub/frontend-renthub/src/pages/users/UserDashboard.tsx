import { useState } from "react";
import { Box, AppBar, Toolbar, Typography, Paper } from "@mui/material";
import Sidebar from "./Sidebar";
import ProfileSummary from "./ProfileSummary";
import ContractInfo from "./ContractInfo";
import PaymentHistory from "./PaymentHistory";
import LaundryBookings from "./LaundryBookings";
import ChangePassword from "./SettingsPage";

const UserDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("inicio");

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Menú Lateral */}
      <Sidebar onSelect={setSelectedSection} />

      {/* Contenido principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" sx={{ bgcolor: "#1976d2" }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Dashboard de Usuario</Typography>
          </Toolbar>
        </AppBar>

        <Paper sx={{ padding: 3, bgcolor: "#2c2c2c", color: "white", mt: 2 }}>
          {selectedSection === "inicio" && <ProfileSummary />}
          {selectedSection === "contrato" && <ContractInfo />}
          {selectedSection === "pagos" && <PaymentHistory />}
          {selectedSection === "lavanderia" && <LaundryBookings />}
          {selectedSection === "configuracion" && <ChangePassword />}
        </Paper>
      </Box>
    </Box>
  );
};

export default UserDashboard;
