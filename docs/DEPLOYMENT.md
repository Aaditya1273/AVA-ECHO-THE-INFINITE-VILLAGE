# Deployment Guide

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Git
- Somnia wallet with testnet/mainnet tokens
- Domain name (for production)

## Environment Configuration

### Development Environment

Create `.env.local`:
\`\`\`env
# Somnia Network Configuration
SOMNIA_TESTNET_RPC_URL=https://testnet-rpc.somnia.network
SOMNIA_MAINNET_RPC_URL=https://mainnet-rpc.somnia.network
PRIVATE_KEY=your_private_key_here
SOMNIA_API_KEY=your_somnia_api_key

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_CHAIN_ID=2648
NEXT_PUBLIC_CHAIN_NAME=Somnia Testnet
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Database (if using external DB)
DATABASE_URL=postgresql://user:password@localhost:5432/sphira

# Optional Features
REPORT_GAS=true
ENABLE_ANALYTICS=true
SENTRY_DSN=your_sentry_dsn
\`\`\`

### Production Environment

Create `.env.production`:
\`\`\`env
# Somnia Network Configuration
SOMNIA_MAINNET_RPC_URL=https://mainnet-rpc.somnia.network
PRIVATE_KEY=your_production_private_key
SOMNIA_API_KEY=your_production_api_key

# Application Configuration
NEXT_PUBLIC_API_URL=https://api.sphira.finance
NEXT_PUBLIC_CHAIN_ID=2649
NEXT_PUBLIC_CHAIN_NAME=Somnia Mainnet
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Database
DATABASE_URL=postgresql://user:password@prod-db:5432/sphira

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Monitoring
SENTRY_DSN=your_production_sentry_dsn
DATADOG_API_KEY=your_datadog_key
\`\`\`

## Smart Contract Deployment

### Testnet Deployment

1. **Compile Contracts**
\`\`\`bash
cd contracts
npm install
npx hardhat compile
\`\`\`

2. **Run Tests**
\`\`\`bash
npx hardhat test
npm run test:coverage
\`\`\`

3. **Deploy to Testnet**
\`\`\`bash
npx hardhat run scripts/deploy.js --network somnia-testnet
\`\`\`

4. **Verify Contracts**
\`\`\`bash
npx hardhat verify --network somnia-testnet DEPLOYED_CONTRACT_ADDRESS
\`\`\`

### Mainnet Deployment

1. **Security Audit**
\`\`\`bash
npm run audit
npm run slither
\`\`\`

2. **Deploy to Mainnet**
\`\`\`bash
npx hardhat run scripts/deploy.js --network somnia-mainnet
\`\`\`

3. **Verify Contracts**
\`\`\`bash
npx hardhat verify --network somnia-mainnet DEPLOYED_CONTRACT_ADDRESS
\`\`\`

## Frontend Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Connect your GitHub repository to Vercel
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

2. **Environment Variables**
   - Add all production environment variables in Vercel dashboard
   - Ensure `NEXT_PUBLIC_*` variables are properly set

3. **Domain Configuration**
   - Add custom domain in Vercel dashboard
   - Configure DNS records:
     - A record: `@` → Vercel IP
     - CNAME record: `www` → `your-app.vercel.app`

### Docker Deployment

1. **Build Docker Image**
\`\`\`bash
docker build -t sphira-frontend .
\`\`\`

2. **Run Container**
\`\`\`bash
docker run -p 3000:3000 --env-file .env.production sphira-frontend
\`\`\`

3. **Docker Compose**
\`\`\`bash
docker-compose up -d
\`\`\`

## Database Setup

### PostgreSQL Setup

1. **Create Database**
\`\`\`sql
CREATE DATABASE sphira;
CREATE USER sphira_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE sphira TO sphira_user;
\`\`\`

2. **Run Migrations**
\`\`\`bash
npm run db:migrate
npm run db:seed
\`\`\`

### Redis Setup (Optional)

For caching and session management:

\`\`\`bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Or install locally
sudo apt-get install redis-server
\`\`\`

## Load Balancer Configuration

### Nginx Configuration

Create `/etc/nginx/sites-available/sphira`:

\`\`\`nginx
upstream sphira_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name sphira.finance www.sphira.finance;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sphira.finance www.sphira.finance;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://sphira_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ws {
        proxy_pass http://sphira_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

## Monitoring Setup

### Application Monitoring

1. **Sentry Setup**
\`\`\`bash
npm install @sentry/nextjs
\`\`\`

Add to `next.config.js`:
\`\`\`javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Your Next.js config
}, {
  silent: true,
  org: "your-org",
  project: "sphira",
});
\`\`\`

2. **Health Check Endpoint**
Create `/api/health`:
\`\`\`javascript
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
}
\`\`\`

### Infrastructure Monitoring

1. **Prometheus Configuration**
\`\`\`yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sphira'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
\`\`\`

2. **Grafana Dashboard**
Import the provided Grafana dashboard configuration from `monitoring/grafana-dashboard.json`

## Security Configuration

### SSL/TLS Setup

1. **Let's Encrypt Certificate**
\`\`\`bash
sudo certbot --nginx -d sphira.finance -d www.sphira.finance
\`\`\`

2. **Security Headers**
Add to `next.config.js`:
\`\`\`javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ];
  }
};
\`\`\`

### Firewall Configuration

\`\`\`bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application port (if needed)
sudo ufw allow 3000

# Enable firewall
sudo ufw enable
\`\`\`

## Backup Strategy

### Database Backup

1. **Automated Backup Script**
\`\`\`bash
#!/bin/bash
BACKUP_DIR="/backups/sphira"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="sphira_backup_$DATE.sql"

pg_dump -h localhost -U sphira_user sphira > "$BACKUP_DIR/$FILENAME"
gzip "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
\`\`\`

2. **Cron Job**
\`\`\`bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
\`\`\`

### Smart Contract Backup

Keep copies of:
- Contract source code
- Deployment artifacts
- ABI files
- Deployment addresses
- Verification information

## Scaling Considerations

### Horizontal Scaling

1. **Multiple App Instances**
\`\`\`bash
# Using PM2
pm2 start ecosystem.config.js
\`\`\`

2. **Load Balancer Configuration**
Configure Nginx upstream with multiple backend servers

### Database Scaling

1. **Read Replicas**
\`\`\`javascript
// Database configuration
const dbConfig = {
  master: {
    host: 'master-db.example.com',
    // write operations
  },
  slaves: [
    {
      host: 'replica1-db.example.com',
      // read operations
    },
    {
      host: 'replica2-db.example.com',
      // read operations
    }
  ]
};
\`\`\`

2. **Connection Pooling**
\`\`\`javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
\`\`\`

## Rollback Strategy

### Application Rollback

1. **Vercel Rollback**
\`\`\`bash
vercel rollback [deployment-url]
\`\`\`

2. **Docker Rollback**
\`\`\`bash
docker tag sphira-frontend:latest sphira-frontend:backup
docker pull sphira-frontend:previous-version
docker tag sphira-frontend:previous-version sphira-frontend:latest
docker-compose up -d
\`\`\`

### Smart Contract Rollback

Smart contracts are immutable, but you can:
1. Deploy new version with fixes
2. Update proxy contract to point to new implementation
3. Pause contract functionality if emergency

## Maintenance

### Regular Maintenance Tasks

1. **Update Dependencies**
\`\`\`bash
npm audit
npm update
\`\`\`

2. **Database Maintenance**
\`\`\`sql
VACUUM ANALYZE;
REINDEX DATABASE sphira;
\`\`\`

3. **Log Rotation**
\`\`\`bash
# Configure logrotate
sudo nano /etc/logrotate.d/sphira
\`\`\`

4. **Security Updates**
\`\`\`bash
sudo apt update && sudo apt upgrade
\`\`\`

### Performance Monitoring

1. **Application Metrics**
   - Response times
   - Error rates
   - Memory usage
   - CPU utilization

2. **Database Metrics**
   - Query performance
   - Connection pool usage
   - Slow query log

3. **Blockchain Metrics**
   - Gas usage
   - Transaction success rate
   - Block confirmation times

## Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   - Check gas limit
   - Verify network configuration
   - Ensure sufficient balance

2. **Frontend Build Fails**
   - Check environment variables
   - Verify dependencies
   - Review build logs

3. **Database Connection Issues**
   - Verify connection string
   - Check firewall rules
   - Review database logs

### Debug Commands

\`\`\`bash
# Check application logs
docker logs sphira-frontend

# Check database connections
psql -h localhost -U sphira_user -d sphira -c "SELECT version();"

# Test API endpoints
curl -X GET https://api.sphira.finance/health

# Check smart contract status
npx hardhat console --network somnia-mainnet
