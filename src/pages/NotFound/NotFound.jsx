import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Terminal } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <div className="error-title">
          <AlertTriangle color="#ff003c" size={28} />
          <span>ERREUR_SYSTÈME</span>
        </div>
        <p className="error-message">
          [FATAL_ERROR] : La ressource demandée est introuvable dans le secteur mémoire actuel. Le lien est peut-être corrompu ou la page a été purgée.
        </p>
        <button onClick={() => navigate('/dashboard')} className="home-btn">
          <Terminal size={18} /> RETOUR_CONSOLE
        </button>
      </div>
    </div>
  );
};

export default NotFound;