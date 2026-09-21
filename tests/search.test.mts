import { filterServices } from '../src/domain/usecases/search.ts';

const svc = (id: number, name: string, category: string, description: string | null = null) => ({ id, name, category, description, price: 100, durationMinutes: 30 });
const all = [
  svc(1, 'General Checkup & Consultation', 'Consultation', 'Comprehensive physical examination'),
  svc(2, 'Rabies Vaccination & Tag', 'Preventive Care', 'Annual anti-rabies vaccine'),
  svc(3, 'Puppy & Kitten Core Vaccination', 'Preventive Care', 'DHLPP/FVRCP core immunization shots'),
  svc(4, 'Complete Pet Grooming & Spa', 'Grooming', 'Medicated bath, nail clipping'),
];
let pass = 0, fail = 0;
const ids = (q: string) => filterServices(all, q).map((s) => s.id);
const eq = (name: string, got: unknown, want: unknown) => { JSON.stringify(got) === JSON.stringify(want) ? pass++ : (fail++, console.log('FAIL', name, JSON.stringify(got), '!=', JSON.stringify(want))); };

eq('empty query returns everything', ids(''), [1, 2, 3, 4]);
eq('whitespace only returns everything', ids('   '), [1, 2, 3, 4]);
eq('matches name (case-insensitive)', ids('GROOMING'), [4]);
eq('partial word', ids('vaccin'), [2, 3]);
eq('matches category', ids('preventive'), [2, 3]);
eq('matches description', ids('nail'), [4]);
eq('all words must match', ids('rabies tag'), [2]);
eq('words in any order', ids('tag rabies'), [2]);
eq('no match', ids('zzz'), []);
eq('extra spaces ignored', ids('  puppy   kitten '), [3]);
console.log(`search: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
