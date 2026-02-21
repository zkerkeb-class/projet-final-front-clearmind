import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, Mail, User, Upload, Terminal, AlertTriangle, Check, Image, ChevronLeft } from 'lucide-react';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Regex de validation
  const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
  
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      // Validation Frontend (Taille & Type)
      if (selected.size > 2 * 1024 * 1024) {
        setError("Le fichier est trop volumineux (Max 2MB).");
        return;
      }
      if (!selected.type.startsWith('image/')) {
        setError("Seuls les fichiers images sont autorisés.");
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validation des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!PWD_REGEX.test(formData.password)) {
      setError("Le mot de passe ne respecte pas les critères de sécurité.");
      return;
    }

    setLoading(true);

    // 2. Préparation du FormData (Multipart)
    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    if (file) {
      data.append('photo', file);
    }

    try {
      // Route backend pour l'inscription
      const res = await api.post('/users/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Connexion automatique après inscription
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Link to="/" className="home-link">
        <ChevronLeft size={16} /> RETOUR_ACCUEIL
      </Link>
      <div className="signup-card">
        <div className="signup-header">
          <Terminal className="signup-logo" size={40} />
          <h2 className="signup-title">Red<span>Sheet</span></h2>
          <p className="signup-subtitle">Création de compte opérateur</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="signup-form-grid">
            <div className="form-group">
              <User className="form-icon" size={18} />
              <input
                type="text"
                required
                className="form-input"
                placeholder="Nom d'utilisateur"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div className="form-group">
              <Mail className="form-icon" size={18} />
              <input
                type="email"
                required
                className="form-input"
                placeholder="Email professionnel"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <Lock className="form-icon" size={18} />
              <input
                type="password"
                required
                className="form-input"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="form-group">
              <Lock className="form-icon" size={18} />
              <input
                type="password"
                required
                className="form-input"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          {/* Indicateurs de force du mot de passe */}
          <div className="password-requirements">
            <span className={`req-item ${formData.password.length >= 8 ? 'valid' : 'invalid'}`}>• 8+ Chars</span>
            <span className={`req-item ${/[A-Z]/.test(formData.password) ? 'valid' : 'invalid'}`}>• 1 Maj</span>
            <span className={`req-item ${/[!@#\$%\^&\*]/.test(formData.password) ? 'valid' : 'invalid'}`}>• 1 Spécial</span>
          </div>

          <div className="file-input-wrapper">
            <label htmlFor="pfp-upload" className="file-input-label">
              {file ? <Check size={16} color="#00ff41"/> : <Upload size={16} />}
              {file ? file.name : "Uploader Photo de Profil (Optionnel)"}
            </label>
            <input 
              id="pfp-upload" 
              type="file" 
              accept="image/png, image/jpeg, image/jpg" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            {file && <Image size={20} color="#00d4ff" className="file-input-icon" />}
          </div>

          {error && (
            <div className="error-message">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'INITIALISATION...' : 'ENREGISTRER LE COMPTE'}
          </button>
        </form>

        <div className="auth-footer">
          Déjà un accès ? <Link to="/login" className="auth-link">Se connecter</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
