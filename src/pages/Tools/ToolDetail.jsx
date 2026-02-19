import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Terminal, ChevronLeft, ExternalLink, Copy, AlertTriangle, Search, Pencil } from 'lucide-react';
import './ToolDetail.css';
import { ROLES } from '../../utils/constants';
import Skeleton from '../../components/Skeleton/Skeleton';
import { getUserRole } from '../../utils/auth';

const ToolDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  if (loading) {
    return (
      <div className="tool-detail-container">
        <button className="back-btn" style={{ pointerEvents: 'none' }}><ChevronLeft size={16} /> RETOUR</button>
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
          <Skeleton width={200} height={24} style={{ marginBottom: '20px' }} />
          <div className="commands-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="command-card" style={{ height: '100px' }}>
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
      <div className="tool-error-container">
        <style>{`
          .btn-deploy {
            margin-top: 1.5rem;
            background: transparent;
            border: 1px solid #00d4ff;
            color: #00d4ff;
            padding: 1rem 2rem;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .btn-deploy:hover {
            background: rgba(0, 212, 255, 0.1);
            box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
            text-shadow: 0 0 5px #00d4ff;
          }
        `}</style>
        <button 
          onClick={() => navigate(-1)} 
          className="back-btn"
          style={{ position: 'absolute', top: '30px', left: '30px' }}
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
    );
  }

  return (
    <div className="tool-detail-container">
      <style>{`
        @media (max-width: 768px) {
          .tool-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .commands-grid { grid-template-columns: 1fr !important; }
        }
        .edit-tool-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid #ffa500;
          color: #ffa500;
          padding: 5px 12px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        .edit-tool-btn:hover {
          background: rgba(255, 165, 0, 0.1);
          box-shadow: 0 0 10px rgba(255, 165, 0, 0.2);
        }
      `}</style>
      <button onClick={() => navigate(-1)} className="back-btn">
        <ChevronLeft size={16} /> RETOUR
      </button>

      <header className="tool-header">
        <div className="tool-title-section">
          <h1>{tool.name.toUpperCase()}</h1>
          <span className="tool-category-badge">{tool.category}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {userRole === ROLES.ADMIN && (
            <button 
              onClick={() => navigate(`/tools/edit/${tool.name}`)} 
              className="edit-tool-btn"
            >
              <Pencil size={14} /> ÉDITER
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
                  <Copy 
                    size={14} 
                    className="copy-icon" 
                    onClick={() => {
                        navigator.clipboard.writeText(item.command);
                        // Optionnel: ajouter un petit feedback ici
                    }} 
                  />
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