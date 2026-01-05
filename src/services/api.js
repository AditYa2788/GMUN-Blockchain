const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth headers from localStorage
function getAuthHeaders() {
  const auth = localStorage.getItem('medchain_auth');
  if (!auth) return {};
  
  try {
    const { address, signature, message } = JSON.parse(auth);
    return {
      'address': address,
      'signature': signature,
      'message': message
    };
  } catch {
    return {};
  }
}

// API request helper
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  getNonce: (address) => apiRequest(`/auth/nonce?address=${address}`),
  verify: (address, signature, message) => 
    apiRequest('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ address, signature, message })
    }),
  getMe: () => apiRequest('/auth/me')
};

// Patient API
export const patientAPI = {
  getProfile: () => apiRequest('/patient/profile'),
  updateProfile: (data) => apiRequest('/patient/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getAppointments: () => apiRequest('/patient/appointments'),
  bookAppointment: (data) => apiRequest('/patient/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getPrescriptions: () => apiRequest('/patient/prescriptions'),
  getEHR: () => apiRequest('/patient/ehr'),
  getAccessPermissions: () => apiRequest('/patient/access-permissions'),
  grantAccess: (data) => apiRequest('/patient/grant-access', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Doctor API
export const doctorAPI = {
  getDoctors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/doctor/doctors${query ? '?' + query : ''}`);
  },
  getDepartments: () => apiRequest('/doctor/departments'),
  getProfile: () => apiRequest('/doctor/profile'),
  getPatients: () => apiRequest('/doctor/patients'),
  getAppointments: (status) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/doctor/appointments${query}`);
  },
  updateAppointmentStatus: (id, status) => 
    apiRequest(`/doctor/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  createPrescription: (data) => apiRequest('/doctor/prescriptions', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Pharmacy API
export const pharmacyAPI = {
  getPrescription: (tokenId) => apiRequest(`/pharmacy/prescription/${tokenId}`),
  fulfillPrescription: (tokenId) => apiRequest(`/pharmacy/prescription/${tokenId}/fulfill`, {
    method: 'POST'
  }),
  getInventory: () => apiRequest('/pharmacy/inventory'),
  addInventory: (data) => apiRequest('/pharmacy/inventory', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  verifyInventory: (data) => apiRequest('/pharmacy/inventory/verify', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Blockchain API
export const blockchainAPI = {
  getNetwork: () => apiRequest('/blockchain/network'),
  getAddress: (address) => apiRequest(`/blockchain/address/${address}`),
  verifyContract: (address) => apiRequest('/blockchain/verify-contract', {
    method: 'POST',
    body: JSON.stringify({ address })
  })
};

export default apiRequest;

