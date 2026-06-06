import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getAllAdminRecipes, moderateRecipe, removeRecipeAsAdmin } from '@/services/adminService';
import { spacing } from '@/theme/spacing';
import type { Recipe } from '@/types/recipe';
import { formatDate } from '@/utils/formatters';

export default function AprovacoesScreen() {
  const { colors } = useAppTheme();
  const [pendingRecipes, setPendingRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPendingRecipes = async () => {
    try {
      setIsLoading(true);
      setError('');
      setPendingRecipes(await getAllAdminRecipes('pending'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar as pendencias.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPendingRecipes();
  }, []);

  const handleModeration = async (recipeId: number, nextStatus: 'approved' | 'rejected') => {
    try {
      await moderateRecipe(recipeId, nextStatus);
      Alert.alert(
        nextStatus === 'approved' ? 'Receita aprovada' : 'Receita rejeitada',
        'A alteracao foi salva no backend.'
      );
      await loadPendingRecipes();
    } catch (moderationError) {
      Alert.alert('Erro', moderationError instanceof Error ? moderationError.message : 'Nao foi possivel moderar.');
    }
  };

  const handleDelete = async (recipeId: number) => {
    try {
      await removeRecipeAsAdmin(recipeId);
      Alert.alert('Receita removida', 'A receita foi removida da base.');
      await loadPendingRecipes();
    } catch (deleteError) {
      Alert.alert('Erro', deleteError instanceof Error ? deleteError.message : 'Nao foi possivel remover.');
    }
  };

  return (
    <Screen
      title="Receitas pendentes"
      subtitle="Fila administrativa real para aprovar, rejeitar ou remover receitas submetidas.">
      <View style={styles.list}>
        {isLoading ? (
          <EmptyState title="Carregando pendencias" description="Consultando receitas pendentes no backend." />
        ) : error ? (
          <EmptyState title="Falha ao carregar pendencias" description={error} />
        ) : pendingRecipes.length === 0 ? (
          <EmptyState title="Sem pendencias" description="Nao ha receitas pendentes neste momento." />
        ) : (
          pendingRecipes.map((recipe) => (
            <View
              key={recipe.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>{recipe.nome}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>Categoria: {recipe.refeicao}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>
                Autor: {recipe.autor?.username ?? 'Sem autor'}
              </Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>Criada em {formatDate(recipe.createdAt)}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]} numberOfLines={3}>
                Passos: {recipe.passos}
              </Text>
              <View style={styles.actions}>
                <Button title="Aprovar" onPress={() => void handleModeration(recipe.id, 'approved')} fullWidth={false} />
                <Button
                  title="Rejeitar"
                  onPress={() => void handleModeration(recipe.id, 'rejected')}
                  variant="ghost"
                  fullWidth={false}
                />
                <Button
                  title="Remover"
                  onPress={() => void handleDelete(recipe.id)}
                  variant="danger"
                  fullWidth={false}
                />
              </View>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
