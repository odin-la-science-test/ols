-- Table pour stocker les structures protéiques
CREATE TABLE IF NOT EXISTS protein_structures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sequence TEXT NOT NULL,
    pdb_data TEXT,
    view_mode TEXT CHECK (view_mode IN ('cartoon', 'surface', 'stick')) DEFAULT 'cartoon',
    molecular_weight NUMERIC,
    residue_count INTEGER,
    notes TEXT,
    user_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_protein_structures_user_email ON protein_structures(user_email);
CREATE INDEX IF NOT EXISTS idx_protein_structures_updated_at ON protein_structures(updated_at DESC);

-- RLS (Row Level Security) pour sécuriser l'accès aux données
ALTER TABLE protein_structures ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir uniquement leurs propres structures
CREATE POLICY "Users can view their own protein structures"
    ON protein_structures
    FOR SELECT
    USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Politique : Les utilisateurs peuvent insérer leurs propres structures
CREATE POLICY "Users can insert their own protein structures"
    ON protein_structures
    FOR INSERT
    WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres structures
CREATE POLICY "Users can update their own protein structures"
    ON protein_structures
    FOR UPDATE
    USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Politique : Les utilisateurs peuvent supprimer leurs propres structures
CREATE POLICY "Users can delete their own protein structures"
    ON protein_structures
    FOR DELETE
    USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_protein_structures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appeler la fonction avant chaque UPDATE
CREATE TRIGGER trigger_update_protein_structures_updated_at
    BEFORE UPDATE ON protein_structures
    FOR EACH ROW
    EXECUTE FUNCTION update_protein_structures_updated_at();
