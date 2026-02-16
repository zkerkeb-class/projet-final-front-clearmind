import React, { useState } from 'react';
import api from '../../api/axios';
import { Lock, Mail, Terminal } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post('/users/login', formData);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', res.data.role); 
    
    window.location.href = '/dashboard';
  } catch (err) {
    setError(err.response?.data?.message || 'Erreur de connexion');
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Terminal className="login-logo" size={48} />
          <h2 className="login-title">
            Red<span>Sheet</span>
          </h2>
          <p className="login-subtitle">Authentification requise</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <Mail className="form-icon" size={20} />
            <input
              type="email"
              required
              className="form-input"
              placeholder="Email"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <Lock className="form-icon" size={20} />
            <input
              type="password"
              required
              className="form-input"
              placeholder="Mot de passe"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button">
            Initialiser la session
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;