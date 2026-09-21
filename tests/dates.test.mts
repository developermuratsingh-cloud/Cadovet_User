import { addDays, monthGrid, toDateString } from '../src/domain/usecases/dates.ts';

let pass = 0, fail = 0;
const eq = (name: string, got: unknown, want: unknown) => { JSON.stringify(got) === JSON.stringify(want) ? pass++ : (fail++, console.log('FAIL', name, JSON.stringify(got), '!=', JSON.stringify(want))); };

// September 2026 starts on a Tuesday and has 30 days.
const sep = monthGrid(2026, 8);
eq('Sep 2026: two leading blanks (Sun, Mon)', sep.slice(0, 3), [null, null, '2026-09-01']);
eq('Sep 2026: 32 cells', sep.length, 32);
eq('Sep 2026: last day', sep[sep.length - 1], '2026-09-30');
// February in a leap year / non-leap year, and a month starting on Sunday (no blanks).
eq('Feb 2028 has 29 days', monthGrid(2028, 1).filter(Boolean).length, 29);
eq('Feb 2027 has 28 days', monthGrid(2027, 1).filter(Boolean).length, 28);
eq('Nov 2026 starts on Sunday: no blanks', monthGrid(2026, 10)[0], '2026-11-01');
eq('December 2026 has 31 days', monthGrid(2026, 11).filter(Boolean).length, 31);
// date arithmetic across month/year boundaries
eq('addDays +1', addDays('2026-09-20', 1), '2026-09-21');
eq('addDays across month', addDays('2026-09-30', 1), '2026-10-01');
eq('addDays across year', addDays('2026-12-31', 1), '2027-01-01');
eq('addDays 90', addDays('2026-09-20', 90), '2026-12-19');
eq('addDays negative', addDays('2026-03-01', -1), '2026-02-28');
eq('toDateString is local, zero-padded', toDateString(new Date(2026, 0, 5)), '2026-01-05');
console.log(`dates: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
