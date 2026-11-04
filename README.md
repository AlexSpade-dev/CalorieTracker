# CalorieTracker+ — Expo React Native conversion

This is a native React Native starter conversion of the supplied HTML project. It uses React Native primitives (View, Text, TextInput, Pressable, ScrollView) and no WebView.

## Install into an existing Expo project

1. Back up your existing `App.js`.
2. Copy this folder's `App.js` into the root of your Expo project, replacing its current `App.js`.
3. Copy `src/theme/theme.js` into your project's `src/theme/theme.js` (create the folders if needed).
4. Start Expo:

```bash
npx expo start
```

No additional package is required by this starter.

### If your project uses Expo Router
Expo Router projects typically use `app/` or `app/(tabs)/` rather than root `App.js`. For a simple migration, either create a standard Expo project with `npx create-expo-app MyApp --template blank` and use this App.js, or tell me your current `app/` folder structure and I can adapt this conversion to it. Do not delete your existing project configuration.

## Included in this first conversion
- Splash/welcome, login, two-step sign-up flow
- Native calorie dashboard with meal list and calorie progress
- Quick-add food modal and hydration controls
- Recipe browser with search, filters and add-to-log actions
- Analytics screen with period selection and macro progress
- Shared dark CalorieTracker+ theme

## Important notes
- The supplied HTML is a visual prototype. The conversion recreates its core screens and interactions as native components; it is not a pixel-perfect port of every HTML modal.
- Login and registration are front-end demo flows only. They do not authenticate users or save accounts to a server.
- Entries are held in React state and reset when the app reloads. Persistent storage, backend/API integration, real nutrition data, and production authentication should be added separately.
- Profile is a placeholder because the supplied repo does not include a profile page.
