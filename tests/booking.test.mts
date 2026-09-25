import { limitWords, slotsFor, TIME_SLOTS } from '../src/domain/usecases/booking.ts';

let pass = 0, fail = 0;
const eq = (name: string, got: unknown, want: unknown) => { JSON.stringify(got) === JSON.stringify(want) ? pass++ : (fail++, console.log('FAIL', name, JSON.stringify(got), '!=', JSON.stringify(want))); };

const at = (h: number, m = 0) => new Date(2026, 8, 25, h, m);

// Slots that have already passed today are not offered.
eq('3:45 PM: first slot is 4 PM', slotsFor('2026-09-25', at(15, 45))[0], '04:00 PM');
eq('3:45 PM: 9 AM is gone', slotsFor('2026-09-25', at(15, 45)).includes('09:00 AM'), false);
eq('exactly on the hour the slot has started, so it is gone', slotsFor('2026-09-25', at(16, 0))[0], '05:00 PM');
eq('early morning: every day-time slot is offered', slotsFor('2026-09-25', at(6))[0], '09:00 AM');
eq('a future day offers all slots', slotsFor('2026-09-26', at(15, 45)), TIME_SLOTS);
eq('after the last evening slot, nothing is left today', slotsFor('2026-09-25', at(23, 30)), []);

// The concerns box stops at 200 words.
eq('limitWords keeps short text', limitWords('a b c'), 'a b c');
eq('limitWords caps at 200', limitWords(Array(250).fill('w').join(' ')).split(' ').length, 200);
console.log(`booking: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
