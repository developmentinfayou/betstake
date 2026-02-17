# How to Play Ludo

## Game Overview
Ludo is a multiplayer board game where 2-4 players race their 4 tokens from start to finish. The first player to get all 4 tokens home wins!

## Game Setup

### 1. Create or Join a Game
- Go to `/game/ludo`
- Choose game mode: **1v1** or **1v1v1v1** (4 players)
- Set bet amount (e.g., $10 USD)
- Click "Create Game" or join an existing game

### 2. Wait for Players
- Game needs minimum players (2 for 1v1, 4 for 1v1v1v1)
- Share the game link with friends
- Once all players join, the host clicks "Start Game"

## How to Play

### Your Turn
When it's your turn (indicated by pink border around your name):

1. **Roll the Dice** 🎲
   - Click the "🎲 Roll Dice" button
   - You'll see the dice result (1-6)

2. **Move a Token**
   - After rolling, valid tokens will be **highlighted in GOLD** on the board
   - Click one of the highlighted tokens in the "Your Tokens" panel
   - The token will move forward by the dice number

3. **Special Rules**
   - **Roll 6**: Get an extra turn! Roll again
   - **Start Token**: Need a 6 to bring a token from home to the starting position
   - **Capture**: Land on opponent's token to send it back home
   - **No Valid Moves**: Turn automatically skips

### Game Board

```
┌─────────┬─────┬─────────┐
│  RED    │     │  BLUE   │
│  HOME   │     │  HOME   │
│  🔴🔴   │     │  🔵🔵   │
│  🔴🔴   │     │  🔵🔵   │
├─────────┼─────┼─────────┤
│         │     │         │
│  PATH   │ 🏁  │  PATH   │
│         │     │         │
├─────────┼─────┼─────────┤
│ GREEN   │     │ YELLOW  │
│  HOME   │     │  HOME   │
│  🟢🟢   │     │  🟡🟡   │
│  🟢🟢   │     │  🟡🟡   │
└─────────┴─────┴─────────┘
```

- **Colored Corners**: Starting home areas
- **Circular Path**: Main track (52 spaces)
- **Center**: Finish area
- **Tokens**: Your 4 game pieces

### Visual Indicators

- **Pink Border**: Current player's turn
- **Gold Glow**: Selectable tokens (after rolling)
- **Token Numbers**: 1, 2, 3, 4 on each piece
- **Position**: Shows where each token is

## Winning

- First player to get all 4 tokens to the center wins
- Winner receives the pot (minus house edge)
- Game automatically ends and returns you to lobby

## Tips

1. **Roll 6 First**: You need a 6 to start moving tokens from home
2. **Spread Out**: Don't keep all tokens at home
3. **Capture Opponents**: Send them back to slow them down
4. **Watch the Timer**: Make your move before timeout (auto-move)
5. **Use All Tokens**: Don't focus on just one token

## Troubleshooting

### "No valid moves" message?
- You rolled but no tokens can move (e.g., rolled 4 but all tokens at home)
- Need a 6 to start a new token from home
- All tokens are blocked or finished
- **Turn automatically passes to next player after 2 seconds**

### Can't see the board?
- Board should show colored corners and circular path
- Tokens appear as colored circles with numbers
- Refresh page if board doesn't load

### Not my turn?
- Wait for other players to complete their turns
- Your name will have a pink border when it's your turn
- "Roll Dice" button only appears on your turn

## Game Modes

### 1v1 Mode
- 2 players
- Faster games
- Higher win rate (50%)
- 2% house edge

### 1v1v1v1 Mode
- 4 players
- Longer games
- Lower win rate (25%)
- 3% house edge

## Example Turn

```
1. It's Samarpit's turn (RED player)
2. Click "🎲 Roll Dice" → Rolls 6
3. Token 1 is highlighted in GOLD (can move from home)
4. Click "Token 1" in the panel
5. Token 1 moves to starting position
6. Rolled 6, so get extra turn!
7. Click "🎲 Roll Dice" again → Rolls 4
8. Token 1 is highlighted (can move 4 spaces)
9. Click "Token 1" to move
10. Turn passes to next player (BLUE)
```

## Current Status

After clicking "Start Game":
- ✅ Game starts
- ✅ Turn assigned to first player
- ✅ Board is visible (with improved colors)
- ✅ "Roll Dice" button appears for current player
- ✅ Tokens are clickable after rolling
- ✅ Valid moves are highlighted in gold

## Next Steps

1. **Samarpit** (current player): Click "🎲 Roll Dice"
2. See the dice result
3. Click a highlighted token to move
4. Turn passes to next player

Enjoy the game! 🎲🎯
