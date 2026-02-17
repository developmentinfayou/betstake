# Complete Ludo Online Guide - All Game Modes

## 🎯 Overview
Ludo is a provably fair multiplayer board game where players race their 4 tokens from home to the finish line. The first player (or team) to get all tokens home wins the pot!

## 🎮 Game Modes Available

### 1. **1v1 Mode** (Head-to-Head)
- **Players**: 2 players
- **Colors**: RED vs BLUE
- **Win Rate**: 50% chance
- **House Edge**: 2%
- **Game Speed**: Fast (15-30 minutes)
- **Strategy**: Aggressive play, focus on capturing opponent tokens

### 2. **1v1v1v1 Mode** (Free-for-All)
- **Players**: 4 players
- **Colors**: RED, BLUE, GREEN, YELLOW
- **Win Rate**: 25% chance per player
- **House Edge**: 3%
- **Game Speed**: Medium (30-60 minutes)
- **Strategy**: Balanced play, avoid early conflicts

### 3. **2v2 Mode** (Team Battle)
- **Players**: 4 players (2 teams)
- **Teams**: RED+GREEN vs BLUE+YELLOW
- **Win Rate**: 50% chance per team
- **House Edge**: 2.5%
- **Game Speed**: Long (45-90 minutes)
- **Strategy**: Coordinate with teammate, protect partner's tokens

## 🚀 How to Start Playing

### Step 1: Access Ludo Lobby
1. Navigate to `/game/ludo`
2. Check your USD balance (top right)
3. Select your preferred game mode

### Step 2: Choose Game Mode & Bet
```
Game Mode Selection:
┌─────────┬─────────┬─────────┐
│   1v1   │   2v2   │ 1v1v1v1 │
│ 2 Players│ 4 Players│ 4 Players│
│Head-to-head│Team battle│Free-for-all│
└─────────┴─────────┴─────────┘

Bet Amount: $10, $50, $100 (or custom)
```

### Step 3: Join or Create Game
- **Quick Match**: Auto-matches with similar bet amounts
- **Private Game**: Create shareable link for friends

## 🎲 Game Flow & Rules

### Game Setup
1. **Board Layout**: 15x15 grid with colored corners
2. **Token Placement**: 4 tokens per player in home corner
3. **Turn Order**: Clockwise starting with RED
4. **Objective**: Move all 4 tokens to center finish area

### Turn Mechanics

#### 1. **Roll Dice** 🎲
- Click "🎲 Roll Dice" button when it's your turn
- Provably fair RNG generates result (1-6)
- Your name has **pink border** during your turn

#### 2. **Move Token**
- Valid tokens are highlighted in **GOLD**
- Click highlighted token in "Your Tokens" panel
- Token moves forward by dice number

#### 3. **Special Rules**
```
🎲 Roll 6: Get extra turn (roll again)
🏠 Start Token: Need 6 to move from home to board
⚔️ Capture: Land on opponent = send them home
🚫 No Moves: Turn skips automatically
🏁 Exact Finish: Must land exactly on finish (position 57)
```

## 🗺️ Board Understanding

### Path System
```
Home (-1) → Start (0) → Path (1-50) → Final Stretch (51-56) → Finish (57)

Each color has different starting positions:
- RED starts at position 0
- BLUE starts at position 13  
- GREEN starts at position 26
- YELLOW starts at position 39
```

### Safe Positions
- **Safe Squares**: Positions 0, 8, 13, 21, 26, 34, 39, 47
- **Final Stretch**: Positions 51-56 (color-specific, always safe)
- **Home**: Position -1 (cannot be captured)

### Visual Indicators
- **Pink Border**: Current player's turn
- **Gold Glow**: Selectable tokens after rolling
- **Token Numbers**: 1, 2, 3, 4 on each piece
- **Color Coding**: Each player has distinct color

## ⚔️ Combat & Strategy

### Capturing Tokens
1. **How to Capture**: Land on exact same position as opponent
2. **Effect**: Opponent's token returns to home (-1)
3. **Restrictions**: 
   - Cannot capture on safe positions
   - Cannot capture same color (in team mode)
   - Cannot capture teammate tokens (2v2 mode)

### Strategic Tips by Mode

#### 1v1 Strategy
- **Early Game**: Get multiple tokens out quickly
- **Mid Game**: Focus on capturing opponent tokens
- **Late Game**: Race to finish, block opponent paths

#### 1v1v1v1 Strategy  
- **Early Game**: Stay defensive, avoid conflicts
- **Mid Game**: Pick battles carefully
- **Late Game**: Form temporary alliances against leader

#### 2v2 Strategy
- **Coordination**: Protect teammate's tokens
- **Positioning**: Create safe passages for partner
- **Sacrifice**: Sometimes sacrifice your token to help teammate

## 🎯 Winning Conditions

### Individual Modes (1v1, 1v1v1v1)
- First player to get all 4 tokens to position 57 wins
- Winner receives entire pot minus house edge

### Team Mode (2v2)
- First team to get all 8 tokens finished wins
- Both teammates share the victory payout

### Payout Structure
```
1v1 Mode:
- Total Pot: $20 (2 × $10 bet)
- Winner Gets: $19.60 (98% of pot)
- House Edge: $0.40 (2%)

1v1v1v1 Mode:
- Total Pot: $40 (4 × $10 bet)  
- Winner Gets: $38.80 (97% of pot)
- House Edge: $1.20 (3%)

2v2 Mode:
- Total Pot: $40 (4 × $10 bet)
- Winning Team Gets: $39.00 (97.5% of pot)
- Each Winner Gets: $19.50
- House Edge: $1.00 (2.5%)
```

## 🔧 Game Controls & Interface

### Main Game Screen
```
┌─────────────────┬─────────────┐
│                 │   Players   │
│   Game Board    │   Status    │
│   (Canvas)      │             │
│                 ├─────────────┤
│                 │ Your Tokens │
│                 │  🎯 🎯 🎯 🎯  │
├─────────────────┼─────────────┤
│  🎲 Roll Dice   │ Game Info   │
│   (Your Turn)   │ Pot: $20    │
└─────────────────┴─────────────┘
```

### Token Panel
- **Token 1-4**: Shows position and status
- **Clickable**: Only when highlighted gold
- **Status**: "Start", "Pos X", "✓ Home"

### Game Info Panel
- **Mode**: Current game mode
- **Bet**: Individual bet amount  
- **Total Pot**: Sum of all bets
- **Winner Gets**: Payout after house edge

## ⏱️ Timing & Automation

### Turn Timer
- **30 seconds** per turn after rolling dice
- **Auto-move**: System selects best move if timeout
- **Priority**: Capture > Advance furthest > Move from home

### Game Timeouts
- **Waiting Room**: 5 minutes before cleanup
- **Disconnect Grace**: Players can reconnect
- **Forfeit**: Remaining players split the pot

## 🎲 Provably Fair System

### How It Works
1. **Server Seed**: Generated before game starts
2. **Client Seeds**: Each player provides seed
3. **Combined Seed**: All seeds mixed together
4. **Nonce**: Increments with each dice roll
5. **Result**: HMAC-SHA256 generates fair 1-6 result

### Verification
- View server seed hash before game
- Server seed revealed after game ends
- Use verifier page to confirm fairness
- Each dice roll is independently verifiable

## 🚨 Common Issues & Solutions

### "No valid moves" Message
- **Cause**: No tokens can move with current dice roll
- **Solution**: Need 6 to start new token, or all tokens blocked
- **Result**: Turn skips automatically

### Can't See Board
- **Cause**: Canvas rendering issue
- **Solution**: Refresh page, check browser compatibility
- **Backup**: Token panel still shows positions

### Not My Turn
- **Cause**: Waiting for other players
- **Solution**: Wait for pink border around your name
- **Indicator**: "Roll Dice" button only appears on your turn

### Connection Issues
- **Cause**: Network problems
- **Solution**: Game saves state, can reconnect
- **Grace Period**: 5 minutes to rejoin

## 📊 Advanced Features

### Matchmaking System
- **Bet Range Matching**: ±20% tolerance
- **Queue System**: Auto-matches similar players
- **Wait Times**: Shows average queue time
- **Skill Matching**: Future feature planned

### Statistics Tracking
- **Total Wagered**: All-time betting volume
- **Win/Loss Ratio**: Performance tracking  
- **Profit/Loss**: Net earnings
- **Rakeback**: Loyalty rewards based on volume

### Social Features
- **Private Games**: Share links with friends
- **Spectator Mode**: Watch ongoing games (planned)
- **Chat System**: In-game messaging (planned)
- **Tournaments**: Scheduled competitions (planned)

## 🎯 Pro Tips for Each Mode

### 1v1 Mastery
1. **Opening**: Always try to get 2+ tokens out early
2. **Aggression**: Capture opponent tokens when possible
3. **Blocking**: Position tokens to block opponent paths
4. **Endgame**: Count exact moves needed to finish

### 1v1v1v1 Survival
1. **Patience**: Don't be the first to advance too far
2. **Opportunism**: Capture when others are fighting
3. **Positioning**: Stay in middle of pack
4. **Timing**: Make your move when others are vulnerable

### 2v2 Coordination
1. **Communication**: Plan moves with teammate (future chat)
2. **Protection**: Shield teammate's advancing tokens
3. **Sacrifice**: Take hits to help partner advance
4. **Timing**: Coordinate final push together

## 🏆 Winning Strategies

### Universal Principles
1. **Token Distribution**: Don't keep all tokens at home
2. **Risk Management**: Balance safety vs advancement
3. **Opponent Tracking**: Watch enemy token positions
4. **Dice Probability**: Plan for likely rolls (3.5 average)

### Mode-Specific Tactics
- **1v1**: Maximum aggression, capture everything
- **1v1v1v1**: Calculated risks, avoid early targets
- **2v2**: Team coordination, mutual protection

## 🔄 Game State Management

### Reconnection System
- Games persist in database
- Players can rejoin within 5 minutes
- Game state fully restored
- Turn continues where left off

### Forfeit Handling
- Remaining players split the pot
- Automatic win if opponent leaves
- Bet refunded if game hasn't started
- Fair distribution based on remaining players

---

## 🎮 Ready to Play?

1. **Visit**: `/game/ludo`
2. **Select**: Your preferred mode
3. **Bet**: Choose your stake
4. **Play**: Roll dice and move tokens
5. **Win**: Get all tokens home first!

**Good luck and may the dice be in your favor!** 🎲🏆