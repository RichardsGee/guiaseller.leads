/**
 * Design System — Consolidated Tokens
 *
 * Re-exports and unifies all vertical-specific typography and color tokens.
 * This is the single source of truth for the Designer agent and the
 * /design-system page.
 *
 * @see brand-guidelines.md for usage rules
 */

// ─── Typography tokens ───────────────────────────────────────
export { dashboardTypography } from '../styles/dashboardTypography';
export { calculatorTypography } from '../styles/calculatorTypography';

// Re-export remaining verticals (they follow the same pattern)
// If the import fails at build time it means the file doesn't exist yet
export { analyticsTypography } from '../styles/analyticsTypography';
export { salesTypography } from '../styles/salesTypography';
export { salesAnalyticsTypography } from '../styles/salesAnalyticsTypography';
export { integrationsTypography } from '../styles/integrationsTypography';
export { listingsTypography } from '../styles/listingsTypography';
export { toolsTypography } from '../styles/toolsTypography';

// ─── Color tokens ────────────────────────────────────────────
export { dashboardColors } from '../styles/dashboardColors';
export { calculatorColors } from '../styles/calculatorColors';
export { analyticsColors } from '../styles/analyticsColors';
export * as salesColors from '../styles/salesColors';
export { salesAnalyticsColors } from '../styles/salesAnalyticsColors';
export { integrationsColors } from '../styles/integrationsColors';
export { listingsColors } from '../styles/listingsColors';
export { toolsColors } from '../styles/toolsColors';

// ─── Calculator Design System (full) ────────────────────────
export { calculatorDesignSystem } from '../styles/calculatorDesignSystem';

// ─── Semantic color palette (shared) ─────────────────────────
export const semanticColors = {
  positive: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  negative: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  neutral: {
    bg: 'bg-gray-50 dark:bg-gray-700/50',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
  },
} as const;

// ─── Marketplace brand colors ────────────────────────────────
export const marketplaceBranding = {
  'mercado-livre': { primary: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-400', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' },
  'shopee':        { primary: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' },
  'magalu':        { primary: 'bg-blue-600',   text: 'text-blue-700 dark:text-blue-400',     badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
  'shein':         { primary: 'bg-black',      text: 'text-gray-900 dark:text-gray-400',     badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200' },
  'tiktok':        { primary: 'bg-cyan-500',   text: 'text-gray-900 dark:text-gray-400',     badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200' },
  'amazon':        { primary: 'bg-orange-600', text: 'text-orange-700 dark:text-orange-400', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' },
} as const;

// ─── Approved gradients ──────────────────────────────────────
export const gradients = {
  referralFab:     'bg-gradient-to-r from-emerald-500 to-green-600',
  sidebarLock:     'bg-gradient-to-r from-yellow-400/90 to-amber-500/90',
  sidebarBadgeAI:  'bg-gradient-to-r from-blue-600 to-purple-600',
  chartHover1:     'bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10',
  chartHover2:     'bg-gradient-to-br from-green-50/50 via-transparent to-teal-50/50 dark:from-green-900/10 dark:to-teal-900/10',
  priceText:       'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent',
  tutorialsBanner: 'bg-gradient-to-r from-blue-600 to-purple-600',
} as const;

// ─── Spacing tokens ──────────────────────────────────────────
export const fluidSpacing = {
  'fluid-1':  'clamp(0.25rem, 0.2rem + 0.2vw, 0.375rem)',
  'fluid-2':  'clamp(0.5rem, 0.4rem + 0.4vw, 0.75rem)',
  'fluid-3':  'clamp(0.75rem, 0.6rem + 0.6vw, 1.125rem)',
  'fluid-4':  'clamp(1rem, 0.8rem + 0.8vw, 1.5rem)',
  'fluid-5':  'clamp(1.25rem, 1rem + 1vw, 2rem)',
  'fluid-6':  'clamp(1.5rem, 1.2rem + 1.2vw, 2.5rem)',
  'fluid-8':  'clamp(2rem, 1.6rem + 1.6vw, 3rem)',
  'fluid-10': 'clamp(2.5rem, 2rem + 2vw, 4rem)',
  'fluid-12': 'clamp(3rem, 2.4rem + 2.4vw, 5rem)',
} as const;

// ─── Breakpoints ─────────────────────────────────────────────
export const breakpoints = {
  xs:   '480px',
  sm:   '640px',
  md:   '768px',
  lg:   '1024px',
  xl:   '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
  '4xl': '2560px',
} as const;
