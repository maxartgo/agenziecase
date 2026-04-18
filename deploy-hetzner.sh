#!/bin/bash
# 🚀 DEPLOY AUTOMATICO - AgenzieCase su Hetzner

echo "🚀 DEPLOY AGENZIECASE SU HETZNER"
echo "================================"
echo ""

# Configuration
SERVER_IP="178.104.183.66"
SSH_KEY="$HOME/.ssh/agenziecase_hetzner"
PROJECT_DIR="/var/www/agenziecase"

echo "📡 Connessione al server..."
ssh -i "$SSH_KEY" root@$SERVER_IP << 'EOF'
echo "✅ Connessione riuscita!"
echo "📂 Directory progetto: $PROJECT_DIR"
cd $PROJECT_DIR

echo "🧹 Pulisco vecchi file..."
rm -rf *
git clone https://github.com/maxartgo/agenziecase.git .
echo "✅ Repository clonato!"

echo "⚙️ Configuro environment..."
cp .env.production .env
echo "✅ Environment configurato!"

echo "🐳 Deploy Docker containers..."
docker compose -f docker-compose.hetzner.yml up -d --build
echo "✅ Deploy completato!"

echo "🧪 Verifico deploy..."
sleep 10
docker ps
curl -s http://localhost:3001/api/health || echo "⚠️ Backend non risponde ancora"

echo ""
echo "🎉 DEPLOY COMPLETATO!"
echo "🌐 Sito disponibile su: http://$SERVER_IP"
echo "🔧 Per controllare i logs: ssh -i $SSH_KEY root@$SERVER_IP"
EOF

echo ""
echo "🎯 DEPLOY FINITO!"
echo "✅ Il tuo sito dovrebbe essere live su: http://$SERVER_IP"
echo ""
echo "📋 COMANDI UTILI:"
echo "   Connessione: ssh -i ~/.ssh/agenziecase_hetzner root@$SERVER_IP"
echo "   Logs: ssh -i ~/.ssh/agenziecase_hetzner root@$SERVER_IP 'cd /var/www/agenziecase && docker compose logs -f'"
echo "   Restart: ssh -i ~/.ssh/agenziecase_hetzner root@$SERVER_IP 'cd /var/www/agenziecase && docker compose restart'"