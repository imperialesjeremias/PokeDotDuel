#!/bin/bash

# PokeDotDuel Development Script
# This script helps you start the development environment with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Create environment file if it doesn't exist
create_env_file() {
    if [ ! -f .env ]; then
        print_info "Creating .env file..."
        cat > .env << EOF
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
EOF
        print_success ".env file created"
    else
        print_info ".env file already exists"
    fi
}

# Build and start services
start_services() {
    print_info "Building and starting services (using simple configuration)..."
    docker-compose -f docker-compose.simple.yml up --build -d

    if [ $? -eq 0 ]; then
        print_success "Services started successfully!"
        print_info "Access your application at:"
        print_success "  🌐 Frontend: http://localhost:3000"
        print_success "  🚀 Backend API: http://localhost:3001"
        print_success "  🗄️  pgAdmin: http://localhost:5050"
        print_success "  🐘 PostgreSQL: localhost:5432"
        print_info ""
        print_info "pgAdmin credentials:"
        print_info "  Email: admin@pokedotduel.com"
        print_info "  Password: admin123"
    else
        print_error "Failed to start services"
    fi
}

# Show service status
show_status() {
    print_info "Service Status:"
    docker-compose -f docker-compose.simple.yml ps
}

# Show logs
show_logs() {
    if [ -z "$2" ]; then
        print_info "Showing logs for all services (press Ctrl+C to exit):"
        docker-compose -f docker-compose.simple.yml logs -f
    else
        print_info "Showing logs for $2 (press Ctrl+C to exit):"
        docker-compose -f docker-compose.simple.yml logs -f $2
    fi
}

# Stop services
stop_services() {
    print_info "Stopping services..."
    docker-compose -f docker-compose.simple.yml down
    print_success "Services stopped"
}

# Clean up
cleanup() {
    print_warning "This will remove all containers, volumes, and images"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose -f docker-compose.simple.yml down -v --rmi all
        print_success "Cleanup completed"
    fi
}

# Install dependencies
install_deps() {
    print_info "Installing dependencies..."

    # Install backend dependencies
    if [ -d "apps/backend" ]; then
        print_info "Installing backend dependencies..."
        docker run --rm -v $(pwd)/apps/backend:/app -w /app node:20-alpine npm ci
    fi

    # Install frontend dependencies
    if [ -d "apps/web" ]; then
        print_info "Installing frontend dependencies..."
        docker run --rm -v $(pwd)/apps/web:/app -w /app node:20-alpine npm ci
    fi

    print_success "Dependencies installed"
}

# Main menu
show_menu() {
    echo "
╔══════════════════════════════════════════════╗
║           🚀 PokeDotDuel Dev Tools            ║
╠══════════════════════════════════════════════╣
║  1) Start development environment            ║
║  2) Stop development environment             ║
║  3) Show service status                      ║
║  4) Show logs (all services)                 ║
║  5) Show logs (specific service)             ║
║  6) Install dependencies                     ║
║  7) Clean up (remove containers/volumes)     ║
║  8) Create environment file                  ║
║  0) Exit                                     ║
╚══════════════════════════════════════════════╝"
}

# Main script logic
main() {
    check_docker

    case "$1" in
        start)
            create_env_file
            install_deps
            start_services
            ;;
        stop)
            stop_services
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$@"
            ;;
        install)
            install_deps
            ;;
        cleanup)
            cleanup
            ;;
        env)
            create_env_file
            ;;
        *)
            while true; do
                show_menu
                read -p "Choose an option (0-8): " choice
                echo

                case $choice in
                    1)
                        create_env_file
                        install_deps
                        start_services
                        ;;
                    2)
                        stop_services
                        ;;
                    3)
                        show_status
                        ;;
                    4)
                        show_logs
                        ;;
                    5)
                        read -p "Enter service name (backend/frontend/postgres/supabase/redis): " service
                        show_logs "$service"
                        ;;
                    6)
                        install_deps
                        ;;
                    7)
                        cleanup
                        ;;
                    8)
                        create_env_file
                        ;;
                    0)
                        print_info "Goodbye! 👋"
                        exit 0
                        ;;
                    *)
                        print_error "Invalid option. Please try again."
                        ;;
                esac

                echo
                read -p "Press Enter to continue..."
                clear
            done
            ;;
    esac
}

# Run main function with all arguments
main "$@"
