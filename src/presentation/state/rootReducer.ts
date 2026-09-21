import { combineReducers } from '@reduxjs/toolkit';

import { baseApi } from '@/data/api/baseApi';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import languageReducer from './slices/languageSlice';
import themeReducer from './slices/themeSlice';

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  app: appReducer,
  auth: authReducer,
  booking: bookingReducer,
  language: languageReducer,
  theme: themeReducer,
});

// Only these slices are persisted (via AsyncStorage). Auth tokens go to secure storage instead,
// and server data is always refetched through RTK Query.
export const PERSISTED_SLICES = ['theme', 'language'] as const;
