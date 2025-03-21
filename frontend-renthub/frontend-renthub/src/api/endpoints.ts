const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const endpoints = {
  auth: {
    login: `${API_BASE}/token/`,
    me: `${API_BASE}/users/me/`,
    refresh: `${API_BASE}/refresh/`
    
  },

  userManagement :{
    user: `${API_BASE}/users/`,
    userId: (userId: string) => `${API_BASE}/users/${userId}/` ,
    documentTypes: `${API_BASE}/document-types/`,
    referencePerson: `${API_BASE}/references/` 
  },

  contractManagement:{
    rommsAvaible: `${API_BASE}/rooms/available/`,
    contracts: `${API_BASE}/contracts/`
  },

  siteManagement: {
    rooms: `${API_BASE}/rooms/`,
    building: `${API_BASE}/buildings/`,
    buildingRooms: (buildingId: string) => `${API_BASE}/buildings/${buildingId}/rooms/`,
    buildingRoomsAvailable: (buildingId: string) => `${API_BASE}/buildings/${buildingId}/rooms/available`,
    buildingRoomsOccuped: (buildingId: string) => `${API_BASE}/buildings/${buildingId}/rooms/occupied`,
  },

  dashboard: {
    user: `${API_BASE}/user-dashboard/`,
    admin: `${API_BASE}/admin-dashboard/`,
  },
  
  payments: {
    approve: (paymentId: string) =>`${API_BASE}/payments/${paymentId}/approve_payment/`,
    reject: (paymentId: string) =>`${API_BASE}/payments/${paymentId}/reject_payment/`, 
    list: `${API_BASE}/payments/`,
    detail: (paymentId: string) => `${API_BASE}/payments/${paymentId}/`,
    create: `${API_BASE}/payments/`,
  },

  laundryManagement: {
    list: "/laundry-bookings/",
    create: "/laundry-bookings/",
    detail: (bookingId: string) => `/laundry-bookings/${bookingId}/`,
    approve: (bookingId: string) => `/laundry-bookings/${bookingId}/approve/`,
    reject: (bookingId: string) => `/laundry-bookings/${bookingId}/reject/`,
    propose: (bookingId: string) => `/laundry-bookings/${bookingId}/propose/`,
    acceptProposal: (bookingId: string) => `/laundry-bookings/${bookingId}/accept_proposal/`,
    counterProposal: (bookingId: string) => `/laundry-bookings/${bookingId}/counter_proposal/`,
  }
};

export default endpoints;
