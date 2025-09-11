const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://piauenmnxufwkglkogrh.supabase.co';
const supabaseServiceKey = 'sb_secret__G_ZeBFndBeq8Bq0DkJYQg_H2mBpeKl';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteTestUser() {
  try {
    console.log('🔄 Eliminando usuario de prueba...');
    
    const testWalletAddress = '0xd320A44e39C6cb5eB8274aEF3403D5f31284CeD2';

    // Verificar si el usuario existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('wallet_address', testWalletAddress)
      .single();

    if (!existingUser) {
      console.log('ℹ️  Usuario de prueba no encontrado en la base de datos');
      return;
    }

    console.log('👤 Usuario encontrado:', existingUser);

    // Eliminar el usuario
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('wallet_address', testWalletAddress);

    if (error) {
      console.error('❌ Error eliminando usuario:', error);
      throw error;
    }

    console.log('✅ Usuario de prueba eliminado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar la función
deleteTestUser().then(() => {
  console.log('🎉 Proceso completado');
  process.exit(0);
});