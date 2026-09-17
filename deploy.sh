#!/bin/bash
# Despliegue de saas-administrador-web en DigitalOcean Droplet
# Dominio: sus.multibancaexpress.com | Puerto: 8540

set -e

PORT=8540
DOMAIN="sus.multibancaexpress.com"

echo "🚀 Iniciando despliegue de ME Gestión SaaS ($DOMAIN)..."
systemctl enable --now docker || true
systemctl enable --now nginx || true

echo "📦 Construyendo imagen de Docker saas-web-app..."
docker build -t saas-web-app .

echo "🛑 Limpiando contenedor anterior..."
docker rm -f saas-web-container 2>/dev/null || true
sleep 2

echo "▶️ Iniciando nuevo contenedor en puerto $PORT..."
docker run -d \
  --name saas-web-container \
  -p 127.0.0.1:$PORT:80 \
  --restart always \
  saas-web-app

echo "⚙️ Configurando Nginx para $DOMAIN..."
SITE_NAME="sus"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

SSL_OPTS=""
[ -f /etc/letsencrypt/options-ssl-nginx.conf ] && SSL_OPTS="    include /etc/letsencrypt/options-ssl-nginx.conf;"
SSL_DH=""
[ -f /etc/letsencrypt/ssl-dhparams.pem ] && SSL_DH="    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;"

if [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
    echo "🔒 Certificados SSL detectados en $CERT_DIR. Configurando HTTPS directo..."
    cat << EOF > /etc/nginx/sites-available/$SITE_NAME
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name $DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
$SSL_OPTS
$SSL_DH

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
    }

    location /assets/ {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Proxy de administración de usuarios Supabase Auth
    location /api/admin-users/ {
        proxy_pass https://envojryuxdmcamlolkgp.supabase.co/auth/v1/admin/users/;
        proxy_ssl_server_name on;
        proxy_set_header apikey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVudm9qcnl1eGRtY2FtbG9sa2dwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA3NjU3MywiZXhwIjoyMDg3NjUyNTczfQ.RgfpYk7MSpfuOMy0mPtQiK838Ao1z38c1r7-bxcU-7E";
        proxy_set_header Authorization "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVudm9qcnl1eGRtY2FtbG9sa2dwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA3NjU3MywiZXhwIjoyMDg3NjUyNTczfQ.RgfpYk7MSpfuOMy0mPtQiK838Ao1z38c1r7-bxcU-7E";
        proxy_set_header Content-Type "application/json";
    }
}
EOF
else
    echo "⚠️ Certificado aún no existe. Configurando HTTP temporal para validación Certbot..."
    cat << EOF > /etc/nginx/sites-available/$SITE_NAME
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
    }

    location /assets/ {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Proxy de administración de usuarios Supabase Auth
    location /api/admin-users/ {
        proxy_pass https://envojryuxdmcamlolkgp.supabase.co/auth/v1/admin/users/;
        proxy_ssl_server_name on;
        proxy_set_header apikey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVudm9qcnl1eGRtY2FtbG9sa2dwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA3NjU3MywiZXhwIjoyMDg3NjUyNTczfQ.RgfpYk7MSpfuOMy0mPtQiK838Ao1z38c1r7-bxcU-7E";
        proxy_set_header Authorization "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVudm9qcnl1eGRtY2FtbG9sa2dwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA3NjU3MywiZXhwIjoyMDg3NjUyNTczfQ.RgfpYk7MSpfuOMy0mPtQiK838Ao1z38c1r7-bxcU-7E";
        proxy_set_header Content-Type "application/json";
    }
}
EOF
    ln -sf /etc/nginx/sites-available/$SITE_NAME /etc/nginx/sites-enabled/$SITE_NAME
    nginx -t
    systemctl reload nginx

    echo "🔒 Solicitando Certificado SSL Let's Encrypt para $DOMAIN..."
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email --keep-until-expiring || true

    if [ -f "$CERT_DIR/fullchain.pem" ]; then
        cat << EOF > /etc/nginx/sites-available/$SITE_NAME
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name $DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
$SSL_OPTS
$SSL_DH

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
    }

    location /assets/ {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Proxy de administración de usuarios Supabase Auth
    location /api/admin-users/ {
        proxy_pass https://envojryuxdmcamlolkgp.supabase.co/auth/v1/admin/users/;
        proxy_ssl_server_name on;
        proxy_set_header apikey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVudm9qcnl1eGRtY2FtbG9sa2dwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA3NjU3MywiZXhwIjoyMDg3NjUyNTczfQ.RgfpYk7MSpfuOMy0mPtQiK838Ao1z38c1r7-bxcU-7E";
        proxy_set_header Authorization "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVudm9qcnl1eGRtY2FtbG9sa2dwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA3NjU3MywiZXhwIjoyMDg3NjUyNTczfQ.RgfpYk7MSpfuOMy0mPtQiK838Ao1z38c1r7-bxcU-7E";
        proxy_set_header Content-Type "application/json";
    }
}
EOF
    fi
fi

ln -sf /etc/nginx/sites-available/$SITE_NAME /etc/nginx/sites-enabled/$SITE_NAME
nginx -t
systemctl reload nginx

echo "✅ ¡ME Gestión SaaS desplegado exitosamente en https://$DOMAIN!"
