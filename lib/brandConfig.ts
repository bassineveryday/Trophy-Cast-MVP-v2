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
  // Main brand color (SeaGreen)
  primary: '#2E8B57',
  
  // Accent/highlight color (MintGreen)
  accent: '#65C18C',
  
  // Success states
  success: '#4CAF50',
  
  // Warning states
  warning: '#FF9800',
  
  // Error states
  error: '#F44336',
  
  // Info states
  info: '#2196F3',
} as const;

/**
 * Light theme colors
 */
export const LIGHT_THEME_COLORS = {
  background: '#F5F5F5',        // Page background
  surface: '#FFFFFF',           // Cards, elevated surfaces
  surfaceVariant: '#F8F8F8',    // Alternate surface color
  border: '#E0E0E0',            // Borders and dividers
  text: '#1A1A1A',              // Primary text
  textSecondary: '#666666',     // Secondary/muted text
  shadow: '#000000',            // Shadow color
} as const;

/**
 * Dark theme colors
 */
export const DARK_THEME_COLORS = {
  background: '#121212',        // Page background
  surface: '#1E1E1E',           // Cards, elevated surfaces
  surfaceVariant: '#2C2C2C',    // Alternate surface color
  border: '#333333',            // Borders and dividers
  text: '#FFFFFF',              // Primary text
  textSecondary: '#B0B0B0',     // Secondary/muted text
  shadow: '#000000',            // Shadow color
} as const;

/**
 * Gradient definitions
 * Used for hero sections, special cards, etc.
 */
export const BRAND_GRADIENTS = {
  // Main hero gradient (SeaGreen → MintGreen)
  hero: ['#2E8B57', '#65C18C'],
  
  // Card gradient (slightly darker variation)
  card: ['#3A9D6B', '#4CAF79'],
  
  // Accent gradient (lighter variation)
  accent: ['#65C18C', '#7ED5A3'],
  
  // Success gradient
  success: ['#4CAF50', '#66BB6A'],
  
  // Premium/gold gradient (for special features)
  premium: ['#FFD700', '#FFA500'],
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

/**
 * Font family configuration
 * Using Inter font family for clean, modern look
 */
export const BRAND_FONTS = {
  // Font families from @expo-google-fonts/inter
  regular: 'Inter_400Regular',
  medium: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
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
  xs: 6,           // Extra small spacing
  sm: 8,           // Small spacing
  md: 12,          // Medium spacing
  lg: 16,          // Large spacing
  xl: 20,          // Extra large spacing
  xxl: 24,         // 2x extra large spacing
} as const;

/**
 * Border radius values (in pixels)
 * Used for consistent rounded corners
 */
export const BORDER_RADIUS = {
  sm: 8,           // Small radius (buttons, chips)
  md: 12,          // Medium radius (cards)
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
    card: CARD_DEFAULTS,
    input: INPUT_DEFAULTS,
  },
} as const;

// Type for the brand configuration
export type BrandConfig = typeof BRAND_CONFIG;
