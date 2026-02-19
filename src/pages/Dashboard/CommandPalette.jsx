import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Terminal, Box, Target, FileText, Shield, Command, Layers, Binary, Cpu } from 'lucide-react';
import './CommandPalette.css';
import { ROLES } from '../../utils/constants';
import { getUserRole } from '../../utils/auth';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  
  // Récupération du rôle (depuis localStorage pour être synchrone et rapide)
  const userRole = getUserRole();

  const actions = [
    { id: 'dash', label: 'Go to Dashboard', icon: <Terminal size={18} />, path: '/dashboard', roles: [] },
    { id: 'payloads', label: 'Database Payloads', icon: <Search size={18} />, path: '/payloads', roles: [] },
    { id: 'targets', label: 'Scope / Targets', icon: <Target size={18} />, path: '/targets', roles: [ROLES.PENTESTER, ROLES.ADMIN] },
    { id: 'boxes', label: 'Active Boxes', icon: <Box size={18} />, path: '/boxes', roles: [ROLES.PENTESTER, ROLES.ADMIN] },
    { id: 'news', label: 'Threat Intelligence', icon: <FileText size={18} />, path: '/news', roles: [] },
    { id: 'killchain', label: 'Kill Chain Methodology', icon: <Layers size={18} />, path: '/killchain', roles: [] },
    { id: 'wiki', label: 'Knowledge Base', icon: <Shield size={18} />, path: '/wiki', roles: [] },
    { id: 'cyberchef', label: 'Open CyberChef', icon: <Binary size={18} />, path: '/cyberchef', roles: [] },
    { id: 'revshell', label: 'Reverse Shell Generator', icon: <Cpu size={18} />, path: '/revshell', roles: [] },
  ];

  const filteredActions = actions.filter(action => 
    (action.roles.length === 0 || action.roles.includes(userRole)) &&
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (action) => {
    navigate(action.path);
    setIsOpen(false);
  };

  // Navigation au clavier
  useEffect(() => {
    const handleListNav = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          handleSelect(filteredActions[selectedIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleListNav);
    return () => window.removeEventListener('keydown', handleListNav);
  }, [isOpen, filteredActions, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="palette-overlay" onClick={() => setIsOpen(false)}>
      <div className="palette-modal" onClick={e => e.stopPropagation()}>
        <div className="palette-search">
          <Command className="palette-icon" size={20} />
          <input
            autoFocus
            type="text"
            placeholder="Exécuter une commande..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <span className="palette-hint">ESC to close</span>
        </div>
        <div className="palette-results">
          {filteredActions.map((action, index) => (
            <div
              key={action.id}
              className={`palette-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(action)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="item-icon">{action.icon}</span>
              <span className="item-label">{action.label}</span>
              {index === selectedIndex && <span className="item-enter">↵</span>}
            </div>
          ))}
          {filteredActions.length === 0 && (
            <div className="palette-empty">Aucun résultat</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;