export interface Prescription {
  id: number;
  medicineName: string;
  dosage: string | null;
  frequency: string | null;
  durationDays: number | null;
  instructions: string | null;
}

export interface MedicalRecord {
  id: number;
  petId: number;
  petName: string;
  doctorName: string | null;
  visitDate: string; // YYYY-MM-DD
  symptoms: string | null;
  diagnosis: string | null;
  treatmentNotes: string | null;
  temperatureF: number | null;
  weightKg: number | null;
  followUpDate: string | null;
  prescriptions: Prescription[];
}
