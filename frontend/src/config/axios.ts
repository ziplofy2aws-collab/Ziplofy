import axios from "axios";

// Type-safe environment variable access
const getBaseURL = (): string => {
    return import.meta.env.VITE_BACKEND_URL
};

const axiosi = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token to every request
axiosi.interceptors.request.use(
    (config) => {
        // Critical for file uploads: let browser set multipart boundary.
        if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
            if (config.headers) {
                delete (config.headers as any)['Content-Type'];
                delete (config.headers as any)['content-type'];
            }
        }

        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (config.headers && 'Authorization' in config.headers) {
            delete (config.headers as any).Authorization;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for global error handling
axiosi.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors globally
        if (error.response?.status === 401) {
            // Token expired or invalid
            console.log('🔐 Authentication failed, clearing token');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('userData');
            localStorage.removeItem('userRole');
            localStorage.removeItem('isSuperAdmin');
            localStorage.removeItem('userEmail');
        }
        if (error.response?.status === 403) {
            const msg = (error.response?.data?.error || error.response?.data?.message || '').toLowerCase();
            if (msg.includes('suspended') || msg.includes('not active')) {
                console.log('🔐 Account suspended, clearing token');
                localStorage.removeItem('admin_token');
                localStorage.removeItem('userData');
                localStorage.removeItem('userRole');
                localStorage.removeItem('isSuperAdmin');
                localStorage.removeItem('userEmail');
            }
        }
        return Promise.reject(error);
    }
);

export default axiosi;
