import React, { useState } from 'react';
import api from '../../api/axios';
import { X, AlertTriangle } from 'lucide-react';
import './PayloadModal.css';
import { PAYLOAD_CATEGORIES, PAYLOAD_SEVERITIES } from '../../utils/constants';
import { useToast } from '../Toast/ToastContext';

const PayloadModal = ({ isOpen, onClose, onPayloadAdded }) => {
  const { success } = useToast();
  const [error, setError] = useState(null);
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
      success("VECTEUR D'ATTAQUE ENREGISTRÉ");
    } catch (err) {
      setError("ERREUR D'INJECTION : " + err.response?.data?.message);
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
                  {PAYLOAD_CATEGORIES.WEB.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </optgroup>
                <optgroup label="Accès & Système">
                  {PAYLOAD_CATEGORIES.SYSTEM.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </optgroup>
                <optgroup label="API & Sécurité Moderne">
                  {PAYLOAD_CATEGORIES.API.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                <option value={PAYLOAD_SEVERITIES.LOW}>Low</option>
                <option value={PAYLOAD_SEVERITIES.MEDIUM}>Medium</option>
                <option value={PAYLOAD_SEVERITIES.HIGH}>High</option>
                <option value={PAYLOAD_SEVERITIES.CRITICAL}>Critical</option>
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

      {/* MODALE D'ERREUR (NESTED) */}
      {error && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div className="modal-content" style={{ background: '#0a0a0a', border: '1px solid #ff003c', padding: '2rem', width: '400px', position: 'relative', boxShadow: '0 0 30px rgba(255, 0, 60, 0.2)' }}>
            <button onClick={() => setError(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              <AlertTriangle size={28} color="#ff003c" />
              <h3 style={{ color: '#ff003c', margin: 0, fontFamily: 'Orbitron, sans-serif', letterSpacing: '1px' }}>ERREUR_SYSTÈME</h3>
            </div>
            
            <p style={{ color: '#e0e0e0', fontFamily: 'monospace', marginBottom: '2rem', lineHeight: '1.5' }}>{error}</p>
            
            <button onClick={() => setError(null)} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #ff003c', color: '#ff003c', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Orbitron, sans-serif', transition: 'all 0.3s' }} onMouseOver={(e) => {e.target.style.background = '#ff003c'; e.target.style.color = '#000'}} onMouseOut={(e) => {e.target.style.background = 'transparent'; e.target.style.color = '#ff003c'}}>ACQUITTER_ERREUR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayloadModal;