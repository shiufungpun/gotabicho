import React, {ReactNode} from 'react';
import {ThemeProvider} from './ThemeProvider';
import {DatabaseProvider} from './DatabaseProvider';
import {AIExtractionProvider} from './AIExtractionProvider';

interface AppProviderProps {
    children: ReactNode;
}

/**
 * AppProvider combines all context providers in one place
 * This makes it easy to add new providers and keeps _layout.tsx clean
 *
 * Usage in _layout.tsx:
 * ```tsx
 * return (
 *   <AppProvider>
 *     <Stack>
 *       ...screens
 *     </Stack>
 *   </AppProvider>
 * );
 * ```
 */
export function AppProvider({children}: AppProviderProps) {
    return (
        <ThemeProvider>
            <DatabaseProvider>
                <AIExtractionProvider>
                    {children}
                </AIExtractionProvider>
            </DatabaseProvider>
        </ThemeProvider>
    );
}
