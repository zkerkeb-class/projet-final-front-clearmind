import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import './Layout.css';
import CyberChef from '../pages/Cyberchef/CyberChef';
import CommandPalette from './CommandPalette/CommandPalette';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isCyberChef = location.pathname === '/cyberchef';

  return (
    <div className="app-layout">
      {/* Palette de commande globale (Ctrl+K) */}
      <CommandPalette />

      {/* Bouton Mobile */}
      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay pour fermer en cliquant à côté */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="main-content">
        {/* CyberChef est toujours monté mais caché si on n'est pas sur la route */}
        {/* On utilise position absolute + left négatif au lieu de display: none pour que l'iframe s'initialise correctement */}
        <div style={{ 
          height: '100%',
          width: '100%',
          position: isCyberChef ? 'relative' : 'absolute',
          left: isCyberChef ? 'auto' : '-10000px',
          visibility: isCyberChef ? 'visible' : 'hidden'
        }}>
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