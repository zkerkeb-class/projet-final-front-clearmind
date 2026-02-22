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
  Download,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Trash,
  Clock,
  Copy,
  Check
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
  const [activeLogLevels, setActiveLogLevels] = useState(['info', 'success', 'warning', 'error']);
  const [selectedActor, setSelectedActor] = useState("All");
  const [selectedAction, setSelectedAction] = useState("All");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 25;
  const { success, info } = useToast();
  const userRole = getUserRole();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  
  const levelColors = {
    info: '#00d4ff',
    success: '#00ff41',
    warning: '#ffa500',
    error: '#ff003c'
  };

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
    // Chargement initial de TOUTES les données pour les compteurs (Badges)
    if (userRole === ROLES.ADMIN) {
      fetchTools();
      fetchUsers();
      fetchLogs();
    }
  }, [userRole]);

  useEffect(() => {
    // Sécurité & Reset Filtres
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
    setActiveLogLevels(['info', 'success', 'warning', 'error']);
    setSelectedActor("All");
    setSelectedAction("All");
    setDateStart("");
    setDateEnd("");
  }, [activeTab, userRole, navigate]);

  // Reset de l'état de copie quand on change de log ou qu'on ferme la modale
  useEffect(() => {
    if (!selectedLog) setJsonCopied(false);
  }, [selectedLog]);

  // Reset de la pagination quand on change les filtres
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeLogLevels, selectedActor, selectedAction, dateStart, dateEnd]);

  // Protection visuelle : Si pas admin, on n'affiche rien le temps que la redirection se fasse
  if (userRole !== ROLES.ADMIN) return null;

  // --- AUTO REFRESH LOGIC ---
  useEffect(() => {
    let interval;
    if (autoRefresh && activeTab === 'logs') {
      interval = setInterval(() => fetchLogs(true), 5000); // Refresh toutes les 5s
    }
    return () => clearInterval(interval);
  }, [autoRefresh, activeTab]);

  // --- LOGIQUE LOGS ---
  const fetchLogs = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get('/logs');
      setSystemLogs(res.data.data.logs || []);
      setError(null);
    } catch (err) {
      if (!isBackground) setError("Impossible de récupérer les logs système.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const confirmPurgeLogs = () => {
    setConfirmModal({
      isOpen: true,
      title: "PURGE_SYSTÈME",
      message: "ATTENTION : Vous allez supprimer l'intégralité des logs système. Cette action est irréversible. Continuer ?",
      onConfirm: executePurgeLogs
    });
  };

  const executePurgeLogs = async () => {
    try {
      await api.delete('/logs');
      setSystemLogs([]);
      success("BASE DE LOGS PURGÉE AVEC SUCCÈS");
    } catch (err) {
      setError("ÉCHEC DE LA PURGE DES LOGS");
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

  const handleExportTools = () => {
    const dataStr = JSON.stringify(tools, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arsenal_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("SAUVEGARDE ARSENAL GÉNÉRÉE");

    // Log de l'action
    api.post('/logs', {
      action: 'DATA_EXPORT',
      details: `Backup JSON de l'arsenal (${tools.length} outils)`,
      level: 'info'
    }).catch(console.error);
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

  const toggleLogLevel = (level) => {
    setActiveLogLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const resetLogFilters = () => {
    setSearchTerm("");
    setActiveLogLevels(['info', 'success', 'warning', 'error']);
    setSelectedActor("All");
    setSelectedAction("All");
    setDateStart("");
    setDateEnd("");
  };

  const filteredLogs = systemLogs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.details.toLowerCase().includes(searchTerm.toLowerCase()) || l.actor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = activeLogLevels.includes(l.level);
    const matchesActor = selectedActor === 'All' || l.actor === selectedActor;
    const matchesAction = selectedAction === 'All' || l.action === selectedAction;
    
    let matchesDate = true;
    if (dateStart) {
      matchesDate = matchesDate && new Date(l.timestamp) >= new Date(dateStart);
    }
    if (dateEnd) {
      matchesDate = matchesDate && new Date(l.timestamp) <= new Date(dateEnd);
    }

    return matchesSearch && matchesLevel && matchesActor && matchesAction && matchesDate;
  });

  // --- FILTRES RAPIDES ---
  const handleQuickTimeFilter = (hours) => {
    const end = new Date();
    const start = new Date(end.getTime() - (hours * 60 * 60 * 1000));
    
    const toLocalISO = (date) => {
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };

    setDateStart(toLocalISO(start));
    setDateEnd(toLocalISO(end));
  };

  // --- LOGIQUE DE TRI ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data) => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // --- PAGINATION LOGIC ---
  const sortedLogs = sortData(filteredLogs);
  const indexOfLastLog = currentPage * itemsPerPage;
  const indexOfFirstLog = indexOfLastLog - itemsPerPage;
  const currentLogs = sortedLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  // Extraction des valeurs uniques pour les filtres dynamiques
  const uniqueActors = [...new Set(systemLogs.map(log => log.actor))].sort();
  const uniqueActions = [...new Set(systemLogs.map(log => log.action))].sort();

  // Stats pour la barre de distribution
  const totalLogsCount = systemLogs.length || 1;
  const logStats = {
    info: (systemLogs.filter(l => l.level === 'info').length / totalLogsCount) * 100,
    success: (systemLogs.filter(l => l.level === 'success').length / totalLogsCount) * 100,
    warning: (systemLogs.filter(l => l.level === 'warning').length / totalLogsCount) * 100,
    error: (systemLogs.filter(l => l.level === 'error').length / totalLogsCount) * 100,
  };

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

    // Log de l'action (Warning car export de données sensibles)
    api.post('/logs', {
      action: 'DATA_EXPORT',
      details: `Export CSV des logs (${filteredLogs.length} entrées)`,
      level: 'warning'
    }).catch(console.error);
  };

  const handleCopyLogJSON = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setJsonCopied(true);
    success("JSON COPIÉ DANS LE PRESSE-PAPIER");
    setTimeout(() => setJsonCopied(false), 2000);
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
          <Wrench size={18} /> GESTION_ARSENAL <span className="tab-badge">{tools.length}</span>
        </button>
        <button 
          className={activeTab === 'users' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> UTILISATEURS <span className="tab-badge">{users.length}</span>
        </button>
        <button 
          className={activeTab === 'logs' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('logs')}
        >
          <FileText size={18} /> LOGS_SYSTÈME <span className="tab-badge">{systemLogs.length}</span>
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
              <button className="add-tool-btn" onClick={handleExportTools} style={{background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.3)', color: '#00d4ff'}}>
                  <Download size={16} /> BACKUP_JSON
              </button>
              <button className="add-tool-btn" onClick={() => navigate('/tools/add')}>
                  <Plus size={16} /> AJOUTER
              </button>
              </div>
            </div>
            
            {filteredTools.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>NOM_TECHNIQUE <ArrowUpDown size={12} /></th>
                  <th onClick={() => handleSort('category')}>CATÉGORIE <ArrowUpDown size={12} /></th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {sortData(filteredTools).map((tool) => (
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
                  <th onClick={() => handleSort('username')}>USERNAME <ArrowUpDown size={12} /></th>
                  <th onClick={() => handleSort('email')}>EMAIL <ArrowUpDown size={12} /></th>
                  <th onClick={() => handleSort('role')}>RÔLE_ACCÈS <ArrowUpDown size={12} /></th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {sortData(filteredUsers).map((user) => (
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
                <select 
                  value={selectedActor} 
                  onChange={(e) => setSelectedActor(e.target.value)} 
                  className="admin-filter-select"
                >
                  <option value="All">ACTEUR (TOUS)</option>
                  {uniqueActors.map(actor => <option key={actor} value={actor}>{actor}</option>)}
                </select>
                <select 
                  value={selectedAction} 
                  onChange={(e) => setSelectedAction(e.target.value)} 
                  className="admin-filter-select"
                >
                  <option value="All">ACTION (TOUTES)</option>
                  {uniqueActions.map(action => <option key={action} value={action}>{action}</option>)}
                </select>
                
                <div className="date-filter-group">
                  <div className="quick-filters">
                    <button onClick={() => handleQuickTimeFilter(1)} title="Dernière heure">1H</button>
                    <button onClick={() => handleQuickTimeFilter(24)} title="Dernières 24h">24H</button>
                    <button onClick={() => handleQuickTimeFilter(168)} title="7 Jours">7J</button>
                  </div>
                  <input 
                    type="datetime-local" 
                    value={dateStart} 
                    onChange={(e) => setDateStart(e.target.value)}
                    className="date-input"
                  />
                  <span className="date-separator">-</span>
                  <input 
                    type="datetime-local" 
                    value={dateEnd} 
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="date-input"
                  />
                </div>

                <button className={`add-tool-btn ${autoRefresh ? 'active-refresh' : ''}`} onClick={() => setAutoRefresh(!autoRefresh)} title="Actualisation auto (5s)">
                    <Clock size={16} className={autoRefresh ? 'spin' : ''} /> 
                    {autoRefresh ? 'LIVE' : 'AUTO'}
                </button>

                <button className="add-tool-btn" onClick={confirmPurgeLogs} style={{background: 'rgba(255, 0, 60, 0.1)', color: '#ff003c', border: '1px solid rgba(255, 0, 60, 0.3)'}}>
                    <Trash size={16} /> PURGER
                </button>
                <button className="add-tool-btn" onClick={handleExportLogs}>
                    <Download size={16} /> EXPORT_CSV
                </button>
              </div>
            </div>

            {/* BARRE DE DISTRIBUTION DES LOGS */}
            <div className="log-distribution-bar">
              <div className="dist-segment info" style={{width: `${logStats.info}%`}} title={`INFO: ${Math.round(logStats.info)}%`}></div>
              <div className="dist-segment success" style={{width: `${logStats.success}%`}} title={`SUCCESS: ${Math.round(logStats.success)}%`}></div>
              <div className="dist-segment warning" style={{width: `${logStats.warning}%`}} title={`WARNING: ${Math.round(logStats.warning)}%`}></div>
              <div className="dist-segment error" style={{width: `${logStats.error}%`}} title={`ERROR: ${Math.round(logStats.error)}%`}></div>
            </div>

            {/* BARRE DE FILTRES UI/UX DRIVEN */}
            <div className="log-filters-bar">
              <span className="filter-label"><Filter size={14} /> FILTRER PAR NIVEAU :</span>
              {['info', 'success', 'warning', 'error'].map(level => (
                <button
                  key={level}
                  className={`log-filter-chip ${activeLogLevels.includes(level) ? 'active ' + level : ''}`}
                  onClick={() => toggleLogLevel(level)}
                >
                  <span className="chip-dot"></span>
                  {level.toUpperCase()}
                </button>
              ))}
              
              <button className="reset-filters-btn" onClick={resetLogFilters}>
                <RotateCcw size={14} /> RESET
              </button>
            </div>

            <table className="admin-data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('timestamp')}>TIMESTAMP <ArrowUpDown size={12} /></th>
                  <th onClick={() => handleSort('level')}>NIVEAU <ArrowUpDown size={12} /></th>
                  <th onClick={() => handleSort('actor')}>ACTEUR <ArrowUpDown size={12} /></th>
                  <th onClick={() => handleSort('action')}>ACTION <ArrowUpDown size={12} /></th>
                  <th onClick={() => handleSort('details')}>DÉTAILS <ArrowUpDown size={12} /></th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log) => (
                  <tr key={log._id} onClick={() => setSelectedLog(log)} className="log-row-interactive" title="Cliquez pour voir les détails">
                    <td style={{color: '#666', fontSize: '0.8rem'}}>
                      {new Date(log.timestamp).toLocaleString()}
                      <span style={{opacity: 0.5, fontSize: '0.7rem'}}>.{new Date(log.timestamp).getMilliseconds().toString().padStart(3, '0')}</span>
                    </td>
                    <td><span className={`log-badge ${log.level}`}>{log.level.toUpperCase()}</span></td>
                    <td style={{fontWeight: 'bold', color: '#fff'}}>{log.actor}</td>
                    <td style={{color: levelColors[log.level] || '#00d4ff'}}>{log.action}</td>
                    <td style={{color: '#aaa', fontSize: '0.85rem'}}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION CONTROLS */}
            {filteredLogs.length > 0 && totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  className="pagination-btn"
                ><ChevronLeft size={16} /></button>
                <span className="pagination-info">PAGE {currentPage} / {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  className="pagination-btn"
                ><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        )}

        {/* MODALE DÉTAILS LOG */}
        {selectedLog && (
          <div className="admin-modal-overlay" onClick={() => setSelectedLog(null)}>
            <div className="admin-modal log-detail-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>DÉTAILS_LOG</h3>
                <div className="modal-actions">
                  <button onClick={handleCopyLogJSON} className={`icon-action ${jsonCopied ? 'copied' : ''}`} title="Copier JSON brut">
                      {jsonCopied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                  <X className="close-icon" onClick={() => setSelectedLog(null)} />
                </div>
              </div>
              <div className="log-detail-content">
                <div className="detail-row">
                  <span className="label">ID ÉVÉNEMENT:</span>
                  <span className="value">{selectedLog._id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">TIMESTAMP:</span>
                  <span className="value">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">NIVEAU:</span>
                  <span className={`log-badge ${selectedLog.level}`}>{selectedLog.level.toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">ACTEUR:</span>
                  <span className="value" style={{color: '#fff', fontWeight: 'bold'}}>{selectedLog.actor}</span>
                </div>
                <div className="detail-row">
                  <span className="label">ACTION:</span>
                  <span className="value" style={{color: levelColors[selectedLog.level] || '#00d4ff'}}>{selectedLog.action}</span>
                </div>
                <div className="detail-group">
                  <span className="label">DÉTAILS COMPLETS:</span>
                  <div className="detail-box">
                    {selectedLog.details}
                  </div>
                </div>
              </div>
            </div>
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