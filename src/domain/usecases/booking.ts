import type { AppointmentInput, BookingDraft } from '../entities';

export type CompleteBookingDraft = BookingDraft & {
  selectedService: NonNullable<BookingDraft['selectedService']>;
  selectedDoctor: NonNullable<BookingDraft['selectedDoctor']>;
  petId: number;
  selectedDate: string;
  selectedTime: string;
};

export const isBookingComplete = (draft: BookingDraft): draft is CompleteBookingDraft =>
  !!draft.selectedService && !!draft.selectedDoctor && draft.petId !== null && !!draft.selectedDate && !!draft.selectedTime;

export const toAppointmentInput = (draft: CompleteBookingDraft): AppointmentInput => ({
  petId: draft.petId,
  doctorId: draft.selectedDoctor.id,
  serviceId: draft.selectedService.id,
  date: draft.selectedDate,
  time: draft.selectedTime,
  reason: draft.selectedService.name,
  notes: draft.notes.trim() || undefined,
  couponCode: draft.couponCode ?? undefined,
});
