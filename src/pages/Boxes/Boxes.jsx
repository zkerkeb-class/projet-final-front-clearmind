import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { getUserRole } from '../../utils/auth';
import { Monitor, Search, Plus, Trash2, X, Save, Trophy, AlertTriangle } from 'lucide-react';
import './Boxes.css';

const Boxes = () => {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = getUserRole(); // Récupération du rôle
  
  // État pour la modale d'ajout
  const [showModal, setShowModal] = useState(false);
  const [newBox, setNewBox] = useState({
    name: '',
    ipAddress: '',
    platform: 'HackTheBox',
    difficulty: 'Easy',
    status: 'Todo'
  });

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const res = await api.get('/boxes');
        setBoxes(res.data.data.boxes);
        setLoading(false);
      } catch (err) {
        console.error("Erreur de récupération des boxes:", err);
        setLoading(false);
      }
    };
    fetchBoxes();
  }, []);

  // --- ACTIONS ---

  const handleAddBox = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/boxes', newBox);
      setBoxes([...boxes, res.data.data]); // Ajoute la nouvelle box à la liste locale
      setShowModal(false);
      setNewBox({ name: '', ipAddress: '', platform: 'HackTheBox', difficulty: 'Easy', status: 'Todo' });
    } catch (err) {
      setError("ERREUR D'AJOUT : " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteBox = async (id) => {
    if (!window.confirm("Confirmer la suppression de cette cible ?")) return;
    try {
      await api.delete(`/boxes/${id}`);
      setBoxes(boxes.filter(b => b._id !== id));
    } catch (err) {
      setError("IMPOSSIBLE DE SUPPRIMER LA MACHINE.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Mise à jour optimiste de l'UI
      setBoxes(boxes.map(b => b._id === id ? { ...b, status: newStatus } : b));
      await api.patch(`/boxes/${id}`, { status: newStatus });
    } catch (err) {
      setError("ERREUR DE SYNCHRONISATION DU STATUT.");
    }
  };

  // Logique de filtrage combinée
  const filteredBoxes = boxes.filter(box => {
    const matchSearch = box.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        box.ipAddress.includes(searchTerm);
    const matchDifficulty = difficultyFilter === "All" || box.difficulty === difficultyFilter;
    const matchPlatform = platformFilter === "All" || box.platform === platformFilter;

    return matchSearch && matchDifficulty && matchPlatform;
  });

  if (loading) return <div className="loading-text">ACCÈS AU SEGMENT ISOLÉ...</div>;

  return (
    <div className="boxes-container">
      <header className="page-header">
        <h2 className="page-title">ACTIVE_<span>BOXES</span></h2>
        
        {/* Affichage conditionnel du bouton selon le rôle */}
        {(userRole === 'pentester' || userRole === 'admin') && (
          <button className="add-btn" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#00d4ff', color: '#000', border: 'none', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Plus size={18} /> NOUVELLE CIBLE
          </button>
        )}
      </header>

      {/* Barre de contrôle : Recherche et Filtres */}
      <div className="controls-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#00d4ff' }} />
          <input 
            type="text" 
            placeholder="Rechercher une machine (Nom, IP)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 35px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid #333',
              color: '#fff',
              fontFamily: 'monospace',
              outline: 'none'
            }}
          />
        </div>

        <div className="filters-wrapper" style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={difficultyFilter} 
            onChange={(e) => setDifficultyFilter(e.target.value)}
            style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff', fontFamily: 'monospace', cursor: 'pointer' }}
          >
            <option value="All">DIFFICULTÉ (TOUTES)</option>
            <option value="Easy">EASY</option>
            <option value="Medium">MEDIUM</option>
            <option value="Hard">HARD</option>
            <option value="Insane">INSANE</option>
          </select>

          <select 
            value={platformFilter} 
            onChange={(e) => setPlatformFilter(e.target.value)}
            style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff', fontFamily: 'monospace', cursor: 'pointer' }}
          >
            <option value="All">OS (TOUS)</option>
            <option value="Linux">LINUX</option>
            <option value="Windows">WINDOWS</option>
          </select>
        </div>
      </div>

      <div className="boxes-grid">
        {filteredBoxes.length > 0 ? filteredBoxes.map(box => (
          <div 
            key={box._id} 
            className="box-card" 
            onClick={() => navigate(`/boxes/${box._id}`)}
            style={{ cursor: 'pointer' }}
          >
            {/* Mapping de tes difficultés réelles */}
            <div className="box-difficulty" style={{ color: box.difficulty === 'Insane' ? '#ff003c' : '#00ff41' }}>
              {box.difficulty?.toUpperCase()}
            </div>
            
            <Monitor size={32} color="#00d4ff" />
            <h3 style={{ marginTop: '1rem' }}>{box.name}</h3>
            <p style={{ color: '#555', fontSize: '0.8rem' }}>{box.ipAddress} @ {box.platform}</p>

            <div className="difficulty-bar">
              <div 
                className="difficulty-fill" 
                style={{ 
                  // Logique de progression basée sur ton enum status
                  width: box.status === 'Root-Flag' ? '100%' : box.status === 'User-Flag' ? '50%' : '10%', 
                  backgroundColor: box.status === 'Root-Flag' ? '#ff003c' : '#00d4ff' 
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
                  style={{
                    background: 'transparent',
                    border: '1px solid #333',
                    color: box.status === 'Root-Flag' ? '#ff003c' : '#00d4ff',
                    padding: '5px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Todo">TODO</option>
                  <option value="In-Progress">IN PROGRESS</option>
                  <option value="User-Flag">USER OWNED</option>
                  <option value="Root-Flag">ROOT OWNED</option>
                </select>
              </div>
              
              {(userRole === 'pentester' || userRole === 'admin') && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteBox(box._id); }} 
                  className="delete-icon-btn" 
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <Trash2 size={16} color="#555" className="hover-red" />
                </button>
              )}
            </div>
          </div>
        )) : (
          <div style={{ width: '100%', textAlign: 'center', color: '#888', marginTop: '2rem' }}>AUCUNE CIBLE DÉTECTÉE AVEC CES PARAMÈTRES.</div>
        )}
      </div>

      {/* MODALE D'AJOUT */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#0a0a0a', border: '1px solid #00d4ff', padding: '2rem', width: '400px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>INITIALISER_NOUVELLE_MACHINE</h3>
            
            <form onSubmit={handleAddBox} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Nom de la machine" required value={newBox.name} onChange={e => setNewBox({...newBox, name: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }} />
              <input type="text" placeholder="Adresse IP" value={newBox.ipAddress} onChange={e => setNewBox({...newBox, ipAddress: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }} />
              
              <select value={newBox.platform} onChange={e => setNewBox({...newBox, platform: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }}>
                <option value="HackTheBox">HackTheBox</option>
                <option value="TryHackMe">TryHackMe</option>
                <option value="Root-Me">Root-Me</option>
                <option value="VulnHub">VulnHub</option>
                <option value="Other">Autre</option>
              </select>

              <select value={newBox.difficulty} onChange={e => setNewBox({...newBox, difficulty: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Insane">Insane</option>
              </select>

              <button type="submit" style={{ marginTop: '1rem', padding: '12px', background: '#00d4ff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>LANCER L'INSTANCE</button>
            </form>
          </div>
        </div>
      )}

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

export default Boxes;