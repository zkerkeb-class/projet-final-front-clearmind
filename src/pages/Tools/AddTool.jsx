import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, Trash2, Save, ChevronLeft, AlertTriangle, X } from 'lucide-react';
import './AddTool.css';

const AddTool = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: name || '',
    category: '',
    description: '',
    link: '',
    cheatsheet: [{ command: '', explanation: '' }]
  });

  // Gérer les changements des champs simples
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gérer les changements dans le tableau cheatsheet
  const handleCommandChange = (index, e) => {
    const newCheatsheet = [...formData.cheatsheet];
    newCheatsheet[index][e.target.name] = e.target.value;
    setFormData({ ...formData, cheatsheet: newCheatsheet });
  };

  const addCommandRow = () => {
    setFormData({
      ...formData,
      cheatsheet: [...formData.cheatsheet, { command: '', explanation: '' }]
    });
  };

  const removeCommandRow = (index) => {
    const newCheatsheet = formData.cheatsheet.filter((_, i) => i !== index);
    setFormData({ ...formData, cheatsheet: newCheatsheet });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tools', formData);
      navigate(`/tools/${formData.name.toLowerCase()}`);
    } catch (err) {
      setError("ERREUR D'ENREGISTREMENT : " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="add-tool-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ChevronLeft size={16} /> ANNULER
      </button>

      <header className="form-header">
        <h1>DÉPLOYER_NOUVEL_<span>OUTIL</span></h1>
        <p>Enregistrement dans l'arsenal RedSheet</p>
      </header>

      <form onSubmit={handleSubmit} className="tool-form">
        <div className="form-section">
          <h3>INFORMATIONS_GÉNÉRALES</h3>
          <div className="input-group">
            <input name="name" placeholder="Nom de l'outil (ex: nmap)" value={formData.name} onChange={handleChange} required />
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="" disabled>-- Sélectionner une étape --</option>
              <option value="Reconnaissance">Reconnaissance</option>
              <option value="Weaponization">Weaponization</option>
              <option value="Delivery">Delivery</option>
              <option value="Exploitation">Exploitation</option>
              <option value="Installation">Installation</option>
              <option value="Command & Control">Command & Control</option>
              <option value="Actions on Objectives">Actions on Objectives</option>
            </select>
          </div>
          <input name="link" placeholder="Lien vers documentation officielle" value={formData.link} onChange={handleChange} />
          <textarea name="description" placeholder="Description courte de l'outil..." value={formData.description} onChange={handleChange} rows="3" />
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>COMMAND_CHEATSHEET</h3>
            <button type="button" onClick={addCommandRow} className="add-row-btn">
              <Plus size={14} /> AJOUTER_LIGNE
            </button>
          </div>
          
          {formData.cheatsheet.map((item, index) => (
            <div key={index} className="command-input-row">
              <input 
                name="command" 
                placeholder="Commande (ex: nmap -sV...)" 
                value={item.command} 
                onChange={(e) => handleCommandChange(index, e)} 
              />
              <input 
                name="explanation" 
                placeholder="Explication" 
                value={item.explanation} 
                onChange={(e) => handleCommandChange(index, e)} 
              />
              {formData.cheatsheet.length > 1 && (
                <button type="button" onClick={() => removeCommandRow(index)} className="remove-btn">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="submit" className="save-btn">
          <Save size={18} /> ENREGISTRER_DANS_L_ARSENAL
        </button>
      </form>

      {/* MODALE D'ERREUR */}
      {error && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div className="modal-content" style={{ background: '#0a0a0a', border: '1px solid #ff003c', padding: '2rem', width: '400px', position: 'relative', boxShadow: '0 0 30px rgba(255, 0, 60, 0.2)' }}>
            <button onClick={() => setError(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              <AlertTriangle size={28} color="#ff003c" />
              <h3 style={{ color: '#ff003c', margin: 0, fontFamily: 'Orbitron, sans-serif', letterSpacing: '1px' }}>ERREUR_SYSTÈME</h3>
            </div>
            
            <p style={{ color: '#e0e0e0', fontFamily: 'monospace', marginBottom: '2rem', lineHeight: '1.5' }}>{error}</p>
            
            <button onClick={() => setError(null)} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #ff003c', color: '#ff003c', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Orbitron, sans-serif', transition: 'all 0.3s' }} onMouseOver={(e) => {e.target.style.background = '#ff003c'; e.target.style.color = '#000'}} onMouseOut={(e) => {e.target.style.background = 'transparent'; e.target.style.color = '#ff003c'}}>ACQUITTER_ERREUR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTool;