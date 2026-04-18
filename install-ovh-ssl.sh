#!/bin/bash
# 🔧 INSTALLA CERTIFICATI SSL OVH - AGENZIECASE

echo "🔒 INSTALLAZIONE CERTIFICATI SSL OVH"
echo "===================================="
echo ""

SSH_KEY="$HOME/.ssh/agenziecase_hetzner"
SERVER_IP="178.104.183.66"

echo "📋 ISTRUZIONI:"
echo "1. Scarica i certificati SSL dal pannello OVH"
echo "2. Salva i file in una cartella temporanea"
echo "3. Questo script li caricherà sul server"
echo ""
echo "📁 FILE NECESSARI DA OVH:"
echo "   - certificato.crt (o .crt)"
echo "   - chiave.key (o .key)"
echo "   - ca_bundle.crt (opzionale)"
echo ""

read -p "Hai già scaricato i certificati da OVH? (s/n): " downloaded

if [ "$downloaded" = "s" ] || [ "$downloaded" = "S" ]; then
    echo ""
    echo "📂 Inserisci il percorso dei file certificati:"
    read -p "Certificato (.crt): " cert_path
    read -p "Chiave (.key): " key_path

    if [ -f "$cert_path" ] && [ -f "$key_path" ]; then
        echo "✅ File trovati!"
        echo ""
        echo "📤 Upload certificati sul server..."

        # Create directory on server
        ssh -i "$SSH_KEY" root@$SERVER_IP 'mkdir -p /etc/ssl/ovh'

        # Upload certificates
        scp -i "$SSH_KEY" "$cert_path" root@$SERVER_IP:/etc/ssl/ovh/agenziecase.crt
        scp -i "$SSH_KEY" "$key_path" root@$SERVER_IP:/etc/ssl/ovh/agenziecase.key

        echo "✅ Certificati caricati!"
        echo ""

        # Update nginx configuration
        ssh -i "$SSH_KEY" root@$SERVER_IP << 'EOF'
echo "⚙️ Aggiornamento configurazione nginx..."

cd /var/www/agenziecase

# Create nginx config with OVH certificates
cat > nginx-ssl.conf << 'NGINX'
# HTTP to HTTPS redirect server
server {
    listen 80;
    server_name agenziecase.com www.agenziecase.com;

    # Allow Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }

    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS main server
server {
    listen 443 ssl http2;
    server_name agenziecase.com www.agenziecase.com;

    root /usr/share/nginx/html;
    index index.html;

    # SSL Certificate Configuration (OVH)
    ssl_certificate /etc/ssl/ovh/agenziecase.crt;
    ssl_certificate_key /etc/ssl/ovh/agenziecase.key;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https:; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # API proxy to backend
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers if needed
        add_header Access-Control-Allow-Origin https://agenziecase.com always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Serve static files with caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint (no logging)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Security: Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINX

echo "✅ Configurazione nginx aggiornata!"
echo ""

# Restart frontend container
echo "🐳 Riavvio frontend..."
docker stop agenziecase-frontend
docker rm agenziecase-frontend
docker run -d --name agenziecase-frontend \
  --network agenziecase_agenziecase-network \
  -p 80:80 -p 443:443 \
  -v /var/www/agenziecase/nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro \
  -v /etc/ssl/ovh:/etc/ssl/ovh:ro \
  --restart unless-stopped \
  agenziecase-frontend

echo "✅ Frontend riavviato!"
echo ""

# Verify SSL
echo "🔍 Verifica certificati:"
openssl x509 -in /etc/ssl/ovh/agenziecase.crt -text -noout | grep -i "subject\|issuer"

EOF

        echo ""
        echo "🎉 CERTIFICATI OVH INSTALLATI!"
        echo ""
        echo "🌐 Test nel browser:"
        echo "   https://agenziecase.com"
        echo ""
        echo "✅ Non dovresti vedere più avvisi di sicurezza!"
        echo ""
    else
        echo "❌ File non trovati. Verifica i percorsi."
        exit 1
    fi
else
    echo ""
    echo "📋 COME SCARICARE I CERTIFICATI DA OVH:"
    echo "1. Vai su https://www.ovh.com/auth"
    echo "2. Domini → agenziecase.com → SSL"
    echo "3. Cerca l'opzione per scaricare i certificati"
    echo "4. Scarica il file .crt e il file .key"
    echo "5. Riavvia questo script"
    echo ""
fi