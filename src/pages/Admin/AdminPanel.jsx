import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  ShieldCheck, 
  Wrench, 
  Users, 
  Plus, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  UserPlus, 
  X,
  Edit,
  Search,
  Database,
  FileText,
  Download
} from 'lucide-react';
import './AdminPanel.css';
import { ROLES, TOOL_CATEGORIES } from '../../utils/constants';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import { getUserRole } from '../../utils/auth';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('arsenal');
  const [tools, setTools] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [logLevelFilter, setLogLevelFilter] = useState("All");
  const { success, info } = useToast();
  const userRole = getUserRole();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  
  // États pour le modal de création d'utilisateur
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: ROLES.GUEST 
  });

  const [systemLogs, setSystemLogs] = useState([]);
  const hasLoggedAccess = useRef(false);

  useEffect(() => {
    if (userRole !== ROLES.ADMIN) {
      // "Honeypot" : On envoie une seule fois la requête pour logger le 403
      if (!hasLoggedAccess.current) {
        api.get('/logs?resource=/admin').catch(() => {}); 
        hasLoggedAccess.current = true;
      }
      navigate('/dashboard');
      return;
    }

    setSearchTerm("");
    setCategoryFilter("All");
    setRoleFilter("All");
    setLogLevelFilter("All");
    
    // On ne lance les fetch que si on est admin (pour éviter les requêtes inutiles avant la redirection)
    if (userRole === ROLES.ADMIN) {
      if (activeTab === 'arsenal') fetchTools();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'logs') fetchLogs();
    }
  }, [activeTab, userRole, navigate]);

  // Protection visuelle : Si pas admin, on n'affiche rien le temps que la redirection se fasse
  if (userRole !== ROLES.ADMIN) return null;

  // --- LOGIQUE LOGS ---
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/logs');
      setSystemLogs(res.data.data.logs || []);
      setError(null);
    } catch (err) {
      setError("Impossible de récupérer les logs système.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE ARSENAL ---
  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tools');
      setTools(res.data.data || []);
      setError(null);
    } catch (err) {
      setError("Erreur de synchronisation de l'arsenal");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteTool = (toolName) => {
    setConfirmModal({
      isOpen: true,
      title: "SUPPRESSION_OUTIL",
      message: `Voulez-vous vraiment supprimer l'outil ${toolName.toUpperCase()} de l'arsenal ?`,
      onConfirm: () => executeDeleteTool(toolName)
    });
  };

  const executeDeleteTool = async (toolName) => {
    try {
      await api.delete(`/tools/${toolName}`);
      setTools(tools.filter(t => t.name !== toolName));
      info("OUTIL SUPPRIMÉ DE L'ARSENAL");
    } catch (err) {
      setError("ERREUR LORS DE LA SUPPRESSION DE L'OUTIL.");
    }
  };

  // --- LOGIQUE UTILISATEURS ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data?.users || []);
      setError(null);
    } catch (err) {
      setError("Erreur de récupération des opérateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      setShowAddUser(false);
      setNewUser({ username: '', email: '', password: '', role: 'guest' });
      fetchUsers();
      success("NOUVEL OPÉRATEUR ENREGISTRÉ");
    } catch (err) {
      setError("ERREUR_CRÉATION : " + (err.response?.data?.message || "Données invalides"));
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      success("ACCRÉDITATION MISE À JOUR");
    } catch (err) {
      setError("MODIFICATION DU RÔLE REFUSÉE PAR LE SYSTÈME.");
    }
  };

  const confirmDeleteUser = (userId, username) => {
    setConfirmModal({
      isOpen: true,
      title: "RÉVOCATION_ACCÈS",
      message: `Confirmez-vous la suppression du compte opérateur : ${username} ?`,
      onConfirm: () => executeDeleteUser(userId)
    });
  };

  const executeDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      info("ACCÈS RÉVOQUÉ");
    } catch (err) {
      setError("ERREUR LORS DE LA RÉVOCATION DE L'UTILISATEUR.");
    }
  };

  // --- FILTRAGE ---
  const filteredTools = tools.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredLogs = systemLogs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.details.toLowerCase().includes(searchTerm.toLowerCase()) || l.actor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = logLevelFilter === 'All' || l.level === logLevelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleExportLogs = () => {
    if (filteredLogs.length === 0) {
      info("AUCUNE DONNÉE À EXPORTER");
      return;
    }

    const headers = ["TIMESTAMP", "NIVEAU", "ACTEUR", "ACTION", "DETAILS"];
    const csvRows = [headers.join(',')];

    filteredLogs.forEach(log => {
      const row = [
        `"${new Date(log.timestamp).toLocaleString()}"`,
        `"${log.level.toUpperCase()}"`,
        `"${log.actor}"`,
        `"${log.action}"`,
        `"${(log.details || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `logs_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("EXPORT CSV GÉNÉRÉ");
  };

  return (
    <div className="admin-container">
      <header className="page-header">
        <h2 className="page-title">ADMIN_<span>PANEL</span></h2>
        <div className="admin-status">MODE_ROOT_ACTIF</div>
      </header>

      <nav className="admin-tabs">
        <button 
          className={activeTab === 'arsenal' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('arsenal')}
        >
          <Wrench size={18} /> GESTION_ARSENAL
        </button>
        <button 
          className={activeTab === 'users' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> UTILISATEURS
        </button>
        <button 
          className={activeTab === 'logs' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('logs')}
        >
          <FileText size={18} /> LOGS_SYSTÈME
        </button>
      </nav>

      <main className="admin-view">
        {loading && <div className="admin-loader">SYNCHRONISATION_EN_COURS...</div>}

        {!loading && !error && activeTab === 'arsenal' && (
          <div className="arsenal-mgmt">
            <div className="controls-bar">
              <div className="admin-search-container">
                <Search size={20} className="admin-search-icon" />
                <input 
                  type="text" 
                  placeholder="RECHERCHER UN OUTIL..." 
                  className="admin-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filters-wrapper">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="admin-filter-select">
                  <option value="All">CATÉGORIE (TOUTES)</option>
                  {TOOL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              <button className="add-tool-btn" onClick={() => navigate('/tools/add')}>
                  <Plus size={16} /> AJOUTER
              </button>
              </div>
            </div>
            
            {filteredTools.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>NOM_TECHNIQUE</th>
                  <th>CATÉGORIE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTools.map((tool) => (
                  <tr key={tool._id}>
                    <td className="tool-name">{tool.name.toUpperCase()}</td>
                    <td><span className="cat-tag">{tool.category}</span></td>
                    <td className="actions-cell">
                      <button onClick={() => navigate(`/tools/${tool.name.toLowerCase()}`)} title="Voir" className="action-btn view-btn">
                        <ExternalLink size={16} />
                      </button>
                      <button onClick={() => navigate(`/tools/edit/${tool.name}`)} title="Modifier" className="action-btn edit-btn">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => confirmDeleteTool(tool.name)} title="Supprimer" className="action-btn delete-btn">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : (
              <div className="empty-state">
                <Database size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <span>AUCUN OUTIL CORRESPONDANT</span>
              </div>
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'users' && (
          <div className="users-mgmt">
            <div className="controls-bar">
              <div className="admin-search-container">
                <Search size={20} className="admin-search-icon" />
                <input 
                  type="text" 
                  placeholder="RECHERCHER UN OPÉRATEUR..." 
                  className="admin-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filters-wrapper">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="admin-filter-select">
                  <option value="All">RÔLE (TOUS)</option>
                  <option value={ROLES.GUEST}>GUEST</option>
                  <option value={ROLES.PENTESTER}>PENTESTER</option>
                  <option value={ROLES.ADMIN}>ADMIN</option>
                </select>
              <button className="add-tool-btn" onClick={() => setShowAddUser(true)}>
                  <UserPlus size={16} /> CRÉER
              </button>
            </div>
            </div>

            {showAddUser && (
              <div className="admin-modal-overlay">
                <div className="admin-modal">
                  <div className="modal-header">
                    <h3>NOUVEL_OPÉRATEUR</h3>
                    <X className="close-icon" onClick={() => setShowAddUser(false)} />
                  </div>
                  <form onSubmit={handleCreateUser}>
                    <input 
                      type="text" placeholder="Username" required 
                      value={newUser.username} 
                      onChange={e => setNewUser({...newUser, username: e.target.value})} 
                    />
                    <input 
                      type="email" placeholder="Email" required 
                      value={newUser.email} 
                      onChange={e => setNewUser({...newUser, email: e.target.value})} 
                    />
                    <input 
                      type="password" placeholder="Mot de passe" required 
                      value={newUser.password} 
                      onChange={e => setNewUser({...newUser, password: e.target.value})} 
                    />
                    <select 
                      value={newUser.role} 
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value={ROLES.GUEST}>GUEST</option>
                      <option value={ROLES.PENTESTER}>PENTESTER</option>
                      <option value={ROLES.ADMIN}>ADMIN</option>
                    </select>
                    <button type="submit" className="save-btn">INITIALISER_COMPTE</button>
                  </form>
                </div>
              </div>
            )}

            {filteredUsers.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>USERNAME</th>
                  <th>EMAIL</th>
                  <th>RÔLE_ACCÈS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select 
                        className="role-select"
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        <option value={ROLES.GUEST}>GUEST</option>
                        <option value={ROLES.PENTESTER}>PENTESTER</option>
                        <option value={ROLES.ADMIN}>ADMIN</option>
                      </select>
                    </td>
                    <td className="actions-cell">
                      <button onClick={() => confirmDeleteUser(user._id, user.username)} title="Supprimer" className="action-btn delete-btn">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : (
              <div className="empty-state">
                <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <span>AUCUN UTILISATEUR TROUVÉ</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-mgmt">
            <div className="controls-bar">
              <div className="admin-search-container">
                <Search size={20} className="admin-search-icon" />
                <input 
                  type="text" 
                  placeholder="RECHERCHER DANS LES LOGS..." 
                  className="admin-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filters-wrapper">
                <select value={logLevelFilter} onChange={(e) => setLogLevelFilter(e.target.value)} className="admin-filter-select">
                  <option value="All">NIVEAU (TOUS)</option>
                  <option value="info">INFO</option>
                  <option value="success">SUCCESS</option>
                  <option value="warning">WARNING</option>
                  <option value="error">ERROR</option>
                </select>
                <button className="add-tool-btn" onClick={handleExportLogs}>
                    <Download size={16} /> EXPORT_CSV
                </button>
              </div>
            </div>

            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>NIVEAU</th>
                  <th>ACTEUR</th>
                  <th>ACTION</th>
                  <th>DÉTAILS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td style={{color: '#666', fontSize: '0.8rem'}}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td><span className={`log-badge ${log.level}`}>{log.level.toUpperCase()}</span></td>
                    <td style={{fontWeight: 'bold', color: '#fff'}}>{log.actor}</td>
                    <td style={{color: '#00d4ff'}}>{log.action}</td>
                    <td style={{color: '#aaa', fontSize: '0.85rem'}}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODALE DE CONFIRMATION GÉNÉRIQUE */}
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
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

export default AdminPanel;