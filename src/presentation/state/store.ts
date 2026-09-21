import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

import { baseApi } from '@/data/api/baseApi';
import { listenerMiddleware } from './listeners';
import { PERSISTED_SLICES, rootReducer } from './rootReducer';

const persistedReducer = persistReducer(
  { key: 'cadovet', storage: AsyncStorage, whitelist: [...PERSISTED_SLICES] },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    })
      .prepend(listenerMiddleware.middleware)
      .concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
