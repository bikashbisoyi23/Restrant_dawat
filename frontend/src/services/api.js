import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const UPLOADS_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'; // For legacy static images

const api = axios.create({ baseURL: API_BASE });

// Inject admin token if present
api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers['x-admin-token'] = token;
    return config;
});

export const menuApi = {
    getAll: () => api.get('/menu?t=' + Date.now()),
    getFeatured: () => api.get('/menu/featured?t=' + Date.now()),
};

export const tablesApi = {
    getAll: (params) => api.get('/tables', { params }),
    getAvailable: (params) => api.get('/tables/available', { params }),
};

export const reservationsApi = {
    create: (data) => api.post('/reservations', data),
    getById: (id) => api.get(`/reservations/${id}`),
    cancel: (id) => api.delete(`/reservations/${id}`),
};

export const offersApi = {
    getPublic: () => api.get('/offers?t=' + Date.now()),
};

export const contactApi = {
    send: (data) => api.post('/contact', data),
};

export const galleryApi = {
    getAll: () => api.get('/gallery?t=' + Date.now()),
};

export const reviewsApi = {
    getAll: () => api.get('/reviews'),
    submit: (data) => api.post('/reviews', data),
};

export const adminApi = {
    login: (data) => api.post('/admin/login', data),
    logout: () => api.post('/admin/logout'),
    getDashboard: () => api.get('/admin/dashboard'),
    getBookings: (params) => api.get('/admin/bookings', { params }),
    createReservation: (data) => api.post('/admin/reservations', data),
    updateStatus: (id, status) => api.put(`/admin/reservations/${id}/status`, { status }),
    getOffers: () => api.get('/admin/offers'),
    createOffer: (data) => api.post('/admin/offers', data), // expects FormData if image
    updateOffer: (id, data) => api.put(`/admin/offers/${id}`, data), // expects FormData if image
    deleteOffer: (id) => api.delete(`/admin/offers/${id}`),
    getContacts: () => api.get('/admin/contacts'),
    // New V2 Endpoints
    getAllMenu: () => api.get('/admin/menu?t=' + Date.now()),
    createMenu: (data) => api.post('/admin/menu', data),
    updateMenu: (id, data) => api.put(`/admin/menu/${id}`, data),
    deleteMenu: (id) => api.delete(`/admin/menu/${id}`),

    getGallery: () => api.get('/gallery'),
    uploadGallery: (data) => api.post('/gallery', data),
    deleteGallery: (id) => api.delete(`/gallery/${id}`),
};

export default api;
