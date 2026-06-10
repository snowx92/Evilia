import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Locale } from '@/types/auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NUMBER_LOCALE: Record<Locale, string> = {
  ar: 'ar-EG',
  en: 'en-US',
};

/**
 * Firestore serializes Timestamp values to one of these shapes when they go
 * through the Admin SDK → JSON. Backend dates frequently arrive as objects
 * rather than ISO strings, so every date helper here accepts the union.
 */
export type FirestoreTimestamp =
  | { _seconds: number; _nanoseconds: number }
  | { seconds: number; nanoseconds: number };

export type TimestampLike = string | number | FirestoreTimestamp | null | undefined;

export function toDate(value: TimestampLike): Date | null {
  if (value == null) return null;

  if (typeof value === 'number') {
    // Accept both ms and s. Anything past ~2001 in ms is > 1e12; treat smaller as seconds.
    const ms = value > 1e12 ? value : value * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'object') {
    const seconds =
      '_seconds' in value
        ? value._seconds
        : 'seconds' in value
          ? value.seconds
          : null;
    const nanos =
      '_nanoseconds' in value
        ? value._nanoseconds
        : 'nanoseconds' in value
          ? value.nanoseconds
          : 0;
    if (typeof seconds !== 'number') return null;
    const d = new Date(seconds * 1000 + Math.floor((nanos ?? 0) / 1e6));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function formatCurrency(value: number, locale: Locale = 'ar', currency = 'EGP') {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, locale: Locale = 'ar') {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale]).format(value);
}

export function formatPercent(value: number, locale: Locale = 'ar') {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatDate(value: TimestampLike, locale: Locale = 'ar') {
  const date = toDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat(NUMBER_LOCALE[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(value: TimestampLike, locale: Locale = 'ar') {
  const date = toDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat(NUMBER_LOCALE[locale], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
