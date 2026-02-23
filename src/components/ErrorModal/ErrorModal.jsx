import { X, AlertTriangle } from 'lucide-react';
import './ErrorModal.css';

const ErrorModal = ({ isOpen, onClose, message, title = "ERREUR_SYSTÈME" }) => {
  if (!isOpen) return null;

  return (
    <div className="error-modal-overlay">
      <div className="error-modal-content">
        <button onClick={onClose} className="error-modal-close">
          <X size={24} />
        </button>
        <div className="error-modal-header">
          <AlertTriangle size={28} color="#ff003c" />
          <h3>{title}</h3>
        </div>
        
        <p className="error-modal-message">{message}</p>
        
        <button onClick={onClose} className="error-modal-btn">ACQUITTER_ERREUR</button>
      </div>
    </div>
  );
};

export default ErrorModal;