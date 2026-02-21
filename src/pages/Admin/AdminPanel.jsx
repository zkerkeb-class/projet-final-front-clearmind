import React, { useState, useEffect } from 'react';
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
  Pencil,
  AlertTriangle
} from 'lucide-react';
import './AdminPanel.css';
import { ROLES } from '../../utils/constants';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('arsenal');
  const [tools, setTools] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { success, info } = useToast();
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

  useEffect(() => {
    if (activeTab === 'arsenal') fetchTools();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

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
      </nav>

      <main className="admin-view">
        {loading && <div className="admin-loader">SYNCHRONISATION_EN_COURS...</div>}

        {!loading && !error && activeTab === 'arsenal' && (
          <div className="arsenal-mgmt">
            <div className="toolbar">
              <button className="add-tool-btn" onClick={() => navigate('/tools/add')}>
                <Plus size={16} /> ENREGISTRER_NOUVEL_OUTIL
              </button>
            </div>
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>NOM_TECHNIQUE</th>
                  <th>CATÉGORIE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool._id}>
                    <td className="tool-name">{tool.name.toUpperCase()}</td>
                    <td><span className="cat-tag">{tool.category}</span></td>
                    <td className="actions-cell">
                      <button onClick={() => navigate(`/tools/${tool.name.toLowerCase()}`)} title="Voir">
                        <ExternalLink size={16} color="#00d4ff" />
                      </button>
                      <button onClick={() => navigate(`/tools/edit/${tool.name}`)} title="Modifier">
                        <Pencil size={16} color="#ffa500" />
                      </button>
                      <button onClick={() => confirmDeleteTool(tool.name)} title="Supprimer">
                        <Trash2 size={16} color="#ff003c" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && activeTab === 'users' && (
          <div className="users-mgmt">
            <div className="toolbar">
              <button className="add-tool-btn" onClick={() => setShowAddUser(true)}>
                <UserPlus size={16} /> CRÉER_UTILISATEUR
              </button>
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
                {users.map((user) => (
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
                      <button onClick={() => confirmDeleteUser(user._id, user.username)} title="Supprimer">
                        <Trash2 size={16} color="#ff003c" />
                      </button>
                    </td>
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

export default AdminPanel;