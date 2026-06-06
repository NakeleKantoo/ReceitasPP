import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { StatCard } from '@/components/StatCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getDashboardStats } from '@/services/adminService';
import { spacing } from '@/theme/spacing';
import type { AdminDashboardStats } from '@/types/admin';

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError('');
        const nextStats = await getDashboardStats();
        setStats(nextStats);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar o dashboard.');
      }
    }

    void loadDashboard();
  }, []);

  if (!stats && !error) {
    return (
      <Screen title="Dashboard admin" subtitle="Carregando indicadores administrativos reais.">
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>Buscando metricas do sistema...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Dashboard admin" subtitle="Nao foi possivel carregar os indicadores.">
        <EmptyState title="Falha ao consultar o painel" description={error} />
      </Screen>
    );
  }

  return (
    <Screen
      title="Dashboard admin"
      subtitle="Visao global do sistema para o Superadmin acompanhar usuarios e moderacao de receitas.">
      <View style={styles.grid}>
        <StatCard label="Usuarios" value={stats?.totalUsers ?? 0} />
        <StatCard label="Receitas" value={stats?.totalRecipes ?? 0} accent="secondary" />
        <StatCard label="Pendentes" value={stats?.pendingRecipes ?? 0} />
        <StatCard label="Aprovadas" value={stats?.approvedRecipes ?? 0} accent="secondary" />
        <StatCard label="Rejeitadas" value={stats?.rejectedRecipes ?? 0} />
      </View>

      <SectionTitle title="Categorias com mais receitas" />
      <View style={styles.list}>
        {stats?.topCategories.length ? (
          stats.topCategories.map((item) => (
            <Text key={item.label} style={[styles.item, { color: colors.text }]}>
              - {item.label}: {item.value}
            </Text>
          ))
        ) : (
          <EmptyState title="Sem categorias ainda" description="Nenhuma receita foi cadastrada no sistema." />
        )}
      </View>

      <SectionTitle title="Distribuicao por status" />
      <View style={styles.list}>
        {stats?.recipesByStatus.map((item) => (
          <Text key={item.label} style={[styles.item, { color: colors.text }]}>
            - {item.label}: {item.value}
          </Text>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  loadingState: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 180,
  },
  loadingText: {
    fontSize: 14,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    fontSize: 15,
    lineHeight: 22,
  },
});
