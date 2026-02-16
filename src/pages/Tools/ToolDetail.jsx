import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Terminal, ChevronLeft, ExternalLink, Copy, AlertTriangle, Search } from 'lucide-react';
import './ToolDetail.css';

const ToolDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const userRole = localStorage.getItem('role');

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

  if (loading) return (
    <div className="loading-status">
      <div className="scanner-line"></div>
      RECHERCHE_DANS_L_ARSENAL...
    </div>
  );

  // --- PAGE D'ERREUR SI L'OUTIL N'EXISTE PAS ---
  if (error) {
    return (
      <div className="tool-error-container">
        <h2 className="neon-text-red">ALERTE: OUTIL_INTROUVABLE</h2>
        <p>L'outil "{name}" n'est pas encore documenté dans l'arsenal.</p>
        
        {/* On vérifie si l'utilisateur est admin pour afficher le bouton d'ajout */}
        {userRole === 'admin' ? (
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
      <button onClick={() => navigate(-1)} className="back-btn">
        <ChevronLeft size={16} /> RETOUR
      </button>

      <header className="tool-header">
        <div className="tool-title-section">
          <h1>{tool.name.toUpperCase()}</h1>
          <span className="tool-category-badge">{tool.category}</span>
        </div>
        {tool.link && (
          <a href={tool.link} target="_blank" rel="noreferrer" className="doc-link">
            DOC_OFFICIELLE <ExternalLink size={14} />
          </a>
        )}
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