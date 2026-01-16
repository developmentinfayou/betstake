# Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **PostgreSQL** 14.x or higher
- **Redis** 6.x or higher

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd casino-platform
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo, including all apps and packages.

### 3. Setup PostgreSQL Database

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a new database:

```sql
CREATE DATABASE casinobit;
CREATE USER casinouser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE casinobit TO casinouser;
```

#### Option B: Docker PostgreSQL

```bash
docker run --name casinobit-postgres \
  -e POSTGRES_DB=casinobit \
  -e POSTGRES_USER=casinouser \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

### 4. Setup Redis

#### Option A: Local Redis

Install Redis on your system and start the service:

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://redis.io/download
```

#### Option B: Docker Redis

```bash
docker run --name casinobit-redis \
  -p 6379:6379 \
  -d redis:6
```

### 5. Configure Environment Variables

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://casinouser:your_password@localhost:5432/casinobit"
REDIS_HOST="localhost"
REDIS_PORT="6379"
JWT_SECRET="generate-a-secure-random-string-here"
PORT="3001"
FRONTEND_URL="http://localhost:3000"
```

Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 6. Generate Prisma Client

```bash
npm run db:generate
```

### 7. Run Database Migrations

```bash
npm run db:push
```

This will create all necessary tables in your PostgreSQL database.

### 8. (Optional) Seed Database

Create a seed script to populate initial data:

```bash
# Create seed file
touch packages/database/seed.ts
```

Add seed data for game configs, default jackpots, etc.

### 9. Start Development Servers

```bash
npm run dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000

### 10. Verify Installation

1. Open http://localhost:3000 in your browser
2. You should see the CasinoBit homepage
3. Register a new account
4. Try playing a game in demo mode

## Production Deployment

### 1. Build for Production

```bash
npm run build
```

### 2. Set Production Environment Variables

Update `.env` with production values:

```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
REDIS_HOST="your-production-redis-host"
JWT_SECRET="your-production-jwt-secret"
FRONTEND_URL="https://your-domain.com"
```

### 3. Start Production Servers

```bash
npm run start
```

### 4. Setup Process Manager (PM2)

```bash
npm install -g pm2

# Start backend
cd apps/backend
pm2 start dist/index.js --name casinobit-backend

# Start frontend
cd apps/frontend
pm2 start npm --name casinobit-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Setup Nginx Reverse Proxy

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Setup SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

## Docker Deployment

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: casinobit
      POSTGRES_USER: casinouser
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6
    ports:
      - "6379:6379"

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    environment:
      DATABASE_URL: postgresql://casinouser:your_password@postgres:5432/casinobit
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: your_jwt_secret
      FRONTEND_URL: http://localhost:3000
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Start with Docker Compose:

```bash
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U casinouser -d casinobit

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping

# Check if Redis is running
sudo systemctl status redis
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Prisma Issues

```bash
# Reset database
npm run db:push -- --force-reset

# Regenerate Prisma client
npm run db:generate
```

### Build Errors

```bash
# Clean build cache
rm -rf node_modules
rm -rf .next
rm -rf dist
rm -rf .turbo

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

## Next Steps

After successful installation:

1. Create an admin account
2. Configure game settings
3. Setup jackpots
4. Create contests
5. Test all games
6. Setup monitoring
7. Configure backups

## Support

If you encounter issues:

1. Check the logs in `apps/backend/logs`
2. Review the troubleshooting section
3. Open an issue on GitHub
4. Join our Discord community
