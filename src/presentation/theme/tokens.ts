// Brand tokens mirrored from the Cado Vet website (cadovet-client/src/index.css).
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  onPrimary: string;
  secondary: string; // brand green (website "Book Appointment" buttons, positive stats)
  lime: string; // website nav highlight / "VET" wordmark
  accent: string;
  success: string;
  warning: string;
  danger: string;
  whatsapp: string;
  emergency: string;
}

export const lightColors: ThemeColors = {
  background: '#EAF6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  text: '#1A2332',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  border: '#D1E8EC',
  primary: '#1BAFBF',
  primaryDark: '#0D9AAA',
  primaryLight: '#E0F7F9',
  onPrimary: '#FFFFFF',
  secondary: '#4CAF50',
  lime: '#84CC16',
  accent: '#FF7043',
  success: '#2E9E4F',
  warning: '#D98200',
  danger: '#D93025',
  whatsapp: '#25D366',
  emergency: '#1A2332',
};

export const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1F2937',
  surfaceAlt: '#111827',
  text: '#EDF2FF',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#2B3648',
  primary: '#5AD6EB',
  primaryDark: '#1DB7D8',
  primaryLight: '#0B2A35',
  onPrimary: '#06222A',
  secondary: '#7AD67A',
  lime: '#A3E635',
  accent: '#FF8A65',
  success: '#7AD67A',
  warning: '#F5B342',
  danger: '#FF6B61',
  whatsapp: '#25D366',
  emergency: '#08111F',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 24, full: 9999 } as const;

// Poppins is the website's body font; weights are separate families so Android renders them correctly.
export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
} as const;

// Teal-tinted elevation, like the website's --shadow-md.
export const shadow = (color: string, level: 'sm' | 'md' | 'lg' = 'md') => {
  const spec = { sm: [2, 8, 0.1, 2], md: [6, 18, 0.16, 4], lg: [12, 30, 0.22, 8] }[level];
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: spec[0] },
    shadowRadius: spec[1],
    shadowOpacity: spec[2],
    elevation: spec[3],
  };
};
