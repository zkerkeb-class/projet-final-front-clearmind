import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole, getPayloadFromToken } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');

  // 1. Si pas de token, redirection Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Vérification de l'expiration du token
  const payload = getPayloadFromToken(token);
  if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    return <Navigate to="/login" replace />;
  }

  // 3. Vérification du rôle (Sécurité anti-modification localStorage)
  if (allowedRoles.length > 0) {
    const userRole = getUserRole(); // Lit le rôle crypté dans le token
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;