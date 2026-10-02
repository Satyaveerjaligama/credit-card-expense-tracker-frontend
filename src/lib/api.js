const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Universal fetch wrapper that handles JSON formatting, JWT token injection, and errors
 */
async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cc_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.message || (data.errors && data.errors[0]?.msg) || 'API Request failed';
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request('/auth/me'),

  updatePassword: (passwordData) =>
    request('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),

  updateProfile: (profileData) =>
    request('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Limits
  getLimitsOverview: () => request('/limits/overview'),

  updateLimits: (limitsData) =>
    request('/limits', {
      method: 'PUT',
      body: JSON.stringify(limitsData),
    }),

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.month) query.append('month', params.month);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return request(`/transactions${qs ? `?${qs}` : ''}`);
  },

  addTransaction: (transactionData) =>
    request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    }),

  updateTransaction: (id, transactionData) =>
    request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    }),

  deleteTransaction: (id) =>
    request(`/transactions/${id}`, {
      method: 'DELETE',
    }),

  parseSMS: (smsData) =>
    request('/transactions/parse-sms', {
      method: 'POST',
      body: JSON.stringify(smsData),
    }),

  bulkImport: (items) =>
    request('/transactions/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  // Analytics
  getMonthlyHistory: (months = 6) => request(`/analytics/monthly-history?months=${months}`),

  getCategoryBreakdown: (month = '') =>
    request(`/analytics/categories${month ? `?month=${month}` : ''}`),
};
