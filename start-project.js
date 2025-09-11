#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to run command in specific directory
function runCommand(command, args, cwd, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Starting ${label}...`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ ${label} exited with code ${code}`);
        reject(new Error(`${label} failed`));
      } else {
        console.log(`✅ ${label} completed successfully`);
        resolve();
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Error starting ${label}:`, error);
      reject(error);
    });
  });
}

// Function to check if directory exists
function directoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

async function startProject() {
  console.log('🎮 Starting PokeDuel Development Environment...');
  
  const rootDir = __dirname;
  const webAppDir = path.join(rootDir, 'apps', 'web');
  const backendDir = path.join(rootDir, 'apps', 'backend');
  const wsDir = path.join(rootDir, 'apps', 'websocket-server');

  // Check if required directories exist
  if (!directoryExists(webAppDir)) {
    console.error('❌ Web app directory not found:', webAppDir);
    process.exit(1);
  }

  try {
    // Start web application (Next.js)
    console.log('\n📱 Starting Web Application (Next.js)...');
    
    const webProcess = spawn('npm', ['run', 'dev'], {
      cwd: webAppDir,
      stdio: 'inherit',
      shell: true
    });

    webProcess.on('error', (error) => {
      console.error('❌ Error starting web app:', error);
      process.exit(1);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development servers...');
      webProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down development servers...');
      webProcess.kill('SIGTERM');
      process.exit(0);
    });

    console.log('\n✅ Development environment started!');
    console.log('📱 Web App: http://localhost:3000');
    console.log('\n💡 Press Ctrl+C to stop all servers');

  } catch (error) {
    console.error('❌ Failed to start development environment:', error);
    process.exit(1);
  }
}

// Start the project
startProject().catch((error) => {
  console.error('❌ Startup failed:', error);
  process.exit(1);
});