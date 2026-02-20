import { supabase, isSupabaseConfigured, getCurrentUserEmail } from '../utils/supabaseClient';

export interface ProteinStructure {
    id?: string;
    name: string;
    sequence: string;
    pdb_data?: string;
    view_mode: 'cartoon' | 'surface' | 'stick';
    molecular_weight?: number;
    residue_count?: number;
    notes?: string;
    user_email: string;
    created_at?: string;
    updated_at?: string;
}

// Clé pour le stockage local (fallback)
const LOCAL_STORAGE_KEY = 'protein_structures';

// Sauvegarder une structure protéique
export const saveProteinStructure = async (structure: ProteinStructure): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
        const userEmail = getCurrentUserEmail();
        const structureData = {
            ...structure,
            user_email: userEmail,
            updated_at: new Date().toISOString()
        };

        // Si Supabase est configuré, utiliser la base de données
        if (isSupabaseConfigured() && supabase) {
            if (structure.id) {
                // Mise à jour
                const { data, error } = await supabase
                    .from('protein_structures')
                    .update(structureData)
                    .eq('id', structure.id)
                    .eq('user_email', userEmail)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, id: data.id };
            } else {
                // Création
                const { data, error } = await supabase
                    .from('protein_structures')
                    .insert([{ ...structureData, created_at: new Date().toISOString() }])
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, id: data.id };
            }
        } else {
            // Fallback: stockage local
            const structures = getLocalStructures();
            if (structure.id) {
                const index = structures.findIndex(s => s.id === structure.id);
                if (index !== -1) {
                    structures[index] = structureData;
                }
            } else {
                structureData.id = `local_${Date.now()}`;
                structureData.created_at = new Date().toISOString();
                structures.push(structureData);
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(structures));
            return { success: true, id: structureData.id };
        }
    } catch (error) {
        console.error('Error saving protein structure:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Charger toutes les structures de l'utilisateur
export const loadProteinStructures = async (): Promise<ProteinStructure[]> => {
    try {
        const userEmail = getCurrentUserEmail();

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('protein_structures')
                .select('*')
                .eq('user_email', userEmail)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } else {
            // Fallback: stockage local
            return getLocalStructures();
        }
    } catch (error) {
        console.error('Error loading protein structures:', error);
        return getLocalStructures();
    }
};

// Charger une structure spécifique
export const loadProteinStructure = async (id: string): Promise<ProteinStructure | null> => {
    try {
        const userEmail = getCurrentUserEmail();

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('protein_structures')
                .select('*')
                .eq('id', id)
                .eq('user_email', userEmail)
                .single();

            if (error) throw error;
            return data;
        } else {
            // Fallback: stockage local
            const structures = getLocalStructures();
            return structures.find(s => s.id === id) || null;
        }
    } catch (error) {
        console.error('Error loading protein structure:', error);
        return null;
    }
};

// Supprimer une structure
export const deleteProteinStructure = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const userEmail = getCurrentUserEmail();

        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase
                .from('protein_structures')
                .delete()
                .eq('id', id)
                .eq('user_email', userEmail);

            if (error) throw error;
            return { success: true };
        } else {
            // Fallback: stockage local
            const structures = getLocalStructures();
            const filtered = structures.filter(s => s.id !== id);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
            return { success: true };
        }
    } catch (error) {
        console.error('Error deleting protein structure:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Helper: récupérer les structures du stockage local
const getLocalStructures = (): ProteinStructure[] => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading local structures:', error);
        return [];
    }
};
