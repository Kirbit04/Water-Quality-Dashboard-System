const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      credentials: 'include', // Includes cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
      
      // Extract detailed error message
      let errorMessage = errorData.message || errorData.detail || `HTTP ${response.status}`;
      
      // If detail is an array (validation errors), extract the first error
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail[0]?.msg || errorData.detail[0]?.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};


// Authentication APIs
export const authAPI = {
  signup: async (userData) => {
    return apiCall('/users/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        name: userData.name || '',
        phone: userData.phone || '',
        password: userData.password,
        role: userData.role || 'user',
      }),
    });
  },

  login: async (email, password, role) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },
};

// Lab Tests APIs
export const labTestAPI = {
  submit: async (testData) => {
    return apiCall('/lab-tests', {
      method: 'POST',
      body: JSON.stringify({
        occupation: testData.occupation,
        location_id: parseInt(testData.location_id),
        date_of_test: testData.date_of_test,
        ph: parseFloat(testData.ph),
        turbidity: parseFloat(testData.turbidity),
        salinity: parseFloat(testData.salinity),
        dissolved_oxygen: parseFloat(testData.dissolved_oxygen),
        nitrates: parseFloat(testData.nitrates),
        phosphates: parseFloat(testData.phosphates),
      }),
    });
  },

  getAll: async (skip = 0, limit = 100) => {
    return apiCall(`/lab-tests?skip=${skip}&limit=${limit}`, {
      method: 'GET',
    });
  },

  getById: async (testId) => {
    return apiCall(`/lab-tests/${testId}`, {
      method: 'GET',
    });
  },

  getUserTests: async (userId, skip = 0, limit = 100) => {
    return apiCall(`/lab-tests/user/${userId}?skip=${skip}&limit=${limit}`, {
      method: 'GET',
    });
  },
};

// Contact APIs
export const contactAPI = {
  submitMessage: async (contactData) => {
    return apiCall('/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: contactData.name,
        email: contactData.email,
        message: contactData.message,
      }),
    });
  },

  getAllMessages: async (skip = 0, limit = 100) => {
    return apiCall(`/contact?skip=${skip}&limit=${limit}`, {
      method: 'GET',
    });
  },

  getMessage: async (messageId) => {
    return apiCall(`/contact/${messageId}`, {
      method: 'GET',
    });
  },

  markAsRead: async (messageId) => {
    return apiCall(`/contact/${messageId}/read`, {
      method: 'PATCH',
    });
  },
};

// Admin APIs
export const adminAPI = {
  getStats: async () => {
    return apiCall('/admin/stats', {
      method: 'GET',
    });
  },

  getSubmittedTests: async (skip = 0, limit = 100) => {
    return apiCall(`/lab-tests?skip=${skip}&limit=${limit}`, {
      method: 'GET',
    });
  },

  exportTestData: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/tests/export/csv`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    return response.blob();
  },

  getAllMessages: async (skip = 0, limit = 100) => {
    return apiCall(`/contact?skip=${skip}&limit=${limit}`, {
      method: 'GET',
    });
  },
};

// User APIs
export const userAPI = {
  getProfile: async (userId) => {
    return apiCall(`/users/me?user_id=${userId}`, {
      method: 'GET',
    });
  },
};
