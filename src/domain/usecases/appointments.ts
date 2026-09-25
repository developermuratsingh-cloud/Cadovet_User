import type { Appointment } from '../entities';
import { parseTimeLabel, toDateString } from './dates.ts';

const ACTIVE = ['PENDING', 'CONFIRMED'];

// Minutes-resolution timestamp used only for ordering/comparison; the backend is the authority on the rules.
const sortKey = (a: Appointment) => `${a.date} ${String(parseTimeLabel(a.time) ?? 0).padStart(4, '0')}`;

// An appointment is upcoming while it is active and not yet in the past.
export const isUpcoming = (a: Appointment, now: Date = new Date()): boolean => {
  if (!ACTIVE.includes(a.status)) return false;
  const today = toDateString(now);
  if (a.date !== today) return a.date > today;
  const minutes = parseTimeLabel(a.time);
  // Windows like "10:00 AM to 12:00 PM" have no single start time; keep them for the whole day.
  return minutes === null || minutes >= now.getHours() * 60 + now.getMinutes();
};

export const canModify = isUpcoming;

export const partitionAppointments = (list: Appointment[], now: Date = new Date()) => {
  const upcoming = list.filter((a) => isUpcoming(a, now)).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const past = list.filter((a) => !isUpcoming(a, now)).sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  return { upcoming, past };
};

// Hides slots that have already passed today. Purely a convenience: the backend owns real availability.
export const filterFutureSlots = <T extends { time: string }>(slots: T[], date: string, now: Date = new Date()): T[] => {
  if (date !== toDateString(now)) return slots;
  const current = now.getHours() * 60 + now.getMinutes();
  return slots.filter((s) => (parseTimeLabel(s.time) ?? 0) > current);
};
