# 🔥 Deployment Rapido - Copia e Incolla

## CONNETTITI AL SERVER:
```bash
ssh -i ~/.ssh/agenziecase_hetzner root@178.104.183.66
```

## DOPO LA CONNESSIONE (copia e incalla):

```bash
# 1. Aggiorna sistema
apt update && apt upgrade -y && apt install -y curl wget git vim htop ufw fail2ban

# 2. Configura firewall
ufw default deny incoming && ufw default allow outgoing && ufw allow ssh && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable

# 3. Installa Docker
curl -fsSL https://get.docker.com | sh && apt install -y docker-compose-plugin

# 4. Installa Nginx
apt install -y nginx && systemctl start nginx && systemctl enable nginx

# 5. Crea utente
adduser agenzie --gecos "" && usermod -aG sudo,docker agenzie && mkdir -p /home/agenzie/.ssh && cp ~/.ssh/authorized_keys /home/agenzie/.ssh/ && chown -R agenzie:agenzie /home/agenzie/.ssh && chmod 700 /home/agenzie/.ssh && chmod 600 /home/agenzie/.ssh/authorized_keys

# 6. Crea directory progetto
mkdir -p /var/www && cd /var/www

# 7. Clona repository (sostituisci con la tua URL)
git clone https://github.com/tuo-username/agenziecase.git agenziecase && cd agenziecase && chown -R agenzie:agenzie /var/www/agenziecase

# 8. Configura environment
cp .env.production .env && vim .env

# 9. Deploy applicazione
docker compose -f docker-compose.hetzner.yml up -d --build

# 10. Verifica deploy
docker ps && docker compose logs -f
```

## TEST FINALE:
```bash
# Test da browser
curl http://178.104.183.66
curl http://178.104.183.66/api/health
```

## 🎉 FATTO!
Il tuo sito è live: http://178.104.183.66