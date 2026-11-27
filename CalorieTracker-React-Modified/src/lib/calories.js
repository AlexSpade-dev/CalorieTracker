// Daily calorie goal from the sign-up body details (Mifflin-St Jeor + activity multiplier).
// Used by SignUp step 2 (live preview) and App.js (saved to the profile).
const MULT = { light: 1.2, moderate: 1.55, very: 1.75 };

export function calcGoal({ sex, age, height, weight, target, level } = {}) {
  const a = +age, h = +height, w = +weight, t = +target;
  if (!(a > 0 && h > 0 && w > 0)) return null;
  const bmr = 10 * w + 6.25 * h - 5 * a + (sex === 'Female' ? -161 : 5);
  const tdee = bmr * (MULT[level] || 1.55);
  const diff = t > 0 ? t - w : 0; // negative = wants to lose weight
  const adj = diff < -0.5 ? -500 : diff > 0.5 ? 300 : 0; // deficit / surplus / maintain
  const goal = Math.min(6000, Math.max(1200, Math.round((tdee + adj) / 10) * 10));
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), goal };
}