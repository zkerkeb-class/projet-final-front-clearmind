import { useState } from 'react';
import api from '../../api/axios';
import { X } from 'lucide-react';
import './PayloadModal.css';
import { PAYLOAD_CATEGORIES, PAYLOAD_SEVERITIES } from '../../utils/constants';
import { useToast } from '../Toast/ToastContext';
import ErrorModal from '../ErrorModal/ErrorModal';

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
    <div className="payload-modal-overlay">
      <div className="payload-modal-content">
        <div className="payload-modal-header">
          <h2 className="payload-modal-title">NOUVEAU_<span>PAYLOAD</span></h2>
          <button onClick={onClose} className="payload-close-btn"><X size={24}/></button>
        </div>

        <form className="payload-modal-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Titre de l'attaque</label>
            <input 
              className="payload-modal-input" 
              type="text" 
              placeholder="Ex: Polyglot XSS Bypass"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="payload-modal-row">
            <div className="input-group">
              <label>Catégorie</label>
              <select 
                className="payload-modal-select"
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
            <div className="input-group">
              <label>Sévérité</label>
              <select 
                className="payload-modal-select"
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
              className="payload-modal-textarea" 
              rows="4"
              placeholder="<script>alert(1)</script>"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="payload-submit-btn">Exécuter l'injection</button>
        </form>
      </div>

      {/* MODALE D'ERREUR */}
      <ErrorModal 
        isOpen={!!error} 
        onClose={() => setError(null)} 
        message={error} 
      />
    </div>
  );
};

export default PayloadModal;