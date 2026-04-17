#!/bin/bash

# AgenzieCase Docker Deployment Script
# Usage: ./deploy.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        log_warn "Environment file not found. Creating from example..."
        cp .env.example "$ENV_FILE"
        log_error "Please edit $ENV_FILE with your configuration before running deployment"
        exit 1
    fi
}

# Commands
case "${1:-help}" in
    build)
        log_info "Building Docker images..."
        docker-compose build --no-cache
        log_info "Build complete!"
        ;;

    up)
        check_env
        log_info "Starting services..."
        docker-compose up -d
        log_info "Services started!"
        docker-compose ps
        ;;

    down)
        log_info "Stopping services..."
        docker-compose down
        log_info "Services stopped!"
        ;;

    restart)
        log_info "Restarting services..."
        docker-compose restart
        log_info "Services restarted!"
        ;;

    logs)
        docker-compose logs -f "${2:-}"
        ;;

    status)
        docker-compose ps
        ;;

    health)
        log_info "Checking service health..."
        docker-compose ps
        echo ""
        log_info "Frontend health:"
        curl -s http://localhost/health || echo "Frontend not responding"
        echo ""
        log_info "Backend health:"
        curl -s http://localhost:3456/api/health || echo "Backend not responding"
        ;;

    db:shell)
        log_info "Opening database shell..."
        docker-compose exec database psql -U agenziecase -d agenziecase
        ;;

    db:backup)
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        log_info "Creating database backup: $BACKUP_FILE"
        docker-compose exec -T database pg_dump -U agenziecase agenziecase > "$BACKUP_FILE"
        log_info "Backup complete: $BACKUP_FILE"
        ;;

    redis:shell)
        log_info "Opening Redis shell..."
        docker-compose exec redis redis-cli -a redis_password
        ;;

    clean)
        log_warn "This will remove all containers, volumes, and images!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            log_info "Cleaning up..."
            docker-compose down -v --rmi all
            log_info "Cleanup complete!"
        else
            log_info "Cleanup aborted"
        fi
        ;;

    init)
        log_info "Initializing project..."
        check_env
        log_info "Building images..."
        docker-compose build
        log_info "Starting services..."
        docker-compose up -d
        log_info "Waiting for services to be healthy..."
        sleep 10
        log_info "Running database migrations..."
        docker-compose exec backend npm run migrate
        log_info "Seeding database..."
        docker-compose exec backend npm run seed
        log_info "Initialization complete!"
        log_info "Frontend: http://localhost"
        log_info "Backend API: http://localhost:3456"
        ;;

    help|*)
        echo "AgenzieCase Docker Deployment Script"
        echo ""
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  build        Build Docker images"
        echo "  up           Start all services"
        echo "  down         Stop all services"
        echo "  restart      Restart all services"
        echo "  logs         View logs (optional: specify service name)"
        echo "  status       Show service status"
        echo "  health       Check service health"
        echo "  db:shell     Open database shell"
        echo "  db:backup    Create database backup"
        echo "  redis:shell  Open Redis shell"
        echo "  clean        Remove all containers, volumes, and images"
        echo "  init         Initialize project (build, start, migrate, seed)"
        echo "  help         Show this help message"
        ;;
esac
