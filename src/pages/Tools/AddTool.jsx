import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, Trash2, Save, ChevronLeft } from 'lucide-react';
import './AddTool.css';
import { TOOL_CATEGORIES } from '../../utils/constants';
import { useToast } from '../../components/Toast/ToastContext';
import ErrorModal from '../../components/ErrorModal/ErrorModal';

const AddTool = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const [error, setError] = useState(null);
  const { success } = useToast();

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
      success("OUTIL AJOUTÉ À L'ARSENAL");
      navigate(`/tools/${formData.name.toLowerCase()}`);
    } catch (err) {
      setError("ERREUR D'ENREGISTREMENT : " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="add-tool-container">
      <style>{`
        @media (max-width: 768px) {
          .input-group { grid-template-columns: 1fr !important; }
          .command-input-row { flex-direction: column; }
        }
      `}</style>
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
              {TOOL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
      <ErrorModal 
        isOpen={!!error} 
        onClose={() => setError(null)} 
        message={error} 
      />
    </div>
  );
};

export default AddTool;