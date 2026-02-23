import { AlertTriangle } from 'lucide-react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <div className="confirm-modal-icon">
          <AlertTriangle size={48} />
        </div>
        <h3 className="confirm-modal-title">{title || "CONFIRMATION_REQUISE"}</h3>
        <p className="confirm-modal-message">{message || "Êtes-vous sûr de vouloir effectuer cette action ? Cette opération est irréversible."}</p>
        
        <div className="confirm-modal-actions">
          <button onClick={onClose} className="confirm-btn cancel">
            ANNULER
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="confirm-btn confirm">
            CONFIRMER
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;