import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { BookingDraft, Service } from '@/domain/entities';

// Client-side draft of the booking wizard (shape defined in the domain layer).
export type BookingState = BookingDraft;

const initialState: BookingState = {
  selectedService: null,
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
  petSelected,
  dateSelected,
  timeSelected,
  notesChanged,
  couponChanged,
  bookingReset,
} = bookingSlice.actions;
export default bookingSlice.reducer;
