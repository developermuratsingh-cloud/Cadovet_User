export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  petId: number;
  petName: string;
  doctorId: number | null;
  doctorName: string | null;
  serviceId: number | null;
  serviceName: string | null;
  servicePrice: number | null;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  reason: string | null;
  notes: string | null;
  status: AppointmentStatus;
  couponCode: string | null;
  discountAmount: number;
}

export interface AppointmentInput {
  petId: number;
  doctorId: number;
  serviceId: number | null;
  date: string;
  time: string;
  reason?: string;
  notes?: string;
  couponCode?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
