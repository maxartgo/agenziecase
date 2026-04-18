#!/bin/bash
# 🚀 Setup SSL Certificates for AgenzieCase Production

set -e

echo "🔒 SETUP SSL CERTIFICATES - AGENZIECASE"
echo "======================================="
echo ""

# Configuration
DOMAIN="agenziecase.com"
WWW_DOMAIN="www.agenziecase.com"
EMAIL="admin@agenziecase.com"  # Change this to your email
SERVER_IP="178.104.183.66"
SSH_KEY="$HOME/.ssh/agenziecase_hetzner"

echo "📡 Connessione al server Hetzner..."
ssh -i "$SSH_KEY" root@$SERVER_IP << 'EOF'
echo "✅ Connessione riuscita!"
echo ""

# Install Certbot if not already installed
echo "📦 Installazione Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily for standalone mode
echo "🛑 Fermo nginx temporaneamente..."
systemctl stop nginx

# Obtain SSL certificate
echo "🔑 Richiesta certificati SSL Let's Encrypt..."
certbot certonly --standalone \
  -d agenziecase.com \
  -d www.agenziecase.com \
  --email admin@agenziecase.com \
  --agree-tos \
  --non-interactive \
  --redirect

# Verify certificates
echo "🔍 Verifica certificati..."
ls -la /etc/letsencrypt/live/agenziecase.com/

# Test renewal
echo "🧪 Test rinnovo automatico..."
certbot renew --dry-run

# Enable auto-renewal
echo "⚙️ Configurazione rinnovo automatico..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo "✅ Certificati SSL installati con successo!"
echo ""
echo "📋 Certificati disponibili in:"
echo "   /etc/letsencrypt/live/agenziecase.com/fullchain.pem"
echo "   /etc/letsencrypt/live/agenziecase.com/privkey.pem"
echo ""

# Check certbot timer status
echo "🕐 Timer rinnovo automatico:"
systemctl list-timers | grep certbot

EOF

echo ""
echo "🎉 SETUP SSL COMPLETATO!"
echo ""
echo "🔥 PROSSIMI PASSI:"
echo "1. Aggiorna docker-compose per montare i certificati"
echo "2. Riavvia i container Docker"
echo "3. Verifica HTTPS su https://agenziecase.com"
echo ""
echo "📋 COMANDO VERIFICA SSL:"
echo "   ssh -i $SSH_KEY root@$SERVER_IP 'certbot certificates'"
echo ""