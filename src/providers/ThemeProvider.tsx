import React, {createContext, ReactNode, useContext} from 'react';
import {useColorScheme} from 'react-native';
import {Colors, ThemeColors} from '../theme/colors';

export type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
    colors: ThemeColors;
    colorScheme: ColorScheme;
}

// Create the Theme Context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

/**
 * ThemeProvider component that provides theme context to all children
 * This wraps your app and makes theme available throughout the component tree
 */
export function ThemeProvider({children}: ThemeProviderProps) {
    const systemColorScheme = useColorScheme();
    const colorScheme: ColorScheme = systemColorScheme === 'dark' ? 'dark' : 'light';

    const value: ThemeContextValue = {
        colors: Colors[colorScheme],
        colorScheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook to access theme context
 * Must be used within a ThemeProvider
 */
export function useThemeContext(): ThemeContextValue {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }

    return context;
}
