import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { format, parseISO } from "date-fns";

const TIMEZONE = "Asia/Kolkata";

export function nowISO(): string {
  return new Date().toISOString();
}

export function formatDateTime(isoString: string): string {
  const date = parseISO(isoString);
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd HH:mm:ss");
}

export function formatDate(isoString: string): string {
  const date = parseISO(isoString);
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd");
}

export function formatTime(isoString: string): string {
  const date = parseISO(isoString);
  return formatInTimeZone(date, TIMEZONE, "HH:mm:ss");
}

export function toKolkataTime(date: Date): Date {
  return toZonedTime(date, TIMEZONE);
}

export function daysDifference(from: string, to: string): number {
  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  const diff = toDate.getTime() - fromDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function hoursAgo(isoString: string): number {
  const date = parseISO(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60));
}
