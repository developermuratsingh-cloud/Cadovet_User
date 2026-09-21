import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { fromDateString, monthGrid } from '@/domain/usecases/dates';
import { useAppSelector } from '../state/hooks/useAppSelector';
import { selectLanguage } from '../state/selectors/languageSelectors';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

interface Props {
  value: string | null; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate: string; // earliest selectable day (past days are shown but disabled)
  maxDate: string; // latest selectable day
}

// Month calendar. Days before `minDate` or after `maxDate` are greyed out and cannot be selected.
export function DatePicker({ value, onChange, minDate, maxDate }: Props) {
  const { colors, radius } = useTheme();
  const language = useAppSelector(selectLanguage);
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';

  const start = fromDateString(value && value >= minDate && value <= maxDate ? value : minDate);
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() });

  const min = fromDateString(minDate);
  const max = fromDateString(maxDate);
  const index = (y: number, m: number) => y * 12 + m;
  const canGoBack = index(view.year, view.month) > index(min.getFullYear(), min.getMonth());
  const canGoForward = index(view.year, view.month) < index(max.getFullYear(), max.getMonth());

  const cells = useMemo(() => monthGrid(view.year, view.month), [view]);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + i).toLocaleDateString(locale, { weekday: 'narrow' })), [locale]);
  const title = new Date(view.year, view.month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const today = minDate;

  const step = (delta: number) => setView((v) => {
    const d = new Date(v.year, v.month + delta, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const Arrow = ({ dir, enabled }: { dir: -1 | 1; enabled: boolean }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dir === -1 ? 'Previous month' : 'Next month'}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={() => step(dir)}
      hitSlop={8}
      style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight, opacity: enabled ? 1 : 0.35 }}>
      <Ionicons name={dir === -1 ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.primaryDark} />
    </Pressable>
  );

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg - 4, borderWidth: 1, borderColor: colors.border, padding: 12, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Arrow dir={-1} enabled={canGoBack} />
        <AppText variant="subheading">{title}</AppText>
        <Arrow dir={1} enabled={canGoForward} />
      </View>

      <View style={{ flexDirection: 'row' }}>
        {weekdays.map((w, i) => (
          <View key={i} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 }}>
            <AppText variant="caption" color="textMuted" style={{ fontFamily: fonts.semibold }}>{w}</AppText>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, i) => {
          if (!day) return <View key={`b${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
          const disabled = day < minDate || day > maxDate;
          const selected = day === value;
          const isToday = day === today;
          return (
            <View key={day} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={fromDateString(day).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                accessibilityState={{ disabled, selected }}
                disabled={disabled}
                onPress={() => onChange(day)}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? colors.primary : 'transparent',
                  borderWidth: isToday && !selected ? 1.5 : 0,
                  borderColor: colors.primary,
                  opacity: disabled ? 0.28 : 1,
                }}>
                <AppText style={{ fontFamily: selected || isToday ? fonts.bold : fonts.regular, fontSize: 14, color: selected ? colors.onPrimary : colors.text, textDecorationLine: disabled && day < minDate ? 'line-through' : 'none' }}>
                  {Number(day.slice(8))}
                </AppText>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
