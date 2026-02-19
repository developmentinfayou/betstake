
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** betstake
- **Date:** 2026-02-19
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC01 Manual DICE bet in demo mode
- **Test Code:** [TC01_Manual_DICE_bet_in_demo_mode.py](./TC01_Manual_DICE_bet_in_demo_mode.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/4c12f4e7-8755-4f00-92a5-37ec9e697f6a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC02 Manual bet across multiple game types
- **Test Code:** [TC02_Manual_bet_across_multiple_game_types.py](./TC02_Manual_bet_across_multiple_game_types.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/a204c5bf-ce26-4a22-9df6-e8f4509ba486
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC03 Manual bet edge cases and validation
- **Test Code:** [TC03_Manual_bet_edge_cases_and_validation.py](./TC03_Manual_bet_edge_cases_and_validation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/985eaded-6c08-4c22-903b-e4960b3307f6
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC04 Basic autobet start status stop lifecycle
- **Test Code:** [TC04_Basic_autobet_start_status_stop_lifecycle.py](./TC04_Basic_autobet_start_status_stop_lifecycle.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/f70c96b6-7a7a-4526-b0ed-c60327e97072
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC05 AutoBet infinite mode and stop
- **Test Code:** [TC05_AutoBet_infinite_mode_and_stop.py](./TC05_AutoBet_infinite_mode_and_stop.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/4f0cafcb-f3cf-462c-afa7-e2104227ac20
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC06 AutoBet advanced onWin reset onLoss increase
- **Test Code:** [TC06_AutoBet_advanced_onWin_reset_onLoss_increase.py](./TC06_AutoBet_advanced_onWin_reset_onLoss_increase.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/d91c48b0-fab4-4aa9-b4f8-87646ef47e57
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC07 AutoBet stopOnProfit condition
- **Test Code:** [TC07_AutoBet_stopOnProfit_condition.py](./TC07_AutoBet_stopOnProfit_condition.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/2de4764d-26f5-43e2-b5dd-09345a06ef82
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC08 AutoBet stopOnLoss condition
- **Test Code:** [TC08_AutoBet_stopOnLoss_condition.py](./TC08_AutoBet_stopOnLoss_condition.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 120, in <module>
  File "<string>", line 72, in test_TC08_autobet_stopOnLoss_condition
AssertionError: Autobet should be inactive but is active: {'active': True, 'currentBet': 22, 'totalBets': 0}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/0f16cee7-b497-4a47-942a-2ac569d951d7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC09 AutoBet session game rejection
- **Test Code:** [TC09_AutoBet_session_game_rejection.py](./TC09_AutoBet_session_game_rejection.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/f8b88ae1-8c44-4e74-83f1-d4c7f9d44b92
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC10 Strategy mode Martingale preset autobet
- **Test Code:** [TC10_Strategy_mode_Martingale_preset_autobet.py](./TC10_Strategy_mode_Martingale_preset_autobet.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/af2afeaa-90e9-4b25-bcd4-fb3367578b01
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC11 Custom strategy with profit trigger and stop action
- **Test Code:** [TC11_Custom_strategy_with_profit_trigger_and_stop_action.py](./TC11_Custom_strategy_with_profit_trigger_and_stop_action.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/e59e30f6-08c8-470e-adde-beae17d68eb5
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC12 D'Alembert strategy preset autobet
- **Test Code:** [TC12_DAlembert_strategy_preset_autobet.py](./TC12_DAlembert_strategy_preset_autobet.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/25d5fc01-667a-4e54-a42d-38b40f8f4d61
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC13 Delayed Martingale strategy first_streak_of trigger
- **Test Code:** [TC13_Delayed_Martingale_strategy_first_streak_of_trigger.py](./TC13_Delayed_Martingale_strategy_first_streak_of_trigger.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 118, in <module>
  File "<string>", line 92, in test_TC13_delayed_martingale_strategy_first_streak_of_trigger
AssertionError: Bet 6996da8db514a19d0f35e277 amount changed before loss streak 1: 20

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/b52a0576-7c11-40e4-b1b7-18079fa31e47
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC14 Double start race condition autobet restart
- **Test Code:** [TC14_Double_start_race_condition_autobet_restart.py](./TC14_Double_start_race_condition_autobet_restart.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/3714ad87-9be4-45f8-b64d-9dc23750f98b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC15 Rapid stop start cycling no orphaned sessions
- **Test Code:** [TC15_Rapid_stop_start_cycling_no_orphaned_sessions.py](./TC15_Rapid_stop_start_cycling_no_orphaned_sessions.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/72a088fa-fe5a-41d5-893b-69fb13800202/ec9917a6-e23a-4a8c-a609-7f51ff0f65a7
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **86.67** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---