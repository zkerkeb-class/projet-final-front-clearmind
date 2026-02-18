import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Server, ShieldCheck, Activity, Loader, Plus, Trash2, X, AlertTriangle, Pencil, Box } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import './Targets.css';

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

  const [newTarget, setNewTarget] = useState({
    name: '',
    ip: '',
    domain: '',
    os: 'Unknown',
    status: 'Discovery',
    ports: '',
    linkedBox: '' // ID de la box liée
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [targetsRes, boxesRes] = await Promise.all([
          api.get('/targets'),
          api.get('/boxes')
        ]);
        setTargets(targetsRes.data.data.targets);
        setAvailableBoxes(boxesRes.data.data.boxes);
        setLoading(false);
      } catch (err) {
        console.error("Erreur de récupération des cibles:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveTarget = async (e) => {
    e.preventDefault();

    // Préparation des données (conversion string ports -> array)
    const payload = {
      ...newTarget,
      ports: newTarget.ports.split(',').map(p => p.trim()).filter(p => p !== ''),
      linkedBox: newTarget.linkedBox || null
    };

    try {
      if (isEditMode) {
        // Mode Édition
        const res = await api.patch(`/targets/${editingId}`, payload);
        setTargets(targets.map(t => t._id === editingId ? res.data.data.target : t));
      } else {
        // Mode Création
        const res = await api.post('/targets', payload);
        setTargets([res.data.data.target, ...targets]);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError("ERREUR D'ENREGISTREMENT: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteTarget = async (id) => {
    if(!window.confirm("Supprimer cette cible du scope ?")) return;
    try {
      await api.delete(`/targets/${id}`);
      setTargets(targets.filter(t => t._id !== id));
    } catch (err) {
      setError("IMPOSSIBLE DE SUPPRIMER LA CIBLE.");
    }
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
      ports: target.ports ? target.ports.join(', ') : '',
      linkedBox: target.linkedBox?._id || target.linkedBox || ''
    });
    setIsEditMode(true);
    setEditingId(target._id);
    setShowModal(true);
  };

  const resetForm = () => {
    setNewTarget({ name: '', ip: '', domain: '', os: 'Unknown', status: 'Discovery', ports: '', linkedBox: '' });
    setIsEditMode(false);
    setEditingId(null);
  };

  if (loading) return <div className="loading-text">SCAN DES RÉSEAUX EN COURS...</div>;

  return (
    <div className="targets-container">
      <header className="page-header">
        <h2 className="page-title">SYSTEM_<span>TARGETS</span></h2>
        
        {(userRole === 'pentester' || userRole === 'admin') && (
          <button className="add-btn" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#00d4ff', color: '#000', border: 'none', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Plus size={18} /> AJOUTER SCOPE
          </button>
        )}
      </header>

      <table className="targets-table">
        <thead>
          <tr>
            <th>Nom du Host</th>
            <th>Adresse IP</th>
            <th>OS</th>
            <th>Ports Ouverts</th>
            <th>Statut</th>
            {(userRole === 'pentester' || userRole === 'admin') && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {targets.map((t) => (
            <tr key={t._id} className="target-row">
              <td><Server size={14} style={{marginRight: '10px', color: '#00d4ff'}} /> {t.name}</td>
              <td>{t.domain || "N/A"}</td>
              <td>
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
              <td style={{color: '#4df3ff'}}>{t.ports?.join(', ') || "N/A"}</td>
              <td>
                <span className="status-badge" style={{
                  backgroundColor: t.status === 'Compromised' ? 'rgba(255, 0, 60, 0.2)' : 'rgba(0, 212, 255, 0.1)',
                  color: t.status === 'Compromised' ? '#ff003c' : '#00d4ff',
                  border: `1px solid ${t.status === 'Compromised' ? '#ff003c' : '#00d4ff'}`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {t.status.toUpperCase()}
                </span>
              </td>
              {(userRole === 'pentester' || userRole === 'admin') && (
                <td>
                  <button onClick={() => openEditModal(t)} style={{background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '10px'}}>
                    <Pencil size={16} color="#ffa500" />
                  </button>
                  <button onClick={() => handleDeleteTarget(t._id)} style={{background: 'transparent', border: 'none', cursor: 'pointer'}}>
                    <Trash2 size={16} color="#555" className="hover-red" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODALE D'AJOUT */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#0a0a0a', border: '1px solid #00d4ff', padding: '2rem', width: '400px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>{isEditMode ? 'MODIFIER_CIBLE' : 'DÉFINIR_NOUVELLE_CIBLE'}</h3>
            
            <form onSubmit={handleSaveTarget} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Nom de la cible (ex: SRV-AD-01)" required value={newTarget.name} onChange={e => setNewTarget({...newTarget, name: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }} />
              <input type="text" placeholder="Adresse IP (ex: 192.168.1.10)" required value={newTarget.ip} onChange={e => setNewTarget({...newTarget, ip: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }} />
              <input type="text" placeholder="Domaine (ex: corp.local)" value={newTarget.domain} onChange={e => setNewTarget({...newTarget, domain: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }} />
              <input type="text" placeholder="Ports / Services (ex: 80, 443, 3389)" value={newTarget.ports} onChange={e => setNewTarget({...newTarget, ports: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }} />
              
              <select value={newTarget.linkedBox} onChange={e => setNewTarget({...newTarget, linkedBox: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }}>
                <option value="">-- Lier à une Box (Optionnel) --</option>
                {availableBoxes.map(box => (
                  <option key={box._id} value={box._id}>{box.name} ({box.platform})</option>
                ))}
              </select>

              <select value={newTarget.os} onChange={e => setNewTarget({...newTarget, os: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }}>
                <option value="Unknown">OS Inconnu</option>
                <option value="Windows">Windows</option>
                <option value="Linux">Linux</option>
                <option value="MacOS">MacOS</option>
              </select>

              <select value={newTarget.status} onChange={e => setNewTarget({...newTarget, status: e.target.value})} style={{ padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }}>
                <option value="Discovery">Discovery (Découverte)</option>
                <option value="Scanning">Scanning (En cours)</option>
                <option value="Vulnerable">Vulnerable (Faille trouvée)</option>
                <option value="Compromised">Compromised (Pwned)</option>
              </select>

              <button type="submit" style={{ marginTop: '1rem', padding: '12px', background: '#00d4ff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{isEditMode ? 'SAUVEGARDER MODIFICATIONS' : 'AJOUTER AU SCOPE'}</button>
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

export default Targets;