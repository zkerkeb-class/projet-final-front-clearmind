import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  ShieldAlert, 
  Target, 
  Box as BoxIcon, 
  Search, 
  LogOut,
  Radio,
  Layers,
  BookOpen,
  ShieldCheck, // Ajout de l'icône Admin
  Binary // Pour CyberChef
} from 'lucide-react';
import './Sidebar.css';
import { ROLES } from '../../utils/constants';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // Récupération du rôle pour l'affichage conditionnel
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // Nettoyage du rôle au logout
    navigate('/login');
  };

  // Gestion du clic sur un lien pour fermer le menu sur mobile
  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
    <style>{`
      @media (max-width: 992px) {
        .sidebar {
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
          position: fixed !important;
          z-index: 1500;
          height: 100vh;
          overflow-y: auto;
        }
        .sidebar.open { transform: translateX(0); }
      }
    `}</style>
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <ShieldAlert className="sidebar-logo-icon" size={28} color="#00d4ff" />
        <h1 className="sidebar-title">Red<span>Sheet</span></h1>
      </div>

      <nav className="nav-links">
        <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Terminal size={20} />
          <span>Tableau de bord</span>
        </NavLink>

        <NavLink to="/payloads" onClick={handleNavClick} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Search size={20} />
          <span>Payloads</span>
        </NavLink>

        {userRole !== ROLES.GUEST && (
          <>
            <NavLink to="/targets" onClick={handleNavClick} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Target size={20} />
              <span>Targets</span>
            </NavLink>
            <NavLink to="/boxes" onClick={handleNavClick} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <BoxIcon size={20} />
              <span>Machines (Boxes)</span>
            </NavLink>
          </>
        )}
        
        <NavLink to="/news" onClick={handleNavClick} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Radio size={20} />
          <span>Veille Cyber</span>
        </NavLink>

        <NavLink to="/killchain" onClick={handleNavClick} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Layers size={20} />
          <span>Kill Chain</span>
        </NavLink>

        <NavLink to="/wiki" onClick={handleNavClick} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <BookOpen size={20} />
          <span>Wiki / KB</span>
        </NavLink>

        <NavLink to="/cyberchef" onClick={handleNavClick} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Binary size={20} />
          <span>CyberChef</span>
        </NavLink>

        {/* --- SECTION ADMIN --- */}
        {userRole === ROLES.ADMIN && (
          <NavLink to="/admin" onClick={handleNavClick} className={({ isActive }) => isActive ? "nav-item admin-item active" : "nav-item admin-item"}>
            <ShieldCheck size={20} color="#ff003c" />
            <span style={{ color: '#ff003c', fontWeight: 'bold' }}>PANEL ADMIN</span>
          </NavLink>
        )}
      </nav>

      <div className="logout-btn" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Déconnexion</span>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;