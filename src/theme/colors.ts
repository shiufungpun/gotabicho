/**
 * Color definitions for light and dark themes
 */

export const Colors = {
    light: {
        // Backgrounds
        background: 'rgb(255,251,248)',
        surface: '#ffffff',
        card: '#ffffff',

        // Text
        text: '#333333',
        textSecondary: '#666666',
        textTertiary: '#888888',

        // Primary colors
        primary: '#1565c0',
        primaryLight: '#e3f2fd',

        // Status colors
        success: '#4caf50',
        error: '#ff4444',
        warning: '#ff9800',
        info: '#2196f3',

        // Borders and dividers
        border: '#dddddd',
        divider: '#eeeeee',

        // Shadows
        shadow: '#000000',

        // Budget colors
        budgetNormal: '#4caf50',
        budgetOver: '#ff4444',
        budgetText: '#666666',

        // Progress
        progressBackground: '#eeeeee',

        // Category colors (for charts)
        chartColors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],

        // Settlement colors
        settlementFrom: '#d32f2f',
        settlementTo: '#388e3c',
        settlementAmount: '#1565c0',
    },
    dark: {
        // Backgrounds
        background: '#121212',
        surface: '#1e1e1e',
        card: '#2c2c2c',

        // Text
        text: '#e1e1e1',
        textSecondary: '#b0b0b0',
        textTertiary: '#808080',

        // Primary colors
        primary: '#64b5f6',
        primaryLight: '#1e3a5f',

        // Status colors
        success: '#66bb6a',
        error: '#ef5350',
        warning: '#ffa726',
        info: '#42a5f5',

        // Borders and dividers
        border: '#3a3a3a',
        divider: '#2a2a2a',

        // Shadows
        shadow: '#000000',

        // Budget colors
        budgetNormal: '#66bb6a',
        budgetOver: '#ef5350',
        budgetText: '#b0b0b0',

        // Progress
        progressBackground: '#3a3a3a',

        // Category colors (for charts - slightly adjusted for dark mode)
        chartColors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],

        // Settlement colors
        settlementFrom: '#ef5350',
        settlementTo: '#66bb6a',
        settlementAmount: '#64b5f6',
    },
};

export type ThemeColors = typeof Colors.light;
