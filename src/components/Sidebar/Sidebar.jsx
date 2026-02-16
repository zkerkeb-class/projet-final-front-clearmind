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
  ShieldCheck // Ajout de l'icône Admin
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  
  // Récupération du rôle pour l'affichage conditionnel
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // Nettoyage du rôle au logout
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <ShieldAlert className="sidebar-logo-icon" size={28} color="#00d4ff" />
        <h1 className="sidebar-title">Red<span>Sheet</span></h1>
      </div>

      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Terminal size={20} />
          <span>Tableau de bord</span>
        </NavLink>

        <NavLink to="/payloads" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Search size={20} />
          <span>Payloads</span>
        </NavLink>

        <NavLink to="/targets" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Target size={20} />
          <span>Targets</span>
        </NavLink>

        <NavLink to="/boxes" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <BoxIcon size={20} />
          <span>Machines (Boxes)</span>
        </NavLink>

        <NavLink to="/news" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Radio size={20} />
          <span>Veille Cyber</span>
        </NavLink>

        <NavLink to="/killchain" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Layers size={20} />
          <span>Kill Chain</span>
        </NavLink>

        {/* --- SECTION ADMIN --- */}
        {userRole === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-item admin-item active" : "nav-item admin-item"}>
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
  );
};

export default Sidebar;