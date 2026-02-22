import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Terminal, ChevronLeft, ExternalLink, Copy, Edit, Check } from 'lucide-react';
import './ToolDetail.css';
import { ROLES } from '../../utils/constants';
import Skeleton from '../../components/Skeleton/Skeleton';
import { getUserRole } from '../../utils/auth';
import { useToast } from '../../components/Toast/ToastContext';

const ToolDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { success } = useToast();
  const [copiedId, setCopiedId] = useState(null);

  const userRole = getUserRole();

  useEffect(() => {
    const fetchTool = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await api.get(`/tools/${name}`);
        setTool(res.data.data);
      } catch (err) {
        console.error("Erreur tool:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTool();
  }, [name]);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    success("COMMANDE COPIÉE");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="tool-detail-container">
        <button className="back-btn disabled"><ChevronLeft size={16} /> RETOUR</button>
        <header className="tool-header">
          <div className="tool-title-section">
            <Skeleton width={250} height={40} />
            <Skeleton width={100} height={20} style={{ marginTop: '10px' }} />
          </div>
        </header>
        <section className="tool-description">
          <Skeleton width="100%" height={80} />
        </section>
        <section className="cheatsheet-section">
          <Skeleton width={200} height={24} className="mb-20" />
          <div className="commands-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="command-card skeleton-card">
                <Skeleton width="100%" height="100%" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // --- PAGE D'ERREUR SI L'OUTIL N'EXISTE PAS ---
  if (error) {
    return (
      <div className="tool-detail-container">
        <div className="tool-error-container">
        <button 
          onClick={() => navigate(-1)} 
          className="back-btn back-btn-absolute"
        >
          <ChevronLeft size={16} /> RETOUR
        </button>
        <h2 className="neon-text-red">ALERTE: OUTIL_INTROUVABLE</h2>
        <p>L'outil "{name}" n'est pas encore documenté dans l'arsenal.</p>
        
        {/* On vérifie si l'utilisateur est admin pour afficher le bouton d'ajout */}
        {userRole === ROLES.ADMIN ? (
          <button 
            onClick={() => navigate(`/tools/add/${name}`)} 
            className="btn-deploy"
          >
            DÉPLOYER_LA_FICHE_{name.toUpperCase()}
          </button>
        ) : (
          <p className="notice">Contactez un administrateur pour ajouter cet outil.</p>
        )}
        </div>
      </div>
    );
  }

  return (
    <div className="tool-detail-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ChevronLeft size={16} /> RETOUR
      </button>

      <header className="tool-header">
        <div className="tool-title-section">
          <h1>{tool.name.toUpperCase()}</h1>
          <span className="tool-category-badge">{tool.category}</span>
        </div>
        <div className="tool-actions">
          {userRole === ROLES.ADMIN && (
            <button 
              onClick={() => navigate(`/tools/edit/${tool.name}`)} 
              className="edit-tool-btn"
            >
              <Edit size={14} /> <span className="btn-text">ÉDITER</span>
            </button>
          )}
          {tool.link && (
            <a href={tool.link} target="_blank" rel="noreferrer" className="doc-link">
              DOC_OFFICIELLE <ExternalLink size={14} />
            </a>
          )}
        </div>
      </header>

      <section className="tool-description">
        <p>{tool.description}</p>
      </section>

      {tool.cheatsheet && tool.cheatsheet.length > 0 && (
        <section className="cheatsheet-section">
          <h3><Terminal size={18} /> COMMAND_CHEATSHEET</h3>
          <div className="commands-grid">
            {tool.cheatsheet.map((item, i) => (
              <div key={i} className="command-card">
                <div className="command-header">
                  <code>{item.command}</code>
                  <button onClick={() => handleCopy(item.command, i)} className={`copy-btn ${copiedId === i ? 'copied' : ''}`}>
                    {copiedId === i ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="command-explanation">{item.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ToolDetail;