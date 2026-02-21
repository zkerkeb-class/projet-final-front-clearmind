import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Copy, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import './Payloads.css';
import { PAYLOAD_SEVERITIES, ROLES } from '../../utils/constants';
import Skeleton from '../../components/Skeleton/Skeleton';
import { getUserRole } from '../../utils/auth';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../components/ErrorModal/ErrorModal';

const Payloads = () => {
  const navigate = useNavigate();
  const [payloads, setPayloads] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // État pour la recherche
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payloadToDelete, setPayloadToDelete] = useState(null);
  const userRole = getUserRole();
  const { success, info } = useToast();

  // Récupération de l'ID utilisateur depuis le token pour vérifier la propriété
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      return null;
    }
  };
  const userId = getUserId();

  useEffect(() => {
    const fetchPayloads = async () => {
      try {
        const res = await api.get('/payloads');
        setPayloads(res.data.data.payloads);
        setLoading(false);
      } catch (err) {
        setError("IMPOSSIBLE DE RÉCUPÉRER LA BASE DE DONNÉES PAYLOADS.");
        setLoading(false);
      }
    };
    fetchPayloads();
  }, []);

  // Logique de filtrage en temps réel
  const filteredPayloads = payloads.filter((p) => {
    const search = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(search) || 
      p.category.toLowerCase().includes(search) ||
      p.code.toLowerCase().includes(search)
    );
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Tu pourrais ajouter un petit toast "Copied!" ici
  };

  const handleEdit = (payload) => {
    navigate(`/payloads/edit/${payload._id}`);
  };

  const confirmDelete = (id) => {
    setPayloadToDelete(id);
  };

  const executeDeletePayload = async () => {
    try {
      await api.delete(`/payloads/${payloadToDelete}`);
      setPayloads(payloads.filter(p => p._id !== payloadToDelete));
      info("PAYLOAD SUPPRIMÉ");
    } catch (err) {
      setError("IMPOSSIBLE DE SUPPRIMER LE PAYLOAD.");
    }
    setPayloadToDelete(null);
  };

  const isOwner = (payload) => {
    if (userRole === ROLES.ADMIN) return true;
    return payload.author === userId || (payload.author && payload.author._id === userId);
  };

  return (
    <div className="payloads-container">
      <header className="page-header">
        <h2 className="page-title">DB_<span>PAYLOADS</span></h2>
        {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
          <button className="add-btn" onClick={() => navigate('/payloads/add')}>
            <Plus size={18} /> Nouveau Payload
          </button>
        )}
      </header>

      <div className="payload-search-container">
        <Search className="payload-search-icon" size={20} />
        <input 
          type="text" 
          placeholder="RECHERCHER UN VECTEUR D'ATTAQUE (XSS, SQLI, ETC...)" 
          className="payload-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Mise à jour de l'état
        />
      </div>

      <div className="payload-grid">
        {loading ? (
          // SKELETONS
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="payload-card skeleton-card">
              <Skeleton width={60} height={16} className="skeleton-badge" />
              <Skeleton width="60%" height={24} className="skeleton-title" />
              <Skeleton width="100%" height={60} className="skeleton-code" />
              <Skeleton width="40%" height={16} className="skeleton-footer" />
            </div>
          ))
        ) : filteredPayloads.length > 0 ? (
          filteredPayloads.map((p) => (
            <div key={p._id} className="payload-card">
              {isOwner(p) && (
                <div className="payload-actions">
                  <button onClick={() => handleEdit(p)} className="action-btn edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => confirmDelete(p._id)} className="action-btn delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
              <div className="payload-badge">{p.category}</div>
              <h3 className="payload-name">{p.title}</h3>
              <div className="code-box">
                <code>{p.code}</code>
                <button onClick={() => copyToClipboard(p.code)} className="copy-btn">
                  <Copy size={16} />
                </button>
              </div>
              <div className="payload-footer">
                <span>
                  SEVERITY: 
                  <span className={`severity-badge ${p.severity?.toLowerCase() || 'medium'}`}>
                    {p.severity?.toUpperCase() || 'MEDIUM'}
                  </span>
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="loading-text empty-msg">AUCUN RÉSULTAT CORRESPONDANT DANS LA BASE.</p>
        )}
      </div>

      <ConfirmationModal 
        isOpen={!!payloadToDelete}
        onClose={() => setPayloadToDelete(null)}
        onConfirm={executeDeletePayload}
        title="SUPPRESSION_PAYLOAD"
        message="Voulez-vous vraiment supprimer ce vecteur d'attaque de la base ?"
      />

      {/* MODALE D'ERREUR */}
      <ErrorModal 
        isOpen={!!error} 
        onClose={() => setError(null)} 
        message={error} 
      />
    </div>
  );
};

export default Payloads;