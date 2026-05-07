#!/bin/bash
#
# agenziecase-backup.sh
# Backup automatizzato del database PostgreSQL
#

set -e

# Configurazione
BACKUP_DIR="/var/www/agenziecase/backups/postgresql"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="agenziecase_backup_${TIMESTAMP}.sql.gz"
LOG_FILE="/var/www/agenziecase/logs/backup.log"

# Database configuration
DB_NAME="agenziecase_prod"
DB_USER="agenziecase_prod"
DB_HOST="localhost"
DB_PORT="5432"

# Container name
CONTAINER_NAME="agenziecase-db-1"

# Create backup and log directories FIRST
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

echo "===== Backup iniziato: $(date) =====" >> "$LOG_FILE"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send error notification (placeholder)
notify_error() {
    local error_message="$1"
    log "❌ ERRORE: $error_message"
    # Qui puoi aggiungere notifica Slack/Email/Discord
    # Esempio:
    # curl -X POST -H "Content-Type: application/json" \
    #   -d "{\"text\":\"Backup fallito: $error_message\"}" \
    #   YOUR_WEBHOOK_URL
}

log "🗄️ Inizio backup PostgreSQL..."

# Esegui backup dal container Docker
if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" 2>/dev/null | gzip > "$BACKUP_DIR/$BACKUP_FILE"; then
    # Verifica che il backup sia stato creato correttamente
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
        log "✅ Backup completato: $BACKUP_FILE ($BACKUP_SIZE)"
    else
        notify_error "File backup non creato"
        exit 1
    fi
else
    notify_error "pg_dump fallito"
    exit 1
fi

# Pulisci backup vecchi
log "🧹 Pulizia backup vecchi (più di $RETENTION_DAYS giorni)..."
find "$BACKUP_DIR" -name "agenziecase_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
DELETED=$(find "$BACKUP_DIR" -name "agenziecase_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
log "🗑️  $DELETED backup vecchi eliminati"

# Verifica spazio disco
DISK_USAGE=$(df -h "$BACKUP_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
log "💾 Spazio usato backup directory: $DISK_USAGE"

# Lista backup attuali
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
log "📦 Totali backup salvati: $BACKUP_COUNT"

# Verifica integrità dell'ultimo backup
if command -v gzip >/dev/null 2>&1; then
    if gzip -t "$BACKUP_DIR/$BACKUP_FILE" >/dev/null 2>&1; then
        log "✅ Verifica integrità: OK"
    else
        notify_error "Backup file corrotto"
        exit 1
    fi
fi

log "===== Backup completato: $(date) ====="
log ""

# Exit con successo
exit 0
