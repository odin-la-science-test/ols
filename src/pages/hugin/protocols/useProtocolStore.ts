import { useState, useEffect } from 'react';
import type { Protocol } from './types';

const STORE_KEY = 'hugin_protocol_masters';

// On utilise le même state que ProtocolBuilder.tsx mais on l'encapsule dans un hook
export const useProtocolStore = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);

  useEffect(() => {
    const loadProtocols = () => {
      // Pour assurer la rétrocompatibilité, s'il y a déjà des protocoles dans 'protocols', on les fusionne ou on les utilise
      const legacySaved = localStorage.getItem('protocols');
      const saved = localStorage.getItem(STORE_KEY);
      
      if (saved) {
        setProtocols(JSON.parse(saved));
      } else if (legacySaved) {
        // Migration initiale
        const parsedLegacy = JSON.parse(legacySaved);
        setProtocols(parsedLegacy);
        localStorage.setItem(STORE_KEY, legacySaved);
      }
    };
    loadProtocols();
  }, []);

  const saveProtocols = (newProtocols: Protocol[]) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(newProtocols));
    // Synchro avec l'ancienne clé au cas où
    localStorage.setItem('protocols', JSON.stringify(newProtocols));
    setProtocols(newProtocols);
  };

  const addProtocol = (protocol: Protocol) => {
    saveProtocols([protocol, ...protocols]);
  };

  const updateProtocol = (protocol: Protocol) => {
    const newProtocols = protocols.map(p => p.id === protocol.id ? protocol : p);
    saveProtocols(newProtocols);
  };

  const deleteProtocol = (id: string) => {
    const newProtocols = protocols.filter(p => p.id !== id);
    saveProtocols(newProtocols);
  };

  // Liste uniquement les protocoles validés (pour insertion dans l'ELN)
  const getActiveProtocols = () => {
    return protocols.filter(p => p.validated);
  };

  return {
    protocols,
    setProtocols: saveProtocols,
    addProtocol,
    updateProtocol,
    deleteProtocol,
    getActiveProtocols
  };
};
