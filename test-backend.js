#!/usr/bin/env node

const http = require('http');

console.log('🧪 Probando conexión al backend...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Backend está funcionando correctamente');
      console.log('📄 Respuesta del health check:', data);
    } else {
      console.log('❌ Error en el health check:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ No se pudo conectar al backend. ¿Está ejecutándose?');
  console.log('💡 Ejecuta: npm run dev');
  console.log('🔍 Error:', error.message);
});

req.on('timeout', () => {
  console.log('⏰ Timeout conectando al backend');
  req.destroy();
});

req.end();

