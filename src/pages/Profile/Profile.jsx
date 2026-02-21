import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { User, Mail, Lock, Save, Camera, Shield, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { useToast } from '../../components/Toast/ToastContext';
import './Profile.css';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';

const Profile = () => {
  const { addToast } = useToast();
  const [user, setUser] = useState({ username: '', email: '', photo: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Charger les infos utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data.data.user);
        // URL de la photo (Backend static file)
        if (res.data.data.user.photo) {
          setPhotoPreview(`http://localhost:5000/img/users/${res.data.data.user.photo}`);
          setImgError(false);
        }
      } catch (err) {
        addToast('Erreur de chargement du profil', 'error');
      }
    };
    fetchUser();
  }, [addToast]);

  // Gestion Upload Photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setImgError(false);
    }
  };

  // Mise à jour Infos (Username, Email, Photo)
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('email', user.email);
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      const res = await api.patch('/users/updateMe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.data.user);
      window.dispatchEvent(new Event('user-updated'));
      addToast('Profil mis à jour avec succès', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur de mise à jour', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Suppression de la photo
  const handleDeletePhoto = () => {
    setShowDeleteConfirm(true);
  };

  const executeDeletePhoto = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('deletePhoto', 'true');
      
      const res = await api.patch('/users/updateMe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.data.user);
      setPhotoPreview(`http://localhost:5000/img/users/${res.data.data.user.photo}`);
      setImgError(false);
      window.dispatchEvent(new Event('user-updated'));
      addToast('Photo supprimée avec succès', 'success');
    } catch (err) {
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Mise à jour Mot de passe
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      addToast('Les nouveaux mots de passe ne correspondent pas', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.patch('/users/updateMyPassword', {
        passwordCurrent: passwords.current,
        password: passwords.new,
        passwordConfirm: passwords.confirm
      });
      // Mise à jour du token si renvoyé
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      setPasswords({ current: '', new: '', confirm: '' });
      addToast('Mot de passe modifié. Session sécurisée.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur mot de passe', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1 className="page-title">OPERATOR_<span>PROFILE</span></h1>
      </div>

      <div className="profile-grid">
        {/* Carte Informations Générales */}
        <div className="profile-card info-card">
          <div className="card-header">
            <User size={20} />
            <h3>Identité Opérateur</h3>
          </div>
          
          <form onSubmit={handleUpdateInfo}>
            <div className="photo-upload-section">
              <div className="photo-preview">
                {photoPreview && !imgError ? (
                  <img 
                    src={photoPreview} 
                    alt="Profile" 
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="photo-placeholder"><User size={64} color="#00d4ff" /></div>
                )}
                <label htmlFor="photo-upload" className="photo-edit-btn">
                  <Camera size={16} />
                </label>
                <input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                  hidden 
                />
              </div>
              {user.photo && user.photo !== 'default.jpg' && (
                <button type="button" onClick={handleDeletePhoto} className="delete-photo-btn">
                  <Trash2 size={12} /> Supprimer
                </button>
              )}
              <p className="role-badge">{user.role || 'GUEST'}</p>
            </div>

            <div className="form-group">
              <label>Nom de code</label>
              <div className="input-wrapper">
                <User size={16} />
                <input 
                  type="text" 
                  value={user.username} 
                  onChange={(e) => setUser({...user, username: e.target.value})} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Canal de communication (Email)</label>
              <div className="input-wrapper">
                <Mail size={16} />
                <input 
                  type="email" 
                  value={user.email} 
                  onChange={(e) => setUser({...user, email: e.target.value})} 
                />
              </div>
            </div>

            <button type="submit" className="save-btn" disabled={loading}>
              <Save size={16} /> Sauvegarder les modifications
            </button>
          </form>
        </div>

        {/* Carte Sécurité */}
        <div className="profile-card security-card">
          <div className="card-header">
            <Shield size={20} />
            <h3>Sécurité & Accès</h3>
          </div>

          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label>Mot de passe actuel</label>
              <div className="input-wrapper">
                <Lock size={16} />
                <input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <div className="input-wrapper">
                <Lock size={16} />
                <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>Confirmer le nouveau mot de passe</label>
              <div className="input-wrapper">
                <CheckCircle size={16} />
                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
              </div>
            </div>

            <div className="password-requirements">
              <span className={`req-item ${passwords.new.length >= 8 ? 'valid' : 'invalid'}`}>• 8+ Chars</span>
              <span className={`req-item ${/[A-Z]/.test(passwords.new) ? 'valid' : 'invalid'}`}>• 1 Maj</span>
              <span className={`req-item ${/[!@#\$%\^&\*]/.test(passwords.new) ? 'valid' : 'invalid'}`}>• 1 Spécial</span>
            </div>

            <button type="submit" className="save-btn danger" disabled={loading}>
              <Shield size={16} /> Mettre à jour la sécurité
            </button>
          </form>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDeletePhoto}
        title="SUPPRESSION_PHOTO"
        message="Voulez-vous vraiment supprimer votre photo de profil ?"
      />
    </div>
  );
};

export default Profile;