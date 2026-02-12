import React, {createContext, ReactNode, useContext, useState} from 'react';

interface ActiveTripContextValue {
    activeTripId: number | null;
    setActiveTripId: (tripId: number | null) => void;
}

// Create the ActiveTrip Context
const ActiveTripContext = createContext<ActiveTripContextValue | undefined>(undefined);

interface ActiveTripProviderProps {
    children: ReactNode;
}

/**
 * ActiveTripProvider manages the currently active trip across the app
 * Example: Use this to track which trip is currently selected by the user
 *
 * Usage:
 * 1. Add to AppProvider.tsx:
 *    <ActiveTripProvider>
 *      {children}
 *    </ActiveTripProvider>
 *
 * 2. Use in any component:
 *    const { activeTripId, setActiveTripId } = useActiveTripContext();
 */
export function ActiveTripProvider({children}: ActiveTripProviderProps) {
    const [activeTripId, setActiveTripId] = useState<number | null>(null);

    const value: ActiveTripContextValue = {
        activeTripId,
        setActiveTripId,
    };

    return (
        <ActiveTripContext.Provider value={value}>
            {children}
        </ActiveTripContext.Provider>
    );
}

/**
 * Hook to access active trip context
 * Must be used within an ActiveTripProvider
 */
export function useActiveTripContext(): ActiveTripContextValue {
    const context = useContext(ActiveTripContext);

    if (context === undefined) {
        throw new Error('useActiveTripContext must be used within an ActiveTripProvider');
    }

    return context;
}
