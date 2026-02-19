import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Settings, Cpu, Wifi, ChevronRight, Plus, Edit, Trash2, Save, X, Database, AlertTriangle, Search } from 'lucide-react';
import './ReverseShell.css';
import { useToast } from '../../components/Toast/ToastContext';
import api from '../../api/axios';
import { getUserRole } from '../../utils/auth';
import { ROLES } from '../../utils/constants';
import Skeleton from '../../components/Skeleton/Skeleton';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';

const STANDARD_CATEGORIES = [
  'Awk', 'Bash', 'C', 'Golang', 'Java', 'Lua', 'Netcat', 
  'NodeJS', 'PHP', 'Perl', 'Python', 'PowerShell', 
  'Ruby', 'Socat', 'Telnet', 'Zsh'
];

const ReverseShell = () => {
  const [ip, setIp] = useState('10.10.14.x');
  const [port, setPort] = useState('4444');
  const { success, error: toastError } = useToast();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categorySearch, setCategorySearch] = useState('');
  
  const [shells, setShells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Admin States
  const userRole = getUserRole();
  const isAdmin = userRole === ROLES.ADMIN;
  
  const [showModal, setShowModal] = useState(false);
  const [editingShell, setEditingShell] = useState(null);
  const [formData, setFormData] = useState({ category: '', name: '', code: '' });
  const [shellToDelete, setShellToDelete] = useState(null);

  useEffect(() => {
    fetchShells();
  }, []);

  const fetchShells = async () => {
    try {
      setError(null);
      const res = await api.get('/reverseshells');
      setShells(res.data.data.shells);
      setLoading(false);
    } catch (err) {
      console.error("Erreur chargement shells", err);
      setError("Impossible de contacter le serveur. Vérifiez que la route API est bien déclarée dans app.js");
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(shells.map(s => s.category))];
  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const availableCategories = [...new Set([
    ...STANDARD_CATEGORIES, 
    ...shells.map(s => s.category)
  ])].sort();

  const formatCode = (codeTemplate) => {
    return codeTemplate.replace(/LHOST/g, ip).replace(/LPORT/g, port);
  };

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(formatCode(code));
    setCopiedIndex(index);
    success("PAYLOAD COPIÉ");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // --- ADMIN ACTIONS ---
  const handleSave = async (e) => {
    e.preventDefault();

    // SÉCURITÉ : Vérification côté client que la catégorie n'a pas été falsifiée dans le HTML
    if (!availableCategories.includes(formData.category)) {
      toastError("CATÉGORIE NON AUTORISÉE (Validation échouée)");
      return;
    }

    try {
      if (editingShell) {
        await api.patch(`/reverseshells/${editingShell._id}`, formData);
        success("SHELL MIS À JOUR");
      } else {
        await api.post('/reverseshells', formData);
        success("NOUVEAU SHELL AJOUTÉ");
      }
      fetchShells();
      setShowModal(false);
      setEditingShell(null);
      setFormData({ category: '', name: '', code: '' });
    } catch (err) {
      toastError("ERREUR D'ENREGISTREMENT");
    }
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/reverseshells/${shellToDelete}`);
      setShells(shells.filter(s => s._id !== shellToDelete));
      success("SHELL SUPPRIMÉ");
    } catch (err) {
      toastError("IMPOSSIBLE DE SUPPRIMER");
    }
    setShellToDelete(null);
  };

  const openAddModal = () => {
    setEditingShell(null);
    setFormData({ category: '', name: '', code: '' });
    setShowModal(true);
  };

  const openEditModal = (shell) => {
    setEditingShell(shell);
    setFormData({ category: shell.category, name: shell.name, code: shell.code });
    setShowModal(true);
  };

  const filteredShells = selectedCategory === 'All' 
    ? shells 
    : shells.filter(s => s.category === selectedCategory);

  return (
    <div className="revshell-container">
      <header className="page-header">
        <h2 className="page-title">REVERSE_<span>SHELL_GEN</span></h2>
        {isAdmin && (
          <button className="add-shell-btn" onClick={openAddModal}>
            <Plus size={16} /> AJOUTER
          </button>
        )}
      </header>

      <div className="config-panel">
        <div className="config-group">
          <label><Wifi size={16} /> LHOST (IP Attaquant)</label>
          <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="10.10.14.x" />
        </div>
        <div className="config-group">
          <label><Settings size={16} /> LPORT (Port d'écoute)</label>
          <input type="text" value={port} onChange={(e) => setPort(e.target.value)} placeholder="4444" />
        </div>
      </div>

      <div className="revshell-layout">
        <aside className="revshell-sidebar">
          <h3 className="sidebar-heading">LANGAGES</h3>
          
          <div className="sidebar-search">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Filtrer..." 
              value={categorySearch} 
              onChange={(e) => setCategorySearch(e.target.value)} 
            />
            {categorySearch && (
              <button 
                className="clear-search-btn" 
                onClick={() => setCategorySearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="category-list">
            {filteredCategories.map(cat => (
              <button key={cat} className={`category-btn ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                {cat} {selectedCategory === cat && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </aside>

        <main className="revshell-content">
          {loading ? (
            <div className="shells-grid">
              {Array.from({length: 4}).map((_, i) => <Skeleton key={i} width="100%" height={150} />)}
            </div>
          ) : error ? (
            <div className="empty-state">
              <AlertTriangle size={48} style={{ opacity: 0.8, marginBottom: '1rem', color: '#ff003c' }} />
              <p style={{ color: '#ff003c', fontWeight: 'bold' }}>ERREUR DE CONNEXION</p>
              <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#aaa' }}>{error}</p>
            </div>
          ) : shells.length === 0 ? (
            <div className="empty-state">
              <Database size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>BASE DE DONNÉES VIDE</p>
            </div>
          ) : (
          <div className="shells-grid">
            {filteredShells.map((shell, index) => (
              <div key={shell._id || index} className="shell-card">
                <div className="shell-header">
                  <span className="shell-name"><Terminal size={14} /> {shell.name}</span>
                  <div className="shell-actions">
                    {isAdmin && (
                      <>
                        <button onClick={() => openEditModal(shell)} className="action-icon-btn edit"><Edit size={14} /></button>
                        <button onClick={() => setShellToDelete(shell._id)} className="action-icon-btn delete"><Trash2 size={14} /></button>
                        <div className="separator"></div>
                      </>
                    )}
                    <button className={`copy-shell-btn ${copiedIndex === index ? 'copied' : ''}`} onClick={() => handleCopy(shell.code, index)}>
                      {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="shell-code">
                  <code>{formatCode(shell.code)}</code>
                </div>
              </div>
            ))}
          </div>
          )}
        </main>
      </div>

      {/* MODALE AJOUT/EDITION */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingShell ? 'MODIFIER_SHELL' : 'NOUVEAU_SHELL'}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="shell-form">
              <div className="form-row">
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="" disabled>Catégorie</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input type="text" placeholder="Nom (ex: Bash -i)" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="info-box">
                Utilisez <b>LHOST</b> et <b>LPORT</b> comme placeholders. Ils seront remplacés dynamiquement.
              </div>
              <textarea 
                placeholder="Code du shell..." 
                rows="5" 
                required 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})} 
                style={{ fontFamily: 'monospace' }}
              />
              <button type="submit" className="save-btn"><Save size={16}/> ENREGISTRER</button>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={!!shellToDelete}
        onClose={() => setShellToDelete(null)}
        onConfirm={executeDelete}
        title="SUPPRESSION_SHELL"
        message="Voulez-vous vraiment supprimer ce payload ?"
      />
    </div>
  );
};

export default ReverseShell;