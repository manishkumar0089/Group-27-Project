import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const register = (data: any) => api.post('/api/auth/register', data);
export const login = (data: any) => api.post('/api/auth/login', data);
export const sendOtp = (email: string) => api.post('/api/auth/send-otp', { email });
export const verifyOtp = (email: string, otp: string) => api.post('/api/auth/verify-otp', { email, otp });

// ---- Events ----
export const getOpenEvents = () => api.get('/api/events');
export const getAllEvents = () => api.get('/api/events/all');
export const getEvent = (id: number) => api.get(`/api/events/${id}`);
export const createEvent = (data: any) => api.post('/api/events', data);
export const updateEvent = (id: number, data: any) => api.put(`/api/events/${id}`, data);
export const closeEvent = (id: number) => api.post(`/api/events/${id}/close`);

// ---- Registrations ----
export const registerForEvent = (eventId: number) => api.post('/api/registrations', { eventId });
export const verifyPayment = (registrationId: number, txnId: string) =>
  api.post('/api/payment/verify', { registrationId, txnId });
export const getMyRegistrations = () => api.get('/api/registrations/my');
export const getTicketQR = (id: number) =>
  api.get(`/api/registrations/${id}/ticket`, { responseType: 'blob' });

// ---- CheckIn ----
export const scanQR = (qrToken: string) => api.post('/api/checkin/scan', { qrToken });
export const searchAttendee = (query: string, eventId: number) =>
  api.get('/api/checkin/search', { params: { query, eventId } });
export const manualCheckIn = (registrationId: number) =>
  api.post(`/api/checkin/manual/${registrationId}`);

// ---- Admin ----
export const getEventStats = (id: number) => api.get(`/api/admin/events/${id}/stats`);
export const exportEventData = (id: number) =>
  api.get(`/api/admin/events/${id}/export`, { responseType: 'blob' });
export const createVolunteer = (data: any) => api.post('/api/admin/volunteers', data);
export const getCheckInFeed = (id: number) => api.get(`/api/admin/events/${id}/checkin-feed`);
export const getVolunteersForEvent = (id: number) => api.get(`/api/admin/events/${id}/volunteers`);

export default api;
