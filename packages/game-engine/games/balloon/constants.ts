export type PumpDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Pre-defined static multiplier steps for each Pump difficulty.
 * Values are derived from the reference UI:
 *   Easy:   ~2-6% growth per pump  (low risk, many pumps to high multiplier)
 *   Medium: ~15% growth per pump   (moderate risk)
 *   Hard:   ~28% growth per pump   (high risk, fast escalation)
 *   Expert: ~72% growth per pump   (extreme risk, very few safe pumps)
 *
 * House edge is baked into the multiplier values (~1%).
 */
export const PUMP_STEPS: Record<PumpDifficulty, number[]> = {
  // ~4-5% compound growth per pump (from screenshot: 1.00, 1.02, 1.07, 1.11, 1.17, 1.23, 1.29...)
  easy: [
    1.00, 1.02, 1.07, 1.11, 1.17, 1.23, 1.29, 1.36, 1.43, 1.50,
    1.58, 1.66, 1.74, 1.83, 1.92, 2.02, 2.12, 2.23, 2.34, 2.46,
    2.58, 2.71, 2.85, 2.99, 3.14, 3.30, 3.46, 3.64, 3.82, 4.01,
    4.21, 4.42, 4.64, 4.87, 5.12, 5.37, 5.64, 5.92, 6.22, 6.53,
    6.86, 7.20, 7.56, 7.94, 8.33, 8.75, 9.19, 9.65, 10.13, 10.64,
  ],

  // ~15% compound growth per pump (from screenshot: 1.00, 1.11, 1.27, 1.46, 1.69, 1.98, 2.33...)
  medium: [
    1.00, 1.11, 1.27, 1.46, 1.69, 1.98, 2.33, 2.72, 3.15, 3.64,
    4.22, 4.90, 5.69, 6.60, 7.65, 8.88, 10.30, 11.95, 13.86, 16.08,
    18.65, 21.63, 25.09, 29.11, 33.77, 39.17, 45.44, 52.71, 61.14, 70.92,
    82.27, 95.43, 110.70, 128.41, 148.96, 172.79, 200.44, 232.51, 269.71, 312.86,
  ],

  // ~28% compound growth per pump (from screenshot: 1.00, 1.23, 1.55, 1.98, 2.56, 3.36, 4.48...)
  hard: [
    1.00, 1.23, 1.55, 1.98, 2.56, 3.36, 4.48, 5.93, 7.79, 10.19,
    13.34, 17.48, 22.93, 30.08, 39.46, 51.77, 67.92, 89.10, 116.89, 153.29,
    201.09, 263.83, 346.12, 454.07, 595.74, 781.58, 1025.37, 1345.28, 1764.77, 2315.22,
  ],

  // ~72% compound growth per pump (from screenshot: 1.00, 1.63, 2.80, 4.95, 9.08, 17.34, 34.68...)
  expert: [
    1.00, 1.63, 2.80, 4.95, 9.08, 17.34, 34.68, 69.36, 138.72, 277.44,
    554.88, 1109.76, 2219.52, 4439.04, 8878.08, 17756.16, 35512.32, 71024.64, 142049.28, 284098.56,
  ],
};

/** Maximum number of pumps allowed per difficulty */
export const MAX_PUMPS: Record<PumpDifficulty, number> = {
  easy: PUMP_STEPS.easy.length - 1,     // 49
  medium: PUMP_STEPS.medium.length - 1,  // 39
  hard: PUMP_STEPS.hard.length - 1,      // 29
  expert: PUMP_STEPS.expert.length - 1,  // 19
};
