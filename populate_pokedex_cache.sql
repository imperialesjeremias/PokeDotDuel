-- Script para poblar la tabla pokedex_cache con todos los Pokémon de la primera generación
-- Basado en los datos de GEN1_POKEMON

-- Limpiar la tabla primero (opcional)
-- DELETE FROM public.pokedex_cache;

-- Insertar todos los Pokémon de la primera generación
INSERT INTO public.pokedex_cache (dex_number, name, types, base_stats, moves) VALUES
-- Bulbasaur line
(1, 'Bulbasaur', ARRAY['GRASS', 'POISON'], '{"hp": 45, "atk": 49, "def": 49, "spa": 65, "spd": 65, "spe": 45}', '["tackle","vine-whip","razor-leaf"]'),
(2, 'Ivysaur', ARRAY['GRASS', 'POISON'], '{"hp": 60, "atk": 62, "def": 63, "spa": 80, "spd": 80, "spe": 60}', '["tackle","vine-whip","razor-leaf","sleep-powder"]'),
(3, 'Venusaur', ARRAY['GRASS', 'POISON'], '{"hp": 80, "atk": 82, "def": 83, "spa": 100, "spd": 100, "spe": 80}', '["tackle","vine-whip","razor-leaf","sleep-powder","solar-beam"]'),

-- Charmander line
(4, 'Charmander', ARRAY['FIRE'], '{"hp": 39, "atk": 52, "def": 43, "spa": 60, "spd": 50, "spe": 65}', '["scratch","ember","flamethrower"]'),
(5, 'Charmeleon', ARRAY['FIRE'], '{"hp": 58, "atk": 64, "def": 58, "spa": 80, "spd": 65, "spe": 80}', '["scratch","ember","flamethrower","slash"]'),
(6, 'Charizard', ARRAY['FIRE', 'FLYING'], '{"hp": 78, "atk": 84, "def": 78, "spa": 109, "spd": 85, "spe": 100}', '["scratch","ember","flamethrower","slash","fire-blast"]'),

-- Squirtle line
(7, 'Squirtle', ARRAY['WATER'], '{"hp": 44, "atk": 48, "def": 65, "spa": 50, "spd": 64, "spe": 43}', '["tackle","water-gun","hydro-pump"]'),
(8, 'Wartortle', ARRAY['WATER'], '{"hp": 59, "atk": 63, "def": 80, "spa": 65, "spd": 80, "spe": 58}', '["tackle","water-gun","hydro-pump","bite"]'),
(9, 'Blastoise', ARRAY['WATER'], '{"hp": 79, "atk": 83, "def": 100, "spa": 85, "spd": 105, "spe": 78}', '["tackle","water-gun","hydro-pump","bite","skull-bash"]'),

-- Caterpie line
(10, 'Caterpie', ARRAY['BUG'], '{"hp": 45, "atk": 30, "def": 35, "spa": 20, "spd": 20, "spe": 45}', '["tackle","string-shot"]'),
(11, 'Metapod', ARRAY['BUG'], '{"hp": 50, "atk": 20, "def": 55, "spa": 25, "spd": 25, "spe": 30}', '["harden"]'),
(12, 'Butterfree', ARRAY['BUG', 'FLYING'], '{"hp": 60, "atk": 45, "def": 50, "spa": 90, "spd": 80, "spe": 70}', '["confusion","gust","psybeam","sleep-powder"]'),

-- Weedle line
(13, 'Weedle', ARRAY['BUG', 'POISON'], '{"hp": 40, "atk": 35, "def": 30, "spa": 20, "spd": 20, "spe": 50}', '["poison-sting","string-shot"]'),
(14, 'Kakuna', ARRAY['BUG', 'POISON'], '{"hp": 45, "atk": 25, "def": 50, "spa": 25, "spd": 25, "spe": 35}', '["harden"]'),
(15, 'Beedrill', ARRAY['BUG', 'POISON'], '{"hp": 65, "atk": 90, "def": 40, "spa": 45, "spd": 80, "spe": 75}', '["fury-attack","pin-missile","twineedle"]'),

-- Pidgey line
(16, 'Pidgey', ARRAY['NORMAL', 'FLYING'], '{"hp": 40, "atk": 45, "def": 40, "spa": 35, "spd": 35, "spe": 56}', '["tackle","gust","quick-attack"]'),
(17, 'Pidgeotto', ARRAY['NORMAL', 'FLYING'], '{"hp": 63, "atk": 60, "def": 55, "spa": 50, "spd": 50, "spe": 71}', '["tackle","gust","quick-attack","wing-attack"]'),
(18, 'Pidgeot', ARRAY['NORMAL', 'FLYING'], '{"hp": 83, "atk": 80, "def": 75, "spa": 70, "spd": 70, "spe": 101}', '["tackle","gust","quick-attack","wing-attack","hurricane"]'),

-- Rattata line
(19, 'Rattata', ARRAY['NORMAL'], '{"hp": 30, "atk": 56, "def": 35, "spa": 25, "spd": 35, "spe": 72}', '["tackle","quick-attack","bite"]'),
(20, 'Raticate', ARRAY['NORMAL'], '{"hp": 55, "atk": 81, "def": 60, "spa": 50, "spd": 70, "spe": 97}', '["tackle","quick-attack","bite","hyper-fang"]'),

-- Spearow line
(21, 'Spearow', ARRAY['NORMAL', 'FLYING'], '{"hp": 40, "atk": 60, "def": 30, "spa": 31, "spd": 31, "spe": 70}', '["peck","leer","fury-attack"]'),
(22, 'Fearow', ARRAY['NORMAL', 'FLYING'], '{"hp": 65, "atk": 90, "def": 65, "spa": 61, "spd": 61, "spe": 100}', '["peck","leer","fury-attack","drill-peck"]'),

-- Ekans line
(23, 'Ekans', ARRAY['POISON'], '{"hp": 35, "atk": 60, "def": 44, "spa": 40, "spd": 54, "spe": 55}', '["wrap","leer","poison-sting"]'),
(24, 'Arbok', ARRAY['POISON'], '{"hp": 60, "atk": 95, "def": 69, "spa": 65, "spd": 79, "spe": 80}', '["wrap","leer","poison-sting","bite"]'),

-- Pikachu line
(25, 'Pikachu', ARRAY['ELECTRIC'], '{"hp": 35, "atk": 55, "def": 40, "spa": 50, "spd": 50, "spe": 90}', '["quick-attack","thunderbolt","thunder"]'),
(26, 'Raichu', ARRAY['ELECTRIC'], '{"hp": 60, "atk": 90, "def": 55, "spa": 90, "spd": 80, "spe": 110}', '["quick-attack","thunderbolt","thunder","seismic-toss"]'),

-- Sandshrew line
(27, 'Sandshrew', ARRAY['GROUND'], '{"hp": 50, "atk": 75, "def": 85, "spa": 20, "spd": 30, "spe": 40}', '["scratch","sand-attack","slash"]'),
(28, 'Sandslash', ARRAY['GROUND'], '{"hp": 75, "atk": 100, "def": 110, "spa": 45, "spd": 55, "spe": 65}', '["scratch","sand-attack","slash","earthquake"]'),

-- Nidoran♀ line
(29, 'Nidoran♀', ARRAY['POISON'], '{"hp": 55, "atk": 47, "def": 52, "spa": 40, "spd": 40, "spe": 41}', '["growl","scratch","poison-sting"]'),
(30, 'Nidorina', ARRAY['POISON'], '{"hp": 70, "atk": 62, "def": 67, "spa": 55, "spd": 55, "spe": 56}', '["growl","scratch","poison-sting","bite"]'),
(31, 'Nidoqueen', ARRAY['POISON', 'GROUND'], '{"hp": 90, "atk": 92, "def": 87, "spa": 75, "spd": 85, "spe": 76}', '["growl","scratch","poison-sting","bite","earthquake"]'),

-- Nidoran♂ line
(32, 'Nidoran♂', ARRAY['POISON'], '{"hp": 46, "atk": 57, "def": 40, "spa": 40, "spd": 40, "spe": 50}', '["leer","peck","poison-sting"]'),
(33, 'Nidorino', ARRAY['POISON'], '{"hp": 61, "atk": 72, "def": 57, "spa": 55, "spd": 55, "spe": 65}', '["leer","peck","poison-sting","horn-attack"]'),
(34, 'Nidoking', ARRAY['POISON', 'GROUND'], '{"hp": 81, "atk": 102, "def": 77, "spa": 85, "spd": 75, "spe": 85}', '["leer","peck","poison-sting","horn-attack","earthquake"]'),

-- Clefairy line
(35, 'Clefairy', ARRAY['FAIRY'], '{"hp": 70, "atk": 45, "def": 48, "spa": 60, "spd": 65, "spe": 35}', '["pound","growl","metronome"]'),
(36, 'Clefable', ARRAY['FAIRY'], '{"hp": 95, "atk": 70, "def": 73, "spa": 95, "spd": 90, "spe": 60}', '["pound","growl","metronome","moonblast"]'),

-- Vulpix line
(37, 'Vulpix', ARRAY['FIRE'], '{"hp": 38, "atk": 41, "def": 40, "spa": 50, "spd": 65, "spe": 65}', '["ember","tail-whip","quick-attack"]'),
(38, 'Ninetales', ARRAY['FIRE'], '{"hp": 73, "atk": 76, "def": 75, "spa": 81, "spd": 100, "spe": 100}', '["ember","tail-whip","quick-attack","fire-blast"]'),

-- Jigglypuff line
(39, 'Jigglypuff', ARRAY['NORMAL', 'FAIRY'], '{"hp": 115, "atk": 45, "def": 20, "spa": 45, "spd": 25, "spe": 20}', '["sing","pound","disable"]'),
(40, 'Wigglytuff', ARRAY['NORMAL', 'FAIRY'], '{"hp": 140, "atk": 70, "def": 45, "spa": 85, "spd": 50, "spe": 45}', '["sing","pound","disable","hyper-voice"]'),

-- Zubat line
(41, 'Zubat', ARRAY['POISON', 'FLYING'], '{"hp": 40, "atk": 45, "def": 35, "spa": 30, "spd": 40, "spe": 55}', '["leech-life","supersonic","bite"]'),
(42, 'Golbat', ARRAY['POISON', 'FLYING'], '{"hp": 75, "atk": 80, "def": 70, "spa": 65, "spd": 75, "spe": 90}', '["leech-life","supersonic","bite","wing-attack"]'),

-- Oddish line
(43, 'Oddish', ARRAY['GRASS', 'POISON'], '{"hp": 45, "atk": 50, "def": 55, "spa": 75, "spd": 65, "spe": 30}', '["absorb","sweet-scent","acid"]'),
(44, 'Gloom', ARRAY['GRASS', 'POISON'], '{"hp": 60, "atk": 65, "def": 70, "spa": 85, "spd": 75, "spe": 40}', '["absorb","sweet-scent","acid","sleep-powder"]'),
(45, 'Vileplume', ARRAY['GRASS', 'POISON'], '{"hp": 75, "atk": 80, "def": 85, "spa": 110, "spd": 90, "spe": 50}', '["absorb","sweet-scent","acid","sleep-powder","petal-dance"]'),

-- Paras line
(46, 'Paras', ARRAY['BUG', 'GRASS'], '{"hp": 35, "atk": 70, "def": 55, "spa": 45, "spd": 55, "spe": 25}', '["scratch","stun-spore","slash"]'),
(47, 'Parasect', ARRAY['BUG', 'GRASS'], '{"hp": 60, "atk": 95, "def": 80, "spa": 60, "spd": 80, "spe": 30}', '["scratch","stun-spore","slash","spore"]'),

-- Venonat line
(48, 'Venonat', ARRAY['BUG', 'POISON'], '{"hp": 60, "atk": 55, "def": 50, "spa": 40, "spd": 55, "spe": 45}', '["tackle","disable","psybeam"]'),
(49, 'Venomoth', ARRAY['BUG', 'POISON'], '{"hp": 70, "atk": 65, "def": 60, "spa": 90, "spd": 75, "spe": 90}', '["tackle","disable","psybeam","psychic"]'),

-- Diglett line
(50, 'Diglett', ARRAY['GROUND'], '{"hp": 10, "atk": 55, "def": 25, "spa": 35, "spd": 45, "spe": 95}', '["scratch","growl","dig"]'),
(51, 'Dugtrio', ARRAY['GROUND'], '{"hp": 35, "atk": 100, "def": 50, "spa": 50, "spd": 70, "spe": 120}', '["scratch","growl","dig","earthquake"]'),

-- Meowth line
(52, 'Meowth', ARRAY['NORMAL'], '{"hp": 40, "atk": 45, "def": 35, "spa": 40, "spd": 40, "spe": 90}', '["scratch","growl","bite"]'),
(53, 'Persian', ARRAY['NORMAL'], '{"hp": 65, "atk": 70, "def": 60, "spa": 65, "spd": 65, "spe": 115}', '["scratch","growl","bite","slash"]'),

-- Psyduck line
(54, 'Psyduck', ARRAY['WATER'], '{"hp": 50, "atk": 52, "def": 48, "spa": 65, "spd": 50, "spe": 55}', '["water-gun","tail-whip","disable"]'),
(55, 'Golduck', ARRAY['WATER'], '{"hp": 80, "atk": 82, "def": 78, "spa": 95, "spd": 80, "spe": 85}', '["water-gun","tail-whip","disable","psychic"]'),

-- Mankey line
(56, 'Mankey', ARRAY['FIGHTING'], '{"hp": 40, "atk": 80, "def": 35, "spa": 35, "spd": 45, "spe": 70}', '["scratch","leer","karate-chop"]'),
(57, 'Primeape', ARRAY['FIGHTING'], '{"hp": 65, "atk": 105, "def": 60, "spa": 60, "spd": 70, "spe": 95}', '["scratch","leer","karate-chop","rage"]'),

-- Growlithe line
(58, 'Growlithe', ARRAY['FIRE'], '{"hp": 55, "atk": 70, "def": 45, "spa": 70, "spd": 50, "spe": 60}', '["bite","roar","ember"]'),
(59, 'Arcanine', ARRAY['FIRE'], '{"hp": 90, "atk": 110, "def": 80, "spa": 100, "spd": 80, "spe": 95}', '["bite","roar","ember","fire-blast"]'),

-- Poliwag line
(60, 'Poliwag', ARRAY['WATER'], '{"hp": 40, "atk": 50, "def": 40, "spa": 40, "spd": 40, "spe": 90}', '["water-gun","hypnosis","bubble"]'),
(61, 'Poliwhirl', ARRAY['WATER'], '{"hp": 65, "atk": 65, "def": 65, "spa": 50, "spd": 50, "spe": 90}', '["water-gun","hypnosis","bubble","body-slam"]'),
(62, 'Poliwrath', ARRAY['WATER', 'FIGHTING'], '{"hp": 90, "atk": 95, "def": 95, "spa": 70, "spd": 90, "spe": 70}', '["water-gun","hypnosis","bubble","body-slam","submission"]'),

-- Abra line
(63, 'Abra', ARRAY['PSYCHIC'], '{"hp": 25, "atk": 20, "def": 15, "spa": 105, "spd": 55, "spe": 90}', '["teleport"]'),
(64, 'Kadabra', ARRAY['PSYCHIC'], '{"hp": 40, "atk": 35, "def": 30, "spa": 120, "spd": 70, "spe": 105}', '["teleport","confusion","psybeam"]'),
(65, 'Alakazam', ARRAY['PSYCHIC'], '{"hp": 55, "atk": 50, "def": 45, "spa": 135, "spd": 95, "spe": 120}', '["teleport","confusion","psybeam","psychic"]'),

-- Machop line
(66, 'Machop', ARRAY['FIGHTING'], '{"hp": 70, "atk": 80, "def": 50, "spa": 35, "spd": 35, "spe": 35}', '["karate-chop","leer","focus-energy"]'),
(67, 'Machoke', ARRAY['FIGHTING'], '{"hp": 80, "atk": 100, "def": 70, "spa": 50, "spd": 60, "spe": 45}', '["karate-chop","leer","focus-energy","seismic-toss"]'),
(68, 'Machamp', ARRAY['FIGHTING'], '{"hp": 90, "atk": 130, "def": 80, "spa": 65, "spd": 85, "spe": 55}', '["karate-chop","leer","focus-energy","seismic-toss","submission"]'),

-- Bellsprout line
(69, 'Bellsprout', ARRAY['GRASS', 'POISON'], '{"hp": 50, "atk": 75, "def": 35, "spa": 70, "spd": 30, "spe": 40}', '["vine-whip","growth","wrap"]'),
(70, 'Weepinbell', ARRAY['GRASS', 'POISON'], '{"hp": 65, "atk": 90, "def": 50, "spa": 85, "spd": 45, "spe": 55}', '["vine-whip","growth","wrap","razor-leaf"]'),
(71, 'Victreebel', ARRAY['GRASS', 'POISON'], '{"hp": 80, "atk": 105, "def": 65, "spa": 100, "spd": 70, "spe": 70}', '["vine-whip","growth","wrap","razor-leaf","leaf-storm"]'),

-- Tentacool line
(72, 'Tentacool', ARRAY['WATER', 'POISON'], '{"hp": 40, "atk": 40, "def": 35, "spa": 50, "spd": 100, "spe": 70}', '["poison-sting","supersonic","wrap"]'),
(73, 'Tentacruel', ARRAY['WATER', 'POISON'], '{"hp": 80, "atk": 70, "def": 65, "spa": 80, "spd": 120, "spe": 100}', '["poison-sting","supersonic","wrap","hydro-pump"]'),

-- Geodude line
(74, 'Geodude', ARRAY['ROCK', 'GROUND'], '{"hp": 40, "atk": 80, "def": 100, "spa": 30, "spd": 30, "spe": 20}', '["tackle","defense-curl","rock-throw"]'),
(75, 'Graveler', ARRAY['ROCK', 'GROUND'], '{"hp": 55, "atk": 95, "def": 115, "spa": 45, "spd": 45, "spe": 35}', '["tackle","defense-curl","rock-throw","earthquake"]'),
(76, 'Golem', ARRAY['ROCK', 'GROUND'], '{"hp": 80, "atk": 120, "def": 130, "spa": 55, "spd": 65, "spe": 45}', '["tackle","defense-curl","rock-throw","earthquake","explosion"]'),

-- Ponyta line
(77, 'Ponyta', ARRAY['FIRE'], '{"hp": 50, "atk": 85, "def": 55, "spa": 65, "spd": 65, "spe": 90}', '["ember","tail-whip","stomp"]'),
(78, 'Rapidash', ARRAY['FIRE'], '{"hp": 65, "atk": 100, "def": 70, "spa": 80, "spd": 80, "spe": 105}', '["ember","tail-whip","stomp","fire-blast"]'),

-- Slowpoke line
(79, 'Slowpoke', ARRAY['WATER', 'PSYCHIC'], '{"hp": 90, "atk": 65, "def": 65, "spa": 40, "spd": 40, "spe": 15}', '["confusion","disable","water-gun"]'),
(80, 'Slowbro', ARRAY['WATER', 'PSYCHIC'], '{"hp": 95, "atk": 75, "def": 110, "spa": 100, "spd": 80, "spe": 30}', '["confusion","disable","water-gun","psychic"]'),

-- Magnemite line
(81, 'Magnemite', ARRAY['ELECTRIC', 'STEEL'], '{"hp": 25, "atk": 35, "def": 70, "spa": 95, "spd": 55, "spe": 45}', '["tackle","thundershock","supersonic"]'),
(82, 'Magneton', ARRAY['ELECTRIC', 'STEEL'], '{"hp": 50, "atk": 60, "def": 95, "spa": 120, "spd": 70, "spe": 70}', '["tackle","thundershock","supersonic","thunder-wave"]'),

-- Farfetch'd
(83, 'Farfetch''d', ARRAY['NORMAL', 'FLYING'], '{"hp": 52, "atk": 90, "def": 55, "spa": 58, "spd": 62, "spe": 60}', '["peck","sand-attack","slash"]'),

-- Doduo line
(84, 'Doduo', ARRAY['NORMAL', 'FLYING'], '{"hp": 35, "atk": 85, "def": 45, "spa": 35, "spd": 35, "spe": 75}', '["peck","growl","fury-attack"]'),
(85, 'Dodrio', ARRAY['NORMAL', 'FLYING'], '{"hp": 60, "atk": 110, "def": 70, "spa": 60, "spd": 60, "spe": 110}', '["peck","growl","fury-attack","drill-peck"]'),

-- Seel line
(86, 'Seel', ARRAY['WATER'], '{"hp": 65, "atk": 45, "def": 55, "spa": 45, "spd": 70, "spe": 45}', '["headbutt","growl","aurora-beam"]'),
(87, 'Dewgong', ARRAY['WATER', 'ICE'], '{"hp": 90, "atk": 70, "def": 80, "spa": 70, "spd": 95, "spe": 70}', '["headbutt","growl","aurora-beam","ice-beam"]'),

-- Grimer line
(88, 'Grimer', ARRAY['POISON'], '{"hp": 80, "atk": 80, "def": 50, "spa": 40, "spd": 50, "spe": 25}', '["pound","poison-gas","sludge"]'),
(89, 'Muk', ARRAY['POISON'], '{"hp": 105, "atk": 105, "def": 75, "spa": 65, "spd": 100, "spe": 50}', '["pound","poison-gas","sludge","sludge-bomb"]'),

-- Shellder line
(90, 'Shellder', ARRAY['WATER'], '{"hp": 30, "atk": 65, "def": 100, "spa": 45, "spd": 25, "spe": 40}', '["tackle","withdraw","aurora-beam"]'),
(91, 'Cloyster', ARRAY['WATER', 'ICE'], '{"hp": 50, "atk": 95, "def": 180, "spa": 85, "spd": 45, "spe": 70}', '["tackle","withdraw","aurora-beam","spike-cannon"]'),

-- Gastly line
(92, 'Gastly', ARRAY['GHOST', 'POISON'], '{"hp": 30, "atk": 35, "def": 30, "spa": 100, "spd": 35, "spe": 80}', '["lick","confuse-ray","night-shade"]'),
(93, 'Haunter', ARRAY['GHOST', 'POISON'], '{"hp": 45, "atk": 50, "def": 45, "spa": 115, "spd": 55, "spe": 95}', '["lick","confuse-ray","night-shade","hypnosis"]'),
(94, 'Gengar', ARRAY['GHOST', 'POISON'], '{"hp": 60, "atk": 65, "def": 60, "spa": 130, "spd": 75, "spe": 110}', '["lick","confuse-ray","night-shade","hypnosis","dream-eater"]'),

-- Onix
(95, 'Onix', ARRAY['ROCK', 'GROUND'], '{"hp": 35, "atk": 45, "def": 160, "spa": 30, "spd": 45, "spe": 70}', '["tackle","screech","bind"]'),

-- Drowzee line
(96, 'Drowzee', ARRAY['PSYCHIC'], '{"hp": 60, "atk": 48, "def": 45, "spa": 43, "spd": 90, "spe": 42}', '["pound","hypnosis","disable"]'),
(97, 'Hypno', ARRAY['PSYCHIC'], '{"hp": 85, "atk": 73, "def": 70, "spa": 73, "spd": 115, "spe": 67}', '["pound","hypnosis","disable","psychic"]'),

-- Krabby line
(98, 'Krabby', ARRAY['WATER'], '{"hp": 30, "atk": 105, "def": 90, "spa": 25, "spd": 25, "spe": 50}', '["bubble","leer","vice-grip"]'),
(99, 'Kingler', ARRAY['WATER'], '{"hp": 55, "atk": 130, "def": 115, "spa": 50, "spd": 50, "spe": 75}', '["bubble","leer","vice-grip","crabhammer"]'),

-- Voltorb line
(100, 'Voltorb', ARRAY['ELECTRIC'], '{"hp": 40, "atk": 30, "def": 50, "spa": 55, "spd": 55, "spe": 100}', '["tackle","screech","sonicboom"]'),
(101, 'Electrode', ARRAY['ELECTRIC'], '{"hp": 60, "atk": 50, "def": 70, "spa": 80, "spd": 80, "spe": 150}', '["tackle","screech","sonicboom","explosion"]'),

-- Exeggcute line
(102, 'Exeggcute', ARRAY['GRASS', 'PSYCHIC'], '{"hp": 60, "atk": 40, "def": 80, "spa": 60, "spd": 45, "spe": 40}', '["barrage","hypnosis","leech-seed"]'),
(103, 'Exeggutor', ARRAY['GRASS', 'PSYCHIC'], '{"hp": 95, "atk": 95, "def": 85, "spa": 125, "spd": 75, "spe": 55}', '["barrage","hypnosis","leech-seed","psychic"]'),

-- Cubone line
(104, 'Cubone', ARRAY['GROUND'], '{"hp": 50, "atk": 50, "def": 95, "spa": 40, "spd": 50, "spe": 35}', '["bone-club","leer","focus-energy"]'),
(105, 'Marowak', ARRAY['GROUND'], '{"hp": 60, "atk": 80, "def": 110, "spa": 50, "spd": 80, "spe": 45}', '["bone-club","leer","focus-energy","bonemerang"]'),

-- Hitmonlee
(106, 'Hitmonlee', ARRAY['FIGHTING'], '{"hp": 50, "atk": 120, "def": 53, "spa": 35, "spd": 110, "spe": 87}', '["double-kick","meditate","rolling-kick"]'),

-- Hitmonchan
(107, 'Hitmonchan', ARRAY['FIGHTING'], '{"hp": 50, "atk": 105, "def": 79, "spa": 35, "spd": 110, "spe": 76}', '["comet-punch","agility","fire-punch"]'),

-- Lickitung
(108, 'Lickitung', ARRAY['NORMAL'], '{"hp": 90, "atk": 55, "def": 75, "spa": 60, "spd": 75, "spe": 30}', '["wrap","supersonic","lick"]'),

-- Koffing line
(109, 'Koffing', ARRAY['POISON'], '{"hp": 40, "atk": 65, "def": 95, "spa": 60, "spd": 45, "spe": 35}', '["poison-gas","tackle","smog"]'),
(110, 'Weezing', ARRAY['POISON'], '{"hp": 65, "atk": 90, "def": 120, "spa": 85, "spd": 70, "spe": 60}', '["poison-gas","tackle","smog","explosion"]'),

-- Rhyhorn line
(111, 'Rhyhorn', ARRAY['GROUND', 'ROCK'], '{"hp": 80, "atk": 85, "def": 95, "spa": 30, "spd": 30, "spe": 25}', '["horn-attack","stomp","tail-whip"]'),
(112, 'Rhydon', ARRAY['GROUND', 'ROCK'], '{"hp": 105, "atk": 130, "def": 120, "spa": 45, "spd": 45, "spe": 40}', '["horn-attack","stomp","tail-whip","earthquake"]'),

-- Chansey
(113, 'Chansey', ARRAY['NORMAL'], '{"hp": 250, "atk": 5, "def": 5, "spa": 35, "spd": 105, "spe": 50}', '["pound","growl","tail-whip"]'),

-- Tangela
(114, 'Tangela', ARRAY['GRASS'], '{"hp": 65, "atk": 55, "def": 115, "spa": 100, "spd": 40, "spe": 60}', '["constrict","bind","absorb"]'),

-- Kangaskhan
(115, 'Kangaskhan', ARRAY['NORMAL'], '{"hp": 105, "atk": 95, "def": 80, "spa": 40, "spd": 80, "spe": 90}', '["comet-punch","rage","bite"]'),

-- Horsea line
(116, 'Horsea', ARRAY['WATER'], '{"hp": 30, "atk": 40, "def": 70, "spa": 70, "spd": 25, "spe": 60}', '["bubble","leer","water-gun"]'),
(117, 'Seadra', ARRAY['WATER'], '{"hp": 55, "atk": 65, "def": 95, "spa": 95, "spd": 45, "spe": 85}', '["bubble","leer","water-gun","hydro-pump"]'),

-- Goldeen line
(118, 'Goldeen', ARRAY['WATER'], '{"hp": 45, "atk": 67, "def": 60, "spa": 35, "spd": 50, "spe": 63}', '["peck","tail-whip","supersonic"]'),
(119, 'Seaking', ARRAY['WATER'], '{"hp": 80, "atk": 92, "def": 65, "spa": 65, "spd": 80, "spe": 68}', '["peck","tail-whip","supersonic","horn-drill"]'),

-- Staryu line
(120, 'Staryu', ARRAY['WATER'], '{"hp": 30, "atk": 45, "def": 55, "spa": 70, "spd": 55, "spe": 85}', '["tackle","harden","water-gun"]'),
(121, 'Starmie', ARRAY['WATER', 'PSYCHIC'], '{"hp": 60, "atk": 75, "def": 85, "spa": 100, "spd": 85, "spe": 115}', '["tackle","harden","water-gun","psychic"]'),

-- Mr. Mime
(122, 'Mr. Mime', ARRAY['PSYCHIC', 'FAIRY'], '{"hp": 40, "atk": 45, "def": 65, "spa": 100, "spd": 120, "spe": 90}', '["confusion","barrier","light-screen"]'),

-- Scyther
(123, 'Scyther', ARRAY['BUG', 'FLYING'], '{"hp": 70, "atk": 110, "def": 80, "spa": 55, "spd": 80, "spe": 105}', '["quick-attack","leer","slash"]'),

-- Jynx
(124, 'Jynx', ARRAY['ICE', 'PSYCHIC'], '{"hp": 65, "atk": 50, "def": 35, "spa": 115, "spd": 95, "spe": 95}', '["pound","lick","lovely-kiss"]'),

-- Electabuzz
(125, 'Electabuzz', ARRAY['ELECTRIC'], '{"hp": 65, "atk": 83, "def": 57, "spa": 95, "spd": 85, "spe": 105}', '["quick-attack","leer","thunderpunch"]'),

-- Magmar
(126, 'Magmar', ARRAY['FIRE'], '{"hp": 65, "atk": 95, "def": 57, "spa": 100, "spd": 85, "spe": 93}', '["ember","leer","fire-punch"]'),

-- Pinsir
(127, 'Pinsir', ARRAY['BUG'], '{"hp": 65, "atk": 125, "def": 100, "spa": 55, "spd": 70, "spe": 85}', '["vice-grip","focus-energy","seismic-toss"]'),

-- Tauros
(128, 'Tauros', ARRAY['NORMAL'], '{"hp": 75, "atk": 100, "def": 95, "spa": 40, "spd": 70, "spe": 110}', '["tackle","tail-whip","rage"]'),

-- Magikarp line
(129, 'Magikarp', ARRAY['WATER'], '{"hp": 20, "atk": 10, "def": 55, "spa": 15, "spd": 20, "spe": 80}', '["splash"]'),
(130, 'Gyarados', ARRAY['WATER', 'FLYING'], '{"hp": 95, "atk": 125, "def": 79, "spa": 60, "spd": 100, "spe": 81}', '["bite","dragon-rage","leer"]'),

-- Lapras
(131, 'Lapras', ARRAY['WATER', 'ICE'], '{"hp": 130, "atk": 85, "def": 80, "spa": 85, "spd": 95, "spe": 60}', '["water-gun","growl","sing"]'),

-- Ditto
(132, 'Ditto', ARRAY['NORMAL'], '{"hp": 48, "atk": 48, "def": 48, "spa": 48, "spd": 48, "spe": 48}', '["transform"]'),

-- Eevee line
(133, 'Eevee', ARRAY['NORMAL'], '{"hp": 55, "atk": 55, "def": 50, "spa": 45, "spd": 65, "spe": 55}', '["tackle","tail-whip","sand-attack"]'),
(134, 'Vaporeon', ARRAY['WATER'], '{"hp": 130, "atk": 65, "def": 60, "spa": 110, "spd": 95, "spe": 65}', '["tackle","tail-whip","sand-attack","water-gun"]'),
(135, 'Jolteon', ARRAY['ELECTRIC'], '{"hp": 65, "atk": 65, "def": 60, "spa": 110, "spd": 95, "spe": 130}', '["tackle","tail-whip","sand-attack","thundershock"]'),
(136, 'Flareon', ARRAY['FIRE'], '{"hp": 65, "atk": 130, "def": 60, "spa": 95, "spd": 110, "spe": 65}', '["tackle","tail-whip","sand-attack","ember"]'),

-- Porygon
(137, 'Porygon', ARRAY['NORMAL'], '{"hp": 65, "atk": 60, "def": 70, "spa": 85, "spd": 75, "spe": 40}', '["tackle","sharpen","conversion"]'),

-- Omanyte line
(138, 'Omanyte', ARRAY['ROCK', 'WATER'], '{"hp": 35, "atk": 40, "def": 100, "spa": 90, "spd": 55, "spe": 35}', '["constrict","withdraw","water-gun"]'),
(139, 'Omastar', ARRAY['ROCK', 'WATER'], '{"hp": 70, "atk": 60, "def": 125, "spa": 115, "spd": 70, "spe": 55}', '["constrict","withdraw","water-gun","hydro-pump"]'),

-- Kabuto line
(140, 'Kabuto', ARRAY['ROCK', 'WATER'], '{"hp": 30, "atk": 80, "def": 90, "spa": 55, "spd": 45, "spe": 55}', '["scratch","harden","absorb"]'),
(141, 'Kabutops', ARRAY['ROCK', 'WATER'], '{"hp": 60, "atk": 115, "def": 105, "spa": 65, "spd": 70, "spe": 80}', '["scratch","harden","absorb","slash"]'),

-- Aerodactyl
(142, 'Aerodactyl', ARRAY['ROCK', 'FLYING'], '{"hp": 80, "atk": 105, "def": 65, "spa": 60, "spd": 75, "spe": 130}', '["wing-attack","agility","bite"]'),

-- Snorlax
(143, 'Snorlax', ARRAY['NORMAL'], '{"hp": 160, "atk": 110, "def": 65, "spa": 65, "spd": 110, "spe": 30}', '["tackle","amnesia","rest"]'),

-- Articuno
(144, 'Articuno', ARRAY['ICE', 'FLYING'], '{"hp": 90, "atk": 85, "def": 100, "spa": 95, "spd": 125, "spe": 85}', '["gust","leer","ice-beam"]'),

-- Zapdos
(145, 'Zapdos', ARRAY['ELECTRIC', 'FLYING'], '{"hp": 90, "atk": 90, "def": 85, "spa": 125, "spd": 90, "spe": 100}', '["peck","thundershock","drill-peck"]'),

-- Moltres
(146, 'Moltres', ARRAY['FIRE', 'FLYING'], '{"hp": 90, "atk": 100, "def": 90, "spa": 125, "spd": 85, "spe": 90}', '["wing-attack","leer","fire-spin"]'),

-- Dratini line
(147, 'Dratini', ARRAY['DRAGON'], '{"hp": 41, "atk": 64, "def": 45, "spa": 50, "spd": 50, "spe": 50}', '["wrap","leer","thunder-wave"]'),
(148, 'Dragonair', ARRAY['DRAGON'], '{"hp": 61, "atk": 84, "def": 65, "spa": 70, "spd": 70, "spe": 70}', '["wrap","leer","thunder-wave","dragon-rage"]'),
(149, 'Dragonite', ARRAY['DRAGON', 'FLYING'], '{"hp": 91, "atk": 134, "def": 95, "spa": 100, "spd": 100, "spe": 80}', '["wrap","leer","thunder-wave","dragon-rage","hyper-beam"]'),

-- Mewtwo
(150, 'Mewtwo', ARRAY['PSYCHIC'], '{"hp": 106, "atk": 110, "def": 90, "spa": 154, "spd": 154, "spe": 130}', '["confusion","disable","psychic"]'),

-- Mew
(151, 'Mew', ARRAY['PSYCHIC'], '{"hp": 100, "atk": 100, "def": 100, "spa": 100, "spd": 100, "spe": 100}', '["pound","transform","psychic"]')

ON CONFLICT (dex_number) DO UPDATE SET
    name = EXCLUDED.name,
    types = EXCLUDED.types,
    base_stats = EXCLUDED.base_stats,
    moves = EXCLUDED.moves;

-- Mostrar cuántos Pokémon se insertaron
SELECT COUNT(*) as total_pokemon_inserted FROM public.pokedex_cache;

-- Mostrar algunos ejemplos
SELECT dex_number, name, types FROM public.pokedex_cache ORDER BY dex_number LIMIT 10;