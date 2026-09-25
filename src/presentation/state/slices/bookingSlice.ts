import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { BookingDraft, Service } from '@/domain/entities';

// Client-side draft carried into the booking form (shape defined in the domain layer).
export type BookingState = BookingDraft;

const initialState: BookingState = {
  selectedService: null,
  couponCode: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    serviceSelected: (state, { payload }: PayloadAction<Service>) => {
      state.selectedService = payload;
    },
    couponChanged: (state, { payload }: PayloadAction<string | null>) => {
      state.couponCode = payload;
    },
    bookingReset: () => initialState,
  },
});

export const {
  serviceSelected,
  couponChanged,
  bookingReset,
} = bookingSlice.actions;
export default bookingSlice.reducer;
