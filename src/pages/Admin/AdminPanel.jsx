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
  Pencil
} from 'lucide-react';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('arsenal');
  const [tools, setTools] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour le modal de création d'utilisateur
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'guest' 
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

  const handleDeleteTool = async (toolName) => {
    if (window.confirm(`⚠️ SUPPRIMER L'OUTIL : ${toolName.toUpperCase()} ?`)) {
      try {
        await api.delete(`/tools/${toolName}`);
        setTools(tools.filter(t => t.name !== toolName));
      } catch (err) {
        alert("Erreur lors de la suppression de l'outil.");
      }
    }
  };

  // --- LOGIQUE UTILISATEURS ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
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
    } catch (err) {
      alert("ERREUR_CRÉATION : " + (err.response?.data?.message || "Données invalides"));
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Modification du rôle refusée par le système.");
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`❌ RÉVOQUER L'ACCÈS DE : ${username} ?`)) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
      } catch (err) {
        alert("Erreur lors de la révocation de l'utilisateur.");
      }
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2 className="admin-title">
          <ShieldCheck size={32} color="#ff003c" /> 
          CONSOLE_<span>ADMINISTRATION</span>
        </h2>
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
        {error && <div className="admin-error"><AlertCircle size={20} /> {error}</div>}

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
                      <button onClick={() => handleDeleteTool(tool.name)} title="Supprimer">
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
                      <option value="guest">GUEST</option>
                      <option value="pentester">PENTESTER</option>
                      <option value="admin">ADMIN</option>
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
                        <option value="guest">GUEST</option>
                        <option value="pentester">PENTESTER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="actions-cell">
                      <button onClick={() => handleDeleteUser(user._id, user.username)} title="Supprimer">
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
    </div>
  );
};

export default AdminPanel;