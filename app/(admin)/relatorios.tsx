import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getDashboardStats } from '@/services/adminService';
import { spacing } from '@/theme/spacing';

export default function RelatoriosScreen() {
  const { colors } = useAppTheme();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);

  useEffect(() => {
    async function loadReports() {
      const nextStats = await getDashboardStats();
      setStats(nextStats);
    }

    void loadReports();
  }, []);

  if (!stats) {
    return (
      <Screen title="Relatorios" subtitle="Consolidando indicadores administrativos.">
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.item, { color: colors.mutedText }]}>Carregando relatorios...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title="Relatorios"
      subtitle="Leitura rapida das tendencias de categoria, ingredientes e buscas do app.">
      <SectionTitle title="Categorias mais usadas" />
      <View style={styles.list}>
        {stats.topCategories.map((item) => (
          <Text key={item.label} style={[styles.item, { color: colors.text }]}>
            - {item.label}: {item.value}
          </Text>
        ))}
      </View>

      <SectionTitle title="Ingredientes mais usados nas receitas" />
      <View style={styles.list}>
        {stats.topUsedIngredients.map((item) => (
          <Text key={item.label} style={[styles.item, { color: colors.text }]}>
            - {item.label}: {item.value}
          </Text>
        ))}
      </View>

      <SectionTitle title="Ingredientes mais pesquisados" />
      <View style={styles.list}>
        {stats.topSearchedIngredients.map((item) => (
          <Text key={item.label} style={[styles.item, { color: colors.text }]}>
            - {item.label}: {item.value}
          </Text>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 140,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    fontSize: 15,
    lineHeight: 22,
  },
});
