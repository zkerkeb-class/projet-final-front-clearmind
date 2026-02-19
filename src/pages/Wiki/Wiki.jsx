import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../api/axios';
import { Search, BookOpen, Plus, Save, X, Trash2, AlertTriangle, Edit, Eye, Copy, Check, Code } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import './Wiki.css';
import Skeleton from '../../components/Skeleton/Skeleton';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { CODE_LANGUAGES } from '../../utils/constants';

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
    <div className="wiki-container">
      <style>{`
        @media (max-width: 768px) {
          .wiki-container { flex-direction: column; }
          .wiki-sidebar { width: 100% !important; border-right: none; border-bottom: 1px solid #333; max-height: 200px; overflow-y: auto; }
          
          /* Responsive Header & Actions */
          .wiki-content-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .wiki-actions { width: 100%; display: flex; gap: 10px; }
          .btn-text { display: none; }
        }
      `}</style>
      
      {/* Sidebar de navigation des ports */}
      <div className="wiki-sidebar">
        <div className="wiki-sidebar-header">
          <h3 className="wiki-nav-title"><BookOpen size={18}/> KNOWLEDGE_BASE</h3>
          {canEdit && (
            <button onClick={openAddModal} className="wiki-add-btn" title="Ajouter une fiche"><Plus size={16}/></button>
          )}
        </div>
        
        <div className="wiki-search">
          <Search size={14} className="wiki-search-icon"/>
          <input 
            type="text" 
            placeholder="Rechercher (ex: 80, smb)..." 
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

      {/* MODALE D'AJOUT / ÉDITION */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div className="modal-content" style={{ background: '#0a0a0a', border: '1px solid #00d4ff', padding: '2rem', width: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>{isEditMode ? 'ÉDITER_FICHE' : 'NOUVELLE_MÉTHODOLOGIE'}</h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="number" placeholder="Port (ex: 445)" required value={formData.port} onChange={e => setFormData({...formData, port: e.target.value})} style={{ flex: 1, padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }} />
                <input type="text" placeholder="Service (ex: SMB)" required value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} style={{ flex: 2, padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }} />
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

              <button type="submit" style={{ marginTop: '1rem', padding: '12px', background: '#00d4ff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>ENREGISTRER</button>
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
      {error && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300 }}>
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

export default Wiki;
