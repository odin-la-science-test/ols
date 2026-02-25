import { useEffect, useRef } from 'react';
import { showToast } from '../components/ToastNotification';

interface AutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void> | void;
  interval?: number; // en millisecondes
  enabled?: boolean;
}

export const useAutoSave = ({ data, onSave, interval = 30000, enabled = true }: AutoSaveOptions) => {
  const lastSavedData = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    
    // Ne sauvegarder que si les données ont changé
    if (currentData === lastSavedData.current) return;

    // Annuler le timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Programmer la sauvegarde
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data);
        lastSavedData.current = currentData;
        showToast('success', '💾 Sauvegarde automatique effectuée', 2000);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
        showToast('error', '❌ Erreur lors de la sauvegarde automatique');
      }
    }, interval);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, onSave, interval, enabled]);

  // Sauvegarder avant de quitter la page
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      const currentData = JSON.stringify(data);
      if (currentData !== lastSavedData.current) {
        e.preventDefault();
        e.returnValue = '';
        try {
          await onSave(data);
        } catch (error) {
          console.error('Erreur lors de la sauvegarde avant fermeture:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data, onSave, enabled]);
};
