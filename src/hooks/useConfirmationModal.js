import { useState, useCallback } from 'react';

export const useConfirmationModal = () => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const closeConfirmation = useCallback(() => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const askConfirmation = useCallback((title, message, onConfirm) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        closeConfirmation();
      }
    });
  }, [closeConfirmation]);

  return {
    modalConfig,
    askConfirmation,
    closeConfirmation
  };
};