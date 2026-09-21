import '@/presentation/i18n';

import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, useFonts } from '@expo-google-fonts/poppins';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Appearance, LogBox, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { useGetMeQuery } from '@/data/api/userApi';
import { OfflineBanner, SideMenu } from '@/presentation/components';
import { useNetworkStatus } from '@/presentation/hooks/useNetworkStatus';
import { useAppDispatch } from '@/presentation/state/hooks/useAppDispatch';
import { useAppSelector } from '@/presentation/state/hooks/useAppSelector';
import { selectIsInitialized } from '@/presentation/state/selectors/appSelectors';
import { selectIsAuthenticated } from '@/presentation/state/selectors/authSelectors';
import { selectLanguage } from '@/presentation/state/selectors/languageSelectors';
import { selectThemeMode } from '@/presentation/state/selectors/themeSelectors';
import { persistor, store } from '@/presentation/state/store';
import { initializeApp } from '@/presentation/state/thunks/sessionThunks';
import { useTheme } from '@/presentation/theme/useTheme';

SplashScreen.preventAutoHideAsync();

// Development only: Expo Go's live-reload socket can drop on some networks and paints this notice over the bottom of the screen.
LogBox.ignoreLogs(['Cannot connect to Expo CLI']);

function AppShell() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { colors, scheme } = useTheme();
  const isInitialized = useAppSelector(selectIsInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const language = useAppSelector(selectLanguage);
  const themeMode = useAppSelector(selectThemeMode);

  const [fontsLoaded, fontError] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold });

  useNetworkStatus();

  useEffect(() => {
    dispatch(initializeApp());
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized && (fontsLoaded || fontError)) SplashScreen.hideAsync();
  }, [isInitialized, fontsLoaded, fontError]);

  // Redux owns the language / theme choice; mirror it into i18n and the native appearance (alerts, keyboard).
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    // Not implemented by react-native-web.
    if (typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(themeMode === 'system' ? 'unspecified' : themeMode);
    }
  }, [themeMode]);

  // Loads the signed-in user's profile + permissions into the RTK Query cache.
  useGetMeQuery(undefined, { skip: !isAuthenticated });

  if (!isInitialized || !(fontsLoaded || fontError)) return null;

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <OfflineBanner />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: colors.background },
          }}>
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="book/index" options={{ title: t('booking.chooseService') }} />
            <Stack.Screen name="book/doctor" options={{ title: t('booking.chooseDoctor') }} />
            <Stack.Screen name="book/pet" options={{ title: t('booking.choosePet') }} />
            <Stack.Screen name="book/schedule" options={{ title: t('booking.chooseDate') }} />
            <Stack.Screen name="book/confirm" options={{ title: t('booking.review') }} />
            <Stack.Screen name="appointment/[id]" options={{ title: t('appointments.detailTitle') }} />
            <Stack.Screen name="appointment/reschedule/[id]" options={{ title: t('appointments.rescheduleTitle') }} />
            <Stack.Screen name="pet/[id]" options={{ title: t('pets.details') }} />
            <Stack.Screen name="pet/form" options={{ title: t('pets.add') }} />
            <Stack.Screen name="records/index" options={{ title: t('records.title') }} />
            <Stack.Screen name="records/[id]" options={{ title: t('records.detailTitle') }} />
            <Stack.Screen name="records/prescriptions" options={{ title: t('medical.prescription') }} />
            <Stack.Screen name="records/lab-reports" options={{ title: t('medical.labReports') }} />
            <Stack.Screen name="records/upload" options={{ title: t('upload.title') }} />
            <Stack.Screen name="refer" options={{ title: t('refer.title') }} />
            <Stack.Screen name="coupons" options={{ title: t('coupons.title') }} />
            <Stack.Screen name="membership" options={{ title: t('membership.title') }} />
            <Stack.Screen name="invoices" options={{ title: t('invoices.title') }} />
            <Stack.Screen name="profile-edit" options={{ title: t('profile.editTitle') }} />
            <Stack.Screen name="blog/index" options={{ title: t('blog.title') }} />
            <Stack.Screen name="blog/[slug]" options={{ title: t('blog.title') }} />
            <Stack.Screen name="vaccination" options={{ title: t('vaccination.title') }} />
            <Stack.Screen name="help" options={{ title: t('help.title') }} />
            <Stack.Screen name="contact-support" options={{ title: t('contact.title') }} />
            <Stack.Screen name="privacy-policy" options={{ title: t('privacy.title') }} />
            <Stack.Screen name="delete-account" options={{ title: t('deleteAccount.title') }} />
          </Stack.Protected>
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
        {isAuthenticated ? <SideMenu /> : null}
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <AppShell />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
