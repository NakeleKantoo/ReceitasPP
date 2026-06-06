import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getAdminReports } from '@/services/adminService';
import { spacing } from '@/theme/spacing';
import type { AdminReports } from '@/types/admin';

export default function RelatoriosScreen() {
  const { colors } = useAppTheme();
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReports() {
      try {
        setError('');
        setReports(await getAdminReports());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os relatorios.');
      }
    }

    void loadReports();
  }, []);

  if (!reports && !error) {
    return (
      <Screen title="Relatorios" subtitle="Consolidando indicadores administrativos reais.">
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.item, { color: colors.mutedText }]}>Carregando relatorios...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Relatorios" subtitle="Nao foi possivel consolidar os indicadores.">
        <EmptyState title="Falha ao carregar relatorios" description={error} />
      </Screen>
    );
  }

  return (
    <Screen
      title="Relatorios"
      subtitle="Resumo administrativo real por categoria, autor e status de moderacao.">
      <SectionTitle title="Categorias mais usadas" />
      <View style={styles.list}>
        {reports?.categories.length ? (
          reports.categories.map((item) => (
            <Text key={item.label} style={[styles.item, { color: colors.text }]}>
              - {item.label}: {item.value}
            </Text>
          ))
        ) : (
          <EmptyState title="Sem dados de categorias" description="Cadastre receitas para gerar relatorios." />
        )}
      </View>

      <SectionTitle title="Autores com mais receitas" />
      <View style={styles.list}>
        {reports?.authors.map((item) => (
          <Text key={item.label} style={[styles.item, { color: colors.text }]}>
            - {item.label}: {item.value}
          </Text>
        ))}
      </View>

      <SectionTitle title="Receitas por status" />
      <View style={styles.list}>
        {reports?.statuses.map((item) => (
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
