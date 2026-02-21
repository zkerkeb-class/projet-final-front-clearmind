import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../api/axios';
import { ChevronLeft, Save, Monitor, Hash, Activity, Eye, Edit, Copy, Check, Settings, X, Target, Code, Trash2 } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import './BoxDetail.css';
import { ROLES, BOX_DIFFICULTIES, BOX_PLATFORMS, CODE_LANGUAGES } from '../../utils/constants';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../components/ErrorModal/ErrorModal';

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

const BoxDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [box, setBox] = useState(null);
  const [notes, setNotes] = useState('');
  const [isMainPreview, setIsMainPreview] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [notesFormData, setNotesFormData] = useState('');
  const [isPreviewModal, setIsPreviewModal] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const userRole = getUserRole();
  const { success, info } = useToast();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case BOX_DIFFICULTIES.EASY: return '#00ff41';
      case BOX_DIFFICULTIES.MEDIUM: return '#ff8000';
      case BOX_DIFFICULTIES.HARD: return '#ff003c';
      case BOX_DIFFICULTIES.INSANE: return '#b026ff';
      default: return '#00d4ff';
    }
  };

  // Charger la box
  useEffect(() => {
    const fetchBox = async () => {
      try {
        const res = await api.get(`/boxes/${id}`);
        setBox(res.data.data);
        setNotes(res.data.data.notes || '');
      } catch (err) {
        setError("ERREUR DE CHARGEMENT DU DOSSIER.");
        navigate('/boxes');
      }
    };
    fetchBox();
  }, [id, navigate]);

  // Sauvegarde des notes depuis la modale
  const handleSaveNotes = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/boxes/${id}`, { notes: notesFormData });
      setNotes(notesFormData);
      setBox(prev => ({ ...prev, notes: notesFormData }));
      setLastSaved(new Date());
      setShowNotesModal(false);
      success("NOTES SAUVEGARDÉES");
    } catch (err) {
      setError("ERREUR DE SAUVEGARDE DES NOTES.");
    }
  };

  const executeClearNotes = async () => {
    try {
      await api.patch(`/boxes/${id}`, { notes: '' });
      setNotes('');
      setBox(prev => ({ ...prev, notes: '' }));
      setLastSaved(new Date());
      info("NOTES EFFACÉES");
    } catch (err) {
      setError("ERREUR LORS DE LA SUPPRESSION DES NOTES.");
    }
    setShowClearConfirm(false);
  };

  // Ouvrir la modale avec les données actuelles
  const handleEditClick = () => {
    setEditData({
      name: box.name,
      ipAddress: box.ipAddress,
      platform: box.platform,
      difficulty: box.difficulty,
      status: box.status
    });
    setShowEditModal(true);
  };

  const openNotesModal = () => {
    setNotesFormData(notes);
    setIsPreviewModal(false);
    setShowNotesModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validation IPv4 stricte
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipv4Regex.test(editData.ipAddress)) {
      setError("FORMAT IP INVALIDE. VEUILLEZ ENTRER UNE ADRESSE IPV4 VALIDE (EX: 10.10.10.10).");
      return;
    }

    try {
      const res = await api.patch(`/boxes/${id}`, editData);
      setBox(res.data.data);
      setShowEditModal(false);
      success("CONFIGURATION MISE À JOUR");
    } catch (err) {
      setError("ERREUR DE MODIFICATION : " + (err.response?.data?.message || err.message));
    }
  };

  if (!box) return <div className="loading-text">CHARGEMENT DU DOSSIER...</div>;

  return (
    <div className="box-detail-container">
      <button onClick={() => navigate('/boxes')} className="back-btn">
        <ChevronLeft size={16} /> RETOUR_LISTE
      </button>

      <header className="box-header-detail">
        <div className="box-title">
          <h1>{box.name.toUpperCase()}</h1>
          <div className="box-meta">
            <span><Hash size={14} /> {box.ipAddress}</span>
            <span><Monitor size={14} /> {box.platform}</span>
            <span style={{ color: getDifficultyColor(box.difficulty) }}>
              <Activity size={14} /> {box.difficulty}
            </span>
            
            {/* Bouton d'édition pour l'auteur/admin */}
            {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
              <button onClick={handleEditClick} className="preview-toggle-btn" title="Modifier les infos">
                <Settings size={14} /> CONFIG
              </button>
            )}
          </div>
        </div>

        <div className="save-status">
          {lastSaved ? `DERNIÈRE MODIF : ${lastSaved.toLocaleTimeString()}` : 'PRÊT'}
          <Save size={16} style={{ opacity: 0.5 }} />
        </div>
      </header>

      {/* SECTION SCOPE / CIBLES LIÉES */}
      {box.linkedTargets && box.linkedTargets.length > 0 && (
        <div className="linked-targets-container">
          <div className="linked-targets-title">
            <Target size={16} /> SCOPE_ASSOCIÉ ({box.linkedTargets.length})
          </div>
          <div className="targets-list">
            {box.linkedTargets.map(t => (
              <div key={t._id} className="target-chip">
                <div className="target-chip-header">
                  <span className="target-name">{t.name}</span>
                  <span className="target-ip">{t.ip}</span>
                </div>
                {t.ports && t.ports.length > 0 && (
                  <table className="mini-ports-table">
                    <tbody>
                      {t.ports.map((p, i) => (
                        <tr key={i}>
                          <td className="port-num">{p.port}</td>
                          <td className="port-svc">{p.service}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="editor-wrapper">
        <div className="editor-toolbar">
          <span style={{ fontSize: '0.9rem', color: '#fff', fontFamily: 'Orbitron' }}>NOTES_DE_MISSION.md</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsMainPreview(!isMainPreview)} className="preview-toggle-btn source-btn">
              {isMainPreview ? <><Code size={14}/> <span className="btn-text">SOURCE</span></> : <><Eye size={14}/> <span className="btn-text">APERÇU</span></>}
            </button>
            <button onClick={openNotesModal} className="preview-toggle-btn edit-btn">
              <Edit size={14}/> <span className="btn-text">ÉDITER</span>
            </button>
            <button onClick={() => setShowClearConfirm(true)} className="preview-toggle-btn delete-btn">
              <Trash2 size={14}/>
            </button>
          </div>
        </div>
        {isMainPreview ? (
          <div className="markdown-preview main-view">
            <ReactMarkdown 
              components={{
                code: CodeBlock,
                pre: ({children}) => <>{children}</>
              }}
            >
              {notes || "*Aucune note pour le moment. Cliquez sur ÉDITER pour commencer.*"}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="wiki-raw-source">{notes}</pre>
        )}
      </div>

      {/* MODALE D'ÉDITION */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setShowEditModal(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h3 className="modal-title">CONFIGURATION_CIBLE</h3>
            
            <form onSubmit={handleEditSubmit} className="edit-form">
              <input className="edit-input" type="text" placeholder="Nom de la machine" required value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
              <input className="edit-input" type="text" placeholder="Adresse IP" value={editData.ipAddress} onChange={e => setEditData({...editData, ipAddress: e.target.value})} />
              
              <select className="edit-select" value={editData.platform} onChange={e => setEditData({...editData, platform: e.target.value})}>
                <option value={BOX_PLATFORMS.HTB}>HackTheBox</option>
                <option value={BOX_PLATFORMS.THM}>TryHackMe</option>
                <option value={BOX_PLATFORMS.ROOT_ME}>Root-Me</option>
                <option value={BOX_PLATFORMS.VULNHUB}>VulnHub</option>
                <option value={BOX_PLATFORMS.OTHER}>Autre</option>
              </select>

              <select className="edit-select" value={editData.difficulty} onChange={e => setEditData({...editData, difficulty: e.target.value})}>
                <option value={BOX_DIFFICULTIES.EASY}>Easy</option>
                <option value={BOX_DIFFICULTIES.MEDIUM}>Medium</option>
                <option value={BOX_DIFFICULTIES.HARD}>Hard</option>
                <option value={BOX_DIFFICULTIES.INSANE}>Insane</option>
              </select>

              <button type="submit" className="save-btn" style={{ marginTop: '1rem' }}>
                <Save size={18} /> ENREGISTRER LES MODIFICATIONS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE D'ÉDITION DES NOTES */}
      {showNotesModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '800px', maxWidth: '95vw' }}>
            <button onClick={() => setShowNotesModal(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h3 className="modal-title">ÉDITEUR_DE_NOTES</h3>
            
            <form onSubmit={handleSaveNotes} className="edit-form">
              <div className="wiki-modal-toolbar">
                <span className="wiki-modal-label">MARKDOWN EDITOR</span>
                <button 
                  type="button" 
                  onClick={() => setIsPreviewModal(!isPreviewModal)} 
                  className="preview-toggle-btn small"
                >
                  {isPreviewModal ? <><Edit size={12}/> ÉDITER</> : <><Eye size={12}/> APERÇU</>}
                </button>
              </div>

              {isPreviewModal ? (
                <div className="wiki-modal-preview">
                  <ReactMarkdown components={{ code: CodeBlock, pre: ({children}) => <>{children}</> }}>{notesFormData}</ReactMarkdown>
                </div>
              ) : (
                <textarea className="wiki-modal-textarea" value={notesFormData} onChange={e => setNotesFormData(e.target.value)} placeholder="# Vos notes ici..." />
              )}

              <button type="submit" className="save-btn" style={{ marginTop: '1rem' }}>
                <Save size={18} /> ENREGISTRER LES NOTES
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION */}
      <ConfirmationModal 
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={executeClearNotes}
        title="EFFACER_NOTES"
        message="Voulez-vous vraiment effacer l'intégralité de vos notes pour cette machine ?"
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

export default BoxDetail;
