import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Database, Target, BookOpen, Cpu, ChevronRight, Activity, Users, Globe, MessageSquare, Star } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = "PENTEST_OPERATIONS";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e) => {
    const x = (window.innerWidth - e.pageX * 2) / 50;
    const y = (window.innerHeight - e.pageY * 2) / 50;
    document.documentElement.style.setProperty('--mouse-x', `${x}px`);
    document.documentElement.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="landing-container" onMouseMove={handleMouseMove}>
      <nav className="landing-nav">
        <div className="landing-logo">
          <Terminal size={24} />
          <span>Red<span>Sheet</span></span>
        </div>
        <div className="landing-links">
          <Link to="/about" className="nav-link">ABOUT</Link>
          <Link to="/login" className="nav-link">LOGIN</Link>
          <Link to="/signup" className="nav-link cta">JOIN_OPERATIONS</Link>
        </div>
      </nav>

      <header className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            CENTRALIZED<br/>
            <span>{typedText}</span><span className="cursor">_</span>
          </h1>
          <p className="hero-subtitle">
            La plateforme ultime pour gérer vos audits de sécurité. 
            Centralisez vos payloads, suivez vos cibles et documentez vos exploits en temps réel.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="hero-btn primary">
              INITIALISER_L_ACCÈS <ChevronRight size={20} />
            </Link>
            <Link to="/login" className="hero-btn secondary">
              CONNEXION_TERMINAL
            </Link>
          </div>
        </div>
        <div className="hero-visual">
           <div className="visual-circle">
             <Shield size={120} strokeWidth={1} />
           </div>
        </div>
      </header>

      <section className="features-grid">
        <div className="feature-card">
          <Database size={40} className="feature-icon" />
          <h3>PAYLOAD_DATABASE</h3>
          <p>Une bibliothèque centralisée pour vos vecteurs d'attaque (XSS, SQLi, RCE). Ne perdez plus jamais vos meilleurs one-liners.</p>
        </div>
        <div className="feature-card">
          <Target size={40} className="feature-icon" />
          <h3>SCOPE_MANAGEMENT</h3>
          <p>Suivi précis des cibles et machines (Boxes). Gérez les statuts (User/Root owned) et les ports ouverts.</p>
        </div>
        <div className="feature-card">
          <BookOpen size={40} className="feature-icon" />
          <h3>KNOWLEDGE_BASE</h3>
          <p>Wiki intégré pour vos méthodologies et cheatsheets. Documentation technique accessible instantanément.</p>
        </div>
        <div className="feature-card">
          <Cpu size={40} className="feature-icon" />
          <h3>TOOL_ARSENAL</h3>
          <p>Gestionnaire d'outils de pentest avec fiches techniques et commandes rapides prêtes à l'emploi.</p>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <Activity size={32} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">99.9%</span>
            <span className="stat-label">SYSTEM_UPTIME</span>
          </div>
        </div>
        <div className="stat-item">
          <Database size={32} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">5,000+</span>
            <span className="stat-label">PAYLOADS_INDEXED</span>
          </div>
        </div>
        <div className="stat-item">
          <Users size={32} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">120+</span>
            <span className="stat-label">ACTIVE_OPERATORS</span>
          </div>
        </div>
        <div className="stat-item">
          <Globe size={32} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">GLOBAL</span>
            <span className="stat-label">THREAT_INTEL</span>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-title">RETOURS_<span>OPÉRATEURS</span></h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-header">
              <MessageSquare size={24} className="quote-icon" />
              <div className="stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#00d4ff" color="#00d4ff" />)}
              </div>
            </div>
            <p>"L'outil ultime pour centraliser nos engagements Red Team. Le module de reporting est un gain de temps phénoménal."</p>
            <div className="testimonial-author">- Sarah C., Lead Pentester</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-header">
              <MessageSquare size={24} className="quote-icon" />
              <div className="stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#00d4ff" color="#00d4ff" />)}
              </div>
            </div>
            <p>"Interface fluide, sombre et efficace. La base de payloads partagée a considérablement accéléré nos phases d'exploitation."</p>
            <div className="testimonial-author">- Marc D., Security Researcher</div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>REDSHEET_OPERATING_SYSTEM // v1.0.0</p>
        <p className="copyright">© {new Date().getFullYear()} RedSheet Security. Access Restricted.</p>
      </footer>
    </div>
  );
};

export default Landing;