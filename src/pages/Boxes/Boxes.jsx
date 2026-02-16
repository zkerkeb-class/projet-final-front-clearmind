import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Monitor, ShieldAlert, Cpu } from 'lucide-react';
import './Boxes.css';

const Boxes = () => {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const res = await api.get('/boxes');
        setBoxes(res.data.data.boxes);
        setLoading(false);
      } catch (err) {
        console.error("Erreur de récupération des boxes:", err);
        setLoading(false);
      }
    };
    fetchBoxes();
  }, []);

  if (loading) return <div className="loading-text">ACCÈS AU SEGMENT ISOLÉ...</div>;

  return (
    <div className="boxes-container">
      <header className="page-header">
        <h2 className="page-title">ACTIVE_<span>BOXES</span></h2>
      </header>

      <div className="boxes-grid">
        {boxes.map(box => (
          <div key={box._id} className="box-card">
            {/* Mapping de tes difficultés réelles */}
            <div className="box-difficulty" style={{ color: box.difficulty === 'Insane' ? '#ff003c' : '#00ff41' }}>
              {box.difficulty?.toUpperCase()}
            </div>
            
            <Monitor size={32} color="#00d4ff" />
            <h3 style={{ marginTop: '1rem' }}>{box.name}</h3>
            <p style={{ color: '#555', fontSize: '0.8rem' }}>{box.ipAddress} @ {box.platform}</p>

            <div className="difficulty-bar">
              <div 
                className="difficulty-fill" 
                style={{ 
                  // Logique de progression basée sur ton enum status
                  width: box.status === 'Root-Flag' ? '100%' : box.status === 'User-Flag' ? '50%' : '10%', 
                  backgroundColor: box.status === 'Root-Flag' ? '#ff003c' : '#00d4ff' 
                }} 
              />
            </div>

            <div className="box-info">
              <span>STATUT: {box.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Boxes;