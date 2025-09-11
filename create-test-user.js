const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://piauenmnxufwkglkogrh.supabase.co';
const supabaseServiceKey = 'sb_secret__G_ZeBFndBeq8Bq0DkJYQg_H2mBpeKl';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    console.log('🔄 Creando usuario de prueba...');
    
    const testUser = {
      wallet_address: '0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2',
      generated_wallet_address: 'generated-test-wallet-456',
      level: 3,
      xp: 750,
      badges: ['starter', 'first_win'],
      pokecoins: 2500,
      sol_balance: 50000,
      stats: {
        wins: 5,
        losses: 2,
        packs_opened: 8,
        cards_owned: 15,
        total_wagered: 25000,
        total_won: 40000
      }
    };

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('wallet_address', testUser.wallet_address)
      .single();

    if (existingUser) {
      console.log('✅ Usuario ya existe:', existingUser);
      return existingUser;
    }

    // Crear nuevo usuario
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando usuario:', error);
      throw error;
    }

    console.log('✅ Usuario creado exitosamente:', newUser);
    return newUser;

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// SCRIPT DESHABILITADO - Este script crea un usuario de prueba hardcodeado
// que puede causar problemas de autenticación. Solo descomentar si es necesario para testing.

// Ejecutar la función
// createTestUser().then(() => {
//   console.log('🎉 Proceso completado');
//   process.exit(0);
// });