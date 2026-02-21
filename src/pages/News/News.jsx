import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Radio, ExternalLink, Clock, Search, ShieldAlert, Filter, ArrowUpDown, Calendar, RefreshCw, RotateCcw, CheckSquare, Square } from 'lucide-react';
import './News.css';
import Skeleton from '../../components/Skeleton/Skeleton';
import ErrorModal from '../../components/ErrorModal/ErrorModal';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [activeLevels, setActiveLevels] = useState(['critical', 'high', 'medium', 'low']);
  const [activeSources, setActiveSources] = useState([]);
  const [sortDesc, setSortDesc] = useState(true); // true = plus récent en premier

  const fetchNews = async (init = false) => {
    if (!init) setLoading(true);
    try {
      const res = await api.get('/news');
      setArticles(res.data.data.items);
      // Si c'est l'initialisation, on active toutes les sources par défaut
      if (init) {
        const uniqueSources = [...new Set(res.data.data.items.map(item => item.source))];
        setActiveSources(uniqueSources);
      }
      setLoading(false);
    } catch (err) {
      setError("ÉCHEC DE CONNEXION AUX FLUX DE MENACES.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(true);
  }, []);

  // --- LOGIQUE DE DÉTECTION DE CRITICITÉ ---
  const getCriticality = (title) => {
    const t = title.toLowerCase();
    if (t.includes('critical') || t.includes('rce') || t.includes('zero-day') || t.includes('0-day') || t.includes('pre-auth')) {
      return 'critical';
    }
    if (t.includes('high') || t.includes('exploit') || t.includes('vulnerability') || t.includes('bypass') || t.includes('cve')) {
      return 'high';
    }
    if (t.includes('malware') || t.includes('ransomware') || t.includes('backdoor') || t.includes('trojan') || t.includes('campaign') || t.includes('attack') || t.includes('breach') || t.includes('hack')) {
      return 'medium';
    }
    return 'low';
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

  // --- GESTION DES FILTRES ---
  const toggleLevel = (level) => {
    setActiveLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleSource = (source) => {
    setActiveSources(prev => 
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

  const selectAllSources = () => setActiveSources(allSources);
  const deselectAllSources = () => setActiveSources([]);

  const resetFilters = () => {
    setSearchTerm("");
    setActiveLevels(['critical', 'high', 'medium', 'low']);
    setActiveSources(allSources);
    setSortDesc(true);
  };

  // --- LOGIQUE DE FILTRAGE COMBINÉE ---
  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.contentSnippet?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const level = getCriticality(article.title);
      const matchesLevel = activeLevels.includes(level);
      const matchesSource = activeSources.includes(article.source);

      return matchesSearch && matchesLevel && matchesSource;
    })
    .sort((a, b) => {
      return sortDesc ? new Date(b.pubDate) - new Date(a.pubDate) : new Date(a.pubDate) - new Date(b.pubDate);
    });

  // Liste unique des sources pour l'affichage des filtres
  const allSources = [...new Set(articles.map(item => item.source))];

  return (
    <div className="news-container">
      <header className="page-header">
        <div className="header-left">
            <h2 className="page-title">THREAT_<span>INTELLIGENCE</span></h2>
        </div>
        
        <div className="news-search-container">
            <Search size={18} className="news-search-icon" />
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
              <span>{filteredArticles.length} ALERTES</span>
            </div>
            <button 
              className="sort-btn" 
              onClick={() => setSortDesc(!sortDesc)}
              title={sortDesc ? "Plus récent en premier" : "Plus ancien en premier"}
            >
              <Calendar size={14} />
              {sortDesc ? "RÉCENT" : "ANCIEN"}
              <ArrowUpDown size={14} />
            </button>
        </div>
       </header>

      {/* BARRE DE FILTRES AVANCÉS */}
      <div className="filters-section">
        <button 
          className="icon-btn refresh-btn refresh-btn-absolute" 
          onClick={() => fetchNews(false)}
          title="Rafraîchir les flux"
        >
          <RefreshCw size={16} />
        </button>
        <div className="filter-group sources">
          <div className="filter-header">
            <span className="filter-label"><Filter size={12} /> SOURCES :</span>
            <div className="mini-actions">
              <button 
                onClick={selectAllSources} 
                title="Tout sélectionner"
                className={activeSources.length === allSources.length && allSources.length > 0 ? 'active' : ''}
              >
                <CheckSquare size={10} /> TOUT
              </button>
              <button 
                onClick={deselectAllSources} 
                title="Tout désélectionner"
                className={activeSources.length === 0 ? 'active' : ''}
              >
                <Square size={10} /> RIEN
              </button>
            </div>
          </div>
          <div className="sources-list">
            {allSources.map(source => (
              <button 
                key={source}
                className={`filter-chip ${activeSources.includes(source) ? 'active' : ''}`}
                onClick={() => toggleSource(source)}
              >
                {source}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group levels">
          <span className="filter-label">FILTRER_PAR_CRITICITÉ :</span>
          <div className="threat-legend interactive">
            {['critical', 'high', 'medium', 'low'].map(level => (
              <div 
                key={level}
                className={`legend-item ${activeLevels.includes(level) ? 'active' : 'inactive'}`}
                onClick={() => toggleLevel(level)}
              >
                <span className={`legend-dot ${level}`}></span>
                {level.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <div className="filter-actions-right">
          <button className="reset-filters-btn" onClick={resetFilters}>
            <RotateCcw size={12} /> RÉINITIALISER
          </button>
        </div>
      </div>

      <div className="news-feed">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="news-card skeleton-news-card">
              <div className="card-header skeleton-header">
                <Skeleton width={100} height={20} />
                <Skeleton width={80} height={16} />
              </div>
              <Skeleton width="70%" height={24} style={{ marginBottom: '1rem' }} />
              <Skeleton width="100%" height={60} />
            </div>
          ))
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map((item, index) => {
            const level = getCriticality(item.title);
            const sourceColor = item.color || '#00d4ff';
            
            return (
              <article 
                key={index} 
                className={`news-card alert-${level}`}
              >
                {level === 'critical' && (
                  <div className="critical-badge">
                    <ShieldAlert size={12} /> CRITICAL_THREAT
                  </div>
                )}
                
                <div className="card-header">
                  <span 
                    className="source-tag"
                    style={{ 
                      color: sourceColor, 
                      border: `1px solid ${sourceColor}`, 
                      backgroundColor: `${sourceColor}1a` 
                    }}
                  >
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
      <ErrorModal 
        isOpen={!!error} 
        onClose={() => setError(null)} 
        message={error} 
        title="ERREUR_RÉSEAU"
      />
    </div>
  );
};

export default News;