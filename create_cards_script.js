const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createCardsForWallet(walletAddress) {
  try {
    console.log(`Buscando usuario con wallet: ${walletAddress}`);
    
    // Verificar si existe el usuario
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('wallet_address', walletAddress)
      .single();
    
    let userId;
    
    if (userError && userError.code === 'PGRST116') {
      // Usuario no existe, crear uno nuevo
      console.log('Usuario no encontrado, creando nuevo usuario...');
      
      const { data: newUser, error: createError } = await supabase
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
      
      if (createError) {
        throw new Error(`Error creando usuario: ${createError.message}`);
      }
      
      userId = newUser.id;
      console.log(`Usuario creado con ID: ${userId}`);
    } else if (userError) {
      throw new Error(`Error buscando usuario: ${userError.message}`);
    } else {
      userId = existingUser.id;
      console.log(`Usuario encontrado con ID: ${userId}`);
    }
    
    // Generar 10 cartas usando la función de la base de datos
    console.log('Generando 10 cartas...');
    
    const cardPromises = [];
    for (let i = 0; i < 10; i++) {
      const promise = supabase.rpc('generate_random_card', {
        owner_id: userId
      });
      cardPromises.push(promise);
    }
    
    const results = await Promise.all(cardPromises);
    
    const cardIds = results.map(result => {
      if (result.error) {
        console.error('Error generando carta:', result.error);
        return null;
      }
      return result.data;
    }).filter(id => id !== null);
    
    console.log(`Se generaron ${cardIds.length} cartas exitosamente:`);
    cardIds.forEach((cardId, index) => {
      console.log(`  Carta ${index + 1}: ${cardId}`);
    });
    
    // Obtener detalles de las cartas creadas
    if (cardIds.length > 0) {
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('id, name, rarity, is_shiny, level, dex_number')
        .in('id', cardIds);
      
      if (!cardsError && cards) {
        console.log('\nDetalles de las cartas creadas:');
        cards.forEach(card => {
          console.log(`  ${card.name} (Dex #${card.dex_number}) - ${card.rarity}${card.is_shiny ? ' ✨ SHINY' : ''} - Nivel ${card.level}`);
        });
      }
    }
    
    console.log('\n¡Proceso completado exitosamente!');
    
  } catch (error) {
    console.error('Error en el proceso:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
const walletAddress = '0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2';
createCardsForWallet(walletAddress);