import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
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
  Binary, // Pour CyberChef
  Cpu, // Pour RevShell
  User
} from 'lucide-react';
import './Sidebar.css';
import { ROLES } from '../../utils/constants';
import { getUserRole } from '../../utils/auth';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [userPhoto, setUserPhoto] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Récupération de la photo de profil
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        if (res.data.data.user.photo) {
          setUserPhoto(res.data.data.user.photo);
          setImgError(false); // Réinitialiser l'erreur si une nouvelle image est chargée
        }
      } catch (e) {
        // Ignorer les erreurs silencieusement pour la sidebar
      }
    };
    fetchUser();

    window.addEventListener('user-updated', fetchUser);
    return () => window.removeEventListener('user-updated', fetchUser);
  }, []);
  
  // Récupération du rôle pour l'affichage conditionnel
  const userRole = getUserRole() || ROLES.GUEST;

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
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <ShieldAlert className="sidebar-logo-icon" size={28} color="#00d4ff" />
        <h1 className="sidebar-title">Red<span>Sheet</span></h1>
        
        <Link to="/profile" onClick={handleNavClick} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Mon Profil">
          <div style={{ 
            width: '35px', 
            height: '35px', 
            borderRadius: '50%', 
            border: '2px solid #00d4ff',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000'
          }}>
            {userPhoto && !imgError ? (
              <img 
                src={`http://localhost:5000/img/users/${userPhoto}`} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={() => setImgError(true)}
              />
            ) : (
              <User size={20} color="#00d4ff" />
            )}
          </div>
        </Link>
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

        <NavLink to="/revshell" onClick={handleNavClick} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Cpu size={20} />
          <span>RevShell Gen</span>
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