import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Wiki.css';

const Wiki = () => {
  const [methodologies, setMethodologies] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Simulation de données style HackTricks
  const mockData = [
    { title: "80 - HTTP", content: "### Enumeration\n`nmap -sV --script http-enum <IP>`\n\n### Tools\n- Gobuster\n- Nikto" },
    { title: "445 - SMB", content: "### Enumeration\n`nmblookup -A <IP>`\n`smbclient -L //<IP>/`" }
  ];

  return (
    <div className="wiki-container">
      {/* Sidebar de navigation des ports */}
      <div className="wiki-sidebar">
        <h3 className="wiki-nav-title">PORTS_METHODS</h3>
        {mockData.map(m => (
          <div 
            key={m.title} 
            className={`wiki-nav-item ${selectedTopic?.title === m.title ? 'active' : ''}`}
            onClick={() => setSelectedTopic(m)}
          >
            {m.title}
          </div>
        ))}
      </div>

      {/* Zone de contenu Markdown */}
      <div className="wiki-content">
        {selectedTopic ? (
          <div className="markdown-body">
            <h1>{selectedTopic.title}</h1>
            <ReactMarkdown>{selectedTopic.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="wiki-placeholder">SÉLECTIONNEZ UN PORT POUR AFFICHER LA MÉTHODOLOGIE_</div>
        )}
      </div>
    </div>
  );
};