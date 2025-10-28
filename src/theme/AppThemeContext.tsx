import { createContext, useContext } from 'react';

export type AppTheme = 'light' | 'dark';

type AppThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
};

const defaultValue: AppThemeContextValue = {
  theme: 'light',
  toggleTheme: () => {
    throw new Error('AppThemeContext not initialized');
  },
};

export const AppThemeContext = createContext<AppThemeContextValue>(defaultValue);

export const useAppTheme = () => useContext(AppThemeContext);
