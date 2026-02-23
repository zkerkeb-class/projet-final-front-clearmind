import { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [logs, setLogs] = useState([]);

  // Fonction pour ajouter un log permanent dans le terminal
  const addLog = useCallback((message, type = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour12: false });
    // On garde les 100 derniers logs
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), timestamp, message, type }].slice(-100));
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, closing: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300); // Wait for animation
  }, []);

  // On couple les Toasts avec les Logs
  const success = (msg) => { addToast(msg, 'success'); addLog(msg, 'SUCCESS'); };
  const error = (msg) => { addToast(msg, 'error'); addLog(msg, 'ERROR'); };
  const info = (msg) => { addToast(msg, 'info'); addLog(msg, 'INFO'); };
  const warning = (msg) => { addToast(msg, 'warning'); addLog(msg, 'WARNING'); };

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, warning, logs, clearLogs }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type} ${toast.closing ? 'closing' : ''}`}>
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};