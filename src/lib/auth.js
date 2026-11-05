import { supabase } from './supabase';

const num = (v) => (v === '' || v == null || Number.isNaN(+v) ? undefined : +v);

// Make sure a row exists in public.profiles for this signed-in user (works for email AND Google/Apple).
// First-time details come from the sign-up form, which we stored in the account's metadata.
export async function ensureProfile(authUser) {
  const { data: existing, error: e1 } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
  if (e1) throw e1;
  if (existing) return existing;
  const m = authUser.user_metadata || {};
  const row = {
    id: authUser.id,
    full_name: m.full_name || m.name || authUser.email.split('@')[0],
    avatar_url: m.avatar_url || m.picture || null,
    daily_goal_kcal: num(m.daily_goal_kcal),
    sex: m.sex, age: num(m.age), height_cm: num(m.height_cm), weight_kg: num(m.weight_kg), target_kg: num(m.target_kg),
    activity_level: m.activity_level,
    macro_carbs_pct: num(m.macro_carbs_pct), macro_protein_pct: num(m.macro_protein_pct), macro_fats_pct: num(m.macro_fats_pct),
  };
  Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]); // let the table defaults fill the gaps
  const { data, error } = await supabase.from('profiles').insert(row).select().single();
  if (error) throw error;
  return data;
}

// shape the app already uses (user.name, user.goal, user.profile.macros ...)
export const toUser = (authUser, p) => ({
  id: authUser.id,
  email: authUser.email,
  name: String(p?.full_name || authUser.email.split('@')[0]).trim().split(' ')[0],
  goal: p?.daily_goal_kcal || 2200,
  avatar: p?.avatar_url || null,
  profile: p ? {
    sex: p.sex, age: p.age, height: p.height_cm, weight: p.weight_kg, target: p.target_kg, level: p.activity_level,
    macros: { c: p.macro_carbs_pct, p: p.macro_protein_pct, f: p.macro_fats_pct },
  } : undefined,
});

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// d1 = sign-up step 1 (name, email, password, goal), d2 = step 2 (body details, may be {})
export async function signUpWithEmail(d1, d2 = {}) {
  const { data, error } = await supabase.auth.signUp({
    email: d1.email.trim(),
    password: d1.password,
    options: {
      data: {
        full_name: (d1.name || '').trim(),
        daily_goal_kcal: d1.goal,
        sex: d2.sex, age: d2.age, height_cm: d2.height, weight_kg: d2.weight, target_kg: d2.target,
        activity_level: d2.level,
        macro_carbs_pct: d2.macros?.c, macro_protein_pct: d2.macros?.p, macro_fats_pct: d2.macros?.f,
      },
    },
  });
  if (error) throw error;
  // no session = the project requires email confirmation first
  return { user: data.user, needsConfirm: !data.session };
}

export const sendReset = (email) => supabase.auth.resetPasswordForEmail(email.trim());
export const signOut = () => supabase.auth.signOut();