# AgenzieCase Docker Deployment

This guide covers deploying AgenzieCase using Docker and Docker Compose.

## Prerequisites

- Docker Desktop 4.0+ (Windows/Mac) or Docker Engine 20.10+ (Linux)
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space

## Quick Start

### 1. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
# Set secure passwords, API keys, etc.
nano .env
```

### 2. Deploy Services

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh init
```

**Windows:**
```cmd
deploy.bat init
```

This will:
- Build all Docker images
- Start all services (database, redis, backend, frontend)
- Run database migrations
- Seed initial data

### 3. Access the Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3456
- **Database:** localhost:5432
- **Redis:** localhost:6379

## Deployment Commands

### Using Deployment Script

**Linux/Mac:**
```bash
./deploy.sh [command]
```

**Windows:**
```cmd
deploy.bat [command]
```

Available commands:
- `build` - Build Docker images
- `up` - Start all services
- `down` - Stop all services
- `restart` - Restart all services
- `logs` - View logs (optional: specify service name)
- `status` - Show service status
- `health` - Check service health
- `db:shell` - Open database shell
- `db:backup` - Create database backup
- `redis:shell` - Open Redis shell
- `clean` - Remove all containers, volumes, and images
- `init` - Initialize project (build, start, migrate, seed)
- `help` - Show help message

### Using Docker Compose Directly

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend npm run migrate
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Nginx (Port 80)                      │
│                   (Frontend Proxy)                       │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
┌────────▼────────┐    ┌────────▼────────┐
│   Frontend      │    │   Backend API   │
│   (React)       │◄───┤   (Express)     │
│   Port 80       │    │   Port 3456     │
└─────────────────┘    └────────┬────────┘
                                │
                    ┌───────────┼──────────┐
                    │           │          │
            ┌───────▼────┐ ┌───▼─────┐ ┌──▼────────┐
            │  Database  │ │  Redis  │ │ File      │
            │ (Postgres) │ │  Cache  │ │ Storage   │
            │  Port 5432 │ │Port 6379│ │           │
            └────────────┘ └─────────┘ └───────────┘
```

## Services

### Frontend (React + Vite)
- **Image:** Multi-stage build with nginx
- **Port:** 80
- **Features:**
  - Gzip compression
  - Static file caching
  - SPA routing
  - Health checks

### Backend (Node.js + Express)
- **Image:** Node.js 20 Alpine
- **Port:** 3456
- **Features:**
  - PostgreSQL integration
  - Redis caching
  - Health monitoring
  - Non-root user

### Database (PostgreSQL)
- **Image:** PostgreSQL 16 Alpine
- **Port:** 5432
- **Features:**
  - Persistent volumes
  - Health checks
  - Automatic backups

### Redis (Cache)
- **Image:** Redis 7 Alpine
- **Port:** 6379
- **Features:**
  - Persistent storage
  - Password protection
  - AOF persistence

## Environment Variables

See `.env.example` for all available variables:

```bash
# Application
NODE_ENV=production
FRONTEND_PORT=80
BACKEND_PORT=3456

# Database
POSTGRES_USER=agenziecase
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=agenziecase

# Redis
REDIS_PASSWORD=secure_password

# Security
JWT_SECRET=min_32_char_secret

# API Keys
GROQ_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
```

## Volumes

- `postgres_data` - PostgreSQL data persistence
- `redis_data` - Redis AOF persistence

## Health Checks

All services include health checks:

```bash
# Check all services
./deploy.sh health

# Check specific service
docker-compose ps
```

## Database Management

### Backup Database

```bash
# Automatic backup with timestamp
./deploy.sh db:backup

# Manual backup
docker-compose exec database pg_dump -U agenziecase agenziecase > backup.sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T database psql -U agenziecase agenziecase < backup.sql
```

### Database Shell

```bash
# Open psql shell
./deploy.sh db:shell

# Or directly
docker-compose exec database psql -U agenziecase -d agenziecase
```

### Run Migrations

```bash
docker-compose exec backend npm run migrate
```

## Monitoring

### View Logs

```bash
# All services
./deploy.sh logs

# Specific service
./deploy.sh logs backend
./deploy.sh logs database
```

### Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats agenziecase-backend
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check resource usage
docker stats

# Rebuild images
docker-compose build --no-cache
```

### Database Connection Issues

```bash
# Check database health
docker-compose ps database

# Check database logs
docker-compose logs database

# Verify environment variables
docker-compose exec backend env | grep DB_
```

### Clear Everything and Start Over

```bash
# WARNING: Deletes all data
./deploy.sh clean

# Or manually
docker-compose down -v --rmi all
```

## Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Configure HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Configure monitoring
- [ ] Set up log aggregation
- [ ] Review CORS settings
- [ ] Configure rate limiting
- [ ] Set up fail2ban

### Performance Optimization

- [ ] Enable nginx caching
- [ ] Configure Redis cluster
- [ ] Set up PostgreSQL read replicas
- [ ] Enable CDN for static assets
- [ ] Configure connection pooling
- [ ] Optimize database queries
- [ ] Enable gzip compression
- [ ] Set up load balancer

### Scaling

```bash
# Scale backend
docker-compose up -d --scale backend=3

# Add load balancer (nginx)
# Update nginx.conf with upstream configuration
```

## Updating

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate
```

## Support

For issues and questions:
- GitHub Issues: [agenziecase/issues]
- Documentation: [agenziecase/docs]
