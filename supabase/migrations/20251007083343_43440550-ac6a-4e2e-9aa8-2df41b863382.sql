-- Ajout des colonnes pour le système de hints et cadenas physiques
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS revealed_hints jsonb DEFAULT '{"zone1":[],"zone2":[],"zone3":[]}'::jsonb,
ADD COLUMN IF NOT EXISTS door_codes jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS door_status jsonb DEFAULT '{"zone1":"locked","zone2":"locked","zone3":"locked"}'::jsonb,
ADD COLUMN IF NOT EXISTS door_visible jsonb DEFAULT '{"zone1":false,"zone2":false,"zone3":false}'::jsonb;

COMMENT ON COLUMN sessions.revealed_hints IS 'Indices révélés par zone et puzzle (p1, p2, p3)';
COMMENT ON COLUMN sessions.door_codes IS 'Codes des portes physiques pour chaque zone';
COMMENT ON COLUMN sessions.door_status IS 'État des portes (locked/unlocked)';
COMMENT ON COLUMN sessions.door_visible IS 'Visibilité du cadenas pour chaque zone';