# 🚀 Fast-Debug Playbook

**Goal:** Solve bugs in 5-10 minutes instead of hours by isolating issues before fixing them.

---

## 🎯 The 3-Role System

### **You (Evidence Gatherer)**
Provide exact symptoms:
```
1. Console output (copy/paste actual errors/logs)
2. Screen state (what you see vs. what you expect)
3. Last known good state (git commit, feature, or action)
4. Steps to reproduce
```

### **Perplexity AI (Diagnostic Strategist)**
Analyzes and creates targeted prompts:
```
1. Rank likely causes by probability
2. Design one-line isolation tests
3. Create surgical Copilot prompts
4. Confirm root cause before fixing
```

### **GitHub Copilot (Code Executor)**
Applies changes:
```
1. Run isolation tests (comment out, replace, add logs)
2. Apply minimal diagnostic code
3. Once confirmed, apply proper fix
4. No guessing - wait for confirmation
```

---

## ⚡ Fast-Debug Protocol

### Step 1: Evidence (2 minutes)
**You paste:**
```
Bug: HomeScreen blank after data loads
Console: "Raw dashboard data: {lastTournament: {...}}"
Screen: Blank white screen (no error, no content)
Expected: Dashboard cards with tournament data
Last working: Before adding AnimatedCard components
```

### Step 2: Hypothesis (1 minute)
**Perplexity ranks suspects:**
```
Most likely causes (test in order):
1. Animation component stuck (opacity 0, transform hidden)
2. CSS hiding content (display: none, position: absolute off-screen)
3. Conditional rendering wrong branch
4. Component memoization blocking updates
5. Re-render not triggering (least likely if console shows data)
```

### Step 3: Isolate (30 seconds - 2 minutes)
**Test ONE thing:**
```
Replace: <AnimatedCard> → <View>
Why: Eliminates animation as variable
Expected: If this fixes it, AnimatedCard is the problem
```

### Step 4: Confirm (30 seconds)
**You test and report:**
```
✅ "It works!" → AnimatedCard confirmed
❌ "Still broken" → Try next suspect
```

### Step 5: Fix Properly (5 minutes)
**Now fix the root cause:**
```typescript
// Bad: Work around the issue
<View> instead of <AnimatedCard>

// Good: Fix AnimatedCard properly
useEffect(() => {
	animValue.setValue(0); // Reset on mount
	const timer = setTimeout(() => {
		slideUp(animValue, 400);
	}, delay);
	return () => clearTimeout(timer);
}, [delay, animation, children]); // Add children to deps
```

---

## 🔍 Common Bug Patterns

### Pattern: "Data Loads But UI Blank"
**Symptoms:** Console shows data ✅, screen blank ❌

**Test in order:**
1. Remove animation components → `<AnimatedCard>` to `<View>`
2. Check CSS → Add `console.log('Rendering:', elementName)`
3. Check conditionals → Log before each `return` statement
4. Check keys/memoization → Add/change `key` prop

**Most likely:** Animation stuck at opacity 0 or transform hidden

---

### Pattern: "Component Won't Update"
**Symptoms:** Props change ✅, UI doesn't update ❌

**Test in order:**
1. Check `React.memo()` → Remove temporarily
2. Check `useEffect` deps → Add missing dependencies
3. Check object references → Log `prevProps vs nextProps`
4. Force remount → Add/change `key` prop

**Most likely:** Missing dependency in useEffect or memo blocking update

---

### Pattern: "Infinite Re-renders"
**Symptoms:** Console spams logs, browser freezes ❌

**Test in order:**
1. Check `useEffect` with no deps → Add `[]` or proper deps
2. Check state updates in render → Move to useEffect/callback
3. Check object creation in render → Move to useMemo
4. Check parent re-renders → Add React.memo to child

**Most likely:** State update triggering re-render triggering state update

---

### Pattern: "Error After Deploy/Refresh"
**Symptoms:** Works locally ✅, breaks in production ❌

**Test in order:**
1. Clear Metro cache → `npm start -- --reset-cache`
2. Check environment vars → Log them in console
3. Check build output → Inspect bundle for minification issues
4. Check browser cache → Hard refresh (Ctrl+Shift+R)

**Most likely:** Stale cache or environment variable mismatch

---

## 📋 Today's Case Study: AnimatedCard Bug

### What We Did (Slow - 45 minutes):
1. ❌ Added renderKey to force re-renders
2. ❌ Added useEffect diagnostics
3. ❌ Checked React Query state
4. ❌ Added more console logs
5. ✅ Finally tested removing AnimatedCard

### What We Should Have Done (Fast - 5 minutes):
1. ✅ Saw "data loads but blank screen"
2. ✅ Immediately suspected animation (opacity/transform)
3. ✅ Replaced `<AnimatedCard>` with `<View>` (30 seconds)
4. ✅ Confirmed fix → Fixed AnimatedCard properly

### The Lesson:
**Isolate first, fix later.** Don't add complex solutions until you know the exact cause.

---

## 🛠️ Quick Reference: Isolation Techniques

### Remove Suspected Component
```tsx
// Before
<AnimatedCard><Content /></AnimatedCard>

// Test
<View><Content /></View>
```

### Add Strategic Logs
```typescript
console.log('🔍 Before render:', { data, isLoading });
if (condition1) {
	console.log('✅ Rendering branch A');
	return <ComponentA />;
}
console.log('✅ Rendering branch B');
return <ComponentB />;
```

### Force Remount
```tsx
// Add/change key to force React to remount
<Component key={Date.now()} />
<Component key={data?.id || 'default'} />
```

### Check Visibility
```tsx
// Add temporary visibility override
<View style={[styles.card, { opacity: 1, backgroundColor: 'red' }]}>
```

### Simplify Props
```tsx
// Remove all optional props to eliminate variables
<Component 
	// animation="fade"
	// delay={100}
	// onPress={handler}
>
```

---

## 💡 Pro Tips

1. **One variable at a time** - Change one thing, test, confirm
2. **Console.log is your friend** - Strategic logs beat complex debugging
3. **Comment out, don't delete** - Easy to revert if wrong
4. **Test in isolation** - Reduce complexity before fixing
5. **Fix root cause** - Don't work around the issue

---

## 🎬 Template: Bug Report

Copy/paste this when reporting bugs:

```
### Bug Description
[What's broken]

### Console Output
[Paste exact console logs/errors]

### Screen State
What I see: [describe or screenshot]
What I expect: [describe expected behavior]

### Steps to Reproduce
1. [Action 1]
2. [Action 2]
3. [Bug appears]

### Last Known Good
[Git commit, feature state, or working version]

### Attempted Fixes
[What you've tried, if anything]
```

---

## 📚 Resources

- [React DevTools](https://react.dev/learn/react-developer-tools) - Inspect component state
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Network, console, performance
- [Metro Bundler](https://facebook.github.io/metro/) - React Native bundler debugging

---

**Last Updated:** 2025-10-10  
**Lessons From:** HomeScreen blank screen bug (AnimatedCard issue)

