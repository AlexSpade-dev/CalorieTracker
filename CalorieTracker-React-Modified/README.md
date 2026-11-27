## Features

Implemented in the current app:

- **Accounts** – email + password sign-up (2 steps: account details, then body details and macro split), login, and Google/Apple sign-in through Supabase Auth. The session is kept after the app is closed.
- **Log (dashboard)** – daily calorie ring (kcal left of your goal), consumed vs. base burn, carbs / protein / fats progress, hydration tracker (+250 ml), and today's meals.
- **Quick Add** – log a meal manually with calories and macros.
- **Recipes** – browse recipes and add one to today's log; shows how many kcal and how much protein you have left.
- **Analytics** – daily totals, macro split, water, and weigh-in progress toward your target weight.
- **Calorie Overdraft dialog** – when a meal would put you over your goal, choose to borrow from tomorrow, apply a rest-day burn credit, log the surplus, or adjust the portion to 75%.
- **Daily Goal Hit dialog** – a check-in celebration when you land within your target.
- **Streaks and notifications** – a streak counts consecutive days with at least one logged meal; the bell shows streak, hydration and over-target reminders, with a chime for new ones.
- **Profile** – profile photo, daily goal, sign out.

Planned (not built yet):

- Barcode scanning and food-photo (image recognition) logging
- Ingredient-based calorie estimation for cooked meals
- Workout and sleep tracking
- Weekly reports

## Tech Stack

| Layer | Tools |
| --- | --- |
| App | React Native with Expo (SDK 58), Expo Router |
| Backend / database | Supabase (PostgreSQL, Auth, Row Level Security) |
| Graphics | react-native-svg, expo-linear-gradient |
| Other | expo-audio, expo-image-picker, expo-web-browser (OAuth), Plus Jakarta Sans font |

## Design

The look is the **Oceanic Abyssal Tracker** design system (deep navy surfaces, ocean-blue accents, Plus Jakarta Sans). The full spec is in [`DESIGN.md`](DESIGN.md). The original HTML screen designs are kept in the `DASHBOARD/`, `LOG_IN/`, `SIGN_UP/` folders and `SPLASH_PAGE.html`.

## Project Structure

```
src/
  app/          Expo Router entry (_layout.tsx, index.tsx)
  screens/      Splash, Login, SignUp, Dashboard, Recipes, Analytics, Dialogs
  components/   Shared UI kit (cards, buttons, bottom nav, header)
  lib/          supabase.js, auth.js, socialAuth.js, sounds.js
  theme/        Colors and typography
assets/         Images, fonts, notification sound
App.js          App flow (screens, tabs, meal logging logic)
schema.sql      Database schema for Supabase
```

## Getting Started

### 1. Requirements

- Node.js (LTS) and npm
- An Android phone (or emulator) and a free [Expo](https://expo.dev) account
- A [Supabase](https://supabase.com) project

### 2. Install

```bash
git clone <repo-url>
cd CalorieTracker
npm install
```

### 3. Set up Supabase

1. In Supabase, open **SQL Editor → New query**, paste the contents of `schema.sql`, and run it.
2. Under **Auth → URL Configuration → Redirect URLs**, add `calorietrackapp://auth/callback`.
3. Under **Auth → Providers**, enable Google (and Apple if needed).
4. Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

Use the project's publishable (anon) key only. Never put a `service_role` key in the app.

### 4. Run the app (development)

The app uses native modules, so it needs a development build rather than Expo Go.

```bash
npx expo install --check                                   # keep packages on SDK-compatible versions
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android
```

Install the APK from the build page on your phone, then start the dev server:

```bash
npx expo start --dev-client          # phone and computer on the same Wi-Fi
npx expo start --dev-client --tunnel # different networks
```

### 5. Build a standalone app (for demos)

A preview build runs on its own, with no laptop or dev server needed:

```bash
npx eas-cli@latest build --profile preview --platform android
```

Open the build link on the phone, install the APK, and sign in. The phone needs internet access to reach Supabase.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Red screen at `_layout.tsx` | Run `npx expo-doctor`, install anything it lists, then rebuild the development build |
| `Missing peer dependency: expo-asset` | `npx expo install expo-asset`, then rebuild |
| `supabaseUrl is required` | `.env` is missing or its values were not included in the build |
| Google sign-in does nothing or errors | Check that `calorietrackapp://auth/callback` is in the Supabase redirect URLs |
| Phone cannot reach the dev server | Use `--tunnel`, or put the phone and computer on the same hotspot |

## Team

- Add member names and roles here

## License

See [`LICENSE`](LICENSE).