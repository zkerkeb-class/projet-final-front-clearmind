import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../../api/axios';
import { ChevronLeft, Save, Hash, Eye, Edit, Settings, X, Target, Code, Trash2 } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import './BoxDetail.css';
import { ROLES, BOX_DIFFICULTIES, BOX_PLATFORMS, IPV4_REGEX, BOX_CATEGORIES, TARGET_OS, BOX_STATUSES } from '../../utils/constants';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import { getDifficultyColor } from '../../utils/helpers';
import CodeBlock from '../../components/CodeBlock/CodeBlock';
import OsIcon from '../../components/OsIcon/OsIcon';


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

  const handleStatusChange = async (newStatus) => {
    try {
      setBox(prev => ({ ...prev, status: newStatus }));
      await api.patch(`/boxes/${id}`, { status: newStatus });
      success("STATUT MIS À JOUR");
    } catch (err) {
      setError("ERREUR DE MISE À JOUR DU STATUT");
    }
  };

  // Ouvrir la modale avec les données actuelles
  const handleEditClick = () => {
    setEditData({
      name: box.name,
      ipAddress: box.ipAddress,
      platform: box.platform,
      difficulty: box.difficulty,
      os: box.os || TARGET_OS.LINUX,
      status: box.status,
      category: box.category || BOX_CATEGORIES.RED
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
    if (!IPV4_REGEX.test(editData.ipAddress)) {
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

  const getCategoryColor = (category) => {
    switch (category) {
      case BOX_CATEGORIES.RED: return '#ff003c';
      case BOX_CATEGORIES.BLUE: return '#00d4ff';
      case BOX_CATEGORIES.PURPLE: return '#bf00ff';
      default: return '#fff';
    }
  };

  if (!box) return <div className="loading-text">CHARGEMENT DU DOSSIER...</div>;

  return (
    <div className="box-detail-container">
      {/* HEADER NAVIGATION */}
      <div className="box-nav-header">
        <button onClick={() => navigate('/boxes')} className="back-btn">
          <ChevronLeft size={16} /> RETOUR_LISTE
        </button>
        <div className="save-status">
          {lastSaved ? `DERNIÈRE MODIF : ${lastSaved.toLocaleTimeString()}` : 'PRÊT'}
          <Save size={16} style={{ opacity: 0.5 }} />
        </div>
      </div>

      <div className="box-layout">
        {/* SIDEBAR : INFOS & TARGETS */}
        <aside className="box-sidebar">
          {/* CARTE IDENTITÉ */}
          <div className="info-card">
            <div className="info-header">
              <OsIcon os={box.os} size={14} color="#fff" />
              <h2>{box.name}</h2>
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <label>ADRESSE IP</label>
                <span>{box.ipAddress}</span>
              </div>
              <div className="info-item">
                <label>PLATEFORME</label>
                <span>{box.platform}</span>
              </div>
              <div className="info-item">
                <label>DIFFICULTÉ</label>
                <span style={{ color: getDifficultyColor(box.difficulty) }}>{box.difficulty}</span>
              </div>
              <div className="info-item">
                <label>CATÉGORIE</label>
                <span style={{ color: getCategoryColor(box.category) }}>{box.category}</span>
              </div>
              <div className="info-item">
                <label>STATUT</label>
                <select 
                  value={box.status} 
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="status-select-detail"
                  style={{ 
                    color: box.status === BOX_STATUSES.ROOT_FLAG ? '#ff003c' : box.status === BOX_STATUSES.USER_FLAG ? '#bf00ff' : box.status === BOX_STATUSES.IN_PROGRESS ? '#ffa500' : '#00d4ff',
                    borderColor: box.status === BOX_STATUSES.ROOT_FLAG ? '#ff003c' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  disabled={!(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN)}
                >
                  <option value={BOX_STATUSES.TODO}>TODO</option>
                  <option value={BOX_STATUSES.IN_PROGRESS}>IN PROGRESS</option>
                  <option value={BOX_STATUSES.USER_FLAG}>USER OWNED</option>
                  <option value={BOX_STATUSES.ROOT_FLAG}>ROOT OWNED</option>
                </select>
              </div>
            </div>

            {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
              <button onClick={handleEditClick} className="config-btn">
                <Settings size={14} /> CONFIGURATION
              </button>
            )}
          </div>

          {/* CARTE CIBLES */}
          <div className="targets-card">
            <div className="card-title">
              <Target size={16} /> SCOPE ({box.linkedTargets?.length || 0})
            </div>
            <div className="targets-list-vertical">
              {box.linkedTargets && box.linkedTargets.length > 0 ? (
                box.linkedTargets.map(t => (
                  <div key={t._id} className="target-item-row">
                    <div className="target-row-header">
                      <span className="t-name">{t.name}</span>
                      <span className="t-ip">{t.ip}</span>
                    </div>
                    <div className="t-ports">
                      {t.ports.map(p => p.port).join(', ')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-targets">Aucune cible liée</div>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN : NOTES */}
        <main className="box-main-content">
          <div className="notes-wrapper">
            <div className="notes-toolbar">
              <div className="tab-label">
                <Hash size={14} /> MISSION_NOTES.md
              </div>
              <div className="notes-actions">
                <button onClick={() => setIsMainPreview(!isMainPreview)} className="icon-action source-btn" title={isMainPreview ? "Voir Source" : "Voir Aperçu"}>
                  {isMainPreview ? <Code size={16}/> : <Eye size={16}/>}
                </button>
                {(userRole === ROLES.PENTESTER || userRole === ROLES.ADMIN) && (
                  <>
                    <button onClick={openNotesModal} className="icon-action edit-btn" title="Éditer">
                      <Edit size={16}/>
                    </button>
                    <button onClick={() => setShowClearConfirm(true)} className="icon-action delete-btn" title="Effacer">
                      <Trash2 size={16}/>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="notes-viewer">
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
          </div>
        </main>
      </div>

      {/* MODALE D'ÉDITION */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setShowEditModal(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h3 className="modal-title">CONFIGURATION_CIBLE</h3>
            
            <form onSubmit={handleEditSubmit} className="edit-form config-form">
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

              <select className="edit-select" value={editData.os} onChange={e => setEditData({...editData, os: e.target.value})}>
                <option value={TARGET_OS.LINUX}>Linux</option>
                <option value={TARGET_OS.WINDOWS}>Windows</option>
                <option value={TARGET_OS.MACOS}>MacOS</option>
                <option value={TARGET_OS.ANDROID}>Android</option>
              </select>

              <select className="edit-select" value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})}>
                <option value={BOX_CATEGORIES.RED}>Red Team</option>
                <option value={BOX_CATEGORIES.BLUE}>Blue Team</option>
                <option value={BOX_CATEGORIES.PURPLE}>Purple Team</option>
              </select>

              <button type="submit" className="save-btn">
                <Save size={18} /> ENREGISTRER LES MODIFICATIONS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE D'ÉDITION DES NOTES */}
      {showNotesModal && (
        <div className="modal-overlay">
          <div className="modal-content notes-modal-content">
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

              <button type="submit" className="save-btn">
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
