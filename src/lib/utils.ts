// ─────────────────────────────────────────────
// ID generation
// ─────────────────────────────────────────────

/** Generate a UUID v4. Wraps crypto.randomUUID() for easy test stubbing. */
export function generateId(): string {
  return crypto.randomUUID();
}

// ─────────────────────────────────────────────
// Date / time formatting
// ─────────────────────────────────────────────

/**
 * Format an ISO 8601 string as 'YYYY.MM.DD'.
 * Returns an empty string for falsy input.
 *
 * @example formatDate('2026-02-20T09:00:00.000Z') // '2026.02.20'
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  } catch {
    return iso ?? '';
  }
}

/**
 * Format an ISO 8601 string as 'YYYY.MM.DD HH:mm'.
 * Returns an empty string for falsy input.
 *
 * @example formatDateTime('2026-02-20T09:05:00.000Z') // '2026.02.20 09:05'
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${day} ${hh}:${mm}`;
  } catch {
    return iso ?? '';
  }
}

// ─────────────────────────────────────────────
// Currency formatting
// ─────────────────────────────────────────────

/**
 * Format a numeric amount as a currency string.
 *
 * - KRW → '₩1,000,000'  (no decimals)
 * - USD → '$1,000.00'    (2 decimals)
 *
 * @example formatCurrency(50000000, 'KRW') // '₩50,000,000'
 * @example formatCurrency(1500, 'USD')     // '$1,500.00'
 */
export function formatCurrency(
  value: number,
  currency: 'KRW' | 'USD',
): string {
  try {
    if (currency === 'KRW') {
      return '₩' + Math.round(value).toLocaleString('ko-KR');
    }
    return '$' + value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return `${currency} ${value}`;
  }
}

// ─────────────────────────────────────────────
// Tailwind class merging
// ─────────────────────────────────────────────

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Uses clsx for conditional classes + tailwind-merge to deduplicate
 * conflicting utilities (e.g. px-4 + px-8 → px-8).
 * Required by shadcn/ui components.
 *
 * @example cn('px-4', isActive && 'bg-blue-500', undefined) // 'px-4 bg-blue-500'
 * @example cn('px-4', 'px-8') // 'px-8'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────
// Display helpers
// ─────────────────────────────────────────────

/**
 * Extract the first character(s) of a name for avatar placeholders.
 *
 * Single-word names (Korean etc.) → first character only.
 * Multi-word names (Latin scripts) → first character of each word (up to 2).
 *
 * @example getInitials('홍길동')  // '홍'
 * @example getInitials('John Doe') // 'JD'
 * @example getInitials('')         // '?'
 */
export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?';

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    // Latin-style multi-word name — take first letter of first + last word.
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Single-word name (e.g. Korean) — take the first character only.
  return parts[0][0];
}
