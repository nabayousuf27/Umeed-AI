// API calls using axios to interact with the backend

import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token interceptor for authenticated requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("admin_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// ============================================
// BORROWER ENDPOINTS
// ============================================

export const signupBorrower = (data) => API.post("/borrower/signup", data);
export const loginBorrower = (data) => API.post("/borrower/login", data);
export const getBorrowerProfile = () => API.get("/borrower/me");
export const applyForLoan = (data) => API.post("/borrower/apply-loan", data);
export const getBorrowerLoans = () => API.get("/borrower/loans");

// ============================================
// LOAN ENDPOINTS
// ============================================

export const getLoanDetail = (loanId) => API.get(`/loan/${loanId}`);

// ============================================
// ADMIN ENDPOINTS
// ============================================

export const loginAdmin = (data) => API.post("/admin/login", data);
export const getAdminDashboard = () => API.get("/admin/dashboard");
export const getAllLoans = (filters = {}) => 
  API.get("/admin/loans", { params: filters });
export const getAllClients = (params = {}) => 
  API.get("/admin/clients", { params });
export const getAdminLoanDetail = (loanId) => 
  API.get(`/admin/loan/${loanId}`);
export const approveLoan = (loanId, data) => 
  API.post(`/admin/loan/${loanId}/approve`, data);
export const rejectLoan = (loanId, data) => 
  API.post(`/admin/loan/${loanId}/reject`, data);

// ============================================
// LEGACY CLIENT ENDPOINTS
// ============================================

export const getClients = () => API.get("/clients");
export const getClient = (clientId) => API.get(`/clients/${clientId}`);
export const addClient = (client) => API.post("/clients", client);

export default API;