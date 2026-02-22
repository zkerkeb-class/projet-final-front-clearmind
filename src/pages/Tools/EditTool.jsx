import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, Trash2, Save, ChevronLeft } from 'lucide-react';
import './EditTool.css';
import { TOOL_CATEGORIES } from '../../utils/constants';
import { useToast } from '../../components/Toast/ToastContext';
import ErrorModal from '../../components/ErrorModal/ErrorModal';

const EditTool = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { success } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    link: '',
    cheatsheet: [{ command: '', explanation: '' }]
  });

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const res = await api.get(`/tools/${name}`);
        const tool = res.data.data;
        
        setFormData({
          name: tool.name,
          category: tool.category,
          description: tool.description || '',
          link: tool.link || '',
          cheatsheet: (tool.cheatsheet && tool.cheatsheet.length > 0) ? tool.cheatsheet : [{ command: '', explanation: '' }]
        });
      } catch (err) {
        setError("IMPOSSIBLE DE CHARGER L'OUTIL À MODIFIER.");
        navigate('/admin');
      }
    };
    fetchTool();
  }, [name, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

    // Nettoyage : On retire les lignes sans commande
    const cleanedCheatsheet = formData.cheatsheet.filter(item => item.command.trim() !== '');

    if (cleanedCheatsheet.length === 0) {
      setError("La fiche doit contenir au moins une commande valide.");
      return;
    }

    try {
      await api.patch(`/tools/${name}`, { ...formData, cheatsheet: cleanedCheatsheet });
      success("FICHE TECHNIQUE MISE À JOUR");
      navigate(`/tools/${formData.name.toLowerCase()}`);
    } catch (err) {
      setError("ERREUR DE MODIFICATION : " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="edit-tool-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ChevronLeft size={16} /> ANNULER
      </button>

      <header className="form-header">
        <h1>MODIFIER_<span>OUTIL</span></h1>
        <p>Mise à jour de la fiche technique : {name}</p>
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

          <button type="button" onClick={addCommandRow} className="add-line-btn">
            <Plus size={16} /> AJOUTER_LIGNE
          </button>
        </div>

        <button type="submit" className="save-btn">
          <Save size={18} /> SAUVEGARDER_LES_MODIFICATIONS
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

export default EditTool;