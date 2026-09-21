// Local calendar date as YYYY-MM-DD (never via toISOString, which shifts to UTC).
export const toDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Parses a YYYY-MM-DD string into a local Date at midnight.
export const fromDateString = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const nextDays = (count: number, from: Date = new Date()): string[] =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    return toDateString(d);
  });

// "10:30 AM" -> minutes since midnight; null when the label is not a single clock time.
export const parseTimeLabel = (label: string): number | null => {
  const m = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i.exec(label);
  if (!m) return null;
  const hour = Number(m[1]) % 12;
  return (m[3].toUpperCase() === 'PM' ? hour + 12 : hour) * 60 + Number(m[2]);
};

export const addDays = (ymd: string, days: number): string => {
  const [y, m, d] = ymd.split('-').map(Number);
  return toDateString(new Date(y, m - 1, d + days));
};

/** Calendar cells for one month, Sunday-first: `null` for the leading blanks, then each day as YYYY-MM-DD. */
export const monthGrid = (year: number, month: number): (string | null)[] => {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: first.getDay() }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateString(new Date(year, month, d)));
  return cells;
};
