# Trophy Cast - Setup Instructions

## Environment Setup

After cloning the repository, you need to configure your environment variables:

1. **Copy the environment template:**
```bash
cp .env.example .env.local
```

2. **Edit `.env.local` with your credentials:**
```bash
# Required - Get these from your Supabase project
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional - For error tracking (production)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Development
NODE_ENV=development
```

## Getting Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Navigate to your project (or create a new one)
3. Go to **Settings → API**
4. Copy the **Project URL** and **anon/public key**

## Development Workflow

### Start Development Server
```bash
npm start
# Choose platform: web (w), iOS (i), Android (a)
```

### Code Quality Checks
```bash
npm run type-check    # TypeScript validation
npm run lint          # Code style and best practices
npm run lint:fix      # Auto-fix linting issues
```

### Testing
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

### Coverage Requirements
- **Statements**: 40% minimum
- **Branches**: 35% minimum  
- **Functions**: 40% minimum
- **Lines**: 40% minimum

## CI/CD Pipeline

The project includes automated GitHub Actions that run on every push/PR:

1. **Type checking** - Ensures TypeScript compilation
2. **Linting** - Code style and best practice validation
3. **Testing** - Unit tests with coverage reporting
4. **Security audit** - Dependency vulnerability scanning
5. **Secret detection** - Prevents hardcoded credentials

## Project Structure

```
trophy-cast/
├── .env.local          # Your local environment (create this)
├── .env.example        # Environment template
├── .github/workflows/  # CI/CD pipelines
├── hooks/              # React Query custom hooks
├── components/         # Reusable UI components
├── lib/               # Core utilities (auth, supabase, sentry)
├── screens/           # Main app screens
└── __tests__/         # Test files
```

## Available React Query Hooks

### Data Fetching
```typescript
import { useAOYStandings, useTournamentEvents } from './hooks/useQueries';

// AOY Rankings with automatic caching
const { data: standings, isLoading, error, refetch } = useAOYStandings();

// Tournament Events with background refresh
const { data: events } = useTournamentEvents();

// Member-specific AOY data
const { data: memberAOY } = useAOYStandingsByMember(memberId);
```

### Caching Behavior
- **AOY Standings**: 5-minute cache, background refresh on focus
- **Tournament Events**: 10-minute cache, automatic retry on failure
- **Member Data**: 5-minute cache, only fetches when member ID provided

## Troubleshooting

### Common Issues

**Environment Variables Not Loading**
- Ensure `.env.local` exists and has correct format
- Restart development server after adding env vars
- Check that variables start with `EXPO_PUBLIC_` for client-side access

**TypeScript Errors**
- Run `npm run type-check` to see all errors
- Common fix: Ensure all imports have proper types

**Test Failures**
- Check test output for specific failures
- Run `npm run test:watch` for interactive debugging
- Ensure mocks are properly configured

**CI/CD Pipeline Failing**
- Check GitHub Actions tab for detailed logs
- Ensure code passes linting and type checking locally first

## Next Development Priorities

Based on the current codebase state:

1. **Screen-level testing** - Add integration tests for major user flows
2. **Performance monitoring** - Add Flipper integration for profiling
3. **Accessibility audit** - WCAG compliance for form elements and navigation
4. **Optimistic mutations** - Real-time UI updates for tournament submissions

For questions or issues, check the main README.md or create a GitHub issue.