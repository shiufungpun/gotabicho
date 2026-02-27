/**
 * Supported currencies for trip budgeting.
 * Each entry has a display label and an ISO 4217 currency code.
 */
export interface CurrencyOption {
    label: string;
    value: string;
    symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
    {label: 'JPY — Japanese Yen', value: 'JPY', symbol: '¥'},
    {label: 'USD — US Dollar', value: 'USD', symbol: '$'},
    {label: 'EUR — Euro', value: 'EUR', symbol: '€'},
    {label: 'GBP — British Pound', value: 'GBP', symbol: '£'},
    {label: 'HKD — Hong Kong Dollar', value: 'HKD', symbol: 'HK$'},
    {label: 'TWD — Taiwan Dollar', value: 'TWD', symbol: 'NT$'},
    {label: 'KRW — Korean Won', value: 'KRW', symbol: '₩'},
    {label: 'AUD — Australian Dollar', value: 'AUD', symbol: 'A$'},
    {label: 'SGD — Singapore Dollar', value: 'SGD', symbol: 'S$'},
];

/** Returns the symbol for a given currency code, falling back to the code itself. */
export const getCurrencySymbol = (code: string): string =>
    CURRENCIES.find(c => c.value === code)?.symbol ?? code;

