import { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronUp, ChevronDown, Trash2, Activity } from 'lucide-react';
import { useToast } from '../Toast/ToastContext';
import './TerminalLogs.css';

const TerminalLogs = () => {
  const { logs, clearLogs } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const logsEndRef = useRef(null);

  // Auto-scroll vers le bas quand un nouveau log arrive
  useEffect(() => {
    if (isOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  return (
    <div className={`terminal-logs ${isOpen ? 'open' : 'closed'}`}>
      <div className="terminal-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="terminal-title">
          <Terminal size={14} />
          <span>SYSTEM_LOGS</span>
          {logs.length > 0 && <span className="log-count">({logs.length})</span>}
        </div>
        <div className="terminal-actions">
          <button onClick={(e) => { e.stopPropagation(); clearLogs(); }} title="Effacer les logs" className="clear-btn">
            <Trash2 size={14} />
          </button>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </div>
      
      {isOpen && (
        <div className="terminal-content">
          {logs.length === 0 ? (
            <div className="empty-logs">
              <Activity size={16} />
              <span>En attente d'activité système...</span>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className={`log-entry ${log.type.toLowerCase()}`}>
                <span className="log-time">[{log.timestamp}]</span>
                <span className="log-type">{log.type}</span>
                <span className="log-message">{'>'} {log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
};

export default TerminalLogs;