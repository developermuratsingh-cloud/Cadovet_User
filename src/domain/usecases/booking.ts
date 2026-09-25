import type { HomeVisitInput } from '../entities';
import { filterFutureSlots } from './appointments.ts';

// The website's home-visit form books this fixed service unless a specific one was chosen elsewhere in the app.
export const DEFAULT_HOME_VISIT = { serviceName: 'Home Visit Consultation', totalAmount: 599 };

// Same slots the website offers, 9 AM through to 9 AM the next morning.
export const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM', '02:00 AM',
  '03:00 AM', '04:00 AM', '05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM',
];

/** The slots still bookable on `date`: all of them on a future day, only the ones ahead of `now` today. */
export const slotsFor = (date: string, now: Date = new Date()): string[] =>
  filterFutureSlots(TIME_SLOTS.map((time) => ({ time })), date, now).map((s) => s.time);

export const NOTES_MAX_WORDS = 200;
export const NOTES_MAX_CHARS = 1000; // what the server stores

export const countWords = (text: string): number => text.split(/\s+/).filter(Boolean).length;

/** Caps the text at `max` words, as the website does while typing. */
export const limitWords = (text: string, max = NOTES_MAX_WORDS): string =>
  countWords(text) <= max ? text : text.split(/\s+/).filter(Boolean).slice(0, max).join(' ');

export type HomeVisitForm = Record<
  'ownerName' | 'phone' | 'email' | 'species' | 'petName' | 'breed' | 'age' | 'gender' | 'aggressive' | 'date' | 'time' | 'address' | 'notes',
  string
>;
export type HomeVisitService = Pick<HomeVisitInput, 'serviceId' | 'serviceName' | 'totalAmount'>;

export const toHomeVisitInput = (f: HomeVisitForm, service: HomeVisitService): HomeVisitInput => ({
  ownerName: f.ownerName.trim(),
  phone: f.phone,
  email: f.email.trim() || undefined,
  petName: f.petName.trim(),
  species: f.species.trim(),
  breed: f.breed.trim(),
  ageYears: Number(f.age),
  gender: f.gender as HomeVisitInput['gender'],
  isAggressive: f.aggressive === 'yes',
  ...service,
  date: f.date,
  time: f.time,
  address: f.address.trim(),
  notes: f.notes.trim(),
});
