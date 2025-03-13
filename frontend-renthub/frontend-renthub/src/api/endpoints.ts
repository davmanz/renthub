const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const endpoints = {
  auth: {
    login: `${API_BASE}/token/`,
    me: `${API_BASE}/users/me/`,
    refresh: `${API_BASE}/refresh/`
    
  },

  userManagement :{
    user: `${API_BASE}/users/`,
    documentTypes: `${API_BASE}/document-types/`,
    referencePerson: `${API_BASE}/references/` 
  },

  createContract:{
    users: `${API_BASE}/users/`,
    rommsAvaible: `${API_BASE}/rooms/available/`,
    contracts: `${API_BASE}/contracts/`
  },

  createSites:{
    rooms: `${API_BASE}/rooms/`,
    rooms_id: `${API_BASE}/rooms/available/?building_id`,
    building: `${API_BASE}/buildings/`
  },

  dashboard: {
    user: `${API_BASE}/user-dashboard/`,
    admin: `${API_BASE}/admin-dashboard/`,
  },
  
  payments: {
    unverified: `${API_BASE}/payments/unverified/`,
    rental: `${API_BASE}/payments/rental/`,
    laundry: `${API_BASE}/payments/laundry/`,
  },
  laundry: {
    getBookings: `${API_BASE}/laundry-bookings/`, // Obtener reservas de lavandería
    createBooking: `${API_BASE}/laundry-bookings/`, // Crear una nueva reserva
    acceptProposal: (id: string) => `${API_BASE}/laundry-bookings/${id}/accept-proposal/`, // Aceptar propuesta del admin
    counterProposal: (id: string) => `${API_BASE}/laundry-bookings/${id}/counter-proposal/`, // Enviar contrapropuesta
  },
};

export default endpoints;
