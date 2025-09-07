#!/bin/bash

# PokeDotDuel Docker Test Script
# Verifies Docker setup and starts services

set -e

echo "🐳 Testing Docker Setup for PokeDotDuel"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available${NC}"
    echo "Please ensure Docker Compose is installed"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env file from example..."
    cp docker-env-example.txt .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check if required files exist
required_files=("apps/backend/package.json" "apps/web/package.json" "docker-compose.yml")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Required file missing: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ All required files are present${NC}"

# Test Docker connectivity
echo "Testing Docker connectivity..."
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
else
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo "Please start Docker Desktop"
    exit 1
fi

# Pull required images
echo "Pulling required Docker images..."
docker pull postgres:15-alpine &
docker pull dpage/pgadmin4:latest &
docker pull redis:7-alpine &
wait

echo -e "${GREEN}✅ Docker images pulled successfully${NC}"

# Test docker-compose configuration
echo "Testing docker-compose configuration..."
if docker-compose config &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose configuration is valid${NC}"
else
    echo -e "${RED}❌ Docker Compose configuration has errors${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🎉 Docker setup is ready!${NC}"
echo ""
echo "To start the development environment:"
echo "  ./scripts/dev.sh start"
echo "  # or"
echo "  docker-compose up --build -d"
echo ""
echo "Access your application at:"
echo "  🌐 Frontend: http://localhost:3000"
echo "  🚀 Backend: http://localhost:3001"
echo "  🗄️  pgAdmin: http://localhost:5050"
echo "  📧 Email: http://localhost:54324 (if using Supabase CLI)"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
