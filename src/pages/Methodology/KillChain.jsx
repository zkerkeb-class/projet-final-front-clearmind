import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import * as LucideIcons from 'lucide-react'; // Importe TOUTES les icônes
import './KillChain.css';
import Skeleton from '../../components/Skeleton/Skeleton';

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

  return (
    <div className="killchain-container">
      <style>{`
        @media (max-width: 768px) {
          .kill-step { flex-direction: column; }
          .step-aside { display: none; } /* On cache la ligne de temps sur mobile pour simplifier */
          
          /* Responsive Header */
          .page-header { flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; }
          .page-title { font-size: 1.2rem; display: flex; justify-content: center; flex-wrap: wrap; gap: 5px; }
        }
      `}</style>
      <header className="page-header">
        <h2 className="page-title">LOCKHEED_MARTIN_<span>KILL_CHAIN</span></h2>
      </header>

      <div className="steps-timeline">
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="kill-step">
              <div className="step-aside">
                <Skeleton width={40} height={40} style={{ borderRadius: '50%' }} />
                <div className="connector-line"></div>
              </div>
              <div className="step-card" style={{ width: '100%' }}>
                <div className="step-icon-wrapper" style={{ background: '#1a1a1a', border: 'none' }}>
                  <Skeleton width={24} height={24} />
                </div>
                <div className="step-info" style={{ width: '100%' }}>
                  <Skeleton width={150} height={24} style={{ marginBottom: '10px' }} />
                  <Skeleton width="90%" height={40} style={{ marginBottom: '15px' }} />
                  <div className="tools-list" style={{ display: 'flex', gap: '10px' }}>
                    <Skeleton width={60} height={20} /><Skeleton width={60} height={20} /><Skeleton width={60} height={20} />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : stages.map((stage) => {
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