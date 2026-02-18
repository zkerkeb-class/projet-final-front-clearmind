import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Radio, ExternalLink, Clock, Search, ShieldAlert, AlertTriangle, X } from 'lucide-react';
import './News.css';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get('/news');
        setArticles(res.data.data.items);
        setLoading(false);
      } catch (err) {
        setError("ÉCHEC DE CONNEXION AUX FLUX DE MENACES.");
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // --- LOGIQUE DE DÉTECTION DE CRITICITÉ ---
  const getCriticality = (title) => {
    const t = title.toLowerCase();
    if (t.includes('critical') || t.includes('rce') || t.includes('zero-day') || t.includes('0-day') || t.includes('pre-auth')) {
      return 'critical';
    }
    if (t.includes('high') || t.includes('exploit') || t.includes('vulnerability') || t.includes('bypass')) {
      return 'high';
    }
    return 'info';
  };

  // --- LOGIQUE DE SURLIGNAGE DES CVE ---
  const highlightContent = (text) => {
    if (!text) return "";
    // Regex pour détecter les formats CVE-XXXX-XXXXX
    const parts = text.split(/(CVE-\d{4}-\d{4,})/g);
    return parts.map((part, i) => 
      part.match(/CVE-\d{4}-\d{4,}/) ? 
      <span key={i} className="cve-highlight">{part}</span> : part
    );
  };

  // Logique de filtrage
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.contentSnippet?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="loading-status">
      <div className="scanner-line"></div>
      SCANNING_GLOBAL_FEEDS...
    </div>
  );

  return (
    <div className="news-container">
      <header className="page-header">
        <div className="header-left">
            <h2 className="page-title">THREAT_<span>INTELLIGENCE</span></h2>
        </div>
        
        <div className="search-bar-container">
            <Search size={18} className="search-icon" />
            <input 
            type="text" 
            placeholder="Filtrer par mot-clé (CVE, OS, Source)..." 
            className="news-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="header-right">
            <div className="live-indicator">
            <Radio size={16} className="pulse-icon" /> 
            <span>{filteredArticles.length} ALERTES_TROUVÉES</span>
            </div>
        </div>
       </header>

      <div className="news-feed">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((item, index) => {
            const level = getCriticality(item.title);
            
            return (
              <article key={index} className={`news-card alert-${level}`}>
                {level === 'critical' && (
                  <div className="critical-badge">
                    <ShieldAlert size={12} /> CRITICAL_THREAT
                  </div>
                )}
                
                <div className="card-header">
                  <span className={`source-tag tag-${item.source.toLowerCase().replace(' ', '-')}`}>
                    {item.source}
                  </span>
                  <span className="news-date">
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    {new Date(item.pubDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="news-item-title">
                  {highlightContent(item.title)}
                </h3>

                <p className="news-snippet">
                  {highlightContent(item.contentSnippet)}
                </p>

                <div className="card-footer">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="analyze-btn">
                    ANALYSER_SOURCE <ExternalLink size={14} />
                  </a>
                </div>
              </article>
            );
          })
        ) : (
          <div className="no-results">AUCUNE_MENACE_CORRESPONDANTE_À_LA_RECHERCHE</div>
        )}
      </div>

      {/* MODALE D'ERREUR */}
      {error && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ background: '#0a0a0a', border: '1px solid #ff003c', padding: '2rem', width: '400px', position: 'relative', boxShadow: '0 0 30px rgba(255, 0, 60, 0.2)' }}>
            <button onClick={() => setError(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              <AlertTriangle size={28} color="#ff003c" />
              <h3 style={{ color: '#ff003c', margin: 0, fontFamily: 'Orbitron, sans-serif', letterSpacing: '1px' }}>ERREUR_RÉSEAU</h3>
            </div>
            
            <p style={{ color: '#e0e0e0', fontFamily: 'monospace', marginBottom: '2rem', lineHeight: '1.5' }}>{error}</p>
            
            <button onClick={() => setError(null)} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #ff003c', color: '#ff003c', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Orbitron, sans-serif', transition: 'all 0.3s' }} onMouseOver={(e) => {e.target.style.background = '#ff003c'; e.target.style.color = '#000'}} onMouseOut={(e) => {e.target.style.background = 'transparent'; e.target.style.color = '#ff003c'}}>ACQUITTER_ERREUR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;