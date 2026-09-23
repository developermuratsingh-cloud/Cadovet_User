import type { Service } from './service';

// In-progress booking wizard state. Availability and final validation are enforced by the backend.
export interface BookingDraft {
  selectedService: Service | null;
  petId: number | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedTime: string | null; // "10:30 AM"
  notes: string;
  couponCode: string | null; // chosen from the Coupon screen or typed on the review step
}
