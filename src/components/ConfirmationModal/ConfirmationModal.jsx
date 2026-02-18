import React from 'react';
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
          <button onClick={onClose} className="confirm-btn cancel" style={{ background: 'transparent', border: '1px solid #555', color: '#888', padding: '10px 20px', cursor: 'pointer', fontFamily: 'Orbitron' }}>
            ANNULER
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="confirm-btn confirm" style={{ background: '#ff003c', border: '1px solid #ff003c', color: '#000', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Orbitron' }}>
            CONFIRMER
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;