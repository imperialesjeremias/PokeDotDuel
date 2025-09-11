const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createCardsWithInvoke(walletAddress) {
  try {
    console.log(`Creando cartas para wallet: ${walletAddress}`);
    
    // Paso 1: Crear o verificar usuario usando invoke
    console.log('Paso 1: Verificando/creando usuario...');
    
    const { data: createUserResult, error: createUserError } = await supabase
      .rpc('create_user_if_not_exists', {
        p_wallet_address: walletAddress
      });
    
    if (createUserError) {
      console.log('Función create_user_if_not_exists no existe, creando usuario manualmente...');
      
      // Verificar si existe el usuario
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();
      
      let userId;
      
      if (userError && userError.code === 'PGRST116') {
        // Usuario no existe, crear uno nuevo
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            generated_wallet_address: walletAddress,
            level: 1,
            xp: 0,
            badges: [],
            pokecoins: 1000,
            sol_balance: 0,
            stats: {
              wins: 0,
              losses: 0,
              packs_opened: 0,
              cards_owned: 0,
              total_wagered: 0,
              total_won: 0
            }
          })
          .select('id')
          .single();
        
        if (insertError) {
          throw new Error(`Error creando usuario: ${insertError.message}`);
        }
        
        userId = newUser.id;
        console.log(`Usuario creado con ID: ${userId}`);
      } else if (userError) {
        throw new Error(`Error buscando usuario: ${userError.message}`);
      } else {
        userId = existingUser.id;
        console.log(`Usuario encontrado con ID: ${userId}`);
      }
    } else {
      console.log('Usuario verificado/creado exitosamente');
    }
    
    // Paso 2: Obtener el ID del usuario
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (getUserError) {
      throw new Error(`Error obteniendo usuario: ${getUserError.message}`);
    }
    
    const userId = user.id;
    console.log(`Generando cartas para usuario ID: ${userId}`);
    
    // Paso 3: Generar cartas usando invoke (rpc)
    console.log('Paso 3: Generando 10 cartas...');
    
    // Solo usar Pokémon disponibles en pokedex_cache
    const availablePokemon = [1, 4, 7, 25, 39, 150]; // Bulbasaur, Charmander, Squirtle, Pikachu, Jigglypuff, Mewtwo
    
    const cardPromises = [];
    for (let i = 0; i < 10; i++) {
      const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
      
      const promise = supabase.rpc('generate_random_card', {
        owner_id: userId,
        dex_number: randomPokemon
      });
      cardPromises.push(promise);
    }
    
    const results = await Promise.all(cardPromises);
    
    const cardIds = [];
    results.forEach((result, index) => {
      if (result.error) {
        console.error(`Error generando carta ${index + 1}:`, result.error.message);
      } else {
        cardIds.push(result.data);
        console.log(`Carta ${index + 1} generada con ID: ${result.data}`);
      }
    });
    
    console.log(`\nSe generaron ${cardIds.length} cartas exitosamente`);
    
    // Paso 4: Mostrar detalles de las cartas creadas
    if (cardIds.length > 0) {
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('id, name, rarity, is_shiny, level, dex_number, types')
        .in('id', cardIds)
        .order('created_at', { ascending: false });
      
      if (!cardsError && cards) {
        console.log('\n=== CARTAS CREADAS ===');
        cards.forEach((card, index) => {
          const shinyText = card.is_shiny ? ' ✨ SHINY' : '';
          const typesText = card.types ? card.types.join('/') : 'Unknown';
          console.log(`${index + 1}. ${card.name} (Dex #${card.dex_number}) - ${card.rarity}${shinyText} - Nivel ${card.level} - Tipo: ${typesText}`);
        });
      }
    }
    
    // Paso 5: Mostrar estadísticas del usuario
    const { data: userStats, error: statsError } = await supabase
      .from('users')
      .select(`
        id,
        wallet_address,
        level,
        xp,
        pokecoins,
        stats,
        cards:cards(count)
      `)
      .eq('wallet_address', walletAddress)
      .single();
    
    if (!statsError && userStats) {
      console.log('\n=== ESTADÍSTICAS DEL USUARIO ===');
      console.log(`Wallet: ${userStats.wallet_address}`);
      console.log(`Nivel: ${userStats.level}`);
      console.log(`XP: ${userStats.xp}`);
      console.log(`Pokécoins: ${userStats.pokecoins}`);
      console.log(`Total de cartas: ${userStats.cards[0]?.count || 0}`);
      if (userStats.stats) {
        console.log(`Victorias: ${userStats.stats.wins || 0}`);
        console.log(`Derrotas: ${userStats.stats.losses || 0}`);
        console.log(`Packs abiertos: ${userStats.stats.packs_opened || 0}`);
      }
    }
    
    console.log('\n¡Proceso completado exitosamente!');
    
  } catch (error) {
    console.error('Error en el proceso:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar el script
const walletAddress = '0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2';
createCardsWithInvoke(walletAddress);