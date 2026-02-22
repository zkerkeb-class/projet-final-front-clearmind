import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../../api/axios';
import { Search, BookOpen, Plus, X, Trash2, Edit, Eye, Code } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import './Wiki.css';
import Skeleton from '../../components/Skeleton/Skeleton';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import CodeBlock from '../../components/CodeBlock/CodeBlock';


const WIKI_CATEGORIES = ['General', 'Web', 'Database', 'Remote Access', 'File Transfer', 'Mail', 'Network', 'Active Directory'];

const Wiki = () => {
  const [methodologies, setMethodologies] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isMainPreview, setIsMainPreview] = useState(true); // État pour l'affichage principal
  
  // États pour l'édition/ajout
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ port: '', service: '', category: 'General', content: '' });
  
  const userRole = getUserRole();
  const canEdit = userRole === 'admin' || userRole === 'pentester';
  const { success, info, error: toastError } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Charger la liste des méthodes (sidebar)
  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await api.get('/wiki');
      setMethodologies(res.data.data.methods);
      setLoading(false);
    } catch (err) {
      setError("IMPOSSIBLE DE CHARGER LA BASE DE CONNAISSANCES.");
      setLoading(false);
    }
  };

  // Charger le contenu complet d'une méthode
  const handleSelectTopic = async (id) => {
    try {
      const res = await api.get(`/wiki/${id}`);
      setSelectedTopic(res.data.data.method);
    } catch (err) {
      setError("ERREUR DE CHARGEMENT DU CONTENU.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedTopic) {
        const res = await api.patch(`/wiki/${selectedTopic._id}`, formData);
        setSelectedTopic(res.data.data.method);
        fetchMethods(); // Rafraîchir la liste
      } else {
        await api.post('/wiki', formData);
        fetchMethods();
      }
      setShowModal(false);
      setFormData({ port: '', service: '', category: 'General', content: '' });
      success(isEditMode ? "FICHE MISE À JOUR" : "NOUVELLE FICHE CRÉÉE");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (msg && (msg.includes('duplicate') || msg.includes('11000'))) {
        toastError("ERREUR : UNE FICHE EXISTE DÉJÀ POUR CE PORT.");
      } else {
        setError("ERREUR D'ENREGISTREMENT : " + msg);
      }
    }
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/wiki/${selectedTopic._id}`);
      setSelectedTopic(null);
      fetchMethods();
      info("FICHE SUPPRIMÉE");
    } catch (err) {
      setError("ERREUR DE SUPPRESSION.");
    }
    setShowDeleteConfirm(false);
  };

  const openAddModal = () => {
    setFormData({ port: '', service: '', category: 'General', content: '# Enumeration\n\n# Exploitation\n' });
    setIsEditMode(false);
    setIsPreview(false);
    setShowModal(true);
  };

  const openEditModal = () => {
    if (!selectedTopic) return;
    setFormData({
      port: selectedTopic.port,
      service: selectedTopic.service,
      category: selectedTopic.category || 'General',
      content: selectedTopic.content
    });
    setIsEditMode(true);
    setIsPreview(false);
    setShowModal(true);
  };

  const filteredMethods = methodologies.filter(m => {
    const matchesSearch = m.service.toLowerCase().includes(searchTerm.toLowerCase()) || m.port.toString().includes(searchTerm);
    const matchesCategory = categoryFilter === "All" || (m.category && m.category === categoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="wiki-wrapper">
      <div className="page-header">
        <h1 className="page-title">KNOWLEDGE_<span>BASE</span></h1>
      </div>

      <div className="wiki-container">
      {/* Sidebar de navigation des ports */}
      <div className="wiki-sidebar">
        <div className="wiki-sidebar-header">
          <h3 className="wiki-nav-title">Protocols</h3>
          {canEdit && (
            <button onClick={openAddModal} className="wiki-add-btn" title="Ajouter une fiche"><Plus size={16}/></button>
          )}
        </div>
        
        <div className="wiki-search">
          <Search size={14} className="wiki-search-icon"/>
          <input 
            type="text" 
            placeholder="RECHERCHER (EX: 80, SMB)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="wiki-filter">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="wiki-filter-select"
          >
            <option value="All">CATÉGORIE (TOUTES)</option>
            {WIKI_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="wiki-list">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="wiki-nav-item" style={{ pointerEvents: 'none' }}>
              <Skeleton width={30} height={16} />
              <Skeleton width={100} height={16} />
            </div>
          ))
        ) : filteredMethods.map(m => (
          <div 
            key={m._id} 
            className={`wiki-nav-item ${selectedTopic?._id === m._id ? 'active' : ''}`}
            onClick={() => handleSelectTopic(m._id)}
          >
            <span className="wiki-port">{m.port}</span>
            <span className="wiki-service">{m.service}</span>
          </div>
        ))}
        </div>
      </div>

      {/* Zone de contenu Markdown */}
      <div className="wiki-content">
        {selectedTopic ? (
          <div className="markdown-body">
            <div className="wiki-content-header">
              <div className="wiki-header-left">
                <h1>{selectedTopic.port} - {selectedTopic.service}</h1>
                <span className="wiki-category-tag">{selectedTopic.category || 'GENERAL'}</span>
              </div>
              <div className="wiki-actions">
                {/* Bouton de bascule Source / Aperçu pour tout le monde */}
                <button 
                  onClick={() => setIsMainPreview(!isMainPreview)} 
                  className="wiki-action-btn preview-toggle"
                >
                  {isMainPreview ? <Code size={14}/> : <Eye size={14}/>}
                </button>

                {canEdit && (
                  <>
                  <button onClick={openEditModal} className="wiki-action-btn edit"><Edit size={14}/></button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="wiki-action-btn delete"><Trash2 size={14}/></button>
                  </>
                )}
              </div>
            </div>
            {isMainPreview ? (
              <ReactMarkdown components={{ 
                code: CodeBlock, // En lecture seule ici, pas de onLanguageChange car pas de sauvegarde directe
                pre: ({children}) => <>{children}</> 
              }}>
                {selectedTopic.content}
              </ReactMarkdown>
            ) : (
              <pre className="wiki-raw-source">{selectedTopic.content}</pre>
            )}
          </div>
        ) : (
          <div className="wiki-placeholder">
            <BookOpen size={48} style={{opacity: 0.2, marginBottom: '1rem'}}/>
            SÉLECTIONNEZ UN PORT POUR AFFICHER LA MÉTHODOLOGIE_
          </div>
        )}
      </div>
      </div>

      {/* MODALE D'AJOUT / ÉDITION */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setShowModal(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h3 className="modal-title">{isEditMode ? 'ÉDITER_FICHE' : 'NOUVELLE_MÉTHODOLOGIE'}</h3>
            
            <form onSubmit={handleSave} className="modal-form">
              <div className="modal-row">
                <input 
                  type="number" 
                  placeholder="Port (ex: 445)" 
                  required 
                  min="1" 
                  max="65535"
                  value={formData.port} 
                  onChange={e => setFormData({...formData, port: e.target.value})} 
                  className="modal-input flex-1" 
                />
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  className="modal-select flex-1"
                >
                  {WIKI_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              <div className="modal-row">
                <input 
                  type="text" 
                  placeholder="Service (ex: SMB, HTTP, SSH...)" 
                  required 
                  value={formData.service} 
                  onChange={e => setFormData({...formData, service: e.target.value})} 
                  className="modal-input" 
                  style={{ width: '100%' }}
                />
              </div>
              
              <div className="wiki-modal-toolbar">
                <span className="wiki-modal-label">CONTENT.md</span>
                <button 
                  type="button" 
                  onClick={() => setIsPreview(!isPreview)} 
                  className="wiki-action-btn preview-toggle small"
                >
                  {isPreview ? <><Edit size={12}/> ÉDITER</> : <><Eye size={12}/> APERÇU</>}
                </button>
              </div>

              {isPreview ? (
                <div className="wiki-modal-preview">
                  <ReactMarkdown components={{ 
                    code: CodeBlock, 
                    pre: ({children}) => <>{children}</> 
                  }}>
                    {formData.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea 
                  className="wiki-modal-textarea"
                  placeholder="# Méthodologie (Markdown)..." 
                  required 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                />
              )}

              <button type="submit" className="modal-submit-btn">ENREGISTRER</button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION */}
      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDelete}
        title="SUPPRESSION_FICHE"
        message="Confirmez-vous la suppression définitive de cette fiche méthodologique ?"
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

export default Wiki;
