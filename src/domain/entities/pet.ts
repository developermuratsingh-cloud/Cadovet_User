export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  gender: PetGender;
  dateOfBirth: string | null; // YYYY-MM-DD
  weight: number | null;
  color: string | null;
  bloodGroup: string | null;
  isNeutered: boolean;
  isVaccinated: boolean;
  allergies: string | null;
  notes: string | null;
}

export type PetInput = Partial<Omit<Pet, 'id'>> & Pick<Pet, 'name' | 'species'>;
