import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getAllAdminRecipes, removeRecipeAsAdmin } from '@/services/adminService';
import { spacing } from '@/theme/spacing';
import type { Recipe, RecipeStatus } from '@/types/recipe';
import { formatDate } from '@/utils/formatters';

const filters: Array<{ label: string; value: 'all' | RecipeStatus }> = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Aprovadas', value: 'approved' },
  { label: 'Rejeitadas', value: 'rejected' },
];

export default function ReceitasAdminScreen() {
  const { colors } = useAppTheme();
  const [selectedFilter, setSelectedFilter] = useState<'all' | RecipeStatus>('all');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecipes = async (status: 'all' | RecipeStatus = selectedFilter) => {
    try {
      setIsLoading(true);
      setError('');
      const result = await getAllAdminRecipes(status === 'all' ? undefined : status);
      setRecipes(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar as receitas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRecipes(selectedFilter);
  }, [selectedFilter]);

  const handleDelete = async (recipeId: number) => {
    try {
      await removeRecipeAsAdmin(recipeId);
      Alert.alert('Receita removida', 'A receita foi removida pelo Superadmin.');
      await loadRecipes(selectedFilter);
    } catch (deleteError) {
      Alert.alert('Erro', deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover.');
    }
  };

  const statusLabels: Record<RecipeStatus, string> = {
    pending: 'Pendente',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
  };

  return (
    <Screen
      title="Todas as receitas"
      subtitle="Catalogo administrativo real com autor, status e remocao administrativa.">
      <View style={styles.chips}>
        {filters.map((filter) => (
          <Pressable
            key={filter.value}
            onPress={() => setSelectedFilter(filter.value)}
            style={[
              styles.chip,
              {
                backgroundColor: selectedFilter === filter.value ? colors.secondary : colors.surface,
                borderColor: selectedFilter === filter.value ? colors.secondary : colors.border,
              },
            ]}>
            <Text style={{ color: selectedFilter === filter.value ? '#fff' : colors.text, fontWeight: '600' }}>
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.list}>
        {isLoading ? (
          <EmptyState title="Carregando receitas" description="Aguarde enquanto o painel consulta o backend." />
        ) : error ? (
          <EmptyState title="Falha ao carregar receitas" description={error} />
        ) : recipes.length === 0 ? (
          <EmptyState title="Nenhuma receita encontrada" description="Nao ha receitas para o filtro selecionado." />
        ) : (
          recipes.map((recipe) => (
            <View key={recipe.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>{recipe.nome}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>Categoria: {recipe.refeicao}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>
                Autor: {recipe.autor?.username ?? 'Sem autor'}
              </Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>Status: {statusLabels[recipe.status]}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>Criada em {formatDate(recipe.createdAt)}</Text>
              <Button title="Remover receita" onPress={() => void handleDelete(recipe.id)} variant="danger" />
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
  },
});
