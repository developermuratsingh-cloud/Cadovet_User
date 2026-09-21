import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { BookingDraft, Doctor, Service } from '@/domain/entities';

// Client-side draft of the booking wizard (shape defined in the domain layer).
export type BookingState = BookingDraft;

const initialState: BookingState = {
  selectedService: null,
  selectedDoctor: null,
  petId: null,
  selectedDate: null,
  selectedTime: null,
  notes: '',
  couponCode: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    serviceSelected: (state, { payload }: PayloadAction<Service>) => {
      state.selectedService = payload;
    },
    doctorSelected: (state, { payload }: PayloadAction<Doctor>) => {
      state.selectedDoctor = payload;
      // Availability is per doctor, so a previously chosen slot is no longer valid.
      state.selectedDate = null;
      state.selectedTime = null;
    },
    petSelected: (state, { payload }: PayloadAction<number>) => {
      state.petId = payload;
    },
    dateSelected: (state, { payload }: PayloadAction<string>) => {
      state.selectedDate = payload;
      state.selectedTime = null;
    },
    timeSelected: (state, { payload }: PayloadAction<string>) => {
      state.selectedTime = payload;
    },
    notesChanged: (state, { payload }: PayloadAction<string>) => {
      state.notes = payload;
    },
    couponChanged: (state, { payload }: PayloadAction<string | null>) => {
      state.couponCode = payload;
    },
    bookingReset: () => initialState,
  },
});

export const {
  serviceSelected,
  doctorSelected,
  petSelected,
  dateSelected,
  timeSelected,
  notesChanged,
  couponChanged,
  bookingReset,
} = bookingSlice.actions;
export default bookingSlice.reducer;
