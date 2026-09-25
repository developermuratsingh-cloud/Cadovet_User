import type { PetGender } from './pet';
import type { Service } from './service';

// The service (and coupon) chosen before the booking form opens, e.g. from a Home or Vaccination shortcut.
export interface BookingDraft {
  selectedService: Service | null;
  couponCode: string | null;
}


// The website's "Book Home Visit" form: owner and pet details travel with the booking.
export interface HomeVisitInput {
  ownerName: string;
  phone: string; // 10 digits
  email?: string;
  petName: string;
  species: string;
  breed: string;
  ageYears: number;
  gender: PetGender;
  isAggressive: boolean;
  serviceId?: number; // omitted for the default Home Visit Consultation, which the server finds by name
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // "10:00 AM"
  address: string;
  notes: string;
  totalAmount: number;
}

export interface HomeVisitConfirmation {
  appointmentId: number;
  customerName: string;
  petName: string;
  date: string;
  time: string;
}
