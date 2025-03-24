const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const endpoints = {
  auth: {
    login: `${API_BASE}/token/`,
    refresh: `${API_BASE}/token/refresh/`,
    me: `${API_BASE}/users/me/`,
    changePassword: `${API_BASE}/users/change_password/`,
  },

  userManagement: {
    user: `${API_BASE}/users/`,
    userId: (userId: string) => `${API_BASE}/users/${userId}/`,
    documentTypes: `${API_BASE}/document-types/`,
    referencePerson: `${API_BASE}/references/`,
  },

  contractManagement: {
    contracts: `${API_BASE}/contracts/`,
    rommsAvaible: `${API_BASE}/rooms/available/`,
    roomsAvailable: (buildingId?: string) => buildingId
      ? `${API_BASE}/rooms/available/?building_id=${buildingId}`
      : `${API_BASE}/rooms/available/`,
  },

  siteManagement: {
    rooms: `${API_BASE}/rooms/`,
    building: `${API_BASE}/buildings/`,
    buildingRooms: (buildingId: string) => `${API_BASE}/buildings/${buildingId}/rooms/`,
    buildingRoomsAvailable: (buildingId: string) => `${API_BASE}/buildings/${buildingId}/rooms/available/`,
    buildingRoomsOccupied: (buildingId: string) => `${API_BASE}/buildings/${buildingId}/rooms/occupied/`,
  },

  dashboard: {
    //user: `${API_BASE}/user-dashboard/`,
    admin: `${API_BASE}/admin-dashboard/`,
    //laundry: `${API_BASE}/laundry-dashboard/`,
  },

  payments: {
    // Arriendo
    listRent: `${API_BASE}/payments/rent/`,
    detailRent: (id: string) => `${API_BASE}/payments/rent/${id}/`,
    createRent: (id: string) =>`${API_BASE}/payments/rent/${id}/`,
    approveRent: (id: string) => `${API_BASE}/payments/rent/${id}/approve/`,
    rejectRent: (id: string) => `${API_BASE}/payments/rent/${id}/reject/`,
  },

  laundryManagement: {
    list: `${API_BASE}/laundry-bookings/`,
    create: `${API_BASE}/laundry-bookings/`,
    detail: (bookingId: string) => `${API_BASE}/laundry-bookings/${bookingId}/`,
    approve: (bookingId: string) => `${API_BASE}/laundry-bookings/${bookingId}/approve/`,
    reject: (bookingId: string) => `${API_BASE}/laundry-bookings/${bookingId}/reject/`,
    propose: (bookingId: string) => `${API_BASE}/laundry-bookings/${bookingId}/propose/`,
    acceptProposal: (bookingId: string) => `${API_BASE}/laundry-bookings/${bookingId}/accept_proposal/`,
    counterProposal: (bookingId: string) => `${API_BASE}/laundry-bookings/${bookingId}/counter_proposal/`,
  },

  changeRequests: {
    list: `${API_BASE}/change_requests/`, // GET: listar solicitudes (usuario o admin)
    create: `${API_BASE}/change_requests/`, // POST: crear solicitud (usuario)
    approve: (id: string) => `${API_BASE}/change_requests/${id}/approve/`, // PATCH: aprobar (admin)
    reject: (id: string) => `${API_BASE}/change_requests/${id}/reject/`,   // PATCH: rechazar (admin)
  },
  
};

export default endpoints;
