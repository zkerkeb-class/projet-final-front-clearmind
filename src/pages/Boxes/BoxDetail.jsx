import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../../api/axios';
import { ChevronLeft, Save, Monitor, Hash, Activity, Eye, Edit, Copy, Check, Settings, X, Target, AlertTriangle } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import './BoxDetail.css';

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (inline) {
    return <code className={className} {...props}>{children}</code>;
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <span className="code-lang">{className ? className.replace('language-', '') : 'TEXT'}</span>
        <button onClick={handleCopy} className="copy-code-btn" title="Copier">
          {isCopied ? <Check size={14} color="#00ff41" /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="code-pre">
        <code className={className} {...props}>{children}</code>
      </pre>
    </div>
  );
};

const BoxDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [box, setBox] = useState(null);
  const [notes, setNotes] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const userRole = getUserRole();

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

  // Sauvegarde automatique (Debounce)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (box && notes !== box.notes) {
        setSaving(true);
        try {
          await api.patch(`/boxes/${id}`, { notes });
          setLastSaved(new Date());
          // Mettre à jour l'état local pour éviter de resauvegarder si rien ne change
          setBox(prev => ({ ...prev, notes })); 
        } catch (err) {
          console.error("Erreur de sauvegarde auto");
        } finally {
          setSaving(false);
        }
      }
    }, 2000); // Sauvegarde 2s après la dernière frappe

    return () => clearTimeout(timeoutId);
  }, [notes, id, box]);

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

  const handleEditSubmit = async (e) => {
    e.preventDefault();

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
            <span style={{ color: box.difficulty === 'Insane' ? '#ff003c' : '#00ff41' }}>
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
          {saving ? 'SAUVEGARDE...' : lastSaved ? `ENREGISTRÉ À ${lastSaved.toLocaleTimeString()}` : 'PRÊT'}
          <Save size={16} style={{ opacity: saving ? 1 : 0.5 }} />
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
                <span className="target-name">{t.name}</span>
                <span className="target-ip">{t.ip}</span>
                {t.ports && t.ports.length > 0 && (
                  <span className="target-ports">[{t.ports.join(', ')}]</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="editor-wrapper">
        <div className="editor-toolbar">
          <span>NOTES_DE_MISSION.md</span>
          <button 
            onClick={() => setIsPreview(!isPreview)} 
            className="preview-toggle-btn"
          >
            {isPreview ? <><Edit size={14}/> ÉDITER</> : <><Eye size={14}/> APERÇU</>}
          </button>
        </div>
        {isPreview ? (
          <div className="markdown-preview">
            <ReactMarkdown 
              components={{
                code: CodeBlock,
                pre: ({children}) => <>{children}</>
              }}
            >
              {notes}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            className="markdown-editor"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="# Writeup & Notes&#10;&#10;- [ ] Scan Nmap&#10;- [ ] Enumération Web&#10;- [ ] User Flag..."
          />
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