# Deployment Guide

This guide provides instructions for deploying RentHub to production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Database Backup](#database-backup)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Hardware Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage

### Software Requirements
- Docker 20.10+ and Docker Compose 2.0+ (for Docker deployment)
- Ubuntu 20.04+ or similar Linux distribution
- Domain name with DNS configured
- SSL/TLS certificates (Let's Encrypt recommended)

## Environment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin
```

### 2. Clone Repository

```bash
git clone https://github.com/davmanz/renthub.git
cd renthub
```

### 3. Configure Environment Variables

```bash
# Backend configuration
cp renthub-env/backend.env.example renthub-env/backend.env
nano renthub-env/backend.env
```

**Critical Settings for Production:**

```env
# Django Settings
SECRET_KEY=<generate-a-strong-random-key>  # Use: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Domain
DOMINIO=yourdomain.com

# Database (use strong passwords)
POSTGRES_DB=renthub_db
POSTGRES_USER=renthub_user
POSTGRES_PASSWORD=<strong-random-password>
POSTGRES_HOST=renthub-db
POSTGRES_PORT=5432

# Email Configuration (Gmail example)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Security
AXES_FAILURE_LIMIT=5
AXES_COOLOFF_TIME=15
```

```bash
# Frontend configuration
cp renthub-env/frontend.env.example renthub-env/frontend.env
nano renthub-env/frontend.env
```

```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=RentHub
```

## Docker Deployment

### 1. SSL/TLS Certificates

#### Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot

# Obtain certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Create SSL directory and copy certificates
sudo mkdir -p data/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem data/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem data/ssl/
sudo chmod 644 data/ssl/*
```

#### Self-Signed Certificates (Development/Testing)

```bash
mkdir -p data/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout data/ssl/privkey.pem \
  -out data/ssl/fullchain.pem \
  -subj "/CN=yourdomain.com"
```

### 2. Build and Start Services

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec renthub-backend python manage.py migrate

# Create superuser
docker-compose exec renthub-backend python manage.py createsuperuser

# Load initial data (optional)
docker-compose exec renthub-backend python manage.py init_data
```

### 4. Collect Static Files

```bash
docker-compose exec renthub-backend python manage.py collectstatic --noinput
```

### 5. Verify Deployment

```bash
# Check backend logs
docker-compose logs -f renthub-backend

# Check frontend logs
docker-compose logs -f renthub-frontend

# Test health endpoints
curl -k https://yourdomain.com/api/health/
```

## Manual Deployment

### Backend Setup

```bash
cd renthub-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export SECRET_KEY="your-secret-key"
export DEBUG=False
# ... other variables

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser
python manage.py createsuperuser
```

### Frontend Setup

```bash
cd renthub-frontend

# Install dependencies
pnpm install

# Build for production
pnpm run build
```

### Web Server Configuration

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/renthub
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        root /var/www/renthub/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Media files
    location /media {
        alias /path/to/media;
    }

    # Static files
    location /static {
        alias /path/to/static;
    }
}
```

### Process Management with Systemd

```ini
# /etc/systemd/system/renthub.service
[Unit]
Description=RentHub Django Application
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/path/to/renthub-backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/gunicorn renthub.wsgi:application --bind 0.0.0.0:8000 --workers 4
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable renthub
sudo systemctl start renthub
sudo systemctl status renthub
```

## Database Backup

### Automated Backup Script

```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/backups/renthub"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Using Docker
docker-compose exec -T renthub-db pg_dump -U renthub renthub_db > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -type f -name "*.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Schedule with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-db.sh
```

### Restore Database

```bash
# Restore from backup
gunzip backup_file.sql.gz
docker-compose exec -T renthub-db psql -U renthub renthub_db < backup_file.sql
```

## Monitoring

### Log Monitoring

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f renthub-backend

# View last 100 lines
docker-compose logs --tail=100 renthub-backend
```

### Health Checks

```bash
# Backend health
curl https://yourdomain.com/api/health/

# Database health
docker-compose exec renthub-backend python manage.py check
```

### Resource Monitoring

```bash
# Docker stats
docker stats

# System resources
htop
```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec renthub-backend python manage.py migrate

# Collect static files
docker-compose exec renthub-backend python manage.py collectstatic --noinput
```

### Certificate Renewal

```bash
# Renew Let's Encrypt certificates
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem data/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem data/ssl/

# Restart frontend
docker-compose restart renthub-frontend
```

## Troubleshooting

### Common Issues

#### 502 Bad Gateway
```bash
# Check backend is running
docker-compose ps renthub-backend

# Check backend logs
docker-compose logs renthub-backend

# Restart backend
docker-compose restart renthub-backend
```

#### Database Connection Issues
```bash
# Check database is running
docker-compose ps renthub-db

# Check database logs
docker-compose logs renthub-db

# Test connection
docker-compose exec renthub-backend python manage.py dbshell
```

#### Permission Issues
```bash
# Fix media directory permissions
sudo chown -R www-data:www-data data/media
sudo chmod -R 755 data/media
```

### Performance Optimization

1. **Database**
   - Add database indices for frequently queried fields
   - Enable connection pooling
   - Regular VACUUM and ANALYZE

2. **Backend**
   - Increase Gunicorn workers: `--workers $((2 * $(nproc) + 1))`
   - Enable Redis for caching
   - Configure database connection pooling

3. **Frontend**
   - Enable gzip compression in Nginx
   - Configure browser caching
   - Use CDN for static assets

## Security Checklist

- [ ] Strong SECRET_KEY generated
- [ ] DEBUG=False in production
- [ ] HTTPS enabled with valid certificates
- [ ] Firewall configured (ports 80, 443 only)
- [ ] Database uses strong passwords
- [ ] Email configured for notifications
- [ ] Regular backups scheduled
- [ ] Docker containers running as non-root users
- [ ] Security headers configured in Nginx
- [ ] Rate limiting enabled
- [ ] Logs being monitored

## Support

For deployment issues, please:
1. Check logs: `docker-compose logs`
2. Review this guide
3. Check GitHub issues
4. Open a new issue with deployment details

---

**Note**: This guide assumes a Linux server environment. Adjust paths and commands as needed for your specific setup.
