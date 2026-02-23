import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Copy, Search, Plus, Trash2, Check, Edit, Database, Download, Filter, RotateCcw } from 'lucide-react';
import './Payloads.css';
import { PAYLOAD_SEVERITIES, ROLES, PAYLOAD_CATEGORIES } from '../../utils/constants';
import Skeleton from '../../components/Skeleton/Skeleton';
import { getUserRole } from '../../utils/auth';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import { downloadBlob, logExport } from '../../utils/exportUtils';
import { useClipboard } from '../../hooks/useClipboard';
import { useErrorModal } from '../../hooks/useErrorModal';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';

const Payloads = () => {
  const navigate = useNavigate();
  const [payloads, setPayloads] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // État pour la recherche
  const [activeSeverities, setActiveSeverities] = useState(Object.values(PAYLOAD_SEVERITIES));
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const userRole = getUserRole();
  const { info } = useToast();
  const { copiedId, copyToClipboard } = useClipboard();
  const { error, showError, clearError } = useErrorModal();
  const { modalConfig, askConfirmation, closeConfirmation } = useConfirmationModal();

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
        showError("IMPOSSIBLE DE RÉCUPÉRER LA BASE DE DONNÉES PAYLOADS.");
        setLoading(false);
      }
    };
    fetchPayloads();
  }, []);

  // Aplatir les catégories pour le filtre
  const allCategories = Object.values(PAYLOAD_CATEGORIES).flat().sort();

  const toggleSeverity = (severity) => {
    setActiveSeverities(prev => 
      prev.includes(severity) ? prev.filter(s => s !== severity) : [...prev, severity]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setActiveSeverities(Object.values(PAYLOAD_SEVERITIES));
    setCategoryFilter("All");
  };

  // Logique de filtrage en temps réel
  const filteredPayloads = payloads.filter((p) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (
      p.title.toLowerCase().includes(search) || 
      p.category.toLowerCase().includes(search) ||
      p.code.toLowerCase().includes(search)
    );
    const matchesSeverity = activeSeverities.some(s => s.toLowerCase() === (p.severity || '').toLowerCase());
    const matchesCategory = categoryFilter === "All" || (p.category && p.category === categoryFilter);

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const handleEdit = (payload) => {
    navigate(`/payloads/edit/${payload._id}`);
  };

  const confirmDelete = (id) => {
    askConfirmation(
      "SUPPRESSION_PAYLOAD",
      "Voulez-vous vraiment supprimer ce vecteur d'attaque de la base ?",
      () => executeDeletePayload(id)
    );
  };

  const executeDeletePayload = async (id) => {
    try {
      await api.delete(`/payloads/${id}`);
      setPayloads(payloads.filter(p => p._id !== id));
      info("PAYLOAD SUPPRIMÉ");
    } catch (err) {
      showError("IMPOSSIBLE DE SUPPRIMER LE PAYLOAD.");
    }
  };

  const handleExportPayloads = () => {
    // On retire les champs techniques (_id, __v, dates, auteur) pour un export propre et réutilisable
    const cleanPayloads = payloads.map(({ _id, __v, author, createdAt, updatedAt, ...rest }) => rest);
    const dataStr = JSON.stringify(cleanPayloads, null, 2);
    downloadBlob(dataStr, `payloads_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    success("BASE PAYLOADS EXPORTÉE");
    logExport(`Backup JSON des payloads (${payloads.length} items)`);
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

      <div className="controls-bar">
        <div className="payload-search-container">
          <Search className="payload-search-icon" size={20} />
          <input 
            type="text" 
            placeholder="RECHERCHER UN VECTEUR D'ATTAQUE..." 
            className="payload-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="filters-wrapper">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="payloads-filter-select">
            <option value="All">CATÉGORIE (TOUTES)</option>
            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
            <button className="add-btn" onClick={handleExportPayloads} style={{background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.3)', color: '#00d4ff', fontSize: '0.8rem', padding: '10px 15px'}}>
              <Download size={16} /> JSON
            </button>
          )}
        </div>
      </div>

      {/* BARRE DE FILTRES SÉVÉRITÉ (STYLE ADMIN) */}
      <div className="payload-filters-bar">
        <span className="filter-label"><Filter size={14} /> SÉVÉRITÉ :</span>
        {Object.values(PAYLOAD_SEVERITIES).map(sev => (
          <button
            key={sev}
            className={`filter-chip ${activeSeverities.includes(sev) ? 'active ' + sev.toLowerCase() : ''}`}
            onClick={() => toggleSeverity(sev)}
          >
            <span className="chip-dot"></span>
            {sev.toUpperCase()}
          </button>
        ))}
        
        <button className="reset-filters-btn" onClick={resetFilters}>
          <RotateCcw size={14} /> RESET
        </button>
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
              <div className="payload-badge">{p.category}</div>
              <h3 className="payload-name">{p.title}</h3>
              <div className="code-box">
                <code>{p.code}</code>
                <button onClick={() => copyToClipboard(p.code, p._id, "PAYLOAD COPIÉ")} className={`copy-btn ${copiedId === p._id ? 'copied' : ''}`}>
                  {copiedId === p._id ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="payload-footer">
                <span>
                  SEVERITY: 
                  <span className={`severity-badge ${p.severity?.toLowerCase() || 'medium'}`}>
                    {p.severity?.toUpperCase() || 'MEDIUM'}
                  </span>
                </span>
                {isOwner(p) && (
                  <div className="payload-actions">
                    <button onClick={() => handleEdit(p)} className="action-btn edit">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => confirmDelete(p._id)} className="action-btn delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-msg">
            <Database size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <span>AUCUN RÉSULTAT CORRESPONDANT DANS LA BASE.</span>
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={closeConfirmation}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      {/* MODALE D'ERREUR */}
      <ErrorModal 
        isOpen={!!error} 
        onClose={clearError} 
        message={error} 
      />
    </div>
  );
};

export default Payloads;