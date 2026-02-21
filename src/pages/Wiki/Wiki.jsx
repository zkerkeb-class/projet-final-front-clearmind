import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../api/axios';
import { Search, BookOpen, Plus, X, Trash2, Edit, Eye, Copy, Check, Code } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import './Wiki.css';
import Skeleton from '../../components/Skeleton/Skeleton';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { CODE_LANGUAGES } from '../../utils/constants';
import ErrorModal from '../../components/ErrorModal/ErrorModal';

// Composant pour les blocs de code avec bouton copier
const CodeBlock = ({ inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const [language, setLanguage] = useState(match ? match[1] : 'text');

  useEffect(() => {
    const m = /language-(\w+)/.exec(className || '');
    setLanguage(m ? m[1] : 'text');
  }, [className]);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (inline) {
    return <code className={className} {...props}>{children}</code>;
  }

  const handleLanguageSelect = (e) => {
    e.stopPropagation();
    setLanguage(e.target.value);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <select 
          value={language} 
          onChange={handleLanguageSelect}
          className="code-lang-select"
          style={{ width: `${language.length + 3}ch` }}
        >
          {CODE_LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
        <button onClick={handleCopy} className="copy-code-btn" title="Copier">
          {isCopied ? <Check size={14} color="#00ff41" /> : <Copy size={14} />}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="code-highlighter"
        showLineNumbers={false}
        customStyle={{ margin: 0, padding: '15px', background: '#0a0a0a', fontSize: '0.9rem' }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

const Wiki = () => {
  const [methodologies, setMethodologies] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isMainPreview, setIsMainPreview] = useState(true); // État pour l'affichage principal
  
  // États pour l'édition/ajout
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ port: '', service: '', content: '' });
  
  const userRole = getUserRole();
  const canEdit = userRole === 'admin' || userRole === 'pentester';
  const { success, info } = useToast();
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
      setFormData({ port: '', service: '', content: '' });
      success(isEditMode ? "FICHE MISE À JOUR" : "NOUVELLE FICHE CRÉÉE");
    } catch (err) {
      setError("ERREUR D'ENREGISTREMENT : " + (err.response?.data?.message || err.message));
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
    setFormData({ port: '', service: '', content: '# Enumeration\n\n# Exploitation\n' });
    setIsEditMode(false);
    setIsPreview(false);
    setShowModal(true);
  };

  const openEditModal = () => {
    if (!selectedTopic) return;
    setFormData({
      port: selectedTopic.port,
      service: selectedTopic.service,
      content: selectedTopic.content
    });
    setIsEditMode(true);
    setIsPreview(false);
    setShowModal(true);
  };

  const filteredMethods = methodologies.filter(m => 
    m.service.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.port.toString().includes(searchTerm)
  );

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
              <h1>{selectedTopic.port} - {selectedTopic.service}</h1>
              <div className="wiki-actions">
                {/* Bouton de bascule Source / Aperçu pour tout le monde */}
                <button 
                  onClick={() => setIsMainPreview(!isMainPreview)} 
                  className="wiki-action-btn preview-toggle"
                >
                  {isMainPreview ? <><Code size={16}/> <span className="btn-text">SOURCE</span></> : <><Eye size={16}/> <span className="btn-text">APERÇU</span></>}
                </button>

                {canEdit && (
                  <>
                  <button onClick={openEditModal} className="wiki-action-btn edit"><Edit size={16}/> <span className="btn-text">ÉDITER</span></button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="wiki-action-btn delete"><Trash2 size={16}/></button>
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
                <input type="number" placeholder="Port (ex: 445)" required value={formData.port} onChange={e => setFormData({...formData, port: e.target.value})} className="modal-input flex-1" />
                <input type="text" placeholder="Service (ex: SMB)" required value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="modal-input flex-2" />
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
