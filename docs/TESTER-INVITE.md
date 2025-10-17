# Trophy Cast Beta – Tester Invite

Welcome aboard! Here’s everything you need to install the beta, sign in, and share useful feedback.

## Install the app

- If invited via Expo:
  - Install Expo Go from the iOS App Store or Google Play
  - Open the invite link sent by the team and launch the project in Expo Go
- If provided a standalone build (APK/IPA/TestFlight):
  - Follow the link provided in your invite email and install the app

## Sign in

- No account required for read-only browsing
- If you received test credentials, use these in the Sign In screen
  - Email: your@tester.email
  - Password: provided separately

## What to test (15–20 minutes)

- Home: loads without errors
- Tournaments List: events show from the current season (coming from `events_public`)
- Tournament Detail: standings and weights render
- AOY View: totals and ordering look correct (Best-4 per member)
- Profile: basic profile info loads

Edge cases
- Airplane mode (should show a helpful error)
- Slow network (spinners not stuck; retry works)
- Pull-to-refresh updates lists

## Reporting issues

When you find something, please send one message per issue with:
- What you did (tap path / steps)
- What you expected
- What you saw instead (include screenshot if possible)
- Approximate time and your device model/OS

Template:

```
Title: [Area] short description
Device: iPhone 14 Pro, iOS 18.1 (or Android model/version)
Time: 2025-10-16 19:22 MT
Steps:
1) Open app, go to Tournaments
2) Tap event “Fall Classic”
3) Open AOY tab
Expected: AOY ranks highest to lowest, totals match leaderboard
Actual: Rank #3 shows 295 but should be 302 (screenshot attached)
Notes: Happened on LTE only; fine on Wi‑Fi later
```

## Contact

- Slack: #trophy-cast-beta
- Email: product@trophycast.app

Thank you for helping keep the rankings clean and the experience smooth. Where Every Cast Counts 🎣
