import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Database, Target, BookOpen, Cpu, ChevronRight } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
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
          <h1 className="hero-title">CENTRALIZED<br/><span>PENTEST_OPERATIONS</span></h1>
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

      <footer className="landing-footer">
        <p>REDSHEET_OPERATING_SYSTEM // v1.0.0</p>
        <p className="copyright">© {new Date().getFullYear()} RedSheet Security. Access Restricted.</p>
      </footer>
    </div>
  );
};

export default Landing;