import { useState, useCallback } from 'react';
import { useToast } from '../components/Toast/ToastContext';

export const useClipboard = (timeout = 2000) => {
  const [copiedId, setCopiedId] = useState(null);
  const { success } = useToast();

  const copyToClipboard = useCallback((text, id, message = "COPIÉ !") => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (message) success(message);
    setTimeout(() => setCopiedId(null), timeout);
  }, [success, timeout]);

  return { copiedId, copyToClipboard };
};