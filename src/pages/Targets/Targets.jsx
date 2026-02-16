import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Server, ShieldCheck, Activity, Loader } from 'lucide-react';
import './Targets.css';

const Targets = () => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = await api.get('/targets');
        // On adapte selon la structure de ta réponse API (souvent res.data.data.targets)
        setTargets(res.data.data.targets); 
        setLoading(false);
      } catch (err) {
        console.error("Erreur de récupération des cibles:", err);
        setLoading(false);
      }
    };
    fetchTargets();
  }, []);

  if (loading) return <div className="loading-text">SCAN DES RÉSEAUX EN COURS...</div>;

  return (
    <div className="targets-container">
      <header className="page-header">
        <h2 className="page-title">SYSTEM_<span>TARGETS</span></h2>
      </header>

      <table className="targets-table">
        <thead>
          <tr>
            <th>Nom du Host</th>
            <th>Adresse IP</th>
            <th>OS</th>
            <th>Ports Ouverts</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {targets.map((t) => (
            <tr key={t._id} className="target-row">
              <td><Server size={14} style={{marginRight: '10px', color: '#00d4ff'}} /> {t.name}</td>
              <td>{t.domain || "N/A"}</td>
              {/* On affiche le premier élément du scope ou un message */}
              <td>{t.scope?.[0] || "No scope defined"}</td>
              <td style={{color: '#4df3ff'}}>{t.techStack?.join(', ') || "Scanning..."}</td>
              <td>
                <span className="status-badge" style={{
                  backgroundColor: t.status === 'Active' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 0, 60, 0.1)',
                  color: t.status === 'Active' ? '#00d4ff' : '#ff003c',
                  border: `1px solid ${t.status === 'Active' ? '#00d4ff' : '#ff003c'}`
                }}>
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Targets;