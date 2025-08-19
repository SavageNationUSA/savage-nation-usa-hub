import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value?: number | null, currency: string = "USD") {
  if (value == null) return ""
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value)
  } catch {
    return `$${value}`
  }
}

export function formatDate(value?: string | number | Date | null) {
  if (!value) return ""
  const d = new Date(value)
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d)
}

export function formatDateTime(value?: string | number | Date | null) {
  if (!value) return ""
  const d = new Date(value)
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}
