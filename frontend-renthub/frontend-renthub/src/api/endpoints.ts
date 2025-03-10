const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const endpoints = {
  auth: {
    login: `${API_BASE}/token/`,
    me: `${API_BASE}/users/me/`,
    
  },

  createUsers :{
    createUser: `${API_BASE}/users/`,
    documentTypes: `${API_BASE}/document-types/`,
    referencePerson: `${API_BASE}/references/` 
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
};

export default endpoints;
