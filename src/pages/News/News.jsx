import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Radio, ExternalLink, Clock, Search, ShieldAlert } from 'lucide-react';
import './News.css';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get('/news');
        setArticles(res.data.data.items);
        setLoading(false);
      } catch (err) {
        console.error("Erreur news:", err);
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
        <h2 className="page-title">THREAT_<span>INTELLIGENCE</span></h2>
        
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

        <div className="live-indicator">
          <Radio size={16} className="pulse-icon" /> 
          <span>{filteredArticles.length} ALERTES_TROUVÉES</span>
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
    </div>
  );
};

export default News;