import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import './Layout.css';
import CyberChef from '../pages/CyberChef/CyberChef';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isCyberChef = location.pathname === '/cyberchef';

  return (
    <div className="app-layout">
      {/* Bouton Mobile */}
      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay pour fermer en cliquant à côté */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="main-content">
        {/* CyberChef est toujours monté mais caché si on n'est pas sur la route */}
        <div style={{ display: isCyberChef ? 'block' : 'none', height: '100%' }}>
          <CyberChef />
        </div>

        {/* Le contenu des autres pages est caché quand on est sur CyberChef */}
        <div style={{ display: !isCyberChef ? 'block' : 'none', height: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;