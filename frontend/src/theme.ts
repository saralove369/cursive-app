/**
 * Cursive Design System
 * Warm ivory paper · charcoal ink · muted gold
 */

export const colors = {
  bg: {
    primary: '#F5F1E8',
    secondary: '#EBE5D9',
    paper: '#F9F6F0',
    deep: '#E8E1D2',
  },
  text: {
    primary: '#2C2C2C',
    secondary: '#5C5C5C',
    muted: '#8A8A8A',
    faint: '#B5AE9F',
  },
  accent: {
    gold: '#C9A961',
    goldHover: '#B39552',
    goldFaint: '#E5D5A8',
    ink: '#1A1A1A',
    inkDeep: '#0F0F0F',
    burgundy: '#6B4C4C',
    sepia: '#7A6651',
  },
  border: {
    default: '#E2DCD0',
    light: '#EFEBE1',
    strong: '#CFC7B6',
  },
} as const;

export const fonts = {
  heading: 'PlayfairDisplay_400Regular',
  headingBold: 'PlayfairDisplay_700Bold',
  headingItalic: 'PlayfairDisplay_400Regular_Italic',
  body: 'EBGaramond_400Regular',
  bodyItalic: 'EBGaramond_400Regular_Italic',
  bodyBold: 'EBGaramond_600SemiBold',
  accent: 'CrimsonText_400Regular',
  // Authentic instructional cursive (Palmer Method style)
  cursive: 'DancingScript_400Regular',
  cursiveBold: 'DancingScript_700Bold',
  // Spencerian / copperplate flourish (more decorative — for hero / titles only)
  copperplate: 'Allura_400Regular',
} as const;

export const type = {
  display: {
    fontFamily: fonts.headingBold,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.8,
    color: colors.text.primary,
  },
  h1: {
    fontFamily: fonts.heading,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.4,
    color: colors.text.primary,
  },
  h2: {
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: colors.text.primary,
  },
  h3: {
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.2,
    color: colors.text.primary,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.2,
    color: colors.text.primary,
  },
  bodyLarge: {
    fontFamily: fonts.body,
    fontSize: 20,
    lineHeight: 32,
    letterSpacing: 0.15,
    color: colors.text.primary,
  },
  italic: {
    fontFamily: fonts.bodyItalic,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
    color: colors.text.secondary,
    fontStyle: 'italic' as const,
  },
  caption: {
    fontFamily: fonts.accent,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: colors.text.muted,
  },
  small: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 96,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const shadow = {
  soft: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  paper: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  deep: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

export const motion = {
  fast: 250,
  base: 400,
  slow: 600,
  veryslow: 900,
} as const;
