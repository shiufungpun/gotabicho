import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {initDatabase} from '../db/db';

interface DatabaseContextValue {
    isReady: boolean;
    error: Error | null;
}

// Create the Database Context
const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

interface DatabaseProviderProps {
    children: ReactNode;
}

/**
 * DatabaseProvider component that initializes the database and provides ready state
 * This ensures database is initialized before any components try to use it
 */
export function DatabaseProvider({children}: DatabaseProviderProps) {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        initDatabase()
            .then(() => {
                console.log('Database initialized');
                setIsReady(true);
            })
            .catch((e) => {
                console.error('DB Init Error:', e);
                setError(e);
            });
    }, []);

    const value: DatabaseContextValue = {
        isReady,
        error,
    };

    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    );
}

/**
 * Hook to access database context
 * Must be used within a DatabaseProvider
 */
export function useDatabaseContext(): DatabaseContextValue {
    const context = useContext(DatabaseContext);

    if (context === undefined) {
        throw new Error('useDatabaseContext must be used within a DatabaseProvider');
    }

    return context;
}
