-- Create moves_cache table for storing Pokemon moves data
-- This migration adds support for moves data from Pokemon Showdown

CREATE TABLE IF NOT EXISTS moves_cache (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Physical', 'Special', 'Status')),
    power INTEGER,
    accuracy INTEGER,
    pp INTEGER NOT NULL,
    priority INTEGER DEFAULT 0,
    flags JSONB DEFAULT '{}',
    target TEXT,
    description TEXT,
    generation INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_moves_cache_type ON moves_cache(type);
CREATE INDEX IF NOT EXISTS idx_moves_cache_category ON moves_cache(category);
CREATE INDEX IF NOT EXISTS idx_moves_cache_power ON moves_cache(power);
CREATE INDEX IF NOT EXISTS idx_moves_cache_generation ON moves_cache(generation);

-- Create function to create moves_cache table (for migration script)
CREATE OR REPLACE FUNCTION create_moves_cache_table()
RETURNS VOID AS $$
BEGIN
    -- This function is called by the migration script
    -- The table creation is handled above, so this is just a placeholder
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE moves_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to moves_cache" ON moves_cache
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert/update/delete for service role only
CREATE POLICY "Allow full access to moves_cache for service role" ON moves_cache
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE moves_cache IS 'Cache table for Pokemon moves data from Showdown';
COMMENT ON COLUMN moves_cache.id IS 'Move identifier (e.g., "tackle", "thunderbolt")';
COMMENT ON COLUMN moves_cache.name IS 'Display name of the move';
COMMENT ON COLUMN moves_cache.type IS 'Move type (e.g., "Electric", "Normal")';
COMMENT ON COLUMN moves_cache.category IS 'Move category: Physical, Special, or Status';
COMMENT ON COLUMN moves_cache.power IS 'Base power of the move (null for status moves)';
COMMENT ON COLUMN moves_cache.accuracy IS 'Accuracy percentage (null for moves that never miss)';
COMMENT ON COLUMN moves_cache.pp IS 'Power Points - number of times the move can be used';
COMMENT ON COLUMN moves_cache.priority IS 'Move priority (-6 to +5, higher goes first)';
COMMENT ON COLUMN moves_cache.flags IS 'JSON object containing move flags (contact, protect, etc.)';
COMMENT ON COLUMN moves_cache.target IS 'Move target (e.g., "normal", "self", "allAdjacent")';
COMMENT ON COLUMN moves_cache.description IS 'Move description or effect';
COMMENT ON COLUMN moves_cache.generation IS 'Pokemon generation when move was introduced';