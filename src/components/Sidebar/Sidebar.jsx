import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  ShieldAlert, 
  Target, 
  Box as BoxIcon, 
  Search, 
  LogOut,
  Radio
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
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
      </nav>

      <div className="logout-btn" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Déconnexion</span>
      </div>
    </aside>
  );
};

export default Sidebar;