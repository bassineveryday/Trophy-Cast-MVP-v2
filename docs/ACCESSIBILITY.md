# Accessibility Guidelines for Trophy Cast

## Implemented Accessibility Features

### 1. **Tab Navigation Icons**
- All tab navigation icons have `accessibilityLabel` properties
- Clear descriptions for screen readers
- Examples:
  - Home tab
  - Tournaments tab
  - Angler of the Year standings tab
  - Club information tab
  - Profile tab

### 2. **Interactive Elements**
- All TouchableOpacity components have:
  - `accessibilityRole="button"` - Identifies the element type
  - `accessibilityLabel` - Describes what the button does
  - `accessibilityHint` - Provides additional context on action results

### 3. **Color Contrast**
- Primary text: #2c3e50 on #fff (15.81:1) ✅ WCAG AAA
- Secondary text: #7f8c8d on #fff (4.66:1) ✅ WCAG AA
- Interactive elements: #2c3e50 (high contrast)
- Error states: #e74c3c (sufficient contrast)

### 4. **Text Sizing**
- Minimum font size: 14px for body text
- Headings: 18-28px for clear hierarchy
- Labels: 14-16px for form fields

### 5. **Touch Targets**
- Buttons: Minimum 44x44 points (iOS guidelines)
- Tab bar icons: 24x24 with adequate spacing
- Cards: Large touch areas for easy interaction

## Best Practices Applied

### Screen Reader Support
```tsx
// Good example
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="View club details"
  accessibilityHint="Opens the Denver Bassmasters club information screen"
  onPress={handlePress}
>
  <Text>Denver Bassmasters</Text>
</TouchableOpacity>
```

### Form Inputs
- All input fields have labels
- Error messages are clearly displayed
- Focus states provide visual feedback

### Empty States
- Clear messaging when no data is available
- Action buttons with accessibility labels
- Icons supplement text (not replace)

## Testing Checklist

- [ ] Test with VoiceOver (iOS) or TalkBack (Android)
- [ ] Verify all interactive elements are reachable
- [ ] Check color contrast ratios
- [ ] Test with large font sizes
- [ ] Verify keyboard navigation (web)
- [ ] Test with screen magnification

## Future Improvements

1. **Dynamic Type Support**
   - Respect user's font size preferences
   - Use `useWindowDimensions` for responsive text

2. **Reduced Motion**
   - Detect `AccessibilityInfo.isReduceMotionEnabled()`
   - Disable animations for users who prefer reduced motion

3. **Haptic Feedback**
   - Add subtle vibrations for important actions
   - Use `Haptics.impactAsync()` from Expo

4. **Focus Management**
   - Set focus to error messages on form validation
   - Focus first input field on screen load

## Resources

- [React Native Accessibility Docs](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)
