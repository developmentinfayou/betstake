# Balloon Game - Custom Pump Fix Plan

## 🎯 OBJECTIVE
Change Custom Pump mode to accept **TARGET MULTIPLIER** instead of **TARGET PUMPS**

---

## 📋 CURRENT IMPLEMENTATION ANALYSIS

### Backend (Game Engine)
**File:** `packages/game-engine/games/balloon/index.ts`

**Current Logic:**
```typescript
// Difficulty settings define pump-to-multiplier conversion
simple: { maxPumps: 10, baseMultiplier: 0.1 }   // 1 pump = 0.1x increase
easy: { maxPumps: 20, baseMultiplier: 0.08 }    // 1 pump = 0.08x increase
medium: { maxPumps: 50, baseMultiplier: 0.05 }  // 1 pump = 0.05x increase
hard: { maxPumps: 100, baseMultiplier: 0.03 }   // 1 pump = 0.03x increase
expert: { maxPumps: 200, baseMultiplier: 0.02 } // 1 pump = 0.02x increase

// Custom mode currently accepts targetPumps
if (pumpMode === 'custom') {
  pumps = Math.min(targetPumps, settings.maxPumps);
}

// Multiplier calculation
multiplier = 1 + (pumps * settings.baseMultiplier)
```

**Issues:**
1. ✅ Accepts `targetPumps` parameter
2. ❌ Should accept `targetMultiplier` parameter
3. ❌ Needs to convert multiplier → pumps internally

### Frontend (Controls)
**File:** `apps/frontend/src/components/games/balloon/BalloonGameControls.tsx`

**Current UI:**
```typescript
// Shows "Target Pumps" input
<label>Target Pumps</label>
<input type="number" value={targetPumps} max={maxPumps[difficulty]} />
```

**Issues:**
1. ❌ Label says "Target Pumps"
2. ❌ Input accepts pump count (1-200)
3. ❌ Should accept multiplier (1.0x - max multiplier)
4. ❌ Max value is based on maxPumps, should be maxMultiplier

### Frontend (Page)
**File:** `apps/frontend/src/app/game/balloon/page.tsx`

**Current State:**
```typescript
// Hardcoded multiplier calculation (WRONG)
multiplier={gameParams.pumpMode === 'custom' ? 1 + (gameParams.targetPumps * 0.1) : 2.0}
```

**Issues:**
1. ❌ Uses fixed 0.1 multiplier (only correct for 'simple' difficulty)
2. ❌ Doesn't account for different difficulty baseMultipliers
3. ❌ Should display user's selected target multiplier directly

---

## 🔧 REQUIRED CHANGES

### **CHANGE 1: Backend Interface**
**File:** `packages/game-engine/games/balloon/index.ts`

**Action:** Update interface and logic

**Changes:**
1. Rename `targetPumps` → `targetMultiplier` in `BalloonParams` interface
2. Add multiplier-to-pumps conversion function
3. Update custom mode logic to convert multiplier to pumps
4. Validate targetMultiplier is within valid range (1.0 to maxMultiplier)

**Conversion Formula:**
```
targetMultiplier = 1 + (pumps × baseMultiplier)
pumps = (targetMultiplier - 1) / baseMultiplier
```

**Max Multipliers per Difficulty:**
```
simple:  1 + (10 × 0.1)   = 2.0x
easy:    1 + (20 × 0.08)  = 2.6x
medium:  1 + (50 × 0.05)  = 3.5x
hard:    1 + (100 × 0.03) = 4.0x
expert:  1 + (200 × 0.02) = 5.0x
```

---

### **CHANGE 2: Frontend Controls**
**File:** `apps/frontend/src/components/games/balloon/BalloonGameControls.tsx`

**Action:** Update UI to accept multiplier

**Changes:**
1. Rename state: `targetPumps` → `targetMultiplier`
2. Change label: "Target Pumps" → "Target Multiplier"
3. Update max values to maxMultiplier per difficulty
4. Change input step to 0.1 for decimal multipliers
5. Update display to show "x" suffix (e.g., "2.5x")
6. Update interface `BalloonGameParams.targetPumps` → `targetMultiplier`

**New Max Multipliers:**
```typescript
const maxMultipliers = {
  simple: 2.0,
  easy: 2.6,
  medium: 3.5,
  hard: 4.0,
  expert: 5.0,
};
```

---

### **CHANGE 3: Frontend Page**
**File:** `apps/frontend/src/app/game/balloon/page.tsx`

**Action:** Update state and display

**Changes:**
1. Update initial state: `targetPumps: 5` → `targetMultiplier: 1.5`
2. Fix multiplier display in ManualBetControls
3. Use `gameParams.targetMultiplier` directly instead of calculation
4. Update type import for `BalloonGameParams`

---

### **CHANGE 4: Type Consistency**
**Files:** All files using `BalloonParams` or `BalloonGameParams`

**Action:** Ensure type consistency

**Changes:**
1. Backend: `BalloonParams.targetPumps?` → `targetMultiplier?`
2. Frontend: `BalloonGameParams.targetPumps` → `targetMultiplier`
3. Ensure both use same property name

---

## 📝 IMPLEMENTATION STEPS

### **Step 1: Update Backend Game Engine** ⚙️
1. Open `packages/game-engine/games/balloon/index.ts`
2. Change interface property name
3. Add multiplier-to-pumps conversion
4. Update custom mode logic
5. Add validation for multiplier range

### **Step 2: Update Frontend Controls** 🎮
1. Open `apps/frontend/src/components/games/balloon/BalloonGameControls.tsx`
2. Rename state variable
3. Update label and input properties
4. Change max values to multipliers
5. Add step="0.1" for decimals
6. Update display text

### **Step 3: Update Frontend Page** 📄
1. Open `apps/frontend/src/app/game/balloon/page.tsx`
2. Update initial state
3. Fix multiplier display logic
4. Remove hardcoded calculation

### **Step 4: Test All Modes** ✅
1. Test Random mode (should work unchanged)
2. Test Specific mode (still uses pumps - keep as is)
3. Test Custom mode with multipliers
4. Test all difficulties
5. Verify calculations are correct

---

## 🧮 CALCULATION EXAMPLES

### Simple Difficulty (baseMultiplier: 0.1)
- User selects: **1.5x multiplier**
- Backend calculates: `pumps = (1.5 - 1) / 0.1 = 5 pumps`
- Game generates: `burstAt = random(1-10)`
- Win if: `5 < burstAt`

### Medium Difficulty (baseMultiplier: 0.05)
- User selects: **2.0x multiplier**
- Backend calculates: `pumps = (2.0 - 1) / 0.05 = 20 pumps`
- Game generates: `burstAt = random(1-50)`
- Win if: `20 < burstAt`

### Expert Difficulty (baseMultiplier: 0.02)
- User selects: **3.0x multiplier**
- Backend calculates: `pumps = (3.0 - 1) / 0.02 = 100 pumps`
- Game generates: `burstAt = random(1-200)`
- Win if: `100 < burstAt`

---

## ⚠️ IMPORTANT NOTES

### What NOT to Change:
1. ✅ **Random Mode** - Keep as is (auto-generates pumps)
2. ✅ **Specific Mode** - Keep as is (admin sets specific pumps)
3. ✅ **Difficulty Settings** - Don't change maxPumps or baseMultiplier values
4. ✅ **Burst Logic** - Don't change RNG or burst calculation
5. ✅ **House Edge** - Keep 1% (0.99 multiplier)

### What TO Change:
1. ❌ **Custom Mode Only** - Change to accept multiplier
2. ❌ **UI Labels** - Change "Target Pumps" to "Target Multiplier"
3. ❌ **Input Range** - Change from pump count to multiplier value
4. ❌ **Backend Conversion** - Add multiplier → pumps conversion

---

## 🎯 EXPECTED BEHAVIOR AFTER FIX

### User Experience:
1. User selects **Custom** pump mode
2. User sees input labeled **"Target Multiplier"**
3. User enters **2.5x** (not 25 pumps)
4. Backend converts 2.5x to appropriate pump count based on difficulty
5. Game plays with calculated pumps
6. Result shows both pumps and multiplier

### Example Flow:
```
Difficulty: Medium
Pump Mode: Custom
Target Multiplier: 2.5x

Backend Calculation:
- baseMultiplier = 0.05
- pumps = (2.5 - 1) / 0.05 = 30 pumps
- burstAt = random(1-50) = 35
- won = 30 < 35 = TRUE
- actualMultiplier = 1 + (30 × 0.05) = 2.5x
- payout = betAmount × 2.5 × 0.99
```

---

## 🔍 VALIDATION CHECKLIST

Before coding:
- [ ] Understand current pump-based system
- [ ] Understand multiplier calculation formula
- [ ] Know max multipliers for each difficulty
- [ ] Understand conversion formula

After coding:
- [ ] Custom mode accepts multiplier input
- [ ] Multiplier converts to correct pump count
- [ ] All difficulties work correctly
- [ ] Max multiplier enforced per difficulty
- [ ] Random mode still works
- [ ] Specific mode still works
- [ ] UI shows "Target Multiplier" label
- [ ] Input accepts decimal values (0.1 step)
- [ ] Result displays correctly

---

## 📊 SUMMARY

**Files to Modify:** 3
1. `packages/game-engine/games/balloon/index.ts` (Backend logic)
2. `apps/frontend/src/components/games/balloon/BalloonGameControls.tsx` (UI controls)
3. `apps/frontend/src/app/game/balloon/page.tsx` (Page state)

**Lines to Change:** ~15-20 lines total

**Complexity:** LOW (simple parameter rename + conversion formula)

**Risk:** LOW (only affects Custom mode, other modes unchanged)

**Testing Required:** 
- 5 difficulties × 3 modes = 15 test cases
- Focus on Custom mode with various multipliers

---

**Ready to implement? Confirm and I'll proceed with code changes.**
