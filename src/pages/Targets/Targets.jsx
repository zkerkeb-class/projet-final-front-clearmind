import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Server, ShieldCheck, Activity, Loader, Plus, Trash2, X, Pencil, Box, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import './Targets.css';
import { ROLES, TARGET_STATUSES, TARGET_OS } from '../../utils/constants';
import Skeleton from '../../components/Skeleton/Skeleton';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../components/ErrorModal/ErrorModal';

const Targets = () => {
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);
  const [availableBoxes, setAvailableBoxes] = useState([]); // Liste des boxes pour le lien
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const userRole = getUserRole();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { success, info } = useToast();
  const [targetToDelete, setTargetToDelete] = useState(null);

  const [newTarget, setNewTarget] = useState({
    name: '',
    ip: '',
    domain: '',
    os: 'Unknown',
    status: TARGET_STATUSES.DISCOVERY,
    ports: [], // Tableau d'objets { port, service }
    linkedBox: '' // ID de la box liée
  });

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [page, searchTerm]);

    const fetchData = async () => {
      setLoading(true);
      try {
        const [targetsRes, boxesRes] = await Promise.all([
          api.get('/targets', { params: { page, limit: 10, search: searchTerm } }),
          api.get('/boxes')
        ]);
        setTargets(targetsRes.data.data.targets);
        setTotalPages(targetsRes.data.totalPages);
        setAvailableBoxes(boxesRes.data.data.boxes);
        setLoading(false);
      } catch (err) {
        console.error("Erreur de récupération des cibles:", err);
        setLoading(false);
      }
    };

  const handleSaveTarget = async (e) => {
    e.preventDefault();

    // Préparation des données (conversion string ports -> array)
    const payload = {
      ...newTarget,
      ports: newTarget.ports.filter(p => p.port), // On garde ceux qui ont au moins un port défini
      linkedBox: newTarget.linkedBox || null
    };

    try {
      if (isEditMode) {
        // Mode Édition
        const res = await api.patch(`/targets/${editingId}`, payload);
        setTargets(targets.map(t => t._id === editingId ? res.data.data.target : t));
        success("CIBLE MISE À JOUR");
      } else {
        // Mode Création
        const res = await api.post('/targets', payload);
        setTargets([res.data.data.target, ...targets]);
        success("AJOUTÉE AU SCOPE");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError("ERREUR D'ENREGISTREMENT: " + (err.response?.data?.message || err.message));
    }
  };

  const confirmDeleteTarget = (id) => {
    setTargetToDelete(id);
  };

  const executeDeleteTarget = async () => {
    try {
      await api.delete(`/targets/${targetToDelete}`);
      setTargets(targets.filter(t => t._id !== targetToDelete));
      info("CIBLE RETIRÉE DU SCOPE");
    } catch (err) {
      setError("IMPOSSIBLE DE SUPPRIMER LA CIBLE.");
    }
    setTargetToDelete(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (target) => {
    setNewTarget({
      name: target.name,
      ip: target.ip,
      domain: target.domain || '',
      os: target.os,
      status: target.status,
      ports: target.ports || [],
      linkedBox: target.linkedBox?._id || target.linkedBox || ''
    });
    setIsEditMode(true);
    setEditingId(target._id);
    setShowModal(true);
  };

  const resetForm = () => {
    setNewTarget({ name: '', ip: '', domain: '', os: 'Unknown', status: TARGET_STATUSES.DISCOVERY, ports: [], linkedBox: '' });
    setIsEditMode(false);
    setEditingId(null);
  };

  // Gestion des lignes de ports
  const addPortRow = () => {
    setNewTarget({ ...newTarget, ports: [...newTarget.ports, { port: '', service: '' }] });
  };
  const removePortRow = (index) => {
    const newPorts = newTarget.ports.filter((_, i) => i !== index);
    setNewTarget({ ...newTarget, ports: newPorts });
  };
  const handlePortChange = (index, field, value) => {
    const newPorts = [...newTarget.ports];
    newPorts[index][field] = value;
    setNewTarget({ ...newTarget, ports: newPorts });
  };

  return (
    <div className="targets-container">
      <header className="page-header">
        <h2 className="page-title">SYSTEM_<span>TARGETS</span></h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="targets-search-container">
            <Search className="targets-search-icon" size={20} />
            <input 
              type="text" 
              placeholder="FILTRER..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="targets-search-input"
            />
          </div>

        {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
          <button className="add-target-btn" onClick={openAddModal}>
            <Plus size={18} /> AJOUTER SCOPE
          </button>
        )}
        </div>
      </header>

      <table className="targets-table">
        <thead>
          <tr>
            <th>Nom du Host</th>
            <th>Adresse IP</th>
            <th>OS</th>
            <th>Ports Ouverts</th>
            <th>Statut</th>
            {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td><Skeleton width={120} height={20} /></td>
                <td><Skeleton width={100} height={20} /></td>
                <td><Skeleton width={60} height={20} /></td>
                <td><Skeleton width={150} height={20} /></td>
                <td><Skeleton width={80} height={20} /></td>
              </tr>
            ))
          ) : targets.length > 0 ? (
            targets.map((t) => (
            <tr key={t._id} className="target-row">
              <td data-label="HOST"><Server size={14} style={{marginRight: '10px', color: '#00d4ff'}} /> {t.name}</td>
              <td data-label="IP / DOMAINE">
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <span style={{color: '#fff', fontWeight: 'bold'}}>{t.ip}</span>
                  {t.domain && <span style={{fontSize: '0.75rem', color: '#888'}}>{t.domain}</span>}
                </div>
              </td>
              <td data-label="OS">
                {t.os}
                {/* Indicateur de lien vers une Box */}
                {t.linkedBox && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/boxes/${t.linkedBox._id}`);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px', cursor: 'pointer', color: '#ffa500', fontSize: '0.7rem', border: '1px solid #ffa500', padding: '2px 4px', borderRadius: '3px' }}
                    title={`Lié à la box : ${t.linkedBox.name}`}
                  >
                    <Box size={10} style={{ marginRight: '3px' }} /> LINKED
                  </div>
                )}
              </td>
              <td data-label="PORTS" style={{color: '#4df3ff', fontSize: '0.85rem'}}>
                {t.ports && t.ports.length > 0 
                  ? t.ports.map(p => `${p.port} (${p.service || '?'})`).join(', ') 
                  : "N/A"}
              </td>
              <td data-label="STATUT">
                <span className="status-badge" style={{
                  backgroundColor: t.status === TARGET_STATUSES.COMPROMISED ? 'rgba(255, 0, 60, 0.2)' : 'rgba(0, 212, 255, 0.1)',
                  color: t.status === TARGET_STATUSES.COMPROMISED ? '#ff003c' : '#00d4ff',
                  border: `1px solid ${t.status === TARGET_STATUSES.COMPROMISED ? '#ff003c' : '#00d4ff'}`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {t.status.toUpperCase()}
                </span>
              </td>
              {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
                <td data-label="ACTIONS" className="actions-cell">
                  <button onClick={() => openEditModal(t)} style={{background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '10px'}}>
                    <Pencil size={16} color="#ffa500" />
                  </button>
                  <button onClick={() => confirmDeleteTarget(t._id)} style={{background: 'transparent', border: 'none', cursor: 'pointer'}}>
                    <Trash2 size={16} color="#555" className="hover-red" />
                  </button>
                </td>
              )}
            </tr>
          ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#666', fontFamily: 'Orbitron' }}>
                AUCUNE CIBLE DÉTECTÉE DANS LE SCOPE
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ background: 'transparent', border: '1px solid #333', color: page === 1 ? '#555' : '#fff', padding: '5px 10px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}><ChevronLeft /></button>
          <span style={{ color: '#fff', alignSelf: 'center' }}>PAGE {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ background: 'transparent', border: '1px solid #333', color: page === totalPages ? '#555' : '#fff', padding: '5px 10px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}><ChevronRight /></button>
        </div>
      )}

      {/* MODALE D'AJOUT */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="target-modal-content">
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>{isEditMode ? 'MODIFIER_CIBLE' : 'DÉFINIR_NOUVELLE_CIBLE'}</h3>
            
            <form onSubmit={handleSaveTarget} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Nom de la cible (ex: SRV-AD-01)" required value={newTarget.name} onChange={e => setNewTarget({...newTarget, name: e.target.value})} className="modal-form-input" />
              <input type="text" placeholder="Adresse IP (ex: 192.168.1.10)" required value={newTarget.ip} onChange={e => setNewTarget({...newTarget, ip: e.target.value})} className="modal-form-input" />
              <input type="text" placeholder="Domaine (ex: corp.local)" value={newTarget.domain} onChange={e => setNewTarget({...newTarget, domain: e.target.value})} className="modal-form-input" />
              
              {/* Gestion des Ports en Tableau */}
              <div style={{ background: '#111', padding: '10px', border: '1px solid #333', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ color: '#00d4ff', fontSize: '0.8rem', fontFamily: 'Orbitron' }}>PORTS & SERVICES</label>
                  <button type="button" onClick={addPortRow} style={{ background: 'transparent', border: '1px solid #00ff41', color: '#00ff41', fontSize: '0.7rem', padding: '2px 6px', cursor: 'pointer' }}>+ AJOUTER</button>
                </div>
                {newTarget.ports.map((p, index) => (
                  <div key={index} className="port-row">
                    <input 
                      type="text" 
                      placeholder="Port (80)" 
                      value={p.port} 
                      onChange={(e) => handlePortChange(index, 'port', e.target.value)}
                      style={{ flex: 1, padding: '8px', background: '#0a0a0a', border: '1px solid #333', color: '#fff' }} 
                    />
                    <input 
                      type="text" 
                      placeholder="Service (HTTP)" 
                      value={p.service} 
                      onChange={(e) => handlePortChange(index, 'service', e.target.value)}
                      style={{ flex: 2, padding: '8px', background: '#0a0a0a', border: '1px solid #333', color: '#fff' }} 
                    />
                    <button type="button" onClick={() => removePortRow(index)} style={{ background: 'transparent', border: 'none', color: '#ff003c', cursor: 'pointer' }}><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
              
              <select value={newTarget.linkedBox} onChange={e => setNewTarget({...newTarget, linkedBox: e.target.value})} className="modal-form-select">
                <option value="">-- Lier à une Box (Optionnel) --</option>
                {availableBoxes.map(box => (
                  <option key={box._id} value={box._id}>{box.name} ({box.platform})</option>
                ))}
              </select>

              <select value={newTarget.os} onChange={e => setNewTarget({...newTarget, os: e.target.value})} className="modal-form-select">
                <option value={TARGET_OS.UNKNOWN}>OS Inconnu</option>
                <option value={TARGET_OS.WINDOWS}>Windows</option>
                <option value={TARGET_OS.LINUX}>Linux</option>
                <option value={TARGET_OS.MACOS}>MacOS</option>
              </select>

              <select value={newTarget.status} onChange={e => setNewTarget({...newTarget, status: e.target.value})} className="modal-form-select">
                <option value={TARGET_STATUSES.DISCOVERY}>Discovery (Découverte)</option>
                <option value={TARGET_STATUSES.SCANNING}>Scanning (En cours)</option>
                <option value={TARGET_STATUSES.VULNERABLE}>Vulnerable (Faille trouvée)</option>
                <option value={TARGET_STATUSES.COMPROMISED}>Compromised (Pwned)</option>
              </select>

              <button type="submit" className="modal-submit-btn">{isEditMode ? 'SAUVEGARDER MODIFICATIONS' : 'AJOUTER AU SCOPE'}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION */}
      <ConfirmationModal 
        isOpen={!!targetToDelete}
        onClose={() => setTargetToDelete(null)}
        onConfirm={executeDeleteTarget}
        title="SUPPRESSION_CIBLE"
        message="Voulez-vous vraiment retirer cette cible du scope ? Toutes les données associées seront perdues."
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

export default Targets;