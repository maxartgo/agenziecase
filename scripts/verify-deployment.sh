#!/bin/bash

# AgenzieCase Deployment Verification Script
# This script checks if all deployment requirements are met

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAILED_CHECKS++))
    ((TOTAL_CHECKS++))
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
    ((WARNINGS++))
}

check_command() {
    if command -v "$1" &> /dev/null; then
        log_success "$1 is installed"
        return 0
    else
        log_error "$1 is not installed"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        log_success "$1 exists"
        return 0
    else
        log_error "$1 is missing"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        log_success "$1 exists"
        return 0
    else
        log_error "$1 is missing"
        return 1
    fi
}

check_env_var() {
    if [ -n "${!1}" ]; then
        log_success "$1 is set"
        return 0
    else
        log_error "$1 is not set"
        return 1
    fi
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Start verification
clear
echo -e "${GREEN}"
cat << "EOF"
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   A G E N Z I E C A S E                                  ║
    ║   Deployment Verification Script                          ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Load environment file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    log_error ".env file not found. Please create it from .env.example"
    exit 1
fi

# 1. Check Prerequisites
print_header "1. CHECKING PREREQUITES"

check_command "docker"
check_command "docker-compose"
check_command "node"
check_command "npm"

# Check versions
DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+')
log_info "Docker version: $DOCKER_VERSION"

NODE_VERSION=$(node --version)
log_info "Node version: $NODE_VERSION"

NPM_VERSION=$(npm --version)
log_info "NPM version: $NPM_VERSION"

# 2. Check Docker Configuration
print_header "2. CHECKING DOCKER CONFIGURATION"

check_file "docker-compose.yml"
check_file "frontend/Dockerfile"
check_file "frontend/Dockerfile.dev"
check_file "frontend/nginx.conf"
check_file "server/Dockerfile"
check_file ".dockerignore"
check_file "frontend/.dockerignore"
check_file "server/.dockerignore"

# 3. Check Application Structure
print_header "3. CHECKING APPLICATION STRUCTURE"

check_dir "frontend/src"
check_dir "server"
check_dir "server/config"
check_dir "server/models"
check_dir "server/routes"
check_dir "server/middleware"

# 4. Check Required Files
print_header "4. CHECKING REQUIRED FILES"

check_file "frontend/package.json"
check_file "server/package.json"
check_file "frontend/vite.config.js"
check_file "server/index.js"

# 5. Check Environment Configuration
print_header "5. CHECKING ENVIRONMENT CONFIGURATION"

check_env_var "NODE_ENV"
check_env_var "POSTGRES_USER"
check_env_var "POSTGRES_PASSWORD"
check_env_var "POSTGRES_DB"
check_env_var "REDIS_PASSWORD"

# Check optional variables
if [ -n "$JWT_SECRET" ]; then
    if [ ${#JWT_SECRET} -ge 32 ]; then
        log_success "JWT_SECRET is set and meets minimum length (32 chars)"
    else
        log_warn "JWT_SECRET is set but is shorter than recommended (32 chars)"
    fi
else
    log_warn "JWT_SECRET is not set (required for authentication)"
fi

if [ -n "$GROQ_API_KEY" ]; then
    log_success "GROQ_API_KEY is set"
else
    log_warn "GROQ_API_KEY is not set (AI features will be limited)"
fi

if [ -n "$ANTHROPIC_API_KEY" ]; then
    log_success "ANTHROPIC_API_KEY is set"
else
    log_warn "ANTHROPIC_API_KEY is not set (AI features will be limited)"
fi

# 6. Check Security Configuration
print_header "6. CHECKING SECURITY CONFIGURATION"

# Check for default passwords
if [ "$POSTGRES_PASSWORD" = "your_secure_password_here" ] || \
   [ "$POSTGRES_PASSWORD" = "agenziecase_password" ]; then
    log_error "POSTGRES_PASSWORD is using default value. Please change it!"
elif [ ${#POSTGRES_PASSWORD} -lt 12 ]; then
    log_warn "POSTGRES_PASSWORD is shorter than recommended (12 chars)"
else
    log_success "POSTGRES_PASSWORD is configured"
fi

if [ "$REDIS_PASSWORD" = "your_redis_password_here" ] || \
   [ "$REDIS_PASSWORD" = "redis_password" ]; then
    log_error "REDIS_PASSWORD is using default value. Please change it!"
elif [ ${#REDIS_PASSWORD} -lt 12 ]; then
    log_warn "REDIS_PASSWORD is shorter than recommended (12 chars)"
else
    log_success "REDIS_PASSWORD is configured"
fi

# 7. Check Docker Resources
print_header "7. CHECKING DOCKER RESOURCES"

# Check if Docker is running
if docker info &> /dev/null; then
    log_success "Docker daemon is running"

    # Check available memory
    DOCKER_MEM=$(docker info --format '{{.MemTotal}}' 2>/dev/null || echo "0")
    if [ "$DOCKER_MEM" != "0" ]; then
        DOCKER_MEM_GB=$((DOCKER_MEM / 1024 / 1024 / 1024))
        log_info "Docker has $DOCKER_MEM_GB GB memory available"
        if [ $DOCKER_MEM_GB -lt 4 ]; then
            log_warn "Docker has less than 4GB memory. 8GB+ recommended."
        else
            log_success "Docker memory is sufficient"
        fi
    fi
else
    log_error "Docker daemon is not running"
fi

# 8. Check Network Ports
print_header "8. CHECKING NETWORK PORTS"

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "Port $1 is already in use"
        return 1
    else
        log_success "Port $1 is available"
        return 0
    fi
}

# Check if lsof is available
if command -v lsof &> /dev/null; then
    check_port 80      # Frontend
    check_port 3456    # Backend
    check_port 5432    # PostgreSQL
    check_port 6379    # Redis
else
    log_info "lsof not available, skipping port checks"
fi

# 9. Test Docker Build
print_header "9. TESTING DOCKER BUILD"

log_info "Testing frontend build..."
if cd frontend 2>/dev/null; then
    if npm run build 2>/dev/null; then
        log_success "Frontend builds successfully"
    else
        log_error "Frontend build failed"
    fi
    cd ..
else
    log_error "Cannot access frontend directory"
fi

log_info "Testing backend configuration..."
if cd server 2>/dev/null; then
    if npm run migrate 2>/dev/null; then
        log_success "Backend migrations can run"
    else
        log_warn "Backend migrations test failed (database may not be running)"
    fi
    cd ..
else
    log_error "Cannot access server directory"
fi

# 10. Final Summary
print_header "VERIFICATION SUMMARY"

echo -e "Total Checks:  ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "Passed:        ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed:        ${RED}$FAILED_CHECKS${NC}"
echo -e "Warnings:      ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo -e "You can now deploy with:"
    echo -e "  ${BLUE}./deploy.sh init${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some critical checks failed!${NC}"
    echo ""
    echo -e "Please fix the errors above before deploying."
    echo ""
    exit 1
fi
