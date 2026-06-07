import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

interface OfflineNoticeProps {
  message: string;
}

export function OfflineNotice({ message }: OfflineNoticeProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Modo offline ativo</Text>
      <Text style={[styles.message, { color: colors.mutedText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
  },
});
