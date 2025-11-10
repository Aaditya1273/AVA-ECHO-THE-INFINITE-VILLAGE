# Sphira Architecture Documentation

## System Overview

Sphira is a three-tier architecture consisting of:
1. **Frontend Layer**: React/Next.js application with real-time UI
2. **API Layer**: Next.js API routes for business logic and data aggregation
3. **Blockchain Layer**: Soroban smart contracts on Stellar blockchain

## Smart Contract Architecture

### SIPManager.sol
**Purpose**: Manages systematic investment plans and recurring deposits

**Key Functions**:
- `createSIP(amount, frequency, duration, token)`: Creates new SIP
- `executeSIP(sipId)`: Processes scheduled deposit
- `cancelSIP(sipId)`: Cancels active SIP
- `withdrawEarly(sipId, amount)`: Early withdrawal with penalties

**Security Features**:
- Reentrancy guards on all external calls
- Access control for admin functions
- Gas optimization for batch operations

### YieldRouter.sol
**Purpose**: Optimizes yield by distributing funds across DeFi protocols

**Key Functions**:
- `allocateFunds(amount, strategy)`: Distributes funds to pools
- `rebalance()`: Rebalances allocations based on APY
- `calculateYield(user)`: Computes current yield for user
- `harvestRewards()`: Claims and compounds rewards

**Yield Strategies**:
1. **Conservative**: 70% stablecoins, 30% blue-chip tokens
2. **Balanced**: 50% stablecoins, 50% growth tokens
3. **Aggressive**: 30% stablecoins, 70% high-yield pools

### LockVault.sol
**Purpose**: Emergency fund protection with multi-sig governance

**Key Functions**:
- `lockFunds(amount, conditions)`: Locks funds with conditions
- `requestUnlock(lockId, reason)`: Requests emergency unlock
- `approveUnlock(lockId)`: Multi-sig approval for unlock
- `executeUnlock(lockId)`: Executes approved unlock

**Governance Model**:
- 5-member multi-sig council
- 3/5 signatures required for emergency unlocks
- 24-hour timelock for critical operations

## Frontend Architecture

### Component Structure
\`\`\`
components/
├── dashboard-layout.tsx      # Main layout wrapper
├── overview-cards.tsx        # Portfolio summary cards
├── sip-chart.tsx            # SIP performance charts
├── yield-optimizer.tsx       # Yield allocation interface
├── chat-interface.tsx        # Command-based chat UI
├── wallet-connection.tsx     # Wallet integration
└── notification-center.tsx   # Real-time notifications
\`\`\`

### State Management
- **React Context**: Global wallet and user state
- **SWR**: Data fetching and caching
- **Local Storage**: User preferences and settings

### Real-time Updates
- **Polling**: 30-second intervals for portfolio data
- **WebSocket**: Real-time notifications and chat
- **Event Listeners**: Blockchain event subscriptions

## API Layer

### REST Endpoints
\`\`\`
/api/sips/              # SIP management
/api/yield/             # Yield optimization
/api/portfolio/         # Portfolio analytics
/api/notifications/     # Notification system
/api/chat/              # Chat command processing
/api/analytics/         # Performance metrics
\`\`\`

### Data Flow
1. Frontend makes API request
2. API validates request and user authentication
3. API interacts with smart contracts via ethers.js
4. API aggregates and formats data
5. API returns structured response to frontend

## Security Architecture

### Smart Contract Security
- **OpenZeppelin**: Battle-tested security libraries
- **Access Control**: Role-based permissions (ADMIN, USER, OPERATOR)
- **Reentrancy Protection**: ReentrancyGuard on all external calls
- **Integer Overflow**: SafeMath for arithmetic operations
- **Gas Optimization**: Efficient loops and storage patterns

### Frontend Security
- **Input Validation**: All user inputs sanitized
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookies and CSRF tokens
- **Wallet Security**: Secure key management practices

### API Security
- **Rate Limiting**: 100 requests per minute per IP
- **Authentication**: JWT tokens with 24-hour expiry
- **Input Sanitization**: All inputs validated and sanitized
- **Error Handling**: No sensitive information in error messages

## Performance Optimization

### Smart Contract Optimization
- **Gas Efficiency**: Optimized storage patterns and loops
- **Batch Operations**: Multiple SIPs processed in single transaction
- **Event Indexing**: Efficient event filtering and querying
- **Proxy Patterns**: Upgradeable contracts for future improvements

### Frontend Optimization
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: SWR for intelligent data caching
- **Bundle Size**: Tree shaking and dead code elimination

### Database Optimization
- **Indexing**: Optimized database indexes for common queries
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Efficient SQL queries and joins
- **Caching Layer**: Redis for frequently accessed data

## Monitoring and Observability

### Metrics Collection
- **Smart Contract Events**: All important events logged
- **API Metrics**: Response times, error rates, throughput
- **Frontend Analytics**: User interactions, performance metrics
- **Business Metrics**: SIP creation rates, yield performance

### Error Tracking
- **Smart Contract**: Event-based error logging
- **Frontend**: Sentry for error tracking and performance monitoring
- **API**: Structured logging with correlation IDs
- **Alerting**: Real-time alerts for critical errors

## Deployment Architecture

### Development Environment
- **Local Blockchain**: Hardhat network for development
- **Frontend**: Next.js development server
- **Database**: Local PostgreSQL instance
- **Testing**: Jest and Hardhat test suites

### Staging Environment
- **Blockchain**: Somnia testnet
- **Frontend**: Vercel preview deployment
- **Database**: Staging database with production-like data
- **Monitoring**: Full monitoring stack enabled

### Production Environment
- **Blockchain**: Somnia mainnet
- **Frontend**: Vercel production deployment
- **Database**: Production PostgreSQL with backups
- **CDN**: Global content delivery network
- **Monitoring**: Full observability stack

## Scalability Considerations

### Horizontal Scaling
- **API Layer**: Stateless design allows horizontal scaling
- **Database**: Read replicas for query scaling
- **Frontend**: CDN distribution for global performance
- **Caching**: Redis cluster for distributed caching

### Vertical Scaling
- **Smart Contracts**: Gas-optimized for high throughput
- **Database**: Optimized queries and indexing
- **API**: Efficient algorithms and data structures
- **Frontend**: Performance-optimized React components

## Future Architecture Evolution

### Phase 2: zkML Integration
- **On-chain ML**: Zero-knowledge machine learning for yield optimization
- **Privacy**: User data privacy with zero-knowledge proofs
- **Automation**: Fully automated yield strategies

### Phase 3: Multi-chain
- **Cross-chain**: Bridge integration for multiple blockchains
- **Unified UX**: Single interface for multi-chain operations
- **Liquidity**: Cross-chain liquidity aggregation

### Phase 4: Decentralized Governance
- **DAO**: Decentralized autonomous organization
- **Governance Tokens**: Community-driven decision making
- **Proposal System**: On-chain governance proposals
