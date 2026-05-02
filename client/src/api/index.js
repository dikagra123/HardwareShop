import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (data) => API.post('/api/auth/login', data);

export const getCustomers = (search) => API.get(`/api/customers${search ? `?search=${search}` : ''}`);
export const getCustomer = (id) => API.get(`/api/customers/${id}`);
export const createCustomer = (data) => API.post('/api/customers', data);
export const updateCustomer = (id, data) => API.put(`/api/customers/${id}`, data);
export const deleteCustomer = (id) => API.delete(`/api/customers/${id}`);

export const getJobs = (params) => API.get('/api/jobs', { params });
export const getJob = (id) => API.get(`/api/jobs/${id}`);
export const createJob = (data) => API.post('/api/jobs', data);
export const updateJobStatus = (id, data) => API.patch(`/api/jobs/${id}/status`, data);
export const updateJob = (id, data) => API.put(`/api/jobs/${id}`, data);

export const calculatePaint = (data) => API.post('/api/estimates/paint/calculate', data);
export const savePaintEstimate = (data) => API.post('/api/estimates/paint', data);
export const getRepairRates = () => API.get('/api/estimates/repair/rates');
export const calculateRepair = (data) => API.post('/api/estimates/repair/calculate', data);
export const saveRepairEstimate = (data) => API.post('/api/estimates/repair', data);

export const getInvoices = () => API.get('/api/invoices');
export const createInvoice = (data) => API.post('/api/invoices', data);
export const payInvoice = (id, data) => API.patch(`/api/invoices/${id}/pay`, data);

export const getInventory = (params) => API.get('/api/inventory', { params });
export const getDashboardStats = () => API.get('/api/inventory/stats/summary');
export const addMaterial = (data) => API.post('/api/inventory', data);
export const updateStock = (id, data) => API.patch(`/api/inventory/${id}/stock`, data);

export default API;