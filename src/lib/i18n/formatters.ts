/**
 * Locale-Aware Formatting Utilities using standard ECMAScript Internationalization APIs (Intl)
 * Supports full locale adaptation (EN, DE, ES, AR, FR) for dates, numbers, currency, and relative time.
 */

export function formatDate(
  date: Date | string | number,
  locale: string = "en",
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch {
    return String(date);
  }
}

export function formatDateTime(
  date: Date | string | number,
  locale: string = "en"
): string {
  return formatDate(date, locale, { dateStyle: "medium", timeStyle: "short" });
}

export function formatNumber(
  value: number,
  locale: string = "en",
  options: Intl.NumberFormatOptions = {}
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return String(value);
  }
}

export function formatPercent(
  value: number, // 0.85 = 85%
  locale: string = "en",
  decimals: number = 0
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return `${Math.round(value * 100)}%`;
  }
}

export function formatCurrency(
  amount: number,
  currency: string = "EUR",
  locale: string = "de-DE"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string = "en"
): string {
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    return rtf.format(value, unit);
  } catch {
    return `${value} ${unit} ago`;
  }
}
