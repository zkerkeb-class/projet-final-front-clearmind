import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // On vérifie si le token existe dans le localStorage
  const token = localStorage.getItem('token');

  // Si le token n'existe pas, on redirige vers /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si le token existe, on affiche le contenu (les enfants du composant)
  return children;
};

export default ProtectedRoute;