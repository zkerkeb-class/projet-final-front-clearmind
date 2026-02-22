import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { getUserRole } from '../../utils/auth';
import { Monitor, Search, Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './Boxes.css';
import { ROLES, BOX_STATUSES, BOX_DIFFICULTIES, BOX_PLATFORMS, TARGET_OS, BOX_CATEGORIES } from '../../utils/constants';
import Skeleton from '../../components/Skeleton/Skeleton';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import { getDifficultyColor } from '../../utils/helpers';
import { useAccessControl } from '../../hooks/useAccessControl';
import { useErrorModal } from '../../hooks/useErrorModal';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import OsIcon from '../../components/OsIcon/OsIcon';

const DifficultyBar = ({ difficulty }) => {
  const [width, setWidth] = useState('0%');

  useEffect(() => {
    // Petit délai pour déclencher l'animation CSS après le montage
    const timer = setTimeout(() => {
      switch (difficulty) {
        case BOX_DIFFICULTIES.EASY: setWidth('25%'); break;
        case BOX_DIFFICULTIES.MEDIUM: setWidth('50%'); break;
        case BOX_DIFFICULTIES.HARD: setWidth('75%'); break;
        case BOX_DIFFICULTIES.INSANE: setWidth('100%'); break;
        default: setWidth('0%');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [difficulty]);

  const color = getDifficultyColor(difficulty);

  return (
    <div className="difficulty-bar">
      <div 
        className="difficulty-fill" 
        style={{ 
          width: width, 
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`
        }} 
      />
    </div>
  );
};

const Boxes = () => {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const userRole = getUserRole(); // Récupération du rôle
  const { success, info } = useToast();
  const { error, showError, clearError } = useErrorModal();
  const { modalConfig, askConfirmation, closeConfirmation } = useConfirmationModal();
  
  // État pour la modale d'ajout
  const [showModal, setShowModal] = useState(false);
  const [newBox, setNewBox] = useState({
    name: '',
    ipAddress: '',
    platform: BOX_PLATFORMS.HTB,
    difficulty: BOX_DIFFICULTIES.EASY,
    category: BOX_CATEGORIES.RED,
    os: TARGET_OS.LINUX,
    status: BOX_STATUSES.TODO
  });

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [osFilter, setOsFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const isRestricted = useAccessControl(userRole !== ROLES.GUEST, '/boxes?resource=/boxes');

  useEffect(() => {
    if (isRestricted) return;
    // Debounce pour la recherche
    const timer = setTimeout(() => {
      fetchBoxes();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, searchTerm, difficultyFilter, platformFilter, categoryFilter, osFilter, isRestricted]);

    const fetchBoxes = async () => {
      setLoading(true);
      try {
        const res = await api.get('/boxes', {
          params: { page, limit: 12, search: searchTerm, difficulty: difficultyFilter, platform: platformFilter, category: categoryFilter, os: osFilter }
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
      setNewBox({ name: '', ipAddress: '', platform: BOX_PLATFORMS.HTB, difficulty: BOX_DIFFICULTIES.EASY, category: BOX_CATEGORIES.RED, os: TARGET_OS.LINUX, status: BOX_STATUSES.TODO });
      success("NOUVELLE CIBLE INITIALISÉE");
    } catch (err) {
      showError("ERREUR D'AJOUT : " + (err.response?.data?.message || err.message));
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case BOX_CATEGORIES.RED: return '#ff003c';
      case BOX_CATEGORIES.BLUE: return '#00d4ff';
      case BOX_CATEGORIES.PURPLE: return '#bf00ff';
      default: return '#fff';
    }
  };

  const confirmDeleteBox = (id) => {
    askConfirmation(
      "SUPPRESSION_MACHINE",
      "Attention : Supprimer cette machine effacera également toutes les notes et cibles associées.",
      () => executeDeleteBox(id)
    );
  };

  const executeDeleteBox = async (id) => {
    try {
      await api.delete(`/boxes/${id}`);
      setBoxes(boxes.filter(b => b._id !== id));
      info("CIBLE SUPPRIMÉE");
    } catch (err) {
      showError("IMPOSSIBLE DE SUPPRIMER LA MACHINE.");
    }
  };

  // Si Guest, on n'affiche rien le temps de la redirection
  if (isRestricted) return null;

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
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="boxes-filter-select"
          >
            <option value="All">TYPE (TOUS)</option>
            <option value={BOX_CATEGORIES.RED}>RED (OFFENSIVE)</option>
            <option value={BOX_CATEGORIES.BLUE}>BLUE (DEFENSIVE)</option>
            <option value={BOX_CATEGORIES.PURPLE}>PURPLE (MIXED)</option>
          </select>

          <select 
            value={osFilter} 
            onChange={(e) => setOsFilter(e.target.value)}
            className="boxes-filter-select"
          >
            <option value="All">OS (TOUS)</option>
            {Object.values(TARGET_OS).map(os => (
              <option key={os} value={os}>{os}</option>
            ))}
          </select>

          <select 
            value={platformFilter} 
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="boxes-filter-select"
          >
            <option value="All">PROVIDER (TOUS)</option>
            {Object.values(BOX_PLATFORMS).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
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
            <div className="box-badges">
              <div className="box-difficulty" style={{ color: getDifficultyColor(box.difficulty), borderColor: getDifficultyColor(box.difficulty) }}>
                {box.difficulty?.toUpperCase()}
              </div>
              <div className="box-category-badge" style={{ color: getCategoryColor(box.category), borderColor: getCategoryColor(box.category) }}>
                {box.category?.toUpperCase()}
              </div>
            </div>
            
            <div className="box-visual">
              <OsIcon os={box.os} size={48} color="#fff" strokeWidth={1.5} />
            </div>
            
            <div className="box-content">
              <h3>{box.name}</h3>
              <div className="box-meta">
                <span className="meta-tag ip">{box.ipAddress}</span>
                <span className="meta-tag platform">{box.platform}</span>
              </div>
            </div>

            <DifficultyBar difficulty={box.difficulty} />

            <div className="box-footer">
              <div className="status-display">
                <span style={{ 
                  color: box.status === BOX_STATUSES.ROOT_FLAG ? '#ff003c' : 
                         box.status === BOX_STATUSES.USER_FLAG ? '#bf00ff' :
                         box.status === BOX_STATUSES.IN_PROGRESS ? '#ffa500' : '#00d4ff',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  letterSpacing: '1px'
                }}>
                  {box.status.toUpperCase()}
                </span>
              </div>
              
              {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); confirmDeleteBox(box._id); }} 
                  className="action-btn delete-btn" 
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="empty-state-msg">
            <Monitor size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <span>AUCUNE MACHINE DÉTECTÉE AVEC CES PARAMÈTRES.</span>
          </div>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setShowModal(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h3 className="modal-title">INITIALISER_NOUVELLE_MACHINE</h3>
            
            <form onSubmit={handleAddBox} className="modal-form">
              <input type="text" placeholder="Nom de la machine" required value={newBox.name} onChange={e => setNewBox({...newBox, name: e.target.value})} className="modal-input" />
              <input type="text" placeholder="Adresse IP" value={newBox.ipAddress} onChange={e => setNewBox({...newBox, ipAddress: e.target.value})} className="modal-input" />
              
              <select value={newBox.platform} onChange={e => setNewBox({...newBox, platform: e.target.value})} className="modal-select">
                <option value={BOX_PLATFORMS.HTB}>HackTheBox</option>
                <option value={BOX_PLATFORMS.THM}>TryHackMe</option>
                <option value={BOX_PLATFORMS.ROOT_ME}>Root-Me</option>
                <option value={BOX_PLATFORMS.VULNHUB}>VulnHub</option>
                <option value={BOX_PLATFORMS.OTHER}>Autre</option>
              </select>

              <select value={newBox.difficulty} onChange={e => setNewBox({...newBox, difficulty: e.target.value})} className="modal-select">
                <option value={BOX_DIFFICULTIES.EASY}>Easy</option>
                <option value={BOX_DIFFICULTIES.MEDIUM}>Medium</option>
                <option value={BOX_DIFFICULTIES.HARD}>Hard</option>
                <option value={BOX_DIFFICULTIES.INSANE}>Insane</option>
              </select>

              <select value={newBox.os} onChange={e => setNewBox({...newBox, os: e.target.value})} className="modal-select">
                <option value={TARGET_OS.LINUX}>Linux</option>
                <option value={TARGET_OS.WINDOWS}>Windows</option>
                <option value={TARGET_OS.MACOS}>MacOS</option>
                <option value={TARGET_OS.ANDROID}>Android</option>
              </select>

              <select value={newBox.category} onChange={e => setNewBox({...newBox, category: e.target.value})} className="modal-select">
                <option value={BOX_CATEGORIES.RED}>Red Team (Offensive)</option>
                <option value={BOX_CATEGORIES.BLUE}>Blue Team (Defensive)</option>
                <option value={BOX_CATEGORIES.PURPLE}>Purple Team (Mixed)</option>
              </select>

              <button type="submit" className="modal-submit-btn">LANCER L'INSTANCE</button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION */}
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

export default Boxes;