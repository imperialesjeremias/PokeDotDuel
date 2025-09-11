-- Script para crear cartas manualmente para la wallet 0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2
-- Ejecutar este script directamente en la base de datos PostgreSQL/Supabase

-- Paso 1: Verificar si el usuario existe, si no existe, crearlo
DO $$
DECLARE
    user_exists BOOLEAN;
    new_user_id UUID;
BEGIN
    -- Verificar si el usuario ya existe
    SELECT EXISTS(
        SELECT 1 FROM public.users 
        WHERE wallet_address = '0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Crear el usuario si no existe
        INSERT INTO public.users (
            wallet_address,
            generated_wallet_address,
            level,
            xp,
            badges,
            pokecoins,
            sol_balance,
            stats
        ) VALUES (
            '0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2',
            '0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2',
            1,
            0,
            '[]'::jsonb,
            1000,
            0,
            '{
                "wins": 0,
                "losses": 0,
                "packs_opened": 0,
                "cards_owned": 0,
                "total_wagered": 0,
                "total_won": 0
            }'::jsonb
        ) RETURNING id INTO new_user_id;
        
        RAISE NOTICE 'Usuario creado con ID: %', new_user_id;
    ELSE
        RAISE NOTICE 'Usuario ya existe con wallet: 0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2';
    END IF;
END $$;

-- Paso 2: Generar 10 cartas específicas para el usuario usando solo Pokémon disponibles
DO $$
DECLARE
    target_user_id UUID;
    card_id UUID;
    pokemon_numbers INTEGER[] := ARRAY[1, 4, 7, 25, 39, 150]; -- Solo Pokémon disponibles en pokedex_cache
    selected_pokemon INTEGER;
    i INTEGER;
BEGIN
    -- Obtener el ID del usuario
    SELECT id INTO target_user_id 
    FROM public.users 
    WHERE wallet_address = '0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2';
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado';
    END IF;
    
    -- Generar 10 cartas usando solo Pokémon disponibles
    FOR i IN 1..10 LOOP
        -- Seleccionar un Pokémon aleatorio de los disponibles
        selected_pokemon := pokemon_numbers[floor(random() * array_length(pokemon_numbers, 1) + 1)];
        
        -- Generar carta con Pokémon específico
        SELECT generate_random_card(target_user_id, selected_pokemon) INTO card_id;
        RAISE NOTICE 'Carta % generada: Pokémon #% con ID: %', i, selected_pokemon, card_id;
    END LOOP;
    
    RAISE NOTICE 'Se generaron 10 cartas exitosamente para el usuario %', target_user_id;
END $$;

-- Paso 3: Mostrar las cartas creadas
SELECT 
    c.id,
    c.name,
    c.dex_number,
    c.rarity,
    c.is_shiny,
    c.level,
    c.stats,
    c.types,
    c.created_at
FROM public.cards c
JOIN public.users u ON c.owner_id = u.id
WHERE u.wallet_address = '0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2'
ORDER BY c.created_at DESC
LIMIT 10;

-- Paso 4: Mostrar estadísticas del usuario
SELECT 
    u.id,
    u.wallet_address,
    u.level,
    u.xp,
    u.pokecoins,
    u.stats,
    COUNT(c.id) as total_cards
FROM public.users u
LEFT JOIN public.cards c ON u.id = c.owner_id
WHERE u.wallet_address = '0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2'
GROUP BY u.id, u.wallet_address, u.level, u.xp, u.pokecoins, u.stats;

-- Paso 5: Mostrar qué Pokémon están disponibles en la cache
SELECT 
    dex_number,
    name,
    types
FROM public.pokedex_cache
ORDER BY dex_number;