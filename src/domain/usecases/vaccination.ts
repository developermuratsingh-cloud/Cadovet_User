import type { Appointment, Pet, Service } from '../entities';
import { isUpcoming } from './appointments';

const VACCINATION = /vaccin/i;

export const isVaccinationService = (s: Pick<Service, 'name' | 'category'>): boolean => VACCINATION.test(`${s.name} ${s.category}`);

const isVaccinationAppointment = (a: Appointment): boolean => VACCINATION.test(`${a.serviceName ?? ''} ${a.reason ?? ''}`);

export interface PetVaccination {
  pet: Pet;
  isVaccinated: boolean; // the flag recorded on the pet's profile
  lastDate: string | null; // most recent completed vaccination visit
  next: Appointment | null; // earliest upcoming vaccination visit
}

/** Combines each pet's profile flag with its completed and upcoming vaccination appointments. */
export const vaccinationSummary = (pets: Pet[], appointments: Appointment[], now: Date = new Date()): PetVaccination[] =>
  pets.map((pet) => {
    const visits = appointments.filter((a) => a.petId === pet.id && isVaccinationAppointment(a));
    const completed = visits.filter((a) => a.status === 'COMPLETED').sort((a, b) => b.date.localeCompare(a.date));
    const upcoming = visits
      .filter((a) => isUpcoming(a, now))
      .sort((a, b) => `${a.date}`.localeCompare(`${b.date}`));
    return { pet, isVaccinated: pet.isVaccinated, lastDate: completed[0]?.date ?? null, next: upcoming[0] ?? null };
  });
