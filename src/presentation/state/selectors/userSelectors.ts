import { createSelector } from '@reduxjs/toolkit';

import { userApi } from '@/data/api/userApi';
import type { RootState } from '../store';

// The signed-in user lives in the RTK Query cache (single source of truth), exposed through selectors.
const selectMeResult = userApi.endpoints.getMe.select();

export const selectCurrentUser = createSelector(selectMeResult, (r) => r.data?.profile ?? null);
export const selectPermissions = createSelector(selectMeResult, (r) => r.data?.permissions ?? []);
export const selectHasPermission = (permission: string) => (state: RootState) =>
  selectPermissions(state).includes(permission);
