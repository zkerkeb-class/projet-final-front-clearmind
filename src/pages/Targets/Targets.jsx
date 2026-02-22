import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Server, ShieldCheck, Activity, Loader, Plus, Trash2, X, Pencil, Box, ChevronLeft, ChevronRight, Search, Edit, Monitor, Smartphone, Terminal, Command, HelpCircle, Download } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import './Targets.css';
import { ROLES, TARGET_STATUSES, TARGET_OS, OS_COLORS } from '../../utils/constants';
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
  const [osFilter, setOsFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const hasLoggedAccess = useRef(false);

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
    // Sécurité : Si Guest, on tente l'accès (pour le log backend) puis on redirige
    if (userRole === ROLES.GUEST) {
      if (!hasLoggedAccess.current) {
        api.get('/targets?resource=/targets').catch(() => {}); // Le backend renverra 403 + Log ACCESS_DENIED
        hasLoggedAccess.current = true;
      }
      navigate('/dashboard');
      return;
    }

    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [page, searchTerm, osFilter, statusFilter, userRole, navigate]);

    const fetchData = async () => {
      setLoading(true);
      try {
        const [targetsRes, boxesRes] = await Promise.all([
          api.get('/targets', { params: { page, limit: 10, search: searchTerm, os: osFilter, status: statusFilter } }),
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

  const handleExportScope = () => {
    if (targets.length === 0) {
      info("AUCUNE DONNÉE À EXPORTER");
      return;
    }

    const headers = ["HOST", "IP", "DOMAINE", "OS", "PORTS", "STATUT", "BOX_LIÉE"];
    const csvRows = [headers.join(',')];

    targets.forEach(t => {
      const portsStr = t.ports ? t.ports.map(p => `${p.port}/${p.service}`).join(';') : '';
      const row = [
        `"${t.name}"`, `"${t.ip}"`, `"${t.domain || ''}"`, `"${t.os}"`, `"${portsStr}"`, `"${t.status}"`, `"${t.linkedBox?.name || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scope_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("SCOPE EXPORTÉ EN CSV");

    // Log de l'action
    api.post('/logs', {
      action: 'DATA_EXPORT',
      details: `Export CSV du scope (${targets.length} cibles)`,
      level: 'info'
    }).catch(console.error);
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

  const getOsIcon = (os) => {
    const color = OS_COLORS[os] || '#555';
    switch (os) {
      case TARGET_OS.WINDOWS: return <Monitor size={14} color={color} />;
      case TARGET_OS.LINUX: return <Terminal size={14} color={color} />;
      case TARGET_OS.MACOS: return <Command size={14} color={color} />;
      case TARGET_OS.ANDROID: return <Smartphone size={14} color={color} />;
      case TARGET_OS.IOS: return <Smartphone size={14} color={color} />;
      default: return <HelpCircle size={14} color={color} />;
    }
  };

  // Si Guest, on n'affiche rien le temps de la redirection
  if (userRole === ROLES.GUEST) return null;

  return (
    <div className="targets-container">
      <header className="page-header">
        <h2 className="page-title">SYSTEM_<span>TARGETS</span></h2>
        
        {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
          <button className="add-target-btn" onClick={openAddModal}>
            <Plus size={18} /> AJOUTER SCOPE
          </button>
        )}
      </header>

      <div className="controls-bar">
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

        <div className="filters-wrapper">
          <select 
            value={osFilter} 
            onChange={(e) => setOsFilter(e.target.value)}
            className="targets-filter-select"
          >
            <option value="All">OS (TOUS)</option>
            {Object.values(TARGET_OS).map(os => (
              <option key={os} value={os}>{os}</option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="targets-filter-select"
          >
            <option value="All">STATUT (TOUS)</option>
            {Object.values(TARGET_STATUSES).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
            <button className="add-target-btn" onClick={handleExportScope} style={{background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.3)', color: '#00d4ff', fontSize: '0.8rem', padding: '10px 15px'}}>
              <Download size={16} /> CSV
            </button>
          )}
        </div>
      </div>

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
              <td data-label="HOST"><Server size={14} className="target-icon" /> {t.name}</td>
              <td data-label="IP / DOMAINE">
                <div className="ip-domain-wrapper">
                  <span className="ip-text">{t.ip}</span>
                  {t.domain && <span className="domain-text">{t.domain}</span>}
                </div>
              </td>
              <td data-label="OS">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getOsIcon(t.os)}
                  <span>{t.os}</span>
                </div>
                {/* Indicateur de lien vers une Box */}
                {t.linkedBox && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/boxes/${t.linkedBox._id}`);
                    }}
                    className="linked-box-badge"
                    title={`Lié à la box : ${t.linkedBox.name}`}
                  >
                    <Box size={10} className="linked-icon" /> LINKED
                  </div>
                )}
              </td>
              <td data-label="PORTS" className="ports-cell">
                {t.ports && t.ports.length > 0 
                  ? t.ports.map(p => `${p.port} (${p.service || '?'})`).join(', ') 
                  : "N/A"}
              </td>
              <td data-label="STATUT">
                <span className={`status-badge ${t.status.toLowerCase()}`}>
                  {t.status.toUpperCase()}
                </span>
              </td>
              {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
                <td data-label="ACTIONS" className="actions-cell">
                  <button onClick={() => openEditModal(t)} className="action-btn edit-btn">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => confirmDeleteTarget(t._id)} className="action-btn delete-btn">
                    <Trash2 size={16} />
                  </button>
                </td>
              )}
            </tr>
          ))
          ) : (
            <tr>
              <td colSpan="6" className="empty-state-row">
                AUCUNE CIBLE DÉTECTÉE DANS LE SCOPE
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
          <div className="target-modal-content">
            <button onClick={() => setShowModal(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h3 className="modal-title">{isEditMode ? 'MODIFIER_CIBLE' : 'DÉFINIR_NOUVELLE_CIBLE'}</h3>
            
            <form onSubmit={handleSaveTarget} className="modal-form">
              <input type="text" placeholder="Nom de la cible (ex: SRV-AD-01)" required value={newTarget.name} onChange={e => setNewTarget({...newTarget, name: e.target.value})} className="modal-input" />
              
              <select value={newTarget.os} onChange={e => setNewTarget({...newTarget, os: e.target.value})} className="modal-select">
                <option value={TARGET_OS.UNKNOWN}>OS Inconnu</option>
                <option value={TARGET_OS.WINDOWS}>Windows</option>
                <option value={TARGET_OS.LINUX}>Linux</option>
                <option value={TARGET_OS.MACOS}>MacOS</option>
                <option value={TARGET_OS.ANDROID}>Android</option>
                <option value={TARGET_OS.IOS}>iOS</option>
              </select>

              <input type="text" placeholder="Adresse IP (ex: 192.168.1.10)" required value={newTarget.ip} onChange={e => setNewTarget({...newTarget, ip: e.target.value})} className="modal-input" />
              
              <input 
                type="text" 
                placeholder={
                  newTarget.os === TARGET_OS.WINDOWS ? "Domaine AD (ex: CORP.LOCAL)" :
                  (newTarget.os === TARGET_OS.ANDROID || newTarget.os === TARGET_OS.IOS) ? "Hostname / Device ID" :
                  "Domaine / FQDN"
                }
                value={newTarget.domain} 
                onChange={e => setNewTarget({...newTarget, domain: e.target.value})} 
                className="modal-input" 
              />
              
              <select value={newTarget.linkedBox} onChange={e => setNewTarget({...newTarget, linkedBox: e.target.value})} className="modal-select">
                <option value="">-- Lier à une Box (Optionnel) --</option>
                {availableBoxes.map(box => (
                  <option key={box._id} value={box._id}>{box.name} ({box.platform})</option>
                ))}
              </select>

              <select value={newTarget.status} onChange={e => setNewTarget({...newTarget, status: e.target.value})} className="modal-select">
                <option value={TARGET_STATUSES.DISCOVERY}>Discovery (Découverte)</option>
                <option value={TARGET_STATUSES.SCANNING}>Scanning (En cours)</option>
                <option value={TARGET_STATUSES.VULNERABLE}>Vulnerable (Faille trouvée)</option>
                <option value={TARGET_STATUSES.COMPROMISED}>Compromised (Pwned)</option>
                <option value={TARGET_STATUSES.PATCHED}>Patched (Corrigé)</option>
              </select>

              {/* Gestion des Ports en Tableau (Déplacé en bas pour la grille) */}
              <div className="ports-manager">
                <div className="ports-header">
                  <label>PORTS & SERVICES</label>
                  <button type="button" onClick={addPortRow} className="add-port-btn">+ AJOUTER</button>
                </div>
                {newTarget.ports.map((p, index) => (
                  <div key={index} className="port-row">
                    <input 
                      type="text" 
                      placeholder="Port (80)" 
                      value={p.port} 
                      onChange={(e) => handlePortChange(index, 'port', e.target.value)}
                      className="port-input flex-1"
                    />
                    <input 
                      type="text" 
                      placeholder="Service (HTTP)" 
                      value={p.service} 
                      onChange={(e) => handlePortChange(index, 'service', e.target.value)}
                      className="port-input flex-2"
                    />
                    <button type="button" onClick={() => removePortRow(index)} className="remove-port-btn"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>

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