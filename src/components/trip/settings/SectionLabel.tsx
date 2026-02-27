/**
 * SectionLabel — small all-caps label used above form fields in settings cards.
 */
import React from 'react';
import {ThemedText} from '../../index';

interface Props {
    children: string;
    className?: string;
}

export function SectionLabel({children, className = ''}: Props) {
    return (
        <ThemedText
            textStyle="body"
            variant="secondary"
            className={`text-[11px] font-semibold tracking-widest uppercase mb-2 ${className}`}
        >
            {children}
        </ThemedText>
    );
}

