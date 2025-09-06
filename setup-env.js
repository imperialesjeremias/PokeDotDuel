#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('⚙️  Configurando variables de entorno para PokeDotDuel...\n');

// Verificar si ya existe .env.local
if (fs.existsSync('.env.local')) {
  console.log('✅ .env.local ya existe');
  console.log('💡 Si quieres resetearlo, elimina el archivo y ejecuta este comando nuevamente\n');
  process.exit(0);
}

// Crear .env.local desde .env.example
if (fs.existsSync('.env.example')) {
  try {
    fs.copyFileSync('.env.example', '.env.local');
    console.log('✅ Archivo .env.local creado exitosamente');
    console.log('📝 Variables de entorno configuradas con valores de ejemplo');
    console.log('⚠️  IMPORTANTE: Edita .env.local con tus claves reales antes de usar en producción\n');

    console.log('🔧 Variables configuradas:');
    console.log('   • Solana RPC: devnet');
    console.log('   • Program IDs: placeholders (cambiar por IDs reales)');
    console.log('   • Privy: placeholders');
    console.log('   • Supabase: placeholders');
    console.log('   • WebSocket: localhost:3001');
    console.log('   • JWT Secret: placeholder\n');

  } catch (error) {
    console.error('❌ Error al crear .env.local:', error.message);
    process.exit(1);
  }
} else {
  console.log('❌ No se encontró .env.example');
  console.log('   Crea un archivo .env.example primero o configura .env.local manualmente\n');
  process.exit(1);
}

console.log('🎯 Próximos pasos:');
console.log('   1. Edita .env.local con tus claves reales');
console.log('   2. Ejecuta: npm run start');
console.log('   3. Accede a http://localhost:3000\n');

console.log('🚀 ¡Configuración completada!');

