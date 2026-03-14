import React, { createContext, useContext, useState, useCallback } from 'react';

const WhatsAppContext = createContext();

export const WhatsAppProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null); // Data to pre-fill the form

  const openModal = useCallback((data = {}) => {
    setInitialFormData(data);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setInitialFormData(null); // Clear initial data on close
  }, []);

  const value = {
    isModalOpen,
    initialFormData,
    openModal,
    closeModal,
  };

  return (
    <WhatsAppContext.Provider value={value}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};