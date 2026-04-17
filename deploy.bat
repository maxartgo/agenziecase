@echo off
REM AgenzieCase Docker Deployment Script for Windows
REM Usage: deploy.bat [command]

setlocal enabledelayedexpansion

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="build" goto build
if "%1"=="up" goto up
if "%1"=="down" goto down
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="health" goto health
if "%1"=="db:shell" goto db_shell
if "%1"=="db:backup" goto db_backup
if "%1"=="redis:shell" goto redis_shell
if "%1"=="clean" goto clean
if "%1"=="init" goto init

:help
echo AgenzieCase Docker Deployment Script
echo.
echo Usage: deploy.bat [command]
echo.
echo Commands:
echo   build        Build Docker images
echo   up           Start all services
echo   down         Stop all services
echo   restart      Restart all services
echo   logs         View logs (optional: specify service name)
echo   status       Show service status
echo   health       Check service health
echo   db:shell     Open database shell
echo   db:backup    Create database backup
echo   redis:shell  Open Redis shell
echo   clean        Remove all containers, volumes, and images
echo   init         Initialize project (build, start, migrate, seed)
echo   help         Show this help message
goto end

:build
echo [INFO] Building Docker images...
docker-compose build --no-cache
echo [INFO] Build complete!
goto end

:up
if not exist ".env" (
    echo [WARN] Environment file not found. Creating from example...
    copy .env.example .env
    echo [ERROR] Please edit .env with your configuration before running deployment
    exit /b 1
)
echo [INFO] Starting services...
docker-compose up -d
echo [INFO] Services started!
docker-compose ps
goto end

:down
echo [INFO] Stopping services...
docker-compose down
echo [INFO] Services stopped!
goto end

:restart
echo [INFO] Restarting services...
docker-compose restart
echo [INFO] Services restarted!
goto end

:logs
if "%2"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %2
)
goto end

:status
docker-compose ps
goto end

:health
echo [INFO] Checking service health...
docker-compose ps
echo.
echo [INFO] Frontend health:
curl -s http://localhost/health || echo Frontend not responding
echo.
echo [INFO] Backend health:
curl -s http://localhost:3456/api/health || echo Backend not responding
goto end

:db_shell
echo [INFO] Opening database shell...
docker-compose exec database psql -U agenziecase -d agenziecase
goto end

:db_backup
set BACKUP_FILE=backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~-11,2%%time:~-8,2%%time:~-5,2%.sql
set BACKUP_FILE=%BACKUP_FILE: =0%
echo [INFO] Creating database backup: %BACKUP_FILE%
docker-compose exec -T database pg_dump -U agenziecase agenziecase > %BACKUP_FILE%
echo [INFO] Backup complete: %BACKUP_FILE%
goto end

:redis_shell
echo [INFO] Opening Redis shell...
docker-compose exec redis redis-cli -a redis_password
goto end

:clean
echo [WARN] This will remove all containers, volumes, and images!
set /p confirm="Are you sure? (yes/no): "
if "%confirm%"=="yes" (
    echo [INFO] Cleaning up...
    docker-compose down -v --rmi all
    echo [INFO] Cleanup complete!
) else (
    echo [INFO] Cleanup aborted
)
goto end

:init
echo [INFO] Initializing project...
if not exist ".env" (
    copy .env.example .env
)
echo [INFO] Building images...
docker-compose build
echo [INFO] Starting services...
docker-compose up -d
echo [INFO] Waiting for services to be healthy...
timeout /t 10 /nobreak > nul
echo [INFO] Running database migrations...
docker-compose exec backend npm run migrate
echo [INFO] Seeding database...
docker-compose exec backend npm run seed
echo [INFO] Initialization complete!
echo [INFO] Frontend: http://localhost
echo [INFO] Backend API: http://localhost:3456
goto end

:end
endlocal
