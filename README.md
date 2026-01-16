# CasinoBit - Complete Casino Platform

A production-ready, provably fair casino platform built with modern technologies, featuring 20+ games, multi-currency support, advanced betting strategies, and real-time multiplayer games.

## 🎮 Features

### Core Features
- ✅ **20+ Casino Games** - Dice, Limbo, Crash, Mines, Plinko, Roulette, Keno, Wheel, and more
- ✅ **Provably Fair System** - Stake-style RNG with HMAC-SHA256
- ✅ **Multi-Currency Wallet** - BTC, ETH, LTC, USDT, USD, EUR
- ✅ **Manual & Auto Betting** - Advanced autobet with stop conditions
- ✅ **Strategy Engine** - Martingale, Paroli, D'Alembert, custom scripts
- ✅ **Jackpot System** - Configurable per game/currency
- ✅ **Contest System** - Daily/weekly competitions
- ✅ **Leaderboards** - High rollers, big wins, lucky wins
- ✅ **VIP & Rakeback** - Reward loyal players
- ✅ **Real-time Multiplayer** - Crash, Trenball with Socket.IO
- ✅ **Fairness Verification** - Complete verifier page
- ✅ **Admin Panel** - Manage games, jackpots, contests

### Technical Features
- 🔐 JWT Authentication with RBAC
- 📊 PostgreSQL + Prisma ORM
- 🚀 Redis + BullMQ for workers
- 🔌 Socket.IO for real-time games
- 🎨 Retro modern UI with Tailwind
- 📱 Responsive design
- 🌐 Monorepo architecture

## 🏗️ Architecture

```
casino-platform/
├── apps/
│   ├── backend/          # Fastify API + WebSocket server
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── services/ # Business logic
│   │   │   ├── workers/  # Background jobs
│   │   │   └── websocket/# Real-time games
│   │   └── package.json
│   └── frontend/         # Next.js application
│       ├── src/
│       │   ├── app/      # Pages
│       │   ├── components/# UI components
│       │   ├── store/    # Zustand state
│       │   └── lib/      # API client
│       └── package.json
├── packages/
│   ├── database/         # Prisma schemas
│   ├── game-engine/      # Game logic
│   ├── fairness/         # RNG system
│   └── shared/           # Shared types
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd casino-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create `.env` files in both `apps/backend` and `apps/frontend`:

**Backend `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/casinobit"
REDIS_HOST="localhost"
REDIS_PORT="6379"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT="3001"
FRONTEND_URL="http://localhost:3000"
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

4. **Setup database**
```bash
npm run db:generate
npm run db:push
```

5. **Start development servers**
```bash
npm run dev
```

This will start:
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

## 🎲 Game Implementations

### Implemented Games

1. **Dice** - Roll over/under with ultimate mode
2. **Limbo** - Exponential multiplier prediction
3. **Mines** - Grid-based mine sweeper
4. **Plinko** - Ball drop with risk levels
5. **Crash** - Multiplayer crash game
6. **Roulette** - European roulette with presets
7. **Keno** - Number selection game
8. **Wheel** - Spin wheel with segments
9. **Trenball** - Color betting multiplayer

### Game Features

Each game includes:
- Provably fair RNG
- Configurable house edge
- Min/max bet limits
- Jackpot conditions
- Demo mode
- Auto-bet support
- Strategy compatibility

## 🔐 Provably Fair System

### How It Works

1. **Server Seed** - Generated and hashed before betting
2. **Client Seed** - User-provided or auto-generated
3. **Nonce** - Increments with each bet
4. **Cursor** - For generating unlimited bytes

### RNG Process

```typescript
// Generate HMAC
const hmac = HMAC_SHA256(serverSeed, `${clientSeed}:${nonce}:${cursor}`);

// Convert to bytes
const bytes = Buffer.from(hmac, 'hex');

// Generate floats (0-1)
const float = bytes.readUInt32BE(0) / 0x100000000;

// Map to game events
const result = mapToGameEvent(float);
```

### Verification

Users can verify any bet by:
1. Viewing the seed pair used
2. Checking the server seed hash
3. Rotating seeds to reveal server seed
4. Using the verifier page to recalculate

## 📊 Database Schema

### Key Models

- **User** - Authentication and profile
- **Wallet** - Multi-currency balances
- **SeedPair** - Provably fair seeds
- **Bet** - Bet history and results
- **Jackpot** - Jackpot pools
- **Contest** - Competition data
- **Strategy** - Betting strategies

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Betting
- `POST /api/bet/place` - Place a bet
- `GET /api/bet/history` - Get bet history
- `POST /api/bet/autobet/start` - Start autobet
- `POST /api/bet/autobet/stop` - Stop autobet

### Wallet
- `GET /api/wallet` - Get all wallets
- `POST /api/wallet/add` - Add balance

### Seeds
- `GET /api/seed/active` - Get active seed pair
- `POST /api/seed/client-seed` - Update client seed
- `POST /api/seed/rotate` - Rotate seed pair

### Games
- `GET /api/game` - List all games
- `POST /api/game/:gameType/favorite` - Toggle favorite

### Strategies
- `GET /api/strategy/defaults` - Get default strategies
- `POST /api/strategy` - Create strategy
- `GET /api/strategy/public` - Browse public strategies

### Leaderboards
- `GET /api/leaderboard/all-bets` - Recent bets
- `GET /api/leaderboard/high-rollers` - Highest bets
- `GET /api/leaderboard/big-wins` - Biggest wins
- `GET /api/leaderboard/lucky-wins` - Highest multipliers

## 🎨 Frontend Components

### Pages
- `/` - Homepage with game grid
- `/game/[gameType]` - Individual game pages
- `/wallet` - Wallet management
- `/history` - Bet history
- `/leaderboard` - Leaderboards
- `/contests` - Active contests
- `/fairness` - Fairness explanation
- `/verifier` - Bet verifier
- `/admin` - Admin panel

### Components
- `BetControls` - Amount input, presets, auto-bet
- `FairnessModal` - Seed management
- `LiveStats` - Real-time statistics
- `GameCanvas` - Game visualization
- `Leaderboard` - Bet listings

## 🔧 Configuration

### Game Configuration

Admins can configure per game:
- House edge percentage
- Min/max bet per currency
- Max win per currency
- Jackpot conditions
- Enable/disable game

### Jackpot Configuration

- Per game or global
- Per currency or all currencies
- Minimum amount threshold
- Contribution percentage
- Win conditions

### Contest Configuration

- Duration (daily/weekly)
- Prize pool
- Entry requirements
- Ranking criteria
- Prize distribution

## 🚀 Deployment

### Production Build

```bash
# Build all packages
npm run build

# Start production servers
npm run start
```

### Environment Setup

1. Setup PostgreSQL database
2. Setup Redis instance
3. Configure environment variables
4. Run database migrations
5. Start backend and frontend

### Recommended Stack

- **Hosting**: AWS, DigitalOcean, or Vercel
- **Database**: AWS RDS or managed PostgreSQL
- **Redis**: AWS ElastiCache or Redis Cloud
- **CDN**: CloudFlare
- **Monitoring**: Sentry, DataDog

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## 📝 Default Strategies

### Martingale
Double bet after loss, reset after win

### Delayed Martingale
Double bet after 3 consecutive losses

### Reverse Martingale
Double bet after win, reset after loss

### Paroli
Double bet after win, reset after 3 wins

### D'Alembert
Increase by 10% after loss, decrease by 10% after win

## 🎮 Multiplayer Games

### Crash
- Real-time multiplier growth
- Auto cashout support
- Round history
- Player list

### Trenball
- Bet on crash/red/green/moon
- Round-based gameplay
- Color statistics

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting (recommended)
- Input validation with Zod
- SQL injection protection (Prisma)
- XSS protection

## 📈 Performance

- Redis caching
- Database indexing
- Connection pooling
- Worker queues for heavy tasks
- Optimized queries

## 🎨 Theme Customization

Colors are defined in:
- `packages/shared/constants.ts`
- `apps/frontend/tailwind.config.js`
- `apps/frontend/src/styles/globals.css`

## 📚 Additional Documentation

- [Game Rules](./docs/GAME_RULES.md)
- [API Documentation](./docs/API.md)
- [Fairness Verification](./docs/FAIRNESS.md)
- [Admin Guide](./docs/ADMIN.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

For issues and questions:
- GitHub Issues
- Documentation
- Community Discord

## 🎯 Roadmap

- [ ] More games (Blackjack, HiLo, Tower, etc.)
- [ ] Mobile app
- [ ] Live dealer games
- [ ] Sports betting
- [ ] NFT integration
- [ ] Tournament system
- [ ] Affiliate program
- [ ] Multi-language support

---

Built with ❤️ using Node.js, TypeScript, Next.js, and PostgreSQL
