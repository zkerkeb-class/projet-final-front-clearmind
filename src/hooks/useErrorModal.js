import { useState, useCallback } from 'react';

export const useErrorModal = (initialState = null) => {
  const [error, setError] = useState(initialState);

  const showError = useCallback((message) => {
    // Si le message est un objet erreur axios, on extrait le message
    const msg = message?.response?.data?.message || message?.message || message;
    setError(msg);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, showError, clearError };
};