# Quick Start Reference

## Installation (One-Time Setup)

```bash
# Clone the repository
git clone https://github.com/bassineveryday/Trophy-Cast-MVP-v2.git
cd Trophy-Cast-MVP-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Set up Supabase database
# Go to Supabase SQL Editor and run supabase-setup.sql
```

## Daily Development Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run ios       # iOS simulator (macOS only)
npm run android   # Android emulator
npm run web       # Web browser

# Type check
npx tsc --noEmit

# Clear cache and restart
expo start -c
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── navigation/     # App navigation setup
├── screens/        # App screens (pages)
├── services/       # External services (Supabase, Auth)
├── types/          # TypeScript type definitions
└── utils/          # Helper functions
```

## Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main app entry point |
| `.env` | Environment variables (DO NOT COMMIT) |
| `app.json` | Expo configuration |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |

## Common Tasks

### Adding a New Screen
1. Create file in `src/screens/YourScreen.tsx`
2. Add to navigation in `src/navigation/AppNavigator.tsx`
3. Export types if needed in `src/types/index.ts`

### Adding a Component
1. Create file in `src/components/YourComponent.tsx`
2. Export the component
3. Import and use in screens

### Fetching Data
```typescript
import { supabase } from '../services/supabase';

const fetchData = async () => {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');
  
  if (error) console.error(error);
  return data;
};
```

### Using Auth
```typescript
import { useAuth } from '../services/auth';

const { user, signIn, signOut } = useAuth();
```

## Environment Variables

Required in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Module not found" | Run `npm install` |
| "Invalid API credentials" | Check `.env` file |
| TypeScript errors | Run `npx tsc --noEmit` |
| Cache issues | Run `expo start -c` |
| Port already in use | Kill process or use different port |

## Useful Links

- [Full Documentation](README.md)
- [Setup Guide](SETUP.md)
- [Architecture](ARCHITECTURE.md)
- [Features](FEATURES.md)
- [Contributing](CONTRIBUTING.md)

## Support

- 📚 [Expo Docs](https://docs.expo.dev)
- 🗄️ [Supabase Docs](https://supabase.com/docs)
- ⚛️ [React Native Docs](https://reactnative.dev)

---

**Denver Bassmasters** 🎣
