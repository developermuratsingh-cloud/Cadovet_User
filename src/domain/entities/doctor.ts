export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  qualification: string | null;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  bio: string | null;
}
