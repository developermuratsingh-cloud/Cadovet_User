import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';

import { useAppDispatch } from '../state/hooks/useAppDispatch';
import { onlineStatusChanged } from '../state/slices/appSlice';

// Mirrors connectivity into the app slice so any screen can react to it.
export function useNetworkStatus() {
  const dispatch = useAppDispatch();
  useEffect(
    () =>
      NetInfo.addEventListener((s) => {
        dispatch(onlineStatusChanged(s.isConnected !== false && s.isInternetReachable !== false));
      }),
    [dispatch],
  );
}
