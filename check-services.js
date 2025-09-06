#!/usr/bin/env node

const http = require('http');

console.log('🔍 Verificando servicios...\n');

function checkService(name, host, port, path = '/') {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${name}: OK (puerto ${port})`);
        } else {
          console.log(`⚠️  ${name}: Respuesta ${res.statusCode} (puerto ${port})`);
        }
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name}: No responde (puerto ${port}) - ${err.code}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏱️  ${name}: Timeout (puerto ${port})`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function checkAllServices() {
  console.log('Verificando servicios en ejecución...\n');

  const services = [
    { name: 'Frontend (Next.js)', host: 'localhost', port: 3000 },
    { name: 'WebSocket Server', host: 'localhost', port: 3001, path: '/health' }
  ];

  let runningCount = 0;

  for (const service of services) {
    const isRunning = await checkService(
      service.name,
      service.host,
      service.port,
      service.path
    );
    if (isRunning) runningCount++;
  }

  console.log(`\n📊 Estado: ${runningCount}/${services.length} servicios funcionando`);

  if (runningCount === services.length) {
    console.log('\n🎉 ¡Todos los servicios están funcionando!');
    console.log('🌐 Accede a: http://localhost:3000');
  } else if (runningCount > 0) {
    console.log('\n⚠️  Algunos servicios están funcionando');
    console.log('💡 Puede que estén iniciándose aún...');
  } else {
    console.log('\n❌ Ningún servicio responde');
    console.log('🔧 Ejecuta: npm run start');
  }
}

checkAllServices();

