import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { CODE_LANGUAGES } from '../../utils/constants';
import './CodeBlock.css';

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const [language, setLanguage] = useState(match ? match[1] : 'text');

  useEffect(() => {
    const m = /language-(\w+)/.exec(className || '');
    setLanguage(m ? m[1] : 'text');
  }, [className]);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (inline) {
    return <code className={className} {...props}>{children}</code>;
  }

  const handleLanguageSelect = (e) => {
    e.stopPropagation();
    setLanguage(e.target.value);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <select 
          value={language} 
          onChange={handleLanguageSelect}
          className="code-lang-select"
          style={{ width: `${language.length + 3}ch` }}
        >
          {CODE_LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
        <button onClick={handleCopy} className="copy-code-btn" title="Copier">
          {isCopied ? <Check size={14} color="#00ff41" /> : <Copy size={14} />}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="code-highlighter"
        showLineNumbers={false}
        customStyle={{ margin: 0, padding: '15px', background: '#0a0a0a', fontSize: '0.9rem' }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;