import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { StatCard } from '@/components/StatCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getDashboardStats } from '@/services/adminService';
import { spacing } from '@/theme/spacing';

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const nextStats = await getDashboardStats();
      setStats(nextStats);
    }

    void loadDashboard();
  }, []);

  if (!stats) {
    return (
      <Screen title="Dashboard admin" subtitle="Carregando indicadores do Receitas++.">
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Preparando o resumo administrativo.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title="Dashboard admin"
      subtitle="Visao inicial para o superadmin acompanhar usuarios, receitas e uso do sistema.">
      <View style={styles.grid}>
        <StatCard label="Usuarios" value={stats.totalUsers} />
        <StatCard label="Receitas" value={stats.totalRecipes} accent="secondary" />
        <StatCard label="Pendentes" value={stats.pendingRecipes} />
        <StatCard label="Aprovadas" value={stats.approvedRecipes} accent="secondary" />
        <StatCard label="Favoritos" value={stats.totalFavorites} />
      </View>

      <View style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.noteTitle, { color: colors.text }]}>Painel inicial</Text>
        <Text style={[styles.noteText, { color: colors.mutedText }]}>
          A autenticacao local e as rotas protegidas ja estao ativas. Nesta fase o superadmin consegue
          entrar, visualizar o catalogo geral e acompanhar os dados mockados do sistema.
        </Text>
      </View>

      <SectionTitle title="Top categorias" subtitle="Resumo simples derivado das receitas mockadas." />
      <View style={styles.list}>
        {stats.topCategories.map((item) => (
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
  noteCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 21,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    fontSize: 15,
    lineHeight: 22,
  },
});
