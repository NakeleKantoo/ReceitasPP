import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: 'primary' | 'secondary';
}

export function StatCard({ label, value, accent = 'primary' }: StatCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: accent === 'primary' ? colors.primary : colors.secondary,
        },
      ]}>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 5,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minWidth: 140,
    padding: spacing.lg,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
});
