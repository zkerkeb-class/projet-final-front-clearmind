import axios from 'axios';

// Instance Axios avec l'URL de base de ton API
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1'
});

// Intercepteur de REQUÊTE : Injecte le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de RÉPONSE : Gère l'expiration du token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le backend renvoie 401 (Non autorisé), on déconnecte l'utilisateur
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;