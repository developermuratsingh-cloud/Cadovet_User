import { createSelector } from '@reduxjs/toolkit';

import { isBookingComplete } from '@/domain/usecases/booking';
import type { RootState } from '../store';

export const selectBooking = (state: RootState) => state.booking;
export const selectBookingReady = createSelector(selectBooking, isBookingComplete);
