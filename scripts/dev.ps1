# PokeDotDuel Development Script for Windows
# This script helps you start the development environment with Docker

param(
    [string]$Action = "menu"
)

# Colors for output
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Blue"
$WHITE = "White"

# Function to print colored output
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $BLUE
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $GREEN
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $YELLOW
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $RED
}

# Check if Docker is installed
function Test-Docker {
    try {
        $dockerVersion = docker --version 2>$null
        $composeVersion = docker-compose --version 2>$null

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker and Docker Compose are installed"
            return $true
        }
    }
    catch {
        Write-Error "Docker is not installed or not running. Please install Docker Desktop first."
        return $false
    }
}

# Create environment file if it doesn't exist
function New-EnvFile {
    if (!(Test-Path ".env")) {
        Write-Info "Creating .env file..."

        $envContent = @"
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/pokedotduel

# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
"@

        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success ".env file created"
    }
    else {
        Write-Info ".env file already exists"
    }
}

# Build and start services
function Start-Services {
    Write-Info "Building and starting services (using simple configuration)..."
    docker-compose -f docker-compose.simple.yml up --build -d

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services started successfully!"
        Write-Info "Access your application at:"
        Write-Host "  🌐 Frontend: http://localhost:3000" -ForegroundColor $GREEN
        Write-Host "  🚀 Backend API: http://localhost:3001" -ForegroundColor $GREEN
        Write-Host "  🗄️  pgAdmin: http://localhost:5050" -ForegroundColor $GREEN
        Write-Host "  🐘 PostgreSQL: localhost:5432" -ForegroundColor $GREEN
        Write-Info ""
        Write-Info "pgAdmin credentials:"
        Write-Info "  Email: admin@pokedotduel.com"
        Write-Info "  Password: admin123"
    }
    else {
        Write-Error "Failed to start services"
    }
}

# Show service status
function Show-Status {
    Write-Info "Service Status:"
    docker-compose -f docker-compose.simple.yml ps
}

# Show logs
function Show-Logs {
    param([string]$Service = "")

    if ($Service -eq "") {
        Write-Info "Showing logs for all services (press Ctrl+C to exit):"
        docker-compose logs -f
    }
    else {
        Write-Info "Showing logs for $Service (press Ctrl+C to exit):"
        docker-compose logs -f $Service
    }
}

# Stop services
function Stop-Services {
    Write-Info "Stopping services..."
    docker-compose down

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services stopped"
    }
    else {
        Write-Error "Failed to stop services"
    }
}

# Clean up
function Invoke-Cleanup {
    Write-Warning "This will remove all containers, volumes, and images"
    $confirmation = Read-Host "Are you sure? (y/N)"
    if ($confirmation -eq "y" -or $confirmation -eq "Y") {
        Write-Info "Cleaning up..."
        docker-compose down -v --rmi all
        Write-Success "Cleanup completed"
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Info "Installing dependencies..."

    # Install backend dependencies
    if (Test-Path "apps/backend") {
        Write-Info "Installing backend dependencies..."
        docker run --rm -v "${PWD}/apps/backend:/app" -w /app node:20-alpine npm ci
    }

    # Install frontend dependencies
    if (Test-Path "apps/web") {
        Write-Info "Installing frontend dependencies..."
        docker run --rm -v "${PWD}/apps/web:/app" -w /app node:20-alpine npm ci
    }

    Write-Success "Dependencies installed"
}

# Main menu
function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor $GREEN
    Write-Host "║           🚀 PokeDotDuel Dev Tools            ║" -ForegroundColor $GREEN
    Write-Host "╠══════════════════════════════════════════════╣" -ForegroundColor $GREEN
    Write-Host "║  1) Start development environment            ║" -ForegroundColor $WHITE
    Write-Host "║  2) Stop development environment             ║" -ForegroundColor $WHITE
    Write-Host "║  3) Show service status                      ║" -ForegroundColor $WHITE
    Write-Host "║  4) Show logs (all services)                 ║" -ForegroundColor $WHITE
    Write-Host "║  5) Show logs (specific service)             ║" -ForegroundColor $WHITE
    Write-Host "║  6) Install dependencies                     ║" -ForegroundColor $WHITE
    Write-Host "║  7) Clean up (remove containers/volumes)     ║" -ForegroundColor $WHITE
    Write-Host "║  8) Create environment file                  ║" -ForegroundColor $WHITE
    Write-Host "║  0) Exit                                     ║" -ForegroundColor $WHITE
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor $GREEN
    Write-Host ""
}

# Main script logic
function Invoke-Main {
    if (!(Test-Docker)) {
        exit 1
    }

    switch ($Action) {
        "start" {
            New-EnvFile
            Install-Dependencies
            Start-Services
        }
        "stop" {
            Stop-Services
        }
        "status" {
            Show-Status
        }
        "logs" {
            Show-Logs
        }
        "install" {
            Install-Dependencies
        }
        "cleanup" {
            Invoke-Cleanup
        }
        "env" {
            New-EnvFile
        }
        default {
            while ($true) {
                Show-Menu
                $choice = Read-Host "Choose an option (0-8)"

                switch ($choice) {
                    1 {
                        New-EnvFile
                        Install-Dependencies
                        Start-Services
                    }
                    2 {
                        Stop-Services
                    }
                    3 {
                        Show-Status
                    }
                    4 {
                        Show-Logs
                    }
                    5 {
                        $service = Read-Host "Enter service name (backend/frontend/postgres/supabase/redis)"
                        Show-Logs -Service $service
                    }
                    6 {
                        Install-Dependencies
                    }
                    7 {
                        Invoke-Cleanup
                    }
                    8 {
                        New-EnvFile
                    }
                    0 {
                        Write-Info "Goodbye! 👋"
                        exit 0
                    }
                    default {
                        Write-Error "Invalid option. Please try again."
                    }
                }

                Read-Host "Press Enter to continue"
            }
        }
    }
}

# Run main function
Invoke-Main
