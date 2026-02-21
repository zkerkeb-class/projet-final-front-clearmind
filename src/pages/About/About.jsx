import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Users, Code, Shield, ChevronLeft, Github, Linkedin, Database, Server, Cpu, Globe } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <nav className="about-nav">
        <Link to="/" className="back-link">
          <ChevronLeft size={20} /> RETOUR_ACCUEIL
        </Link>
        <div className="about-logo">
          <Terminal size={24} />
          <span>Red<span>Sheet</span></span>
        </div>
      </nav>

      <header className="about-header">
        <h1 className="about-title">PROJECT_<span>ORIGIN</span></h1>
        <p className="about-subtitle">
          RedSheet est né de la collaboration de deux passionnés de cybersécurité, 
          unis par la volonté de simplifier la gestion des opérations de Red Teaming.
        </p>
      </header>

      <section className="creators-section">
        <h2 className="section-title"><Users size={24} /> THE_CREATORS</h2>
        <div className="creators-grid">
          <div className="creator-card">
            <div className="creator-avatar">
              <Code size={40} />
            </div>
            <h3>NICOLAS_P_</h3>
            <p className="creator-role">Fullstack Developer & Pentester</p>
            <p className="creator-desc">
              Architecte de l'infrastructure et développeur principal. 
              Passionné par l'automatisation et le développement d'outils offensifs.
            </p>
            <div className="creator-socials">
              <a href="#" className="social-link"><Github size={18} /></a>
              <a href="#" className="social-link"><Linkedin size={18} /></a>
            </div>
          </div>

          <div className="creator-card">
            <div className="creator-avatar">
              <Shield size={40} />
            </div>
            <h3>MELINDA_B_</h3>
            <p className="creator-role">Security Researcher & Red Teamer</p>
            <p className="creator-desc">
              Expert en méthodologies d'intrusion et analyse de vulnérabilités. 
              Garant de la pertinence technique des outils intégrés.
            </p>
            <div className="creator-socials">
              <a href="#" className="social-link"><Github size={18} /></a>
              <a href="#" className="social-link"><Linkedin size={18} /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="tech-stack-section">
        <h2 className="section-title"><Cpu size={24} /> ARCHITECTURE_SYSTÈME</h2>
        <div className="tech-grid">
          <div className="tech-card">
            <Globe size={32} className="tech-icon" />
            <h4>FRONTEND_CORE</h4>
            <p className="blurred-text" title="CLASSIFIED">Visual Basic 6 GUI Interface</p>
          </div>
          <div className="tech-card">
            <Server size={32} className="tech-icon" />
            <h4>BACKEND_API</h4>
            <p className="blurred-text" title="CLASSIFIED">Windows 95 Batch Scripts</p>
          </div>
          <div className="tech-card">
            <Database size={32} className="tech-icon" />
            <h4>DATA_PERSISTENCE</h4>
            <p className="blurred-text" title="CLASSIFIED">Post-it notes on a wall</p>
          </div>
          <div className="tech-card">
            <Shield size={32} className="tech-icon" />
            <h4>SECURITY_LAYER</h4>
            <p className="blurred-text" title="CLASSIFIED">We asked nicely not to hack us</p>
          </div>
        </div>
      </section>

      <section className="mission-section">
        <div className="mission-content">
          <h2>NOTRE_MISSION</h2>
          <p>
            Dans un paysage de menaces en constante évolution, l'organisation est la clé. 
            RedSheet vise à fournir une plateforme centralisée, sécurisée et efficace pour 
            les professionnels de la sécurité offensive.
          </p>
          <p>
            Plus qu'un simple dashboard, c'est un véritable système d'exploitation pour vos engagements.
          </p>
        </div>
      </section>

      <footer className="about-footer">
        <p>© {new Date().getFullYear()} RedSheet Security. Made with &lt;3 and code.</p>
      </footer>
    </div>
  );
};

export default About;