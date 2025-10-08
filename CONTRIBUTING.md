# Contributing to Trophy Cast MVP v2

Thank you for your interest in contributing to Trophy Cast! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Trophy-Cast-MVP-v2.git
   cd Trophy-Cast-MVP-v2
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables** (see SETUP.md)
5. **Start the development server**:
   ```bash
   npm start
   ```

## Development Workflow

### Creating a Branch

Always create a new branch for your work:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests

### Making Changes

1. **Make your changes** in the appropriate files
2. **Test your changes** thoroughly:
   - Test on iOS (if available)
   - Test on Android (if available)
   - Test on Web
   - Verify TypeScript compilation: `npx tsc --noEmit`
3. **Follow the code style** (see below)
4. **Update documentation** if needed

### Code Style

#### TypeScript/React Native
- Use TypeScript for all new files
- Use functional components with hooks
- Use interfaces for type definitions
- Use meaningful variable and function names
- Keep components small and focused
- Extract reusable logic into custom hooks

#### File Organization
```typescript
// 1. Imports (React first, then third-party, then local)
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { supabase } from '../services/supabase';

// 2. Type definitions
interface Props {
  title: string;
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ title }) => {
  // State
  const [data, setData] = useState(null);
  
  // Effects
  useEffect(() => {
    // ...
  }, []);
  
  // Handlers
  const handlePress = () => {
    // ...
  };
  
  // Render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};

// 4. Styles
const styles = StyleSheet.create({
  // ...
});
```

#### Naming Conventions
- Components: PascalCase (`MyComponent.tsx`)
- Files: PascalCase for components, camelCase for utilities
- Variables: camelCase (`myVariable`)
- Constants: UPPER_SNAKE_CASE (`MY_CONSTANT`)
- Interfaces: PascalCase with "I" prefix optional (`User` or `IUser`)
- Types: PascalCase (`UserType`)

#### Comments
- Use comments to explain "why", not "what"
- Document complex logic
- Add JSDoc comments for reusable functions
- Keep comments up-to-date with code changes

### Testing Your Changes

Before submitting:
```bash
# Check TypeScript
npx tsc --noEmit

# Test on different platforms
npm run ios      # macOS only
npm run android  # Requires Android setup
npm run web      # Most accessible for testing
```

## Submitting Changes

### Commit Messages

Write clear, descriptive commit messages:
```
Type: Brief description (50 chars or less)

More detailed explanation if needed. Wrap at 72 characters.
Explain what and why, not how.

- Bullet points are okay
- Use imperative mood: "Add feature" not "Added feature"
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: Add tournament photo gallery

fix: Resolve leaderboard sorting issue

docs: Update setup instructions for Windows
```

### Pull Requests

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub
   - Use a clear, descriptive title
   - Describe what your changes do
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Refactoring
   
   ## Testing
   - [ ] Tested on iOS
   - [ ] Tested on Android
   - [ ] Tested on Web
   - [ ] TypeScript compilation passes
   
   ## Screenshots (if applicable)
   [Add screenshots here]
   
   ## Related Issues
   Closes #123
   ```

4. **Wait for review**
   - Address feedback from maintainers
   - Make requested changes
   - Push updates to the same branch

## Code Review Process

1. Maintainers will review your PR
2. They may request changes or ask questions
3. Address feedback by pushing new commits
4. Once approved, a maintainer will merge your PR

## Areas for Contribution

### High Priority
- [ ] Add unit tests for components
- [ ] Add integration tests for data fetching
- [ ] Improve error handling
- [ ] Add offline support
- [ ] Performance optimizations

### Features
- [ ] Tournament photo uploads
- [ ] Push notifications
- [ ] Dark mode
- [ ] Export statistics to PDF
- [ ] Search and filter functionality
- [ ] Real-time updates during tournaments

### UI/UX
- [ ] Animations and transitions
- [ ] Accessibility improvements
- [ ] Loading skeleton screens
- [ ] Better empty states
- [ ] Improved error messages

### Documentation
- [ ] More examples in README
- [ ] Video tutorials
- [ ] API documentation
- [ ] Troubleshooting guide
- [ ] Deployment guide

## Development Best Practices

### Performance
- Use `React.memo()` for expensive components
- Implement pagination for large lists
- Optimize images before including
- Use `useMemo()` and `useCallback()` appropriately
- Profile performance with React DevTools

### Security
- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all user inputs
- Keep dependencies updated
- Follow Supabase security best practices

### Accessibility
- Use semantic elements
- Add proper labels and descriptions
- Test with screen readers
- Ensure sufficient color contrast
- Make touch targets large enough (44x44pt minimum)

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open an issue with reproduction steps
- **Chat**: Contact club administrators
- **Documentation**: Check README.md, SETUP.md, ARCHITECTURE.md

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inspiring community for all.

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing private information
- Any conduct that would be inappropriate in a professional setting

## Recognition

Contributors will be recognized in the following ways:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- GitHub contributor badge

## License

By contributing to Trophy Cast, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, please:
1. Check existing documentation
2. Search closed issues and PRs
3. Open a new issue with the "question" label

---

Thank you for contributing to Trophy Cast! 🎣

**Denver Bassmasters** - Where Every Cast Counts
