import { useMemo } from 'react';
import { useColorScheme, type ColorSchemeName } from 'react-native';

import { useAppTheme } from './AppThemeContext';

export type AwardPalette = {
  text: string;
  subtext: string;
  accent: string;
  accentMuted: string;
  highlight: string;
  cardBg: string;
  border: string;
  borderSoft: string;
  inputBg: string;
  placeholder: string;
  disabled: string;
  successBg: string;
  successText: string;
  errorBg: string;
  errorText: string;
  badgeBg: string;
  pillBg: string;
  pillSubtitle: string;
  surface: string;
  surfaceStrong: string;
  positive: string;
  negative: string;
  chartPrimary: string;
  chartSecondary: string;
  chipBg: string;
};

const palettes: Record<'light' | 'dark', AwardPalette> = {
  light: {
    text: '#0F172A',
    subtext: '#4B5563',
    accent: '#2563EB',
    accentMuted: 'rgba(37, 99, 235, 0.12)',
    highlight: '#7C3AED',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    border: 'rgba(148, 163, 184, 0.25)',
    borderSoft: 'rgba(148, 163, 184, 0.18)',
    inputBg: 'rgba(248, 250, 252, 0.97)',
    placeholder: '#94A3B8',
    disabled: 'rgba(148, 163, 184, 0.35)',
    successBg: 'rgba(16, 185, 129, 0.12)',
    successText: '#047857',
    errorBg: 'rgba(239, 68, 68, 0.12)',
    errorText: '#B91C1C',
    badgeBg: 'rgba(255, 255, 255, 0.7)',
    pillBg: 'rgba(37, 99, 235, 0.12)',
    pillSubtitle: '#64748B',
    surface: 'rgba(255, 255, 255, 0.92)',
    surfaceStrong: 'rgba(241, 245, 255, 0.88)',
    positive: '#22C55E',
    negative: '#F97316',
    chartPrimary: 'rgba(37, 99, 235, 0.6)',
    chartSecondary: 'rgba(14, 116, 144, 0.55)',
    chipBg: 'rgba(37, 99, 235, 0.14)',
  },
  dark: {
    text: '#F8FAFC',
    subtext: '#A1B2D2',
    accent: '#38BDF8',
    accentMuted: 'rgba(56, 189, 248, 0.16)',
    highlight: '#A855F7',
    cardBg: 'rgba(9, 16, 28, 0.88)',
    border: 'rgba(148, 163, 184, 0.22)',
    borderSoft: 'rgba(148, 163, 184, 0.16)',
    inputBg: 'rgba(15, 23, 42, 0.78)',
    placeholder: 'rgba(148, 163, 184, 0.65)',
    disabled: 'rgba(148, 163, 184, 0.28)',
    successBg: 'rgba(34, 197, 94, 0.12)',
    successText: '#4ADE80',
    errorBg: 'rgba(248, 113, 113, 0.14)',
    errorText: '#FCA5A5',
    badgeBg: 'rgba(8, 47, 73, 0.55)',
    pillBg: 'rgba(59, 130, 246, 0.18)',
    pillSubtitle: 'rgba(226, 232, 240, 0.72)',
    surface: 'rgba(15, 23, 42, 0.84)',
    surfaceStrong: 'rgba(15, 23, 42, 0.95)',
    positive: '#4ADE80',
    negative: '#FB7185',
    chartPrimary: 'rgba(56, 189, 248, 0.55)',
    chartSecondary: 'rgba(124, 58, 237, 0.48)',
    chipBg: 'rgba(59, 130, 246, 0.2)',
  },
};

const backgroundGradients = {
  light: ['#F8FAFF', '#EEF4FF', '#E0F2FE'] as const,
  dark: ['#020617', '#050A1E', '#111827'] as const,
};

const primaryGlows: Record<'light' | 'dark', string[]> = {
  light: ['rgba(37, 99, 235, 0.35)', 'rgba(37, 99, 235, 0)'],
  dark: ['rgba(56, 189, 248, 0.45)', 'rgba(56, 189, 248, 0)'],
};

const secondaryGlows: Record<'light' | 'dark', string[]> = {
  light: ['rgba(124, 58, 237, 0.3)', 'rgba(124, 58, 237, 0)'],
  dark: ['rgba(168, 85, 247, 0.38)', 'rgba(168, 85, 247, 0)'],
};

const resolveScheme = (scheme: ColorSchemeName | 'light' | 'dark') => (scheme === 'dark' ? 'dark' : 'light');

export const useAwardPalette = () => {
  const { theme } = useAppTheme();
  const scheme = useColorScheme();
  const resolved = theme ?? resolveScheme(scheme);
  return useMemo(() => palettes[resolveScheme(resolved)], [resolved]);
};

export const getAwardPalette = (scheme: ColorSchemeName) => palettes[resolveScheme(scheme)];

export const getAwardBackground = (scheme: ColorSchemeName) => backgroundGradients[resolveScheme(scheme)];

export const getAwardGlows = (scheme: ColorSchemeName) => ({
  primary: primaryGlows[resolveScheme(scheme)],
  secondary: secondaryGlows[resolveScheme(scheme)],
});
