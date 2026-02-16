import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Copy, Terminal, Search, Plus } from 'lucide-react';
import PayloadModal from '../../components/PayloadModal';
import './Payloads.css';

const Payloads = () => {
  const [payloads, setPayloads] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // État pour la recherche
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPayloads = async () => {
      try {
        const res = await api.get('/payloads');
        setPayloads(res.data.data.payloads);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération :", err);
        setLoading(false);
      }
    };
    fetchPayloads();
  }, []);

  // Logique de filtrage en temps réel
  const filteredPayloads = payloads.filter((p) => {
    const search = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(search) || 
      p.category.toLowerCase().includes(search) ||
      p.code.toLowerCase().includes(search)
    );
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Tu pourrais ajouter un petit toast "Copied!" ici
  };

  return (
    <div className="payloads-container">
      <header className="page-header">
        <h2 className="page-title">DB_<span>PAYLOADS</span></h2>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nouveau Payload
        </button>
      </header>

      <div className="search-bar-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="RECHERCHER UN VECTEUR D'ATTAQUE (XSS, SQLI, ETC...)" 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Mise à jour de l'état
        />
      </div>

      <div className="payload-grid">
        {loading ? (
          <p className="loading-text">ACCÈS AU MAINFRAME EN COURS...</p>
        ) : filteredPayloads.length > 0 ? (
          filteredPayloads.map((p) => (
            <div key={p._id} className="payload-card">
              <div className="payload-badge">{p.category}</div>
              <h3 className="payload-name">{p.title}</h3>
              <div className="code-box">
                <code>{p.code}</code>
                <button onClick={() => copyToClipboard(p.code)} className="copy-btn">
                  <Copy size={16} />
                </button>
              </div>
              <div className="payload-footer">
                <span>
                  SEVERITY: 
                  <span style={{
                    marginLeft: '5px',
                    fontWeight: '900',
                    color: 
                      p.severity === 'Critical' ? '#ff003c' : // Rose Néon
                      p.severity === 'High'     ? '#ff8000' : // Orange Électrique
                      p.severity === 'Medium'   ? '#00d4ff' : // Bleu Cyan
                                                  '#00ff41',  // Vert Matrix pour 'Low'
                    textShadow: (p.severity === 'Critical' || p.severity === 'High') 
                      ? `0 0 8px ${p.severity === 'Critical' ? '#ff003c' : '#ff8000'}` 
                      : 'none'
                  }}>
                    {p.severity?.toUpperCase() || 'MEDIUM'}
                  </span>
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="loading-text" style={{color: '#ff003c'}}>AUCUN RÉSULTAT CORRESPONDANT DANS LA BASE.</p>
        )}
      </div>

      <PayloadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPayloadAdded={(newPayload) => setPayloads([newPayload, ...payloads])}
      />
    </div>
  );
};

export default Payloads;