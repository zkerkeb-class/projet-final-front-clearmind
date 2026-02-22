import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Save, X, AlertTriangle } from 'lucide-react';
import { PAYLOAD_SEVERITIES, PAYLOAD_CATEGORIES } from '../../utils/constants';
import { useToast } from '../../components/Toast/ToastContext';
import './EditPayloads.css';

const EditPayloads = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    category: 'XSS',
    severity: PAYLOAD_SEVERITIES.MEDIUM,
    code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchPayload = async () => {
        try {
          const res = await api.get(`/payloads/${encodeURIComponent(id)}`);
          // Adapter selon la structure de retour de l'API (res.data.data.payload ou res.data.data)
          const payload = res.data.data.payload || res.data.data;
          setFormData({
            title: payload.title,
            category: payload.category,
            severity: payload.severity,
            code: payload.code
          });
        } catch (err) {
          setError("Impossible de charger le payload.");
          toastError("Erreur de chargement");
        }
      };
      fetchPayload();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        await api.patch(`/payloads/${id}`, formData);
        success("PAYLOAD MIS À JOUR");
      } else {
        await api.post('/payloads', formData);
        success("NOUVEAU PAYLOAD CRÉÉ");
      }
      navigate('/payloads');
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
      toastError("Échec de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-payload-container">
      <header className="page-header">
        <h2 className="page-title">{isEditMode ? 'EDIT_' : 'NEW_'}<span>PAYLOAD</span></h2>
      </header>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="payload-form">
        <div className="form-group">
          <label>TITRE DU PAYLOAD</label>
          <input type="text" className="edit-payload-input" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Reverse Shell Python" />
        </div>

        <div className="form-group split-group">
          <div>
            <label>CATÉGORIE</label>
            <select 
              className="edit-payload-select" 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <optgroup label="Web">
                {PAYLOAD_CATEGORIES.WEB.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </optgroup>
              <optgroup label="Système">
                {PAYLOAD_CATEGORIES.SYSTEM.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </optgroup>
              <optgroup label="API">
                {PAYLOAD_CATEGORIES.API.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </optgroup>
              <option value="Other">Autre</option>
            </select>
          </div>
          <div>
            <label>SÉVÉRITÉ</label>
            <select className="edit-payload-select" value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})}>
              <option value={PAYLOAD_SEVERITIES.LOW}>LOW</option>
              <option value={PAYLOAD_SEVERITIES.MEDIUM}>MEDIUM</option>
              <option value={PAYLOAD_SEVERITIES.HIGH}>HIGH</option>
              <option value={PAYLOAD_SEVERITIES.CRITICAL}>CRITICAL</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>CODE / COMMANDE</label>
          <textarea className="edit-payload-textarea" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="# Insérez votre code ici..." spellCheck="false"></textarea>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/payloads')}>ANNULER</button>
          <button type="submit" className="add-btn" disabled={loading}><Save size={18} /> {loading ? 'SAUVEGARDE...' : 'ENREGISTRER'}</button>
        </div>
      </form>
    </div>
  );
};

export default EditPayloads;