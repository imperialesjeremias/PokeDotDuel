#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');

console.log('🎮 PokeDotDuel - Inicio Automático\n');

// Función para verificar si existe un archivo
function fileExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

// Verificar y configurar variables de entorno
console.log('⚙️  Verificando configuración...');

if (!fileExists('.env.local')) {
  console.log('   Configurando variables de entorno...');

  if (fileExists('.env.example')) {
    try {
      fs.copyFileSync('.env.example', '.env.local');
      console.log('   ✅ .env.local creado');
    } catch (error) {
      console.log('   ❌ Error al crear .env.local:', error.message);
    }
  } else {
    console.log('   ❌ No se encontró .env.example');
    console.log('   Crea un archivo .env.local manualmente');
  }
} else {
  console.log('   ✅ .env.local ya existe');
}

// Verificar archivos importantes
const requiredFiles = [
  'apps/web/package.json',
  'apps/websocket-server/package.json',
  'package.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fileExists(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - NO ENCONTRADO`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Faltan archivos importantes. Ejecuta: npm run verify\n');
  process.exit(1);
}

console.log('\n🚀 Iniciando servicios...\n');

// Función para ejecutar comandos
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`   Ejecutando: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: ['inherit', 'inherit', 'inherit'],
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Ejecutar turbo start
async function startServices() {
  try {
    console.log('🎯 Ejecutando: turbo run start');
    console.log('   (Esto iniciará ambos servicios simultáneamente)\n');

    await runCommand('turbo', ['run', 'start']);

  } catch (error) {
    console.log('\n❌ Error al ejecutar turbo:');
    console.log(error.message);
    console.log('\n🔧 Solución alternativa:');
    console.log('   Ejecuta manualmente:');
    console.log('   1. Terminal 1: cd apps/websocket-server && npm run dev');
    console.log('   2. Terminal 2: cd apps/web && npm run dev');
    console.log('   3. Accede a http://localhost:3000\n');

    process.exit(1);
  }
}

startServices();

