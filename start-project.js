#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando PokeDotDuel...');

const backendPath = path.join(__dirname, 'apps', 'backend');
const frontendPath = path.join(__dirname, 'apps', 'web');

// Función para ejecutar comandos
function runCommand(command, args, cwd, name) {
  console.log(`📦 Iniciando ${name}...`);
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (error) => {
    console.error(`❌ Error iniciando ${name}:`, error);
  });

  child.on('exit', (code) => {
    console.log(`🛑 ${name} terminó con código ${code}`);
  });

  return child;
}

// Iniciar backend
const backendProcess = runCommand(
  'npm',
  ['run', 'start:dev'],
  backendPath,
  'Backend (NestJS)'
);

// Iniciar frontend después de un pequeño delay
setTimeout(() => {
  const frontendProcess = runCommand(
    'npm',
    ['run', 'dev'],
    frontendPath,
    'Frontend (Next.js)'
  );

  // Manejar señales de terminación
  process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo servicios...');
    backendProcess.kill('SIGINT');
    frontendProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Deteniendo servicios...');
    backendProcess.kill('SIGTERM');
    frontendProcess.kill('SIGTERM');
    process.exit(0);
  });

}, 3000); // Esperar 3 segundos para que el backend se inicie primero

console.log('✅ Servicios iniciándose...');
console.log('🌐 Backend: http://localhost:3001');
console.log('🌐 Frontend: http://localhost:3000');
console.log('💡 Presiona Ctrl+C para detener todos los servicios');