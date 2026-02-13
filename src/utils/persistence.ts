import { SessionManager, CSRFProtection } from './encryption';

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProduction 
    ? 'https://odin-la-science.infinityfree.me'
    : 'http://localhost:3001';

// Vérifier si le serveur backend est disponible
let serverAvailable: boolean | null = null;

const checkServerAvailability = async (): Promise<boolean> => {
    if (serverAvailable !== null) return serverAvailable;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
        
        const response = await fetch(`${API_BASE_URL}/api/health`, {
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        serverAvailable = response.ok;
        return serverAvailable;
    } catch (error) {
        console.log('Backend server not available, using localStorage fallback');
        serverAvailable = false;
        return false;
    }
};

// Fallback localStorage functions
const getLocalStorageData = (moduleName: string): any[] => {
    try {
        const data = localStorage.getItem(`module_${moduleName}`);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Error reading localStorage for ${moduleName}:`, error);
        return [];
    }
};

const setLocalStorageData = (moduleName: string, data: any[]): void => {
    try {
        localStorage.setItem(`module_${moduleName}`, JSON.stringify(data));
    } catch (error) {
        console.error(`Error writing localStorage for ${moduleName}:`, error);
    }
};

export const fetchModuleData = async (moduleName: string) => {
    try {
        console.log('fetchModuleData called for:', moduleName);
        
        const isServerAvailable = await checkServerAvailability();
        
        if (!isServerAvailable) {
            console.log('Using localStorage fallback for:', moduleName);
            return getLocalStorageData(moduleName);
        }
        
        const response = await fetch(`${API_BASE_URL}/api/module/${moduleName}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            console.error('Fetch failed with status:', response.status);
            console.log('Falling back to localStorage');
            return getLocalStorageData(moduleName);
        }
        
        const data = await response.json();
        console.log('Fetch successful, items:', data.length);
        return data;
    } catch (error) {
        console.error(`Error fetching ${moduleName}:`, error);
        console.log('Falling back to localStorage');
        return getLocalStorageData(moduleName);
    }
};

export const saveModuleItem = async (moduleName: string, item: any) => {
    try {
        console.log('saveModuleItem called with:', moduleName, item);
        
        const isServerAvailable = await checkServerAvailability();
        
        if (!isServerAvailable) {
            console.log('Using localStorage fallback for save:', moduleName);
            const currentData = getLocalStorageData(moduleName);
            
            // Générer un ID si nécessaire
            if (!item.id) {
                item.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            }
            
            // Vérifier si l'item existe déjà (update)
            const existingIndex = currentData.findIndex((d: any) => d.id === item.id);
            if (existingIndex >= 0) {
                currentData[existingIndex] = item;
            } else {
                currentData.push(item);
            }
            
            setLocalStorageData(moduleName, currentData);
            return { success: true, id: item.id };
        }
        
        // Envoyer directement sans cryptage pour le développement
        const response = await fetch(`${API_BASE_URL}/api/module/${moduleName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            console.log('Falling back to localStorage');
            
            // Fallback to localStorage on error
            const currentData = getLocalStorageData(moduleName);
            if (!item.id) {
                item.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            }
            currentData.push(item);
            setLocalStorageData(moduleName, currentData);
            return { success: true, id: item.id };
        }
        
        const result = await response.json();
        console.log('Save successful:', result);
        return result;
    } catch (error) {
        console.error(`Error saving to ${moduleName}:`, error);
        console.log('Falling back to localStorage');
        
        // Fallback to localStorage on error
        const currentData = getLocalStorageData(moduleName);
        if (!item.id) {
            item.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        }
        currentData.push(item);
        setLocalStorageData(moduleName, currentData);
        return { success: true, id: item.id };
    }
};

export const deleteModuleItem = async (moduleName: string, id: string | number) => {
    try {
        console.log('deleteModuleItem called:', moduleName, id);
        
        const isServerAvailable = await checkServerAvailability();
        
        if (!isServerAvailable) {
            console.log('Using localStorage fallback for delete:', moduleName);
            const currentData = getLocalStorageData(moduleName);
            const filteredData = currentData.filter((item: any) => item.id !== id);
            setLocalStorageData(moduleName, filteredData);
            return { success: true };
        }
        
        const response = await fetch(`${API_BASE_URL}/api/module/${moduleName}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            console.log('Delete failed, falling back to localStorage');
            const currentData = getLocalStorageData(moduleName);
            const filteredData = currentData.filter((item: any) => item.id !== id);
            setLocalStorageData(moduleName, filteredData);
            return { success: true };
        }
        
        const result = await response.json();
        console.log('Delete successful:', result);
        return result;
    } catch (error) {
        console.error(`Error deleting from ${moduleName}:`, error);
        console.log('Falling back to localStorage');
        
        // Fallback to localStorage on error
        const currentData = getLocalStorageData(moduleName);
        const filteredData = currentData.filter((item: any) => item.id !== id);
        setLocalStorageData(moduleName, filteredData);
        return { success: true };
    }
};

// Fonction pour nettoyer les données sensibles de la mémoire
export const clearSensitiveData = () => {
    SessionManager.destroySession();
    CSRFProtection.clearToken();
    localStorage.clear();
    sessionStorage.clear();
};

// Fonction pour vérifier l'intégrité des données
export const verifyDataIntegrity = async (data: any, signature: string): Promise<boolean> => {
    try {
        const encoder = new TextEncoder();
        const dataString = JSON.stringify(data);
        const dataBuffer = encoder.encode(dataString);
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex === signature;
    } catch (error) {
        console.error('Data integrity check failed:', error);
        return false;
    }
};

