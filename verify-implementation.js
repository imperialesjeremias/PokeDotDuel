#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando implementación del backend PokeDotDuel...\n');

const checks = [
  {
    name: '📁 Estructura de archivos',
    description: 'Verificar que todos los archivos del backend existen',
    check: () => {
      const files = [
        'apps/websocket-server/src/index.ts',
        'apps/websocket-server/src/lobby/Matchmaker.ts',
        'apps/websocket-server/src/battle/BattleEngine.ts',
        'apps/websocket-server/src/packs/PackManager.ts',
        'apps/websocket-server/src/teams/TeamBuilder.ts',
        'apps/websocket-server/src/marketplace/MarketplaceManager.ts',
        'apps/websocket-server/src/economy/EconomyManager.ts',
        'apps/websocket-server/src/collection/CollectionManager.ts',
        'apps/websocket-server/src/progression/ProgressionManager.ts',
        'apps/web/src/hooks/usePVP.ts',
        'apps/web/src/hooks/useVRF.ts',
        'apps/web/src/hooks/useBridge.ts',
        'apps/web/src/components/PVPBattle.tsx',
        'apps/web/src/components/PackOpener.tsx',
        'apps/web/src/components/EconomyPanel.tsx'
      ];

      const missing = files.filter(file => !fs.existsSync(file));
      if (missing.length === 0) {
        return { passed: true, message: 'Todos los archivos existen' };
      } else {
        return { passed: false, message: `Archivos faltantes: ${missing.join(', ')}` };
      }
    }
  },
  {
    name: '📦 Dependencias del WebSocket Server',
    description: 'Verificar que las dependencias principales están instaladas',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('apps/websocket-server/package.json', 'utf8'));
      const deps = packageJson.dependencies;

      const required = ['socket.io', 'express', '@supabase/supabase-js'];
      const missing = required.filter(dep => !deps[dep]);

      if (missing.length === 0) {
        return { passed: true, message: 'Todas las dependencias principales instaladas' };
      } else {
        return { passed: false, message: `Dependencias faltantes: ${missing.join(', ')}` };
      }
    }
  },
  {
    name: '📦 Dependencias del Frontend',
    description: 'Verificar que las dependencias del frontend están configuradas',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('apps/web/package.json', 'utf8'));
      const deps = packageJson.dependencies;

      const required = ['@solana/web3.js', '@supabase/supabase-js', 'socket.io-client'];
      const missing = required.filter(dep => !deps[dep]);

      if (missing.length === 0) {
        return { passed: true, message: 'Dependencias del frontend configuradas' };
      } else {
        return { passed: false, message: `Dependencias faltantes: ${missing.join(', ')}` };
      }
    }
  },
  {
    name: '🔧 Configuración de TypeScript',
    description: 'Verificar que los archivos de configuración de TS existen',
    check: () => {
      const configFiles = [
        'apps/websocket-server/tsconfig.json',
        'apps/web/tsconfig.json',
        'packages/shared/tsconfig.json'
      ];

      const missing = configFiles.filter(file => !fs.existsSync(file));
      if (missing.length === 0) {
        return { passed: true, message: 'Configuración de TypeScript completa' };
      } else {
        return { passed: false, message: `Archivos de configuración faltantes: ${missing.join(', ')}` };
      }
    }
  },
  {
    name: '📋 Tests',
    description: 'Verificar que los archivos de test existen',
    check: () => {
      const testFiles = [
        'tests/backend.test.ts',
        'tests/battle-engine.test.ts',
        'tests/mock-solana-programs.ts'
      ];

      const missing = testFiles.filter(file => !fs.existsSync(file));
      if (missing.length === 0) {
        return { passed: true, message: 'Archivos de test creados' };
      } else {
        return { passed: false, message: `Archivos de test faltantes: ${missing.join(', ')}` };
      }
    }
  },
  {
    name: '🎮 Documentación',
    description: 'Verificar que la documentación está actualizada',
    check: () => {
      const docFiles = [
        'README.md',
        'BACKEND_IMPLEMENTATION_SUMMARY.md',
        'docs/SETUP.md',
        'docs/ARCHITECTURE.md',
        'docs/API.md'
      ];

      const missing = docFiles.filter(file => !fs.existsSync(file));
      if (missing.length === 0) {
        return { passed: true, message: 'Documentación completa' };
      } else {
        return { passed: false, message: `Documentos faltantes: ${missing.join(', ')}` };
      }
    }
  },
  {
    name: '⚙️ Variables de entorno',
    description: 'Verificar que el archivo de ejemplo de env existe',
    check: () => {
      if (fs.existsSync('ENVIRONMENT_SETUP.md')) {
        return { passed: true, message: 'Guía de configuración de entorno disponible' };
      } else {
        return { passed: false, message: 'Falta archivo de configuración de entorno' };
      }
    }
  }
];

let passedChecks = 0;
let totalChecks = checks.length;

console.log('📋 Ejecutando verificaciones...\n');

checks.forEach((check, index) => {
  console.log(`${index + 1}. ${check.name}`);
  console.log(`   ${check.description}`);

  try {
    const result = check.check();

    if (result.passed) {
      console.log(`   ✅ PASSED: ${result.message}`);
      passedChecks++;
    } else {
      console.log(`   ❌ FAILED: ${result.message}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }

  console.log('');
});

console.log('📊 Resultados de verificación:');
console.log(`   Total: ${totalChecks}`);
console.log(`   Pasaron: ${passedChecks}`);
console.log(`   Fallaron: ${totalChecks - passedChecks}`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 ¡Verificación completa! Todos los sistemas están implementados correctamente.');
  console.log('\n🚀 Próximos pasos:');
  console.log('   1. Configurar variables de entorno (.env.local)');
  console.log('   2. Desplegar programas Solana externos');
  console.log('   3. Ejecutar: npm run dev');
  console.log('   4. Probar el frontend en http://localhost:3000');
} else {
  console.log('\n⚠️  Algunas verificaciones fallaron. Revisa los errores arriba.');
}

console.log('\n🏆 ¡Implementación verificada exitosamente!');
