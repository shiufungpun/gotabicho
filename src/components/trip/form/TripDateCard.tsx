/**
 * TripDateCard — inline date-range picker using flash-calendar.
 * Tap once to set start, tap again to set end (tap-start-then-end pattern).
 */
import React, {forwardRef, useCallback, useImperativeHandle, useMemo, useRef} from 'react';
import {TouchableOpacity, View} from 'react-native';
import type {CalendarTheme} from '@marceloterreiro/flash-calendar';
import {Calendar, toDateId, useDateRange} from '@marceloterreiro/flash-calendar';
import {XIcon} from 'lucide-react-native';
import {useTheme} from '../../../theme';
import {ThemedCard, ThemedText} from '../../index';

/** YYYY-MM-DD string → human-readable short date, e.g. "Mar 5, 2026" */
const fmtShort = (id: string) =>
    new Date(id + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

/** First day of current month as YYYY-MM-DD — computed once at module load */
const currentMonthId = toDateId(new Date()).slice(0, 7) + '-01';

interface TripDateCardProps {
    /** Called whenever the date range changes */
    onRangeChange: (startId: string | undefined, endId: string | undefined) => void;
}

/** Ref handle so AddTripSheet can imperatively reset the calendar */
export interface TripDateCardRef {
    reset: () => void;
}

export const TripDateCard = forwardRef<TripDateCardRef, TripDateCardProps>(
    function TripDateCard({onRangeChange}, ref) {
        const {colors, colorScheme} = useTheme();

        // Uncontrolled — state lives entirely inside this component
        const {
            calendarActiveDateRanges,
            onCalendarDayPress,
            onClearDateRange,
            dateRange,
        } = useDateRange();

        // Keep a stable ref to dateRange so callbacks don't re-create on every render
        const dateRangeRef = useRef(dateRange);
        dateRangeRef.current = dateRange;

        // Expose reset() to parent via ref
        useImperativeHandle(ref, () => ({
            reset: () => {
                onClearDateRange();
                onRangeChange(undefined, undefined);
            },
        }), [onClearDateRange, onRangeChange]);

        const handleDayPress = useCallback((id: string) => {
            const {startId: s, endId: e} = dateRangeRef.current;
            let newStart: string | undefined;
            let newEnd: string | undefined;

            if (!s && !e) {
                newStart = id;
                newEnd = undefined;
            } else if (s && e) {
                newStart = id;
                newEnd = undefined;
            } else if (s && !e) {
                if (id < s) {
                    newStart = id;
                    newEnd = s;
                } else {
                    newStart = s;
                    newEnd = id;
                }
            } else {
                newStart = id;
                newEnd = id;
            }

            onCalendarDayPress(id);
            onRangeChange(newStart, newEnd);
        }, [onCalendarDayPress, onRangeChange]);

        const handleClear = useCallback(() => {
            onClearDateRange();
            onRangeChange(undefined, undefined);
        }, [onClearDateRange, onRangeChange]);

        const hasStart = !!dateRange.startId;
        const hasEnd = !!dateRange.endId;

        // Memoize theme so Calendar.List never sees a new object reference
        const calendarTheme = useMemo<CalendarTheme>(() => ({
            rowMonth: {
                content: {color: colors.text, fontWeight: '600', fontSize: 15},
            },
            rowWeek: {
                container: {borderBottomWidth: 1, borderBottomColor: colors.border},
            },
            itemWeekName: {content: {color: colors.textTertiary, fontSize: 11}},
            itemDay: {
                base: () => ({
                    container: {backgroundColor: 'transparent'},
                    content: {color: colors.text, fontSize: 13},
                }),
                today: () => ({
                    container: {borderWidth: 1.5, borderColor: colors.primary, borderRadius: 16},
                    content: {color: colors.primary, fontWeight: '700'},
                }),
                active: ({isStartOfRange, isEndOfRange}: {
                    isStartOfRange: boolean;
                    isEndOfRange: boolean;
                    isPressed: boolean;
                }) => ({
                    container: {
                        backgroundColor: colors.primary,
                        borderRadius: isStartOfRange || isEndOfRange ? 16 : 0,
                    },
                    content: {color: '#ffffff', fontWeight: '600'},
                }),
                disabled: () => ({
                    container: {backgroundColor: 'transparent'},
                    content: {color: colors.textTertiary},
                }),
                idle: () => ({
                    container: {backgroundColor: 'transparent'},
                    content: {color: colors.text},
                }),
            },
        }), [colors]);

        return (
            <ThemedCard>
                <ThemedText variant="secondary" textStyle="body" className="mb-3 uppercase tracking-widest text-xs">
                    Trip Dates
                </ThemedText>

                {/* Status pill */}
                <View className="flex-row flex-wrap items-center mb-3 gap-2">
                    {!hasStart && !hasEnd ? (
                        <View
                            className="rounded-full px-3 py-1"
                            style={{backgroundColor: colors.border}}
                        >
                            <ThemedText variant="tertiary" style={{fontSize: 13}}>
                                Tap a day to set start date
                            </ThemedText>
                        </View>
                    ) : hasStart && !hasEnd ? (
                        <>
                            <View
                                className="rounded-full px-3 py-1"
                                style={{backgroundColor: colors.primaryLight}}
                            >
                                <ThemedText variant="primaryColor" style={{fontSize: 13, fontWeight: '600'}}>
                                    {fmtShort(dateRange.startId!)}
                                </ThemedText>
                            </View>
                            <View
                                className="rounded-full px-3 py-1"
                                style={{backgroundColor: colors.border}}
                            >
                                <ThemedText variant="tertiary" style={{fontSize: 13}}>
                                    Now tap end date
                                </ThemedText>
                            </View>
                        </>
                    ) : (
                        <>
                            <View
                                className="rounded-full px-3 py-1"
                                style={{backgroundColor: colors.primaryLight}}
                            >
                                <ThemedText variant="primaryColor" style={{fontSize: 13, fontWeight: '600'}}>
                                    {fmtShort(dateRange.startId!)} → {fmtShort(dateRange.endId!)}
                                </ThemedText>
                            </View>
                            <TouchableOpacity
                                onPress={handleClear}
                                className="rounded-full p-1"
                                style={{backgroundColor: colors.border}}
                                hitSlop={8}
                            >
                                <XIcon size={12} color={colors.textSecondary}/>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Inline calendar */}
                <Calendar.List
                    calendarInitialMonthId={currentMonthId}
                    calendarActiveDateRanges={calendarActiveDateRanges}
                    onCalendarDayPress={handleDayPress}
                    calendarFirstDayOfWeek="sunday"
                    calendarDayHeight={36}
                    calendarRowVerticalSpacing={4}
                    calendarRowHorizontalSpacing={4}
                    calendarSpacing={24}
                    calendarFutureScrollRangeInMonths={12}
                    calendarPastScrollRangeInMonths={6}
                    theme={calendarTheme}
                    calendarColorScheme={colorScheme}
                    style={{marginHorizontal: -4}}
                />
            </ThemedCard>
        );
    }
);
