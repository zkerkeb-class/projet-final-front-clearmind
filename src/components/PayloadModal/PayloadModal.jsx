import React, { useState } from 'react';
import api from '../../api/axios';
import { X } from 'lucide-react';
import './PayloadModal.css';

const PayloadModal = ({ isOpen, onClose, onPayloadAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'XSS',
    code: '',
    severity: 'Medium'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/payloads', formData);
      onPayloadAdded(res.data.data.payload); // Mise à jour de la liste
      onClose(); // Ferme la modale
      setFormData({ title: '', category: 'XSS', code: '', severity: 'Medium' });
    } catch (err) {
      alert("Erreur lors de l'injection : " + err.response?.data?.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">NOUVEAU_<span>PAYLOAD</span></h2>
          <button onClick={onClose} className="close-btn"><X size={24}/></button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Titre de l'attaque</label>
            <input 
              className="modal-input" 
              type="text" 
              placeholder="Ex: Polyglot XSS Bypass"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Catégorie</label>
              <select 
                className="modal-select"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {/* Web Classique */}
                <optgroup label="Vunérabilités Web">
                  <option value="XSS">XSS</option>
                  <option value="SQLi">SQLi</option>
                  <option value="NoSQLi">NoSQLi</option>
                  <option value="LFI">LFI/RFI</option>
                  <option value="RCE">RCE</option>
                  <option value="SSTI">SSTI</option>
                  <option value="SSRF">SSRF</option>
                  <option value="XXE">XXE</option>
                </optgroup>

                {/* Accès & Système */}
                <optgroup label="Accès & Système">
                  <option value="Auth-Bypass">Auth-Bypass</option>
                  <option value="Priv-Esc">Priv-Esc</option>
                  <option value="Command-Inj">Command-Inj</option>
                  <option value="Directory-Trav">Directory-Trav</option>
                  <option value="IDOR">IDOR</option>
                </optgroup>

                {/* API & Moderne */}
                <optgroup label="API & Sécurité Moderne">
                  <option value="BOLA">BOLA (API)</option>
                  <option value="Mass-Assignment">Mass-Assignment</option>
                  <option value="JWT-Attack">JWT-Attack</option>
                  <option value="GraphQL-Inj">GraphQL-Inj</option>
                  <option value="Rate-Limit-Bypass">Rate-Limit-Bypass</option>
                </optgroup>
                
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group" style={{flex: 1}}>
              <label>Sévérité</label>
              <select 
                className="modal-select"
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Code / Script</label>
            <textarea 
              className="modal-textarea" 
              rows="4"
              placeholder="<script>alert(1)</script>"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="submit-btn">Exécuter l'injection</button>
        </form>
      </div>
    </div>
  );
};

export default PayloadModal;