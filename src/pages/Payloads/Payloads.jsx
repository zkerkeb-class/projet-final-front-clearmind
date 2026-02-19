import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Copy, Terminal, Search, Plus, AlertTriangle, X, Pencil, Trash2 } from 'lucide-react';
import './Payloads.css';
import { PAYLOAD_SEVERITIES, ROLES } from '../../utils/constants';
import Skeleton from '../../components/Skeleton/Skeleton';
import { getUserRole } from '../../utils/auth';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';

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
      <style>{`
        @media (max-width: 768px) {
          .payload-grid { grid-template-columns: 1fr !important; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .search-bar-container { width: 100%; }
        }
      `}</style>
      <header className="page-header">
        <h2 className="page-title">DB_<span>PAYLOADS</span></h2>
        {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
          <button className="add-btn" onClick={() => navigate('/payloads/add')}>
            <Plus size={18} /> Nouveau Payload
          </button>
        )}
      </header>

      <div className="search-bar-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="RECHERCHER UN VECTEUR D'ATTAQUE (XSS, SQLI, ETC...)" 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Mise à jour de l'état
        />
      </div>

      <div className="payload-grid">
        {loading ? (
          // SKELETONS
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="payload-card" style={{ pointerEvents: 'none' }}>
              <Skeleton width={60} height={16} style={{ position: 'absolute', top: 0, right: 0 }} />
              <Skeleton width="60%" height={24} style={{ margin: '1rem 0' }} />
              <Skeleton width="100%" height={60} style={{ borderRadius: '4px' }} />
              <Skeleton width="40%" height={16} style={{ marginTop: '1rem' }} />
            </div>
          ))
        ) : filteredPayloads.length > 0 ? (
          filteredPayloads.map((p) => (
            <div key={p._id} className="payload-card">
              {isOwner(p) && (
                <div className="payload-actions" style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(p)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ffa500' }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => confirmDelete(p._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#555' }} className="hover-red">
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
                  <span style={{
                    marginLeft: '5px',
                    fontWeight: '900',
                    color: 
                      p.severity === PAYLOAD_SEVERITIES.CRITICAL ? '#ff003c' : // Rose Néon
                      p.severity === PAYLOAD_SEVERITIES.HIGH     ? '#ff8000' : // Orange Électrique
                      p.severity === PAYLOAD_SEVERITIES.MEDIUM   ? '#00d4ff' : // Bleu Cyan
                                                  '#00ff41',  // Vert Matrix pour 'Low'
                    textShadow: (p.severity === PAYLOAD_SEVERITIES.CRITICAL || p.severity === PAYLOAD_SEVERITIES.HIGH) 
                      ? `0 0 8px ${p.severity === PAYLOAD_SEVERITIES.CRITICAL ? '#ff003c' : '#ff8000'}` 
                      : 'none'
                  }}>
                    {p.severity?.toUpperCase() || 'MEDIUM'}
                  </span>
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="loading-text" style={{color: '#ff003c'}}>AUCUN RÉSULTAT CORRESPONDANT DANS LA BASE.</p>
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
      {error && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
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

export default Payloads;