/**
 * Brand Configuration - Trophy Cast
 * 
 * Single source of truth for all branding values.
 * Update colors, fonts, and spacing here to change the entire app instantly!
 * 
 * Usage:
 * - These values are imported into ThemeContext.tsx
 * - Changing any value here updates all screens automatically
 * - No need to touch individual screen files
 */

// ============================================
// BRAND COLORS
// ============================================

/**
 * Primary brand colors
 * Used for main actions, highlights, and brand identity
 */
export const BRAND_COLORS = {
  // Primary brand color (Trophy Gold)
  primary: '#D4AF37',

  // Accent/highlight color (Bass Green)
  accent: '#2E6E3D',

  // Success states (Bass Green)
  success: '#2E6E3D',

  // Warning states (Bright Orange)
  warning: '#FFA500',

  // Error states (Strong Red)
  error: '#D22B2B',

  // Info states (Complementary blue)
  info: '#3A7CA5',

  // Text color to use on top of primary gold backgrounds
  onPrimary: '#0C1A23',
} as const;

/**
 * Light theme colors
 */
export const LIGHT_THEME_COLORS = {
  background: '#F5F1E6',        // Off-White/Sand background
  surface: '#FFFFFF',           // Clean white for cards
  surfaceVariant: '#EEF2F4',    // Alternate light surface
  border: '#DDE2E5',            // Light grey border
  divider: 'rgba(12, 26, 35, 0.15)', // Subtle deep-navy divider with 15% opacity
  text: '#0C1A23',              // Deep Navy text for high contrast
  textSecondary: '#546674',     // Muted Deep Navy/grey
  shadow: '#000000',            // Shadow color
} as const;

/**
 * Dark theme colors
 */
export const DARK_THEME_COLORS = {
  background: '#0C1A23',        // Deep Navy background
  surface: '#132532',           // Slightly lighter navy for surfaces
  surfaceVariant: '#1A2C3A',    // Alternate navy for depth
  border: '#3A4C5A',            // Subtle border color
  divider: 'rgba(212, 175, 55, 0.15)', // Fine gold divider/glow at 15% opacity
  text: '#F5F1E6',              // Off-White/Sand text
  textSecondary: '#C9D3DA',     // Muted Off-White/Sand
  shadow: '#000000',            // Shadow color
} as const;

/**
 * Gradient definitions
 * Used for hero sections, special cards, etc.
 */
export const BRAND_GRADIENTS = {
  // Main hero gradient (Greener palette; light-to-mid green for dark text contrast)
  hero: ['#D9F2E1', '#9FD3A6'],

  // Card gradient (subtle navy depth)
  card: ['#132532', '#1A2C3A'],

  // Accent gradient (Bass Green range)
  accent: ['#2E6E3D', '#3D8E4F'],

  // Success gradient (Bass Green)
  success: ['#2E6E3D', '#3D8E4F'],

  // Premium/gold gradient (for special features)
  premium: ['#D4AF37', '#B8911F'],
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

/**
 * Font family configuration
 * Using Inter font family for clean, modern look
 */
export const BRAND_FONTS = {
  // Brand fonts
  regular: 'Raleway_400Regular',
  medium: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
} as const;

/**
 * Font sizes (in pixels)
 * Used for consistent typography hierarchy
 */
export const FONT_SIZES = {
  h1: 28,          // Page titles, hero text
  h2: 24,          // Section headers
  h3: 20,          // Subsection headers
  body: 16,        // Body text, primary content
  label: 14,       // Labels, small headers
  caption: 11,     // Captions, helper text
} as const;

/**
 * Font weights
 * Numeric values for font-weight property
 */
export const FONT_WEIGHTS = {
  regular: '400',
  medium: '600',
  bold: '700',
} as const;

// ============================================
// LAYOUT & SPACING
// ============================================

/**
 * Spacing scale (in pixels)
 * Used for consistent padding, margins, and gaps
 */
export const SPACING = {
  xs: 4,           // Extra small spacing
  sm: 8,           // Small spacing
  md: 16,          // Standard padding for most components
  lg: 24,          // Larger screen margins
  xl: 32,          // Extra large spacing
  xxl: 40,         // 2x extra large spacing
} as const;

/**
 * Border radius values (in pixels)
 * Used for consistent rounded corners
 */
export const BORDER_RADIUS = {
  sm: 4,           // Small radius (buttons, chips)
  md: 8,           // Medium radius (cards)
  lg: 16,          // Large radius (modals)
  xl: 24,          // Extra large radius (hero cards)
  full: 9999,      // Fully rounded (pills, avatars)
} as const;

/**
 * Elevation/shadow depth (in pixels)
 * Used for consistent shadow effects
 */
export const ELEVATION = {
  sm: 2,           // Subtle elevation
  md: 4,           // Medium elevation
  lg: 10,          // High elevation (modals, overlays)
} as const;

// ============================================
// EFFECTS (Glow/Focus)
// ============================================

/**
 * Minimal gold glow effect tokens, used to replace heavy shadows.
 * Apply via shadow props on iOS and elevation fallback on Android.
 */
export const GLOW_EFFECTS = {
  subtle: {
    shadowColor: BRAND_COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  focus: {
    shadowColor: BRAND_COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;

// ============================================
// ANIMATION & TIMING
// ============================================

/**
 * Animation durations (in milliseconds)
 * Used for consistent animation timing
 */
export const ANIMATION_DURATION = {
  fast: 150,       // Quick transitions
  normal: 250,     // Standard transitions
  slow: 400,       // Slower, more dramatic transitions
} as const;

/**
 * Animation easing functions
 */
export const ANIMATION_EASING = {
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'spring',
} as const;

// ============================================
// COMPONENT DEFAULTS
// ============================================

/**
 * Button defaults
 */
export const BUTTON_DEFAULTS = {
  height: 48,
  borderRadius: BORDER_RADIUS.md,
  paddingHorizontal: SPACING.xl,
  fontSize: FONT_SIZES.body,
  fontFamily: BRAND_FONTS.bold,
} as const;

/**
 * Button component tokens
 * - outline (default): transparent bg, gold border/text
 * - filled (primary CTA only): gold bg, onPrimary text
 */
export const BUTTON_PRIMARY = {
  outline: {
    height: BUTTON_DEFAULTS.height,
    borderRadius: BUTTON_DEFAULTS.borderRadius,
    paddingHorizontal: BUTTON_DEFAULTS.paddingHorizontal,
    borderWidth: 1,
    borderColor: BRAND_COLORS.primary,
    backgroundColor: 'transparent',
    textColor: BRAND_COLORS.primary,
    fontFamily: BUTTON_DEFAULTS.fontFamily,
    fontSize: BUTTON_DEFAULTS.fontSize,
  },
  filled: {
    height: BUTTON_DEFAULTS.height,
    borderRadius: BUTTON_DEFAULTS.borderRadius,
    paddingHorizontal: BUTTON_DEFAULTS.paddingHorizontal,
    borderWidth: 1,
    borderColor: BRAND_COLORS.primary,
    backgroundColor: BRAND_COLORS.primary,
    textColor: BRAND_COLORS.onPrimary,
    fontFamily: BUTTON_DEFAULTS.fontFamily,
    fontSize: BUTTON_DEFAULTS.fontSize,
  },
} as const;

/**
 * Card defaults
 */
export const CARD_DEFAULTS = {
  borderRadius: BORDER_RADIUS.lg,
  padding: SPACING.lg,
  elevation: ELEVATION.sm,
} as const;

/**
 * Input defaults
 */
export const INPUT_DEFAULTS = {
  height: 48,
  borderRadius: BORDER_RADIUS.md,
  paddingHorizontal: SPACING.md,
  fontSize: FONT_SIZES.body,
  borderWidth: 1,
} as const;

/**
 * Chip component tokens (primary)
 * Outline by default; filled reserved for strong emphasis.
 */
export const CHIP_PRIMARY = {
  outline: {
    height: 34,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: BRAND_COLORS.primary,
    backgroundColor: 'transparent',
    textColor: BRAND_COLORS.primary,
    fontFamily: BRAND_FONTS.medium,
    fontSize: FONT_SIZES.label,
  },
  filled: {
    height: 34,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: BRAND_COLORS.primary,
    backgroundColor: BRAND_COLORS.primary,
    textColor: BRAND_COLORS.onPrimary,
    fontFamily: BRAND_FONTS.medium,
    fontSize: FONT_SIZES.label,
  },
} as const;

// ============================================
// EXPORT ALL
// ============================================

/**
 * Complete brand configuration
 * Import this in ThemeContext.tsx
 */
export const BRAND_CONFIG = {
  colors: BRAND_COLORS,
  lightTheme: LIGHT_THEME_COLORS,
  darkTheme: DARK_THEME_COLORS,
  gradients: BRAND_GRADIENTS,
  effects: {
    glow: GLOW_EFFECTS,
  },
  fonts: BRAND_FONTS,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  elevation: ELEVATION,
  animation: {
    duration: ANIMATION_DURATION,
    easing: ANIMATION_EASING,
  },
  components: {
    button: BUTTON_DEFAULTS,
    buttonPrimary: BUTTON_PRIMARY,
    card: CARD_DEFAULTS,
    input: INPUT_DEFAULTS,
    chipPrimary: CHIP_PRIMARY,
  },
} as const;

// Type for the brand configuration
export type BrandConfig = typeof BRAND_CONFIG;
