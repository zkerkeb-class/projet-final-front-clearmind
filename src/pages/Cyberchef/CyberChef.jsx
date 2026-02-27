import React from 'react';
import './CyberChef.css';

const CyberChef = () => {
  return (
    <div className="cyberchef-wrapper">
      
       <header className="page-header cyberchef-header">
        <h2 className="page-title">OPERATION_<span>CYBERCHEF</span></h2>
      </header>
      
      <div className="cyberchef-container">
        <iframe
          src="https://gchq.github.io/CyberChef/?theme=dark"
          title="CyberChef Tool"
          className="cyberchef-frame"
        />
      </div>
    </div>
  );
};

export default CyberChef;