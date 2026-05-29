#!/bin/bash
# Run this ONCE on a fresh EC2 Ubuntu 22.04 instance

set -e

echo "=== Updating system ==="
sudo apt update && sudo apt upgrade -y

echo "=== Installing Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "=== Installing PM2 ==="
sudo npm install -g pm2
pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "=== Installing Nginx ==="
sudo apt install -y nginx

echo "=== Installing Certbot (SSL) ==="
sudo apt install -y certbot python3-certbot-nginx

echo "=== Cloning repository ==="
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git olx
cd olx/apps/server
npm ci

echo "=== Setup .env.prod ==="
# Create .env.prod manually with production values:
# cp .env.dev .env.prod  then edit it

echo "=== Build server ==="
npm run build

echo "=== Start server with PM2 ==="
pm2 start ecosystem.config.cjs --env production
pm2 save

echo "=== Configure Nginx ==="
sudo cp /home/ubuntu/olx/deploy/nginx.conf /etc/nginx/sites-available/olx
sudo ln -s /etc/nginx/sites-available/olx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "=== Issue SSL certificate ==="
# Replace with your actual domain:
# sudo certbot --nginx -d api.yourdomain.com

echo "=== EC2 Setup Complete! ==="
