import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../api/axios';
import { ChevronLeft, Save, Monitor, Hash, Activity, Eye, Edit, Copy, Check, Settings, X, Target, AlertTriangle, Code, Trash2 } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import './BoxDetail.css';

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
          <option value="text">TEXT</option>
          <option value="bash">BASH</option>
          <option value="powershell">POWERSHELL</option>
          <option value="javascript">JAVASCRIPT</option>
          <option value="python">PYTHON</option>
          <option value="cpp">C++</option>
          <option value="csharp">C#</option>
          <option value="go">GO</option>
          <option value="java">JAVA</option>
          <option value="php">PHP</option>
          <option value="ruby">RUBY</option>
          <option value="rust">RUST</option>
          <option value="sql">SQL</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="xml">XML</option>
          <option value="markdown">MARKDOWN</option>
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#00ff41';   // Vert
      case 'Medium': return '#ff8000'; // Orange
      case 'Hard': return '#ff003c';   // Rouge
      case 'Insane': return '#b026ff'; // Violet
      default: return '#00d4ff';       // Bleu par défaut
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
    } catch (err) {
      setError("ERREUR DE SAUVEGARDE DES NOTES.");
    }
  };

  const handleClearNotes = async () => {
    if (!window.confirm("Effacer toutes les notes de cette box ?")) return;
    try {
      await api.patch(`/boxes/${id}`, { notes: '' });
      setNotes('');
      setBox(prev => ({ ...prev, notes: '' }));
      setLastSaved(new Date());
    } catch (err) {
      setError("ERREUR LORS DE LA SUPPRESSION DES NOTES.");
    }
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
            {(userRole === 'pentester' || userRole === 'admin') && (
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
            <button onClick={() => setIsMainPreview(!isMainPreview)} className="preview-toggle-btn">
              {isMainPreview ? <><Code size={14}/> SOURCE</> : <><Eye size={14}/> APERÇU</>}
            </button>
            <button onClick={openNotesModal} className="preview-toggle-btn edit-btn">
              <Edit size={14}/> ÉDITER
            </button>
            <button onClick={handleClearNotes} className="preview-toggle-btn delete-btn">
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
                <option value="HackTheBox">HackTheBox</option>
                <option value="TryHackMe">TryHackMe</option>
                <option value="Root-Me">Root-Me</option>
                <option value="VulnHub">VulnHub</option>
                <option value="Other">Autre</option>
              </select>

              <select className="edit-select" value={editData.difficulty} onChange={e => setEditData({...editData, difficulty: e.target.value})}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Insane">Insane</option>
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

export default BoxDetail;
