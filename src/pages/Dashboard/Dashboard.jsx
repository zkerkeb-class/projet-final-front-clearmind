import React from 'react';
import './Dashboard.css';
import { Terminal, Target, Box, Zap } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2 className="dashboard-title">Terminal_<span>Root</span>@RedSheet</h2>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Payloads Stockés</div>
          <div className="stat-value">128</div>
          <Terminal size={40} style={{position: 'absolute', right: 10, bottom: 10, opacity: 0.1, color: '#00d4ff'}} />
        </div>

        <div className="stat-card">
          <div className="stat-label">Cibles Actives</div>
          <div className="stat-value">12</div>
          <Target size={40} style={{position: 'absolute', right: 10, bottom: 10, opacity: 0.1, color: '#00d4ff'}} />
        </div>

        <div className="stat-card critical">
          <div className="stat-label">Machines compromises</div>
          <div className="stat-value">04</div>
          <Box size={40} style={{position: 'absolute', right: 10, bottom: 10, opacity: 0.1, color: '#ff003c'}} />
        </div>

        <div className="stat-card">
          <div className="stat-label">Scans en cours</div>
          <div className="stat-value">02</div>
          <Zap size={40} style={{position: 'absolute', right: 10, bottom: 10, opacity: 0.1, color: '#00d4ff'}} />
        </div>
      </div>

      <div className="activity-section">
         <h3 style={{color: '#ff003c', letterSpacing: '2px', marginBottom: '1rem'}}>LOGS_ACTIVITE_RECENTS</h3>
         <div style={{fontFamily: 'monospace', color: '#00d4ff', backgroundColor: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '4px', border: '1px solid #333'}}>
            <p>{'>'} [INFO] Connexion établie depuis l'IP 192.168.1.45</p>
            <p>{'>'} [WARN] Tentative d'accès non autorisé détectée sur Target_Alpha</p>
            <p>{'>'} [SUCCESS] Nouveau Payload XSS enregistré avec succès</p>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;