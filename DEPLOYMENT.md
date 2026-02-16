# astroweb API - Deployment Guide

## 📋 Prerequisites

- **Node.js** 18+ installed
- **MySQL** 8.0+ database server
- **PM2** (for production): `npm install -g pm2`
- **Docker** (optional): For containerized deployment

---

## 🚀 Quick Start (Development)

### 1. Clone and Install

```bash
cd "d:\jemsoftech\clientbase\astro\New folder\NodeJS-Astrology"
npm install
```

### 2. Configure Environment

```bash
# Copy example to .env
copy .env.example .env

# Edit .env and set:
# - DB_PASSWORD (your MySQL password)
# - JWT_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
# - JWT_REFRESH_SECRET (different random string)
```

### 3. Create MySQL Database

```sql
CREATE DATABASE astroweb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Migrations

```bash
npm run migrate
```

### 5. Start Development Server

```bash
npm run dev:watch
```

API will be available at: `http://localhost:3000`
Swagger docs at: `http://localhost:3000/api/docs`

---

## 🏭 Production Deployment

### Option 1: PM2 (Recommended for VPS)

#### 1. Build Project

```bash
npm run build
```

#### 2. Set Production Environment

```bash
copy .env.production .env
# Edit .env with production values
```

#### 3. Start with PM2

```bash
npm run pm2:start
```

#### 4. PM2 Management

```bash
# View logs
npm run pm2:logs

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop

# Monitor
pm2 monit

# Save PM2 process list (survives reboots)
pm2 save
pm2 startup
```

---

### Option 2: Docker Compose

#### 1. Configure Environment

```bash
copy .env.example .env
# Edit .env with production values
```

#### 2. Build and Start

```bash
docker-compose up -d
```

#### 3. View Logs

```bash
docker-compose logs -f api
```

#### 4. Run Migrations

```bash
docker-compose exec api npm run migrate
```

#### 5. Access Services

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Adminer (DB UI)**: http://localhost:8080
  - System: MySQL
  - Server: mysql
  - Username: root
  - Password: (from .env)
  - Database: astroweb

#### 6. Stop Services

```bash
docker-compose down
```

---

### Option 3: Standalone Docker

```bash
# Build image
docker build -t astroweb-api .

# Run container
docker run -d \
  --name astroweb-api \
  -p 3000:3000 \
  --env-file .env \
  astroweb-api
```

---

## 🔒 Security Checklist

### Before Going Live:

- [ ] Change all default passwords
- [ ] Generate secure JWT secrets (64+ chars random)
- [ ] Update `CORS_ORIGIN` to your domain
- [ ] Enable HTTPS/SSL with reverse proxy
- [ ] Setup database backups
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Review all `.env` variables
- [ ] Remove Adminer in production (docker-compose)
- [ ] Setup monitoring/alerting

---

## 🌐 Nginx Reverse Proxy (Optional)

### Install Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx
```

### Configure Site

Create `/etc/nginx/sites-available/astroweb`:

```nginx
server {
    listen 80;
    server_name api.astroweb.org;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.astroweb.org;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.astroweb.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.astroweb.org/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase timeout for long calculations
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/astroweb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📊 Database Management

### Backup Database

```bash
# Create backup
mysqldump -u root -p astroweb > astroweb_backup_$(date +%Y%m%d).sql

# With gzip compression
mysqldump -u root -p astroweb | gzip > astroweb_backup_$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
# From SQL file
mysql -u root -p astroweb < astroweb_backup_20260205.sql

# From gzipped file
gunzip < astroweb_backup_20260205.sql.gz | mysql -u root -p astroweb
```

### Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/bin/mysqldump -u root -pYOUR_PASSWORD astroweb | gzip > /backups/astroweb_$(date +\%Y\%m\%d).sql.gz
```

---

## 🔍 Monitoring & Logs

### View Application Logs

```bash
# PM2
pm2 logs astroweb-api

# Docker
docker-compose logs -f api

# Direct file
tail -f logs/app.log
tail -f logs/error.log
```

### Monitor Performance

```bash
# PM2 monitoring
pm2 monit

# Docker stats
docker stats astroweb-api
```

---

## 🧪 Testing Endpoints

### Health Check

```bash
curl http://localhost:3000/health
```

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

### Add Person (with JWT)

```bash
curl -X POST http://localhost:3000/api/person/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "ownerId": "YOUR_USER_ID",
    "personName": "John Doe",
    "birthTime": "1990-06-15T14:30:00Z",
    "gender": "Male",
    "notes": "Test person"
  }'
```

---

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SHOW DATABASES;"

# Check .env configuration
cat .env | grep DB_
```

### Port Already in Use

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### PM2 Won't Start

```bash
# Clear PM2 cache
pm2 kill
pm2 resurrect

# Check logs
pm2 logs astroweb-api --err
```

### Docker Issues

```bash
# Remove all containers
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

---

## 📈 Performance Optimization

### Database Indexing

Migrations automatically create indexes. Verify:

```sql
SHOW INDEX FROM persons;
SHOW INDEX FROM matches;
SHOW INDEX FROM api_logs;
```

### Connection Pooling

Adjust in `.env`:

```bash
DB_CONNECTION_LIMIT=20  # Increase for high traffic
```

### Rate Limiting

Adjust in `.env`:

```bash
RATE_LIMIT_MAX_REQUESTS=500  # Increase if needed
RATE_LIMIT_AUTHENTICATED_MAX=1000
```

---

## 🔄 Updating the Application

### Pull Changes

```bash
git pull origin main
npm install
npm run build
```

### Restart Services

```bash
# PM2
npm run pm2:restart

# Docker
docker-compose restart api

# or rebuild
docker-compose up -d --build
```

---

## 📞 Support

- **Documentation**: `/api/docs`
- **Health Check**: `/health`
- **API Version**: `/api/version`

---

**Last Updated**: 2026-02-05  
**Version**: 1.0.0
