import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import * as LucideIcons from 'lucide-react'; // Importe TOUTES les icônes
import './KillChain.css';

const KillChain = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKillChain = async () => {
      try {
        const res = await api.get('/methodology/kill-chain');
        setStages(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur KillChain:", err);
        setLoading(false);
      }
    };
    fetchKillChain();
  }, []);

  if (loading) return <div className="loading-status">CHARGEMENT_METHODOLOGIE...</div>;

  return (
    <div className="killchain-container">
      <style>{`
        @media (max-width: 768px) {
          .kill-step { flex-direction: column; }
          .step-aside { display: none; } /* On cache la ligne de temps sur mobile pour simplifier */
        }
      `}</style>
      <header className="page-header">
        <h2 className="page-title">LOCKHEED_MARTIN_<span>KILL_CHAIN</span></h2>
      </header>

      <div className="steps-timeline">
        {stages.map((stage) => {
          // Astuce : Récupère l'icône dynamiquement par son nom
          const IconComponent = LucideIcons[stage.iconName] || LucideIcons.Shield;

          return (
            <div key={stage._id} className="kill-step">
              <div className="step-aside">
                <div className="step-id">{stage.stageNumber.toString().padStart(2, '0')}</div>
                <div className="connector-line"></div>
              </div>
              
              <div className="step-card">
                <div className="step-icon-wrapper">
                  <IconComponent size={24} />
                </div>
                <div className="step-info">
                  <h3>{stage.title.toUpperCase()}</h3>
                  <p>{stage.description}</p>
                  <div className="tools-list">
                    {stage.tools.map(toolName => (
                      <Link 
                        key={toolName} 
                        to={`/tools/${toolName.toLowerCase()}`} 
                        className="kill-tool-tag clickable"
                      >
                        {toolName}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KillChain;