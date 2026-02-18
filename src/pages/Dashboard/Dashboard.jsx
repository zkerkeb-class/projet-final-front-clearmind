import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Dashboard.css';
import { Terminal, Target, Box, Zap } from 'lucide-react';
import { getUserRole } from '../../utils/auth';
import { ROLES } from '../../utils/constants';

const Dashboard = () => {
  const [stats, setStats] = useState({
    payloads: 0,
    targets: 0,
    compromised: 0,
    inProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const userRole = getUserRole();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // On ne charge que ce qui est autorisé
        const promises = [api.get('/payloads')];
        if (userRole !== ROLES.GUEST) {
          promises.push(api.get('/targets'));
          promises.push(api.get('/boxes'));
        }

        const results = await Promise.all(promises);
        
        const payloadsRes = results[0];
        const targetsRes = userRole !== ROLES.GUEST ? results[1] : { data: { data: { targets: [] } } };
        const boxesRes = userRole !== ROLES.GUEST ? results[2] : { data: { data: { boxes: [] } } };

        const boxes = boxesRes.data.data.boxes || [];

        setStats({
          payloads: payloadsRes.data.data.payloads?.length || 0,
          targets: targetsRes.data.data.targets?.length || 0,
          compromised: boxes.filter(b => ['User-Flag', 'Root-Flag'].includes(b.status)).length,
          inProgress: boxes.filter(b => b.status === 'In-Progress').length
        });
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userRole]);

  return (
    <div className="dashboard-container">
      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <header className="dashboard-header">
        <h2 className="dashboard-title">Terminal_<span>Root</span>@RedSheet</h2>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Payloads Stockés</div>
          <div className="stat-value">{loading ? '...' : stats.payloads}</div>
          <Terminal size={40} style={{position: 'absolute', right: 10, bottom: 10, opacity: 0.1, color: '#00d4ff'}} />
        </div>

        {userRole !== ROLES.GUEST && (
          <>
            <div className="stat-card">
              <div className="stat-label">Cibles Actives</div>
              <div className="stat-value">{loading ? '...' : stats.targets}</div>
              <Target size={40} style={{position: 'absolute', right: 10, bottom: 10, opacity: 0.1, color: '#00d4ff'}} />
            </div>

            <div className="stat-card critical">
              <div className="stat-label">Machines compromises</div>
              <div className="stat-value">{loading ? '...' : String(stats.compromised).padStart(2, '0')}</div>
              <Box size={40} style={{position: 'absolute', right: 10, bottom: 10, opacity: 0.1, color: '#ff003c'}} />
            </div>

            <div className="stat-card">
              <div className="stat-label">Opérations en cours</div>
              <div className="stat-value">{loading ? '...' : String(stats.inProgress).padStart(2, '0')}</div>
              <Zap size={40} style={{position: 'absolute', right: 10, bottom: 10, opacity: 0.1, color: '#00d4ff'}} />
            </div>
          </>
        )}
      </div>

      <div className="activity-section">
         <h3 style={{color: '#ff003c', letterSpacing: '2px', marginBottom: '1rem'}}>LOGS_ACTIVITE_RECENTS</h3>
         <div style={{fontFamily: 'monospace', color: '#00d4ff', backgroundColor: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '4px', border: '1px solid #333'}}>
            <p>{'>'} [SYSTEM] Initialisation du dashboard...</p>
            <p>{'>'} [INFO] Connexion à la base de données établie.</p>
            {!loading && (
              <>
                {userRole === ROLES.GUEST ? (
                  <>
                    <p>{'>'} [SYSTEM] Accès invité restreint.</p>
                    <p>{'>'} [INFO] Consultation de la base de connaissances autorisée.</p>
                  </>
                ) : (
                  <>
                    <p>{'>'} [STATUS] {stats.payloads} vecteurs d'attaque chargés.</p>
                    <p>{'>'} [STATUS] {stats.targets} cibles identifiées dans le scope.</p>
                  </>
                )}
              </>
            )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;