# Sphira API Documentation

## Base URL
- **Development**: `http://localhost:3000/api`
- **Staging**: `https://staging.sphira.finance/api`
- **Production**: `https://api.sphira.finance`

## Authentication

All API endpoints require authentication via JWT token in the Authorization header:

\`\`\`http
Authorization: Bearer <jwt_token>
\`\`\`

## Rate Limiting

- **Rate Limit**: 100 requests per minute per IP address
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## SIPs API

### List SIPs
\`\`\`http
GET /api/sips
\`\`\`

**Response**:
\`\`\`json
{
  "sips": [
    {
      "id": "sip_123",
      "amount": "100.00",
      "token": "USDC",
      "frequency": "weekly",
      "duration": 12,
      "status": "active",
      "nextExecution": "2025-01-26T10:00:00Z",
      "totalDeposited": "400.00",
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
\`\`\`

### Create SIP
\`\`\`http
POST /api/sips
\`\`\`

**Request Body**:
\`\`\`json
{
  "amount": "100.00",
  "token": "USDC",
  "frequency": "weekly",
  "duration": 12,
  "startDate": "2025-01-20T10:00:00Z"
}
\`\`\`

**Response**:
\`\`\`json
{
  "sip": {
    "id": "sip_124",
    "amount": "100.00",
    "token": "USDC",
    "frequency": "weekly",
    "duration": 12,
    "status": "active",
    "nextExecution": "2025-01-27T10:00:00Z",
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
\`\`\`

### Get SIP Details
\`\`\`http
GET /api/sips/{id}
\`\`\`

**Response**:
\`\`\`json
{
  "sip": {
    "id": "sip_123",
    "amount": "100.00",
    "token": "USDC",
    "frequency": "weekly",
    "duration": 12,
    "status": "active",
    "nextExecution": "2025-01-26T10:00:00Z",
    "totalDeposited": "400.00",
    "executionHistory": [
      {
        "date": "2025-01-19T10:00:00Z",
        "amount": "100.00",
        "txHash": "0x123...",
        "status": "completed"
      }
    ],
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
\`\`\`

### Update SIP
\`\`\`http
PUT /api/sips/{id}
\`\`\`

**Request Body**:
\`\`\`json
{
  "amount": "150.00",
  "frequency": "monthly"
}
\`\`\`

### Cancel SIP
\`\`\`http
DELETE /api/sips/{id}
\`\`\`

**Response**:
\`\`\`json
{
  "message": "SIP cancelled successfully",
  "sip": {
    "id": "sip_123",
    "status": "cancelled",
    "cancelledAt": "2025-01-20T15:30:00Z"
  }
}
\`\`\`

## Portfolio API

### Get Portfolio Overview
\`\`\`http
GET /api/portfolio
\`\`\`

**Response**:
\`\`\`json
{
  "portfolio": {
    "totalValue": "10000.00",
    "totalDeposited": "9500.00",
    "totalYield": "500.00",
    "yieldPercentage": 5.26,
    "activeSips": 3,
    "lockedFunds": "2000.00",
    "availableBalance": "8000.00",
    "tokens": [
      {
        "symbol": "USDC",
        "balance": "5000.00",
        "value": "5000.00",
        "percentage": 50.0
      },
      {
        "symbol": "ETH",
        "balance": "2.5",
        "value": "3000.00",
        "percentage": 30.0
      }
    ]
  }
}
\`\`\`

### Get Portfolio History
\`\`\`http
GET /api/portfolio/history?period=30d
\`\`\`

**Query Parameters**:
- `period`: `7d`, `30d`, `90d`, `1y`, `all`

**Response**:
\`\`\`json
{
  "history": [
    {
      "date": "2025-01-20",
      "totalValue": "10000.00",
      "totalDeposited": "9500.00",
      "yield": "500.00"
    }
  ]
}
\`\`\`

## Yield API

### Get Available Pools
\`\`\`http
GET /api/yield/pools
\`\`\`

**Response**:
\`\`\`json
{
  "pools": [
    {
      "id": "pool_usdc_som",
      "name": "USDC-SOM LP",
      "protocol": "SomniaSwap",
      "apy": 15.5,
      "tvl": "1000000.00",
      "risk": "medium",
      "tokens": ["USDC", "SOM"]
    }
  ]
}
\`\`\`

### Get Current Allocations
\`\`\`http
GET /api/yield/allocations
\`\`\`

**Response**:
\`\`\`json
{
  "allocations": [
    {
      "poolId": "pool_usdc_som",
      "amount": "2000.00",
      "percentage": 40.0,
      "currentYield": "310.00",
      "apy": 15.5
    }
  ],
  "totalAllocated": "5000.00",
  "averageApy": 12.8
}
\`\`\`

## Notifications API

### Get Notifications
\`\`\`http
GET /api/notifications?limit=20&offset=0
\`\`\`

**Response**:
\`\`\`json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "sip_executed",
      "title": "SIP Executed",
      "message": "Your weekly SIP of 100 USDC has been executed",
      "read": false,
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 1,
  "unreadCount": 1
}
\`\`\`

### Mark Notification as Read
\`\`\`http
PUT /api/notifications/{id}/read
\`\`\`

**Response**:
\`\`\`json
{
  "message": "Notification marked as read"
}
\`\`\`

## Chat API

### Process Chat Command
\`\`\`http
POST /api/chat
\`\`\`

**Request Body**:
\`\`\`json
{
  "message": "/startSIP 100 USDC weekly",
  "userId": "user_123"
}
\`\`\`

**Response**:
\`\`\`json
{
  "response": {
    "type": "success",
    "message": "SIP created successfully! 100 USDC weekly for 12 weeks.",
    "data": {
      "sipId": "sip_124",
      "nextExecution": "2025-01-27T10:00:00Z"
    }
  }
}
\`\`\`

### Available Chat Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/startSIP <amount> <token> <frequency>` | Create new SIP | `/startSIP 100 USDC weekly` |
| `/portfolio` | Show portfolio overview | `/portfolio` |
| `/yield` | Show yield information | `/yield` |
| `/lockFunds <amount> <token>` | Lock funds in emergency vault | `/lockFunds 500 USDC` |
| `/sips` | List all SIPs | `/sips` |
| `/cancel <sipId>` | Cancel specific SIP | `/cancel sip_123` |
| `/help` | Show available commands | `/help` |

## Analytics API

### Get Platform Analytics
\`\`\`http
GET /api/analytics
\`\`\`

**Response**:
\`\`\`json
{
  "analytics": {
    "totalUsers": 1250,
    "totalSips": 3500,
    "totalValueLocked": "5000000.00",
    "averageYield": 12.5,
    "topPerformingPool": {
      "name": "USDC-SOM LP",
      "apy": 15.5
    },
    "recentActivity": [
      {
        "type": "sip_created",
        "count": 25,
        "period": "24h"
      }
    ]
  }
}
\`\`\`

## Error Responses

All API endpoints return consistent error responses:

\`\`\`json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "amount",
      "issue": "Amount must be greater than 0"
    }
  }
}
\`\`\`

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |
| `BLOCKCHAIN_ERROR` | Blockchain transaction failed |

## WebSocket Events

Connect to `/api/ws` for real-time updates:

### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `sip_executed` | SIP deposit completed | `{sipId, amount, txHash}` |
| `yield_updated` | Yield calculation updated | `{userId, newYield, apy}` |
| `notification` | New notification | `{id, type, message}` |
| `emergency_triggered` | Emergency event | `{type, message, severity}` |

### Example WebSocket Usage

\`\`\`javascript
const ws = new WebSocket('wss://api.sphira.finance/ws');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  
  switch(event.type) {
    case 'sip_executed':
      console.log('SIP executed:', event.payload);
      break;
    case 'yield_updated':
      console.log('Yield updated:', event.payload);
      break;
  }
});
