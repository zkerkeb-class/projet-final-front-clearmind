import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { getUserRole } from '../../utils/auth';
import { Monitor, Search, Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './Boxes.css';
import { ROLES, BOX_STATUSES, BOX_DIFFICULTIES, BOX_PLATFORMS, TARGET_OS } from '../../utils/constants';
import Skeleton from '../../components/Skeleton/Skeleton';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../components/ErrorModal/ErrorModal';

const Boxes = () => {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = getUserRole(); // Récupération du rôle
  const { success, info } = useToast();
  const [boxToDelete, setBoxToDelete] = useState(null);
  
  // État pour la modale d'ajout
  const [showModal, setShowModal] = useState(false);
  const [newBox, setNewBox] = useState({
    name: '',
    ipAddress: '',
    platform: BOX_PLATFORMS.HTB,
    difficulty: BOX_DIFFICULTIES.EASY,
    status: BOX_STATUSES.TODO
  });

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case BOX_DIFFICULTIES.EASY: return '#00ff41';
      case BOX_DIFFICULTIES.MEDIUM: return '#ff8000';
      case BOX_DIFFICULTIES.HARD: return '#ff003c';
      case BOX_DIFFICULTIES.INSANE: return '#b026ff';
      default: return '#00d4ff';
    }
  };

  useEffect(() => {
    // Debounce pour la recherche
    const timer = setTimeout(() => {
      fetchBoxes();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, searchTerm, difficultyFilter, platformFilter]);

    const fetchBoxes = async () => {
      setLoading(true);
      try {
        const res = await api.get('/boxes', {
          params: { page, limit: 12, search: searchTerm, difficulty: difficultyFilter, platform: platformFilter }
        });
        setBoxes(res.data.data.boxes);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      } catch (err) {
        console.error("Erreur de récupération des boxes:", err);
        setLoading(false);
      }
    };

  // --- ACTIONS ---

  const handleAddBox = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/boxes', newBox);
      setBoxes([...boxes, res.data.data]); // Ajoute la nouvelle box à la liste locale
      setShowModal(false);
      setNewBox({ name: '', ipAddress: '', platform: BOX_PLATFORMS.HTB, difficulty: BOX_DIFFICULTIES.EASY, status: BOX_STATUSES.TODO });
      success("NOUVELLE CIBLE INITIALISÉE");
    } catch (err) {
      setError("ERREUR D'AJOUT : " + (err.response?.data?.message || err.message));
    }
  };

  const confirmDeleteBox = (id) => {
    setBoxToDelete(id);
  };

  const executeDeleteBox = async () => {
    try {
      await api.delete(`/boxes/${boxToDelete}`);
      setBoxes(boxes.filter(b => b._id !== boxToDelete));
      info("CIBLE SUPPRIMÉE");
    } catch (err) {
      setError("IMPOSSIBLE DE SUPPRIMER LA MACHINE.");
    }
    setBoxToDelete(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Mise à jour optimiste de l'UI
      setBoxes(boxes.map(b => b._id === id ? { ...b, status: newStatus } : b));
      await api.patch(`/boxes/${id}`, { status: newStatus });
      success("STATUT MIS À JOUR");
    } catch (err) {
      setError("ERREUR DE SYNCHRONISATION DU STATUT.");
    }
  };

  return (
    <div className="boxes-container">
      <header className="page-header">
        <h2 className="page-title">ACTIVE_<span>BOXES</span></h2>
        
        {/* Affichage conditionnel du bouton selon le rôle */}
        {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <Plus size={18} /> NOUVELLE CIBLE
          </button>
        )}
      </header>

      {/* Barre de contrôle : Recherche et Filtres */}
      <div className="controls-bar">
        <div className="boxes-search-container">
          <Search size={20} className="boxes-search-icon" />
          <input 
            type="text" 
            placeholder="RECHERCHER UNE MACHINE (NOM, IP)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="boxes-search-input"
          />
        </div>

        <div className="filters-wrapper">
          <select 
            value={difficultyFilter} 
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="boxes-filter-select"
          >
            <option value="All">DIFFICULTÉ (TOUTES)</option>
            <option value={BOX_DIFFICULTIES.EASY}>EASY</option>
            <option value={BOX_DIFFICULTIES.MEDIUM}>MEDIUM</option>
            <option value={BOX_DIFFICULTIES.HARD}>HARD</option>
            <option value={BOX_DIFFICULTIES.INSANE}>INSANE</option>
          </select>

          <select 
            value={platformFilter} 
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="boxes-filter-select"
          >
            <option value="All">OS (TOUS)</option>
            <option value={TARGET_OS.LINUX}>LINUX</option>
            <option value={TARGET_OS.WINDOWS}>WINDOWS</option>
          </select>
        </div>
      </div>

      <div className="boxes-grid">
        {loading ? (
          // SKELETONS
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="box-card" style={{ pointerEvents: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width={40} height={40} style={{ borderRadius: '50%' }} />
                <Skeleton width={60} height={20} />
              </div>
              <Skeleton width="70%" height={24} style={{ marginTop: '1rem' }} />
              <Skeleton width="50%" height={16} style={{ marginTop: '0.5rem' }} />
              <Skeleton width="100%" height={8} style={{ marginTop: '1rem' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <Skeleton width={80} height={20} />
              </div>
            </div>
          ))
        ) : boxes.length > 0 ? boxes.map(box => (
          <div 
            key={box._id} 
            className="box-card" 
            onClick={() => navigate(`/boxes/${box._id}`)}
            style={{ cursor: 'pointer' }}
          >
            {/* Mapping de tes difficultés réelles */}
            <div className="box-difficulty" style={{ color: getDifficultyColor(box.difficulty), borderColor: getDifficultyColor(box.difficulty) }}>
              {box.difficulty?.toUpperCase()}
            </div>
            
            <Monitor size={32} color="#00d4ff" />
            <h3>{box.name}</h3>
            <p>{box.ipAddress} @ {box.platform}</p>

            <div className="difficulty-bar">
              <div 
                className="difficulty-fill" 
                style={{ 
                  // Logique de progression basée sur ton enum status
                  width: box.status === BOX_STATUSES.ROOT_FLAG ? '100%' : box.status === BOX_STATUSES.USER_FLAG ? '50%' : '10%', 
                  backgroundColor: box.status === BOX_STATUSES.ROOT_FLAG ? '#ff003c' : '#00d4ff' 
                }} 
              />
            </div>

            <div className="box-info">
              <div className="status-control">
                <select 
                  value={box.status} 
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleStatusChange(box._id, e.target.value)}
                  className="status-select"
                  style={{ color: box.status === BOX_STATUSES.ROOT_FLAG ? '#ff003c' : '#00d4ff' }}
                >
                  <option value={BOX_STATUSES.TODO}>TODO</option>
                  <option value={BOX_STATUSES.IN_PROGRESS}>IN PROGRESS</option>
                  <option value={BOX_STATUSES.USER_FLAG}>USER OWNED</option>
                  <option value={BOX_STATUSES.ROOT_FLAG}>ROOT OWNED</option>
                </select>
              </div>
              
              {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); confirmDeleteBox(box._id); }} 
                  className="delete-icon-btn" 
                >
                  <Trash2 size={16} color="#555" className="hover-red" />
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="empty-state-msg">AUCUNE MACHINE DÉTECTÉE AVEC CES PARAMÈTRES.</div>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="pagination-controls">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="pagination-btn"><ChevronLeft /></button>
          <span className="pagination-info">PAGE {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="pagination-btn"><ChevronRight /></button>
        </div>
      )}

      {/* MODALE D'AJOUT */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#0a0a0a', border: '1px solid #00d4ff', padding: '2rem', width: '400px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>INITIALISER_NOUVELLE_MACHINE</h3>
            
            <form onSubmit={handleAddBox} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Nom de la machine" required value={newBox.name} onChange={e => setNewBox({...newBox, name: e.target.value})} className="modal-form-input" />
              <input type="text" placeholder="Adresse IP" value={newBox.ipAddress} onChange={e => setNewBox({...newBox, ipAddress: e.target.value})} className="modal-form-input" />
              
              <select value={newBox.platform} onChange={e => setNewBox({...newBox, platform: e.target.value})} className="modal-form-select">
                <option value={BOX_PLATFORMS.HTB}>HackTheBox</option>
                <option value={BOX_PLATFORMS.THM}>TryHackMe</option>
                <option value={BOX_PLATFORMS.ROOT_ME}>Root-Me</option>
                <option value={BOX_PLATFORMS.VULNHUB}>VulnHub</option>
                <option value={BOX_PLATFORMS.OTHER}>Autre</option>
              </select>

              <select value={newBox.difficulty} onChange={e => setNewBox({...newBox, difficulty: e.target.value})} className="modal-form-select">
                <option value={BOX_DIFFICULTIES.EASY}>Easy</option>
                <option value={BOX_DIFFICULTIES.MEDIUM}>Medium</option>
                <option value={BOX_DIFFICULTIES.HARD}>Hard</option>
                <option value={BOX_DIFFICULTIES.INSANE}>Insane</option>
              </select>

              <button type="submit" className="modal-submit-btn">LANCER L'INSTANCE</button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION */}
      <ConfirmationModal 
        isOpen={!!boxToDelete}
        onClose={() => setBoxToDelete(null)}
        onConfirm={executeDeleteBox}
        title="SUPPRESSION_MACHINE"
        message="Attention : Supprimer cette machine effacera également toutes les notes et cibles associées."
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

export default Boxes;