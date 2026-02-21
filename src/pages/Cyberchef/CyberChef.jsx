import React from 'react';
import './CyberChef.css';
import { Binary } from 'lucide-react';

const CyberChef = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 768px) {
          .page-header { justify-content: center; text-align: center; }
        }
      `}</style>
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <h2 className="page-title">OPERATION_<span>CYBERCHEF</span></h2>
      </header>
      
      <div className="cyberchef-container">
        <iframe
          src="https://gchq.github.io/CyberChef/?theme=dark"
          title="CyberChef Tool"
          className="cyberchef-frame"
          style={{ filter: 'none' }} // On retire le filtre si le thème dark natif fonctionne
        />
      </div>
    </div>
  );
};

export default CyberChef;