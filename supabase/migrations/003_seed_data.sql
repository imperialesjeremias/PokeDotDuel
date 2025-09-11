-- Insert initial wager brackets
INSERT INTO public.wager_brackets (min_lamports, max_lamports, name) VALUES
(1000000, 5000000, '0.001 - 0.005 SOL'),
(5000000, 10000000, '0.005 - 0.01 SOL'),
(10000000, 25000000, '0.01 - 0.025 SOL'),
(25000000, 50000000, '0.025 - 0.05 SOL'),
(50000000, 100000000, '0.05 - 0.1 SOL'),
(100000000, 250000000, '0.1 - 0.25 SOL'),
(250000000, 500000000, '0.25 - 0.5 SOL'),
(500000000, 1000000000, '0.5 - 1 SOL');

-- Insert initial drop table probabilities
INSERT INTO public.drop_tables (version, rarity, probability_percent) VALUES
(1, 'COMMON', 80.00),
(1, 'RARE', 18.00),
(1, 'LEGENDARY', 2.00);

-- Insert Gen 1 Pokemon data (sample - in production this would be populated from PokeAPI)
INSERT INTO public.pokedex_cache (dex_number, name, types, base_stats, moves) VALUES
(1, 'Bulbasaur', ARRAY['GRASS', 'POISON'], 
 '{"hp": 45, "atk": 49, "def": 49, "spa": 65, "spd": 65, "spe": 45}'::jsonb,
 '{"level_up": [{"level": 1, "move": "Tackle"}, {"level": 1, "move": "Growl"}, {"level": 3, "move": "Vine Whip"}, {"level": 7, "move": "Poison Powder"}], "tm": ["Swords Dance", "Body Slam", "Take Down", "Double-Edge"]}'::jsonb),

(4, 'Charmander', ARRAY['FIRE'], 
 '{"hp": 39, "atk": 52, "def": 43, "spa": 60, "spd": 50, "spe": 65}'::jsonb,
 '{"level_up": [{"level": 1, "move": "Scratch"}, {"level": 1, "move": "Growl"}, {"level": 9, "move": "Ember"}, {"level": 15, "move": "Leer"}], "tm": ["Swords Dance", "Body Slam", "Take Down", "Double-Edge"]}'::jsonb),

(7, 'Squirtle', ARRAY['WATER'], 
 '{"hp": 44, "atk": 48, "def": 65, "spa": 50, "spd": 64, "spe": 43}'::jsonb,
 '{"level_up": [{"level": 1, "move": "Tackle"}, {"level": 1, "move": "Tail Whip"}, {"level": 8, "move": "Bubble"}, {"level": 15, "move": "Water Gun"}], "tm": ["Swords Dance", "Body Slam", "Take Down", "Double-Edge"]}'::jsonb),

(25, 'Pikachu', ARRAY['ELECTRIC'], 
 '{"hp": 35, "atk": 55, "def": 40, "spa": 50, "spd": 50, "spe": 90}'::jsonb,
 '{"level_up": [{"level": 1, "move": "Thunder Shock"}, {"level": 1, "move": "Growl"}, {"level": 9, "move": "Thunder Wave"}, {"level": 16, "move": "Quick Attack"}], "tm": ["Swords Dance", "Body Slam", "Take Down", "Double-Edge"]}'::jsonb),

(39, 'Jigglypuff', ARRAY['NORMAL'], 
 '{"hp": 115, "atk": 45, "def": 20, "spa": 45, "spd": 25, "spe": 20}'::jsonb,
 '{"level_up": [{"level": 1, "move": "Sing"}, {"level": 1, "move": "Pound"}, {"level": 9, "move": "Disable"}, {"level": 14, "move": "Defense Curl"}], "tm": ["Swords Dance", "Body Slam", "Take Down", "Double-Edge"]}'::jsonb),

(150, 'Mewtwo', ARRAY['PSYCHIC'], 
 '{"hp": 106, "atk": 110, "def": 90, "spa": 154, "spd": 90, "spe": 130}'::jsonb,
 '{"level_up": [{"level": 1, "move": "Confusion"}, {"level": 1, "move": "Disable"}, {"level": 11, "move": "Barrier"}, {"level": 22, "move": "Swift"}], "tm": ["Swords Dance", "Body Slam", "Take Down", "Double-Edge"]}'::jsonb);

-- Create a function to generate random cards for testing
CREATE OR REPLACE FUNCTION generate_random_card(
  owner_id UUID,
  dex_number INTEGER DEFAULT NULL,
  rarity rarity_type DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  card_id UUID;
  pokemon_data RECORD;
  final_dex_number INTEGER;
  final_rarity rarity_type;
  shiny_roll INTEGER;
  is_shiny BOOLEAN := FALSE;
  card_stats JSONB;
BEGIN
  -- Get random dex number if not provided
  IF dex_number IS NULL THEN
    SELECT floor(random() * 151 + 1)::INTEGER INTO final_dex_number;
  ELSE
    final_dex_number := dex_number;
  END IF;
  
  -- Get random rarity if not provided
  IF rarity IS NULL THEN
    SELECT 
      CASE 
        WHEN random() < 0.02 THEN 'LEGENDARY'::rarity_type
        WHEN random() < 0.20 THEN 'RARE'::rarity_type
        ELSE 'COMMON'::rarity_type
      END INTO final_rarity;
  ELSE
    final_rarity := rarity;
  END IF;
  
  -- Get Pokemon data
  SELECT * INTO pokemon_data FROM public.pokedex_cache WHERE pokedex_cache.dex_number = final_dex_number;
  
  -- Roll for shiny (1/128 chance)
  SELECT floor(random() * 128 + 1)::INTEGER INTO shiny_roll;
  IF shiny_roll = 1 THEN
    is_shiny := TRUE;
  END IF;
  
  -- Calculate stats based on base stats and level
  card_stats := jsonb_build_object(
    'hp', pokemon_data.base_stats->>'hp',
    'atk', pokemon_data.base_stats->>'atk',
    'def', pokemon_data.base_stats->>'def',
    'spa', pokemon_data.base_stats->>'spa',
    'spd', pokemon_data.base_stats->>'spd',
    'spe', pokemon_data.base_stats->>'spe'
  );
  
  -- Insert the card
  INSERT INTO public.cards (
    owner_id, dex_number, name, is_shiny, rarity, level, stats, types
  ) VALUES (
    owner_id, final_dex_number, pokemon_data.name, is_shiny, final_rarity, 50, card_stats, pokemon_data.types
  ) RETURNING id INTO card_id;
  
  RETURN card_id;
END;
$$ LANGUAGE plpgsql;

-- Test data: Add a test user with fixed ID and generate cards for testing
INSERT INTO public.users (
    id,
    wallet_address,
    generated_wallet_address,
    level,
    xp,
    badges,
    pokecoins,
    sol_balance,
    stats
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'test-wallet-address-123',
    'generated-test-wallet-123',
    5,
    1250,
    '["starter", "collector"]'::jsonb,
    5000,
    100000,
    '{
        "wins": 8,
        "losses": 3,
        "packs_opened": 15,
        "cards_owned": 20,
        "total_wagered": 50000,
        "total_won": 75000
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Generate 20 random cards for the test user
DO $$
DECLARE
    i INTEGER;
    card_result RECORD;
BEGIN
    FOR i IN 1..20 LOOP
        SELECT * INTO card_result FROM generate_random_card('550e8400-e29b-41d4-a716-446655440000'::UUID);
        RAISE NOTICE 'Generated card % for test user', card_result.id;
    END LOOP;
END $$;

-- Create a function to open a booster pack
CREATE OR REPLACE FUNCTION open_booster_pack(pack_id UUID)
RETURNS TABLE(card_id UUID, card_name TEXT, rarity rarity_type, is_shiny BOOLEAN) AS $$
DECLARE
  buyer_id UUID;
  card_count INTEGER := 5; -- 5 cards per pack
  i INTEGER;
  new_card_id UUID;
  card_data RECORD;
BEGIN
  -- Get the pack buyer
  SELECT buyer_id INTO buyer_id FROM public.packs WHERE id = pack_id;
  
  -- Mark pack as opened
  UPDATE public.packs SET opened = TRUE, opened_at = NOW() WHERE id = pack_id;
  
  -- Generate 5 random cards
  FOR i IN 1..card_count LOOP
    SELECT generate_random_card(buyer_id) INTO new_card_id;
    
    -- Get card data for return
    SELECT c.id, c.name, c.rarity, c.is_shiny INTO card_data
    FROM public.cards c WHERE c.id = new_card_id;
    
    -- Insert pack reward
    INSERT INTO public.pack_rewards (pack_id, card_id) VALUES (pack_id, new_card_id);
    
    -- Return card info
    card_id := card_data.id;
    card_name := card_data.name;
    rarity := card_data.rarity;
    is_shiny := card_data.is_shiny;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
