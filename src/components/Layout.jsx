import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ 
        marginLeft: '260px', 
        padding: '2.5rem', 
        width: 'calc(100% - 260px)',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;