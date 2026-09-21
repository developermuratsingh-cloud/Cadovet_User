import { fromDateString } from '@/domain/usecases/dates';

const localeFor = (language: string) => (language === 'hi' ? 'hi-IN' : 'en-IN');

export const formatCurrency = (amount: number, language: string) =>
  new Intl.NumberFormat(localeFor(language), { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (ymd: string, language: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  fromDateString(ymd).toLocaleDateString(localeFor(language), opts);

export const formatWeekday = (ymd: string, language: string) =>
  fromDateString(ymd).toLocaleDateString(localeFor(language), { weekday: 'short' });

export const formatDayOfMonth = (ymd: string) => String(fromDateString(ymd).getDate());
