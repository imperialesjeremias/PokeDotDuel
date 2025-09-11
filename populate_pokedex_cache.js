// Script para poblar la tabla pokedex_cache con todos los Pokémon de la primera generación
// Usando Supabase JavaScript client

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (ajustar según tu configuración)
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de todos los Pokémon de la primera generación
const gen1Pokemon = [
  // Bulbasaur line
  { dex_number: 1, name: 'Bulbasaur', types: ['GRASS', 'POISON'], base_stats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 }, moves: ['tackle', 'vine-whip', 'razor-leaf'] },
  { dex_number: 2, name: 'Ivysaur', types: ['GRASS', 'POISON'], base_stats: { hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60 }, moves: ['tackle', 'vine-whip', 'razor-leaf', 'sleep-powder'] },
  { dex_number: 3, name: 'Venusaur', types: ['GRASS', 'POISON'], base_stats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 }, moves: ['tackle', 'vine-whip', 'razor-leaf', 'sleep-powder', 'solar-beam'] },
  
  // Charmander line
  { dex_number: 4, name: 'Charmander', types: ['FIRE'], base_stats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 }, moves: ['scratch', 'ember', 'flamethrower'] },
  { dex_number: 5, name: 'Charmeleon', types: ['FIRE'], base_stats: { hp: 58, atk: 64, def: 58, spa: 80, spd: 65, spe: 80 }, moves: ['scratch', 'ember', 'flamethrower', 'slash'] },
  { dex_number: 6, name: 'Charizard', types: ['FIRE', 'FLYING'], base_stats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 }, moves: ['scratch', 'ember', 'flamethrower', 'slash', 'fire-blast'] },
  
  // Squirtle line
  { dex_number: 7, name: 'Squirtle', types: ['WATER'], base_stats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 }, moves: ['tackle', 'water-gun', 'hydro-pump'] },
  { dex_number: 8, name: 'Wartortle', types: ['WATER'], base_stats: { hp: 59, atk: 63, def: 80, spa: 65, spd: 80, spe: 58 }, moves: ['tackle', 'water-gun', 'hydro-pump', 'bite'] },
  { dex_number: 9, name: 'Blastoise', types: ['WATER'], base_stats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 }, moves: ['tackle', 'water-gun', 'hydro-pump', 'bite', 'skull-bash'] },
  
  // Caterpie line
  { dex_number: 10, name: 'Caterpie', types: ['BUG'], base_stats: { hp: 45, atk: 30, def: 35, spa: 20, spd: 20, spe: 45 }, moves: ['tackle', 'string-shot'] },
  { dex_number: 11, name: 'Metapod', types: ['BUG'], base_stats: { hp: 50, atk: 20, def: 55, spa: 25, spd: 25, spe: 30 }, moves: ['harden'] },
  { dex_number: 12, name: 'Butterfree', types: ['BUG', 'FLYING'], base_stats: { hp: 60, atk: 45, def: 50, spa: 90, spd: 80, spe: 70 }, moves: ['confusion', 'gust', 'psybeam', 'sleep-powder'] },
  
  // Weedle line
  { dex_number: 13, name: 'Weedle', types: ['BUG', 'POISON'], base_stats: { hp: 40, atk: 35, def: 30, spa: 20, spd: 20, spe: 50 }, moves: ['poison-sting', 'string-shot'] },
  { dex_number: 14, name: 'Kakuna', types: ['BUG', 'POISON'], base_stats: { hp: 45, atk: 25, def: 50, spa: 25, spd: 25, spe: 35 }, moves: ['harden'] },
  { dex_number: 15, name: 'Beedrill', types: ['BUG', 'POISON'], base_stats: { hp: 65, atk: 90, def: 40, spa: 45, spd: 80, spe: 75 }, moves: ['fury-attack', 'pin-missile', 'twineedle'] },
  
  // Pidgey line
  { dex_number: 16, name: 'Pidgey', types: ['NORMAL', 'FLYING'], base_stats: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 }, moves: ['tackle', 'gust', 'quick-attack'] },
  { dex_number: 17, name: 'Pidgeotto', types: ['NORMAL', 'FLYING'], base_stats: { hp: 63, atk: 60, def: 55, spa: 50, spd: 50, spe: 71 }, moves: ['tackle', 'gust', 'quick-attack', 'wing-attack'] },
  { dex_number: 18, name: 'Pidgeot', types: ['NORMAL', 'FLYING'], base_stats: { hp: 83, atk: 80, def: 75, spa: 70, spd: 70, spe: 101 }, moves: ['tackle', 'gust', 'quick-attack', 'wing-attack', 'hurricane'] },
  
  // Rattata line
  { dex_number: 19, name: 'Rattata', types: ['NORMAL'], base_stats: { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 }, moves: ['tackle', 'quick-attack', 'bite'] },
  { dex_number: 20, name: 'Raticate', types: ['NORMAL'], base_stats: { hp: 55, atk: 81, def: 60, spa: 50, spd: 70, spe: 97 }, moves: ['tackle', 'quick-attack', 'bite', 'hyper-fang'] },
  
  // Spearow line
  { dex_number: 21, name: 'Spearow', types: ['NORMAL', 'FLYING'], base_stats: { hp: 40, atk: 60, def: 30, spa: 31, spd: 31, spe: 70 }, moves: ['peck', 'leer', 'fury-attack'] },
  { dex_number: 22, name: 'Fearow', types: ['NORMAL', 'FLYING'], base_stats: { hp: 65, atk: 90, def: 65, spa: 61, spd: 61, spe: 100 }, moves: ['peck', 'leer', 'fury-attack', 'drill-peck'] },
  
  // Ekans line
  { dex_number: 23, name: 'Ekans', types: ['POISON'], base_stats: { hp: 35, atk: 60, def: 44, spa: 40, spd: 54, spe: 55 }, moves: ['wrap', 'leer', 'poison-sting'] },
  { dex_number: 24, name: 'Arbok', types: ['POISON'], base_stats: { hp: 60, atk: 95, def: 69, spa: 65, spd: 79, spe: 80 }, moves: ['wrap', 'leer', 'poison-sting', 'bite'] },
  
  // Pikachu line
  { dex_number: 25, name: 'Pikachu', types: ['ELECTRIC'], base_stats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 }, moves: ['quick-attack', 'thunderbolt', 'thunder'] },
  { dex_number: 26, name: 'Raichu', types: ['ELECTRIC'], base_stats: { hp: 60, atk: 90, def: 55, spa: 90, spd: 80, spe: 110 }, moves: ['quick-attack', 'thunderbolt', 'thunder', 'seismic-toss'] },
  
  // Sandshrew line
  { dex_number: 27, name: 'Sandshrew', types: ['GROUND'], base_stats: { hp: 50, atk: 75, def: 85, spa: 20, spd: 30, spe: 40 }, moves: ['scratch', 'sand-attack', 'slash'] },
  { dex_number: 28, name: 'Sandslash', types: ['GROUND'], base_stats: { hp: 75, atk: 100, def: 110, spa: 45, spd: 55, spe: 65 }, moves: ['scratch', 'sand-attack', 'slash', 'earthquake'] },
  
  // Nidoran♀ line
  { dex_number: 29, name: 'Nidoran♀', types: ['POISON'], base_stats: { hp: 55, atk: 47, def: 52, spa: 40, spd: 40, spe: 41 }, moves: ['growl', 'scratch', 'poison-sting'] },
  { dex_number: 30, name: 'Nidorina', types: ['POISON'], base_stats: { hp: 70, atk: 62, def: 67, spa: 55, spd: 55, spe: 56 }, moves: ['growl', 'scratch', 'poison-sting', 'bite'] },
  { dex_number: 31, name: 'Nidoqueen', types: ['POISON', 'GROUND'], base_stats: { hp: 90, atk: 92, def: 87, spa: 75, spd: 85, spe: 76 }, moves: ['growl', 'scratch', 'poison-sting', 'bite', 'earthquake'] },
  
  // Nidoran♂ line
  { dex_number: 32, name: 'Nidoran♂', types: ['POISON'], base_stats: { hp: 46, atk: 57, def: 40, spa: 40, spd: 40, spe: 50 }, moves: ['leer', 'peck', 'poison-sting'] },
  { dex_number: 33, name: 'Nidorino', types: ['POISON'], base_stats: { hp: 61, atk: 72, def: 57, spa: 55, spd: 55, spe: 65 }, moves: ['leer', 'peck', 'poison-sting', 'horn-attack'] },
  { dex_number: 34, name: 'Nidoking', types: ['POISON', 'GROUND'], base_stats: { hp: 81, atk: 102, def: 77, spa: 85, spd: 75, spe: 85 }, moves: ['leer', 'peck', 'poison-sting', 'horn-attack', 'earthquake'] },
  
  // Clefairy line
  { dex_number: 35, name: 'Clefairy', types: ['FAIRY'], base_stats: { hp: 70, atk: 45, def: 48, spa: 60, spd: 65, spe: 35 }, moves: ['pound', 'growl', 'metronome'] },
  { dex_number: 36, name: 'Clefable', types: ['FAIRY'], base_stats: { hp: 95, atk: 70, def: 73, spa: 95, spd: 90, spe: 60 }, moves: ['pound', 'growl', 'metronome', 'moonblast'] },
  
  // Vulpix line
  { dex_number: 37, name: 'Vulpix', types: ['FIRE'], base_stats: { hp: 38, atk: 41, def: 40, spa: 50, spd: 65, spe: 65 }, moves: ['ember', 'tail-whip', 'quick-attack'] },
  { dex_number: 38, name: 'Ninetales', types: ['FIRE'], base_stats: { hp: 73, atk: 76, def: 75, spa: 81, spd: 100, spe: 100 }, moves: ['ember', 'tail-whip', 'quick-attack', 'fire-blast'] },
  
  // Jigglypuff line
  { dex_number: 39, name: 'Jigglypuff', types: ['NORMAL', 'FAIRY'], base_stats: { hp: 115, atk: 45, def: 20, spa: 45, spd: 25, spe: 20 }, moves: ['sing', 'pound', 'disable'] },
  { dex_number: 40, name: 'Wigglytuff', types: ['NORMAL', 'FAIRY'], base_stats: { hp: 140, atk: 70, def: 45, spa: 85, spd: 50, spe: 45 }, moves: ['sing', 'pound', 'disable', 'hyper-voice'] },
  
  // Zubat line
  { dex_number: 41, name: 'Zubat', types: ['POISON', 'FLYING'], base_stats: { hp: 40, atk: 45, def: 35, spa: 30, spd: 40, spe: 55 }, moves: ['leech-life', 'supersonic', 'bite'] },
  { dex_number: 42, name: 'Golbat', types: ['POISON', 'FLYING'], base_stats: { hp: 75, atk: 80, def: 70, spa: 65, spd: 75, spe: 90 }, moves: ['leech-life', 'supersonic', 'bite', 'wing-attack'] },
  
  // Oddish line
  { dex_number: 43, name: 'Oddish', types: ['GRASS', 'POISON'], base_stats: { hp: 45, atk: 50, def: 55, spa: 75, spd: 65, spe: 30 }, moves: ['absorb', 'sweet-scent', 'acid'] },
  { dex_number: 44, name: 'Gloom', types: ['GRASS', 'POISON'], base_stats: { hp: 60, atk: 65, def: 70, spa: 85, spd: 75, spe: 40 }, moves: ['absorb', 'sweet-scent', 'acid', 'sleep-powder'] },
  { dex_number: 45, name: 'Vileplume', types: ['GRASS', 'POISON'], base_stats: { hp: 75, atk: 80, def: 85, spa: 110, spd: 90, spe: 50 }, moves: ['absorb', 'sweet-scent', 'acid', 'sleep-powder', 'petal-dance'] },
  
  // Paras line
  { dex_number: 46, name: 'Paras', types: ['BUG', 'GRASS'], base_stats: { hp: 35, atk: 70, def: 55, spa: 45, spd: 55, spe: 25 }, moves: ['scratch', 'stun-spore', 'slash'] },
  { dex_number: 47, name: 'Parasect', types: ['BUG', 'GRASS'], base_stats: { hp: 60, atk: 95, def: 80, spa: 60, spd: 80, spe: 30 }, moves: ['scratch', 'stun-spore', 'slash', 'spore'] },
  
  // Venonat line
  { dex_number: 48, name: 'Venonat', types: ['BUG', 'POISON'], base_stats: { hp: 60, atk: 55, def: 50, spa: 40, spd: 55, spe: 45 }, moves: ['tackle', 'disable', 'psybeam'] },
  { dex_number: 49, name: 'Venomoth', types: ['BUG', 'POISON'], base_stats: { hp: 70, atk: 65, def: 60, spa: 90, spd: 75, spe: 90 }, moves: ['tackle', 'disable', 'psybeam', 'psychic'] },
  
  // Diglett line
  { dex_number: 50, name: 'Diglett', types: ['GROUND'], base_stats: { hp: 10, atk: 55, def: 25, spa: 35, spd: 45, spe: 95 }, moves: ['scratch', 'growl', 'dig'] },
  { dex_number: 51, name: 'Dugtrio', types: ['GROUND'], base_stats: { hp: 35, atk: 100, def: 50, spa: 50, spd: 70, spe: 120 }, moves: ['scratch', 'growl', 'dig', 'earthquake'] },
  
  // Meowth line
  { dex_number: 52, name: 'Meowth', types: ['NORMAL'], base_stats: { hp: 40, atk: 45, def: 35, spa: 40, spd: 40, spe: 90 }, moves: ['scratch', 'growl', 'bite'] },
  { dex_number: 53, name: 'Persian', types: ['NORMAL'], base_stats: { hp: 65, atk: 70, def: 60, spa: 65, spd: 65, spe: 115 }, moves: ['scratch', 'growl', 'bite', 'slash'] },
  
  // Psyduck line
  { dex_number: 54, name: 'Psyduck', types: ['WATER'], base_stats: { hp: 50, atk: 52, def: 48, spa: 65, spd: 50, spe: 55 }, moves: ['water-gun', 'tail-whip', 'disable'] },
  { dex_number: 55, name: 'Golduck', types: ['WATER'], base_stats: { hp: 80, atk: 82, def: 78, spa: 95, spd: 80, spe: 85 }, moves: ['water-gun', 'tail-whip', 'disable', 'psychic'] },
  
  // Mankey line
  { dex_number: 56, name: 'Mankey', types: ['FIGHTING'], base_stats: { hp: 40, atk: 80, def: 35, spa: 35, spd: 45, spe: 70 }, moves: ['scratch', 'leer', 'karate-chop'] },
  { dex_number: 57, name: 'Primeape', types: ['FIGHTING'], base_stats: { hp: 65, atk: 105, def: 60, spa: 60, spd: 70, spe: 95 }, moves: ['scratch', 'leer', 'karate-chop', 'rage'] },
  
  // Growlithe line
  { dex_number: 58, name: 'Growlithe', types: ['FIRE'], base_stats: { hp: 55, atk: 70, def: 45, spa: 70, spd: 50, spe: 60 }, moves: ['bite', 'roar', 'ember'] },
  { dex_number: 59, name: 'Arcanine', types: ['FIRE'], base_stats: { hp: 90, atk: 110, def: 80, spa: 100, spd: 80, spe: 95 }, moves: ['bite', 'roar', 'ember', 'fire-blast'] },
  
  // Poliwag line
  { dex_number: 60, name: 'Poliwag', types: ['WATER'], base_stats: { hp: 40, atk: 50, def: 40, spa: 40, spd: 40, spe: 90 }, moves: ['water-gun', 'hypnosis', 'bubble'] },
  { dex_number: 61, name: 'Poliwhirl', types: ['WATER'], base_stats: { hp: 65, atk: 65, def: 65, spa: 50, spd: 50, spe: 90 }, moves: ['water-gun', 'hypnosis', 'bubble', 'body-slam'] },
  { dex_number: 62, name: 'Poliwrath', types: ['WATER', 'FIGHTING'], base_stats: { hp: 90, atk: 95, def: 95, spa: 70, spd: 90, spe: 70 }, moves: ['water-gun', 'hypnosis', 'bubble', 'body-slam', 'submission'] },
  
  // Abra line
  { dex_number: 63, name: 'Abra', types: ['PSYCHIC'], base_stats: { hp: 25, atk: 20, def: 15, spa: 105, spd: 55, spe: 90 }, moves: ['teleport'] },
  { dex_number: 64, name: 'Kadabra', types: ['PSYCHIC'], base_stats: { hp: 40, atk: 35, def: 30, spa: 120, spd: 70, spe: 105 }, moves: ['teleport', 'confusion', 'psybeam'] },
  { dex_number: 65, name: 'Alakazam', types: ['PSYCHIC'], base_stats: { hp: 55, atk: 50, def: 45, spa: 135, spd: 95, spe: 120 }, moves: ['teleport', 'confusion', 'psybeam', 'psychic'] },
  
  // Machop line
  { dex_number: 66, name: 'Machop', types: ['FIGHTING'], base_stats: { hp: 70, atk: 80, def: 50, spa: 35, spd: 35, spe: 35 }, moves: ['karate-chop', 'leer', 'focus-energy'] },
  { dex_number: 67, name: 'Machoke', types: ['FIGHTING'], base_stats: { hp: 80, atk: 100, def: 70, spa: 50, spd: 60, spe: 45 }, moves: ['karate-chop', 'leer', 'focus-energy', 'seismic-toss'] },
  { dex_number: 68, name: 'Machamp', types: ['FIGHTING'], base_stats: { hp: 90, atk: 130, def: 80, spa: 65, spd: 85, spe: 55 }, moves: ['karate-chop', 'leer', 'focus-energy', 'seismic-toss', 'submission'] },
  
  // Bellsprout line
  { dex_number: 69, name: 'Bellsprout', types: ['GRASS', 'POISON'], base_stats: { hp: 50, atk: 75, def: 35, spa: 70, spd: 30, spe: 40 }, moves: ['vine-whip', 'growth', 'wrap'] },
  { dex_number: 70, name: 'Weepinbell', types: ['GRASS', 'POISON'], base_stats: { hp: 65, atk: 90, def: 50, spa: 85, spd: 45, spe: 55 }, moves: ['vine-whip', 'growth', 'wrap', 'razor-leaf'] },
  { dex_number: 71, name: 'Victreebel', types: ['GRASS', 'POISON'], base_stats: { hp: 80, atk: 105, def: 65, spa: 100, spd: 70, spe: 70 }, moves: ['vine-whip', 'growth', 'wrap', 'razor-leaf', 'leaf-storm'] },
  
  // Tentacool line
  { dex_number: 72, name: 'Tentacool', types: ['WATER', 'POISON'], base_stats: { hp: 40, atk: 40, def: 35, spa: 50, spd: 100, spe: 70 }, moves: ['poison-sting', 'supersonic', 'wrap'] },
  { dex_number: 73, name: 'Tentacruel', types: ['WATER', 'POISON'], base_stats: { hp: 80, atk: 70, def: 65, spa: 80, spd: 120, spe: 100 }, moves: ['poison-sting', 'supersonic', 'wrap', 'hydro-pump'] },
  
  // Geodude line
  { dex_number: 74, name: 'Geodude', types: ['ROCK', 'GROUND'], base_stats: { hp: 40, atk: 80, def: 100, spa: 30, spd: 30, spe: 20 }, moves: ['tackle', 'defense-curl', 'rock-throw'] },
  { dex_number: 75, name: 'Graveler', types: ['ROCK', 'GROUND'], base_stats: { hp: 55, atk: 95, def: 115, spa: 45, spd: 45, spe: 35 }, moves: ['tackle', 'defense-curl', 'rock-throw', 'earthquake'] },
  { dex_number: 76, name: 'Golem', types: ['ROCK', 'GROUND'], base_stats: { hp: 80, atk: 120, def: 130, spa: 55, spd: 65, spe: 45 }, moves: ['tackle', 'defense-curl', 'rock-throw', 'earthquake', 'explosion'] },
  
  // Ponyta line
  { dex_number: 77, name: 'Ponyta', types: ['FIRE'], base_stats: { hp: 50, atk: 85, def: 55, spa: 65, spd: 65, spe: 90 }, moves: ['ember', 'tail-whip', 'stomp'] },
  { dex_number: 78, name: 'Rapidash', types: ['FIRE'], base_stats: { hp: 65, atk: 100, def: 70, spa: 80, spd: 80, spe: 105 }, moves: ['ember', 'tail-whip', 'stomp', 'fire-blast'] },
  
  // Slowpoke line
  { dex_number: 79, name: 'Slowpoke', types: ['WATER', 'PSYCHIC'], base_stats: { hp: 90, atk: 65, def: 65, spa: 40, spd: 40, spe: 15 }, moves: ['confusion', 'disable', 'water-gun'] },
  { dex_number: 80, name: 'Slowbro', types: ['WATER', 'PSYCHIC'], base_stats: { hp: 95, atk: 75, def: 110, spa: 100, spd: 80, spe: 30 }, moves: ['confusion', 'disable', 'water-gun', 'psychic'] },
  
  // Magnemite line
  { dex_number: 81, name: 'Magnemite', types: ['ELECTRIC', 'STEEL'], base_stats: { hp: 25, atk: 35, def: 70, spa: 95, spd: 55, spe: 45 }, moves: ['tackle', 'thundershock', 'supersonic'] },
  { dex_number: 82, name: 'Magneton', types: ['ELECTRIC', 'STEEL'], base_stats: { hp: 50, atk: 60, def: 95, spa: 120, spd: 70, spe: 70 }, moves: ['tackle', 'thundershock', 'supersonic', 'thunder-wave'] },
  
  // Farfetch'd
  { dex_number: 83, name: 'Farfetch\'d', types: ['NORMAL', 'FLYING'], base_stats: { hp: 52, atk: 90, def: 55, spa: 58, spd: 62, spe: 60 }, moves: ['peck', 'sand-attack', 'slash'] },
  
  // Doduo line
  { dex_number: 84, name: 'Doduo', types: ['NORMAL', 'FLYING'], base_stats: { hp: 35, atk: 85, def: 45, spa: 35, spd: 35, spe: 75 }, moves: ['peck', 'growl', 'fury-attack'] },
  { dex_number: 85, name: 'Dodrio', types: ['NORMAL', 'FLYING'], base_stats: { hp: 60, atk: 110, def: 70, spa: 60, spd: 60, spe: 110 }, moves: ['peck', 'growl', 'fury-attack', 'drill-peck'] },
  
  // Seel line
  { dex_number: 86, name: 'Seel', types: ['WATER'], base_stats: { hp: 65, atk: 45, def: 55, spa: 45, spd: 70, spe: 45 }, moves: ['headbutt', 'growl', 'aurora-beam'] },
  { dex_number: 87, name: 'Dewgong', types: ['WATER', 'ICE'], base_stats: { hp: 90, atk: 70, def: 80, spa: 70, spd: 95, spe: 70 }, moves: ['headbutt', 'growl', 'aurora-beam', 'ice-beam'] },
  
  // Grimer line
  { dex_number: 88, name: 'Grimer', types: ['POISON'], base_stats: { hp: 80, atk: 80, def: 50, spa: 40, spd: 50, spe: 25 }, moves: ['pound', 'poison-gas', 'sludge'] },
  { dex_number: 89, name: 'Muk', types: ['POISON'], base_stats: { hp: 105, atk: 105, def: 75, spa: 65, spd: 100, spe: 50 }, moves: ['pound', 'poison-gas', 'sludge', 'sludge-bomb'] },
  
  // Shellder line
  { dex_number: 90, name: 'Shellder', types: ['WATER'], base_stats: { hp: 30, atk: 65, def: 100, spa: 45, spd: 25, spe: 40 }, moves: ['tackle', 'withdraw', 'aurora-beam'] },
  { dex_number: 91, name: 'Cloyster', types: ['WATER', 'ICE'], base_stats: { hp: 50, atk: 95, def: 180, spa: 85, spd: 45, spe: 70 }, moves: ['tackle', 'withdraw', 'aurora-beam', 'spike-cannon'] },
  
  // Gastly line
  { dex_number: 92, name: 'Gastly', types: ['GHOST', 'POISON'], base_stats: { hp: 30, atk: 35, def: 30, spa: 100, spd: 35, spe: 80 }, moves: ['lick', 'confuse-ray', 'night-shade'] },
  { dex_number: 93, name: 'Haunter', types: ['GHOST', 'POISON'], base_stats: { hp: 45, atk: 50, def: 45, spa: 115, spd: 55, spe: 95 }, moves: ['lick', 'confuse-ray', 'night-shade', 'hypnosis'] },
  { dex_number: 94, name: 'Gengar', types: ['GHOST', 'POISON'], base_stats: { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 }, moves: ['lick', 'confuse-ray', 'night-shade', 'hypnosis', 'dream-eater'] },
  
  // Onix
  { dex_number: 95, name: 'Onix', types: ['ROCK', 'GROUND'], base_stats: { hp: 35, atk: 45, def: 160, spa: 30, spd: 45, spe: 70 }, moves: ['tackle', 'screech', 'bind'] },
  
  // Drowzee line
  { dex_number: 96, name: 'Drowzee', types: ['PSYCHIC'], base_stats: { hp: 60, atk: 48, def: 45, spa: 43, spd: 90, spe: 42 }, moves: ['pound', 'hypnosis', 'disable'] },
  { dex_number: 97, name: 'Hypno', types: ['PSYCHIC'], base_stats: { hp: 85, atk: 73, def: 70, spa: 73, spd: 115, spe: 67 }, moves: ['pound', 'hypnosis', 'disable', 'psychic'] },
  
  // Krabby line
  { dex_number: 98, name: 'Krabby', types: ['WATER'], base_stats: { hp: 30, atk: 105, def: 90, spa: 25, spd: 25, spe: 50 }, moves: ['bubble', 'leer', 'vice-grip'] },
  { dex_number: 99, name: 'Kingler', types: ['WATER'], base_stats: { hp: 55, atk: 130, def: 115, spa: 50, spd: 50, spe: 75 }, moves: ['bubble', 'leer', 'vice-grip', 'crabhammer'] },
  
  // Voltorb line
  { dex_number: 100, name: 'Voltorb', types: ['ELECTRIC'], base_stats: { hp: 40, atk: 30, def: 50, spa: 55, spd: 55, spe: 100 }, moves: ['tackle', 'screech', 'sonicboom'] },
  { dex_number: 101, name: 'Electrode', types: ['ELECTRIC'], base_stats: { hp: 60, atk: 50, def: 70, spa: 80, spd: 80, spe: 150 }, moves: ['tackle', 'screech', 'sonicboom', 'explosion'] },
  
  // Exeggcute line
  { dex_number: 102, name: 'Exeggcute', types: ['GRASS', 'PSYCHIC'], base_stats: { hp: 60, atk: 40, def: 80, spa: 60, spd: 45, spe: 40 }, moves: ['barrage', 'hypnosis', 'leech-seed'] },
  { dex_number: 103, name: 'Exeggutor', types: ['GRASS', 'PSYCHIC'], base_stats: { hp: 95, atk: 95, def: 85, spa: 125, spd: 75, spe: 55 }, moves: ['barrage', 'hypnosis', 'leech-seed', 'psychic'] },
  
  // Cubone line
  { dex_number: 104, name: 'Cubone', types: ['GROUND'], base_stats: { hp: 50, atk: 50, def: 95, spa: 40, spd: 50, spe: 35 }, moves: ['bone-club', 'leer', 'focus-energy'] },
  { dex_number: 105, name: 'Marowak', types: ['GROUND'], base_stats: { hp: 60, atk: 80, def: 110, spa: 50, spd: 80, spe: 45 }, moves: ['bone-club', 'leer', 'focus-energy', 'bonemerang'] },
  
  // Hitmonlee
  { dex_number: 106, name: 'Hitmonlee', types: ['FIGHTING'], base_stats: { hp: 50, atk: 120, def: 53, spa: 35, spd: 110, spe: 87 }, moves: ['double-kick', 'meditate', 'rolling-kick'] },
  
  // Hitmonchan
  { dex_number: 107, name: 'Hitmonchan', types: ['FIGHTING'], base_stats: { hp: 50, atk: 105, def: 79, spa: 35, spd: 110, spe: 76 }, moves: ['comet-punch', 'agility', 'fire-punch'] },
  
  // Lickitung
  { dex_number: 108, name: 'Lickitung', types: ['NORMAL'], base_stats: { hp: 90, atk: 55, def: 75, spa: 60, spd: 75, spe: 30 }, moves: ['wrap', 'supersonic', 'lick'] },
  
  // Koffing line
  { dex_number: 109, name: 'Koffing', types: ['POISON'], base_stats: { hp: 40, atk: 65, def: 95, spa: 60, spd: 45, spe: 35 }, moves: ['poison-gas', 'tackle', 'smog'] },
  { dex_number: 110, name: 'Weezing', types: ['POISON'], base_stats: { hp: 65, atk: 90, def: 120, spa: 85, spd: 70, spe: 60 }, moves: ['poison-gas', 'tackle', 'smog', 'explosion'] },
  
  // Rhyhorn line
  { dex_number: 111, name: 'Rhyhorn', types: ['GROUND', 'ROCK'], base_stats: { hp: 80, atk: 85, def: 95, spa: 30, spd: 30, spe: 25 }, moves: ['horn-attack', 'stomp', 'tail-whip'] },
  { dex_number: 112, name: 'Rhydon', types: ['GROUND', 'ROCK'], base_stats: { hp: 105, atk: 130, def: 120, spa: 45, spd: 45, spe: 40 }, moves: ['horn-attack', 'stomp', 'tail-whip', 'earthquake'] },
  
  // Chansey
  { dex_number: 113, name: 'Chansey', types: ['NORMAL'], base_stats: { hp: 250, atk: 5, def: 5, spa: 35, spd: 105, spe: 50 }, moves: ['pound', 'growl', 'tail-whip'] },
  
  // Tangela
  { dex_number: 114, name: 'Tangela', types: ['GRASS'], base_stats: { hp: 65, atk: 55, def: 115, spa: 100, spd: 40, spe: 60 }, moves: ['constrict', 'bind', 'absorb'] },
  
  // Kangaskhan
  { dex_number: 115, name: 'Kangaskhan', types: ['NORMAL'], base_stats: { hp: 105, atk: 95, def: 80, spa: 40, spd: 80, spe: 90 }, moves: ['comet-punch', 'rage', 'bite'] },
  
  // Horsea line
  { dex_number: 116, name: 'Horsea', types: ['WATER'], base_stats: { hp: 30, atk: 40, def: 70, spa: 70, spd: 25, spe: 60 }, moves: ['bubble', 'leer', 'water-gun'] },
  { dex_number: 117, name: 'Seadra', types: ['WATER'], base_stats: { hp: 55, atk: 65, def: 95, spa: 95, spd: 45, spe: 85 }, moves: ['bubble', 'leer', 'water-gun', 'hydro-pump'] },
  
  // Goldeen line
  { dex_number: 118, name: 'Goldeen', types: ['WATER'], base_stats: { hp: 45, atk: 67, def: 60, spa: 35, spd: 50, spe: 63 }, moves: ['peck', 'tail-whip', 'supersonic'] },
  { dex_number: 119, name: 'Seaking', types: ['WATER'], base_stats: { hp: 80, atk: 92, def: 65, spa: 65, spd: 80, spe: 68 }, moves: ['peck', 'tail-whip', 'supersonic', 'horn-drill'] },
  
  // Staryu line
  { dex_number: 120, name: 'Staryu', types: ['WATER'], base_stats: { hp: 30, atk: 45, def: 55, spa: 70, spd: 55, spe: 85 }, moves: ['tackle', 'harden', 'water-gun'] },
  { dex_number: 121, name: 'Starmie', types: ['WATER', 'PSYCHIC'], base_stats: { hp: 60, atk: 75, def: 85, spa: 100, spd: 85, spe: 115 }, moves: ['tackle', 'harden', 'water-gun', 'psychic'] },
  
  // Mr. Mime
  { dex_number: 122, name: 'Mr. Mime', types: ['PSYCHIC', 'FAIRY'], base_stats: { hp: 40, atk: 45, def: 65, spa: 100, spd: 120, spe: 90 }, moves: ['confusion', 'barrier', 'light-screen'] },
  
  // Scyther
  { dex_number: 123, name: 'Scyther', types: ['BUG', 'FLYING'], base_stats: { hp: 70, atk: 110, def: 80, spa: 55, spd: 80, spe: 105 }, moves: ['quick-attack', 'leer', 'slash'] },
  
  // Jynx
  { dex_number: 124, name: 'Jynx', types: ['ICE', 'PSYCHIC'], base_stats: { hp: 65, atk: 50, def: 35, spa: 115, spd: 95, spe: 95 }, moves: ['pound', 'lick', 'lovely-kiss'] },
  
  // Electabuzz
  { dex_number: 125, name: 'Electabuzz', types: ['ELECTRIC'], base_stats: { hp: 65, atk: 83, def: 57, spa: 95, spd: 85, spe: 105 }, moves: ['quick-attack', 'leer', 'thunderpunch'] },
  
  // Magmar
  { dex_number: 126, name: 'Magmar', types: ['FIRE'], base_stats: { hp: 65, atk: 95, def: 57, spa: 100, spd: 85, spe: 93 }, moves: ['ember', 'leer', 'fire-punch'] },
  
  // Pinsir
  { dex_number: 127, name: 'Pinsir', types: ['BUG'], base_stats: { hp: 65, atk: 125, def: 100, spa: 55, spd: 70, spe: 85 }, moves: ['vice-grip', 'focus-energy', 'seismic-toss'] },
  
  // Tauros
  { dex_number: 128, name: 'Tauros', types: ['NORMAL'], base_stats: { hp: 75, atk: 100, def: 95, spa: 40, spd: 70, spe: 110 }, moves: ['tackle', 'tail-whip', 'rage'] },
  
  // Magikarp line
  { dex_number: 129, name: 'Magikarp', types: ['WATER'], base_stats: { hp: 20, atk: 10, def: 55, spa: 15, spd: 20, spe: 80 }, moves: ['splash'] },
  { dex_number: 130, name: 'Gyarados', types: ['WATER', 'FLYING'], base_stats: { hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81 }, moves: ['bite', 'dragon-rage', 'leer'] },
  
  // Lapras
  { dex_number: 131, name: 'Lapras', types: ['WATER', 'ICE'], base_stats: { hp: 130, atk: 85, def: 80, spa: 85, spd: 95, spe: 60 }, moves: ['water-gun', 'growl', 'sing'] },
  
  // Ditto
  { dex_number: 132, name: 'Ditto', types: ['NORMAL'], base_stats: { hp: 48, atk: 48, def: 48, spa: 48, spd: 48, spe: 48 }, moves: ['transform'] },
  
  // Eevee line
  { dex_number: 133, name: 'Eevee', types: ['NORMAL'], base_stats: { hp: 55, atk: 55, def: 50, spa: 45, spd: 65, spe: 55 }, moves: ['tackle', 'tail-whip', 'sand-attack'] },
  { dex_number: 134, name: 'Vaporeon', types: ['WATER'], base_stats: { hp: 130, atk: 65, def: 60, spa: 110, spd: 95, spe: 65 }, moves: ['tackle', 'tail-whip', 'sand-attack', 'water-gun'] },
  { dex_number: 135, name: 'Jolteon', types: ['ELECTRIC'], base_stats: { hp: 65, atk: 65, def: 60, spa: 110, spd: 95, spe: 130 }, moves: ['tackle', 'tail-whip', 'sand-attack', 'thundershock'] },
  { dex_number: 136, name: 'Flareon', types: ['FIRE'], base_stats: { hp: 65, atk: 130, def: 60, spa: 95, spd: 110, spe: 65 }, moves: ['tackle', 'tail-whip', 'sand-attack', 'ember'] },
  
  // Porygon
  { dex_number: 137, name: 'Porygon', types: ['NORMAL'], base_stats: { hp: 65, atk: 60, def: 70, spa: 85, spd: 75, spe: 40 }, moves: ['tackle', 'sharpen', 'conversion'] },
  
  // Omanyte line
  { dex_number: 138, name: 'Omanyte', types: ['ROCK', 'WATER'], base_stats: { hp: 35, atk: 40, def: 100, spa: 90, spd: 55, spe: 35 }, moves: ['constrict', 'withdraw', 'water-gun'] },
  { dex_number: 139, name: 'Omastar', types: ['ROCK', 'WATER'], base_stats: { hp: 70, atk: 60, def: 125, spa: 115, spd: 70, spe: 55 }, moves: ['constrict', 'withdraw', 'water-gun', 'hydro-pump'] },
  
  // Kabuto line
  { dex_number: 140, name: 'Kabuto', types: ['ROCK', 'WATER'], base_stats: { hp: 30, atk: 80, def: 90, spa: 55, spd: 45, spe: 55 }, moves: ['scratch', 'harden', 'absorb'] },
  { dex_number: 141, name: 'Kabutops', types: ['ROCK', 'WATER'], base_stats: { hp: 60, atk: 115, def: 105, spa: 65, spd: 70, spe: 80 }, moves: ['scratch', 'harden', 'absorb', 'slash'] },
  
  // Aerodactyl
  { dex_number: 142, name: 'Aerodactyl', types: ['ROCK', 'FLYING'], base_stats: { hp: 80, atk: 105, def: 65, spa: 60, spd: 75, spe: 130 }, moves: ['wing-attack', 'agility', 'bite'] },
  
  // Snorlax
  { dex_number: 143, name: 'Snorlax', types: ['NORMAL'], base_stats: { hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30 }, moves: ['tackle', 'amnesia', 'rest'] },
  
  // Articuno
  { dex_number: 144, name: 'Articuno', types: ['ICE', 'FLYING'], base_stats: { hp: 90, atk: 85, def: 100, spa: 95, spd: 125, spe: 85 }, moves: ['gust', 'leer', 'ice-beam'] },
  
  // Zapdos
  { dex_number: 145, name: 'Zapdos', types: ['ELECTRIC', 'FLYING'], base_stats: { hp: 90, atk: 90, def: 85, spa: 125, spd: 90, spe: 100 }, moves: ['peck', 'thundershock', 'drill-peck'] },
  
  // Moltres
  { dex_number: 146, name: 'Moltres', types: ['FIRE', 'FLYING'], base_stats: { hp: 90, atk: 100, def: 90, spa: 125, spd: 85, spe: 90 }, moves: ['wing-attack', 'leer', 'fire-spin'] },
  
  // Dratini line
  { dex_number: 147, name: 'Dratini', types: ['DRAGON'], base_stats: { hp: 41, atk: 64, def: 45, spa: 50, spd: 50, spe: 50 }, moves: ['wrap', 'leer', 'thunder-wave'] },
  { dex_number: 148, name: 'Dragonair', types: ['DRAGON'], base_stats: { hp: 61, atk: 84, def: 65, spa: 70, spd: 70, spe: 70 }, moves: ['wrap', 'leer', 'thunder-wave', 'dragon-rage'] },
  { dex_number: 149, name: 'Dragonite', types: ['DRAGON', 'FLYING'], base_stats: { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 }, moves: ['wrap', 'leer', 'thunder-wave', 'dragon-rage', 'hyper-beam'] },
  
  // Mewtwo
  { dex_number: 150, name: 'Mewtwo', types: ['PSYCHIC'], base_stats: { hp: 106, atk: 110, def: 90, spa: 154, spd: 154, spe: 130 }, moves: ['confusion', 'disable', 'psychic'] },
  
  // Mew
  { dex_number: 151, name: 'Mew', types: ['PSYCHIC'], base_stats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 }, moves: ['pound', 'transform', 'psychic'] }
];

async function populatePokedexCache() {
  try {
    console.log('🚀 Iniciando población de pokedex_cache...');
    
    // Limpiar la tabla primero (opcional)
    console.log('🧹 Limpiando tabla pokedex_cache...');
    const { error: deleteError } = await supabase
      .from('pokedex_cache')
      .delete()
      .neq('dex_number', 0); // Eliminar todos los registros
    
    if (deleteError) {
      console.warn('⚠️ Error al limpiar tabla (puede ser normal si está vacía):', deleteError.message);
    }
    
    // Insertar todos los Pokémon en lotes
    console.log('📦 Insertando Pokémon en lotes...');
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < gen1Pokemon.length; i += batchSize) {
      const batch = gen1Pokemon.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('pokedex_cache')
        .upsert(batch, { 
          onConflict: 'dex_number',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ Error insertando lote ${Math.floor(i/batchSize) + 1}:`, error);
        throw error;
      }
      
      insertedCount += batch.length;
      console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} insertado (${batch.length} Pokémon)`);
    }
    
    // Verificar el resultado
    const { data: countData, error: countError } = await supabase
      .from('pokedex_cache')
      .select('dex_number', { count: 'exact' });
    
    if (countError) {
      console.error('❌ Error al contar Pokémon:', countError);
    } else {
      console.log(`🎉 ¡Población completada! Total de Pokémon en cache: ${countData.length}`);
    }
    
    // Mostrar algunos ejemplos
    const { data: sampleData, error: sampleError } = await supabase
      .from('pokedex_cache')
      .select('dex_number, name, types')
      .order('dex_number')
      .limit(10);
    
    if (sampleError) {
      console.error('❌ Error al obtener ejemplos:', sampleError);
    } else {
      console.log('\n📋 Primeros 10 Pokémon insertados:');
      sampleData.forEach(pokemon => {
        console.log(`  #${pokemon.dex_number.toString().padStart(3, '0')} ${pokemon.name} (${pokemon.types.join(', ')})`);
      });
    }
    
  } catch (error) {
    console.error('💥 Error general:', error);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  populatePokedexCache()
    .then(() => {
      console.log('\n🏁 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script falló:', error);
      process.exit(1);
    });
}

module.exports = { populatePokedexCache, gen1Pokemon };