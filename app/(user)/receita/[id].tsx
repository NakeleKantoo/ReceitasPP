import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { OfflineNotice } from '@/components/OfflineNotice';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { useFavorites } from '@/hooks/useFavorites';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';
import { formatDuration, formatMealCategory, formatServings, formatUnit } from '@/utils/formatters';
import { useEffect, useState } from 'react';
import type { Recipe } from '@/types/recipe';

export default function ReceitaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { getRecipeById } = useRecipes();
  const { getFavoriteRecipe, isFavorite, toggleFavorite } = useFavorites();

  const [recipe, setRecipe] = useState(null as Recipe | null);
  const [isOfflineFavorite, setIsOfflineFavorite] = useState(false);

  useEffect(() => {
    async function populate() {
      if (!id) {
        return;
      }

      try {
        setRecipe(await getRecipeById(Number(id)));
        setIsOfflineFavorite(false);
      } catch {
        const favoriteRecipe = getFavoriteRecipe(Number(id));
        setRecipe(favoriteRecipe);
        setIsOfflineFavorite(Boolean(favoriteRecipe));
      }
    }

    void populate();
  }, [getFavoriteRecipe, getRecipeById, id]);

  if (!recipe) {
    return (
      <Screen title="Receita não encontrada" showBackButton>
        <EmptyState
          title="Receita indisponível"
          description="Não foi possível localizar a receita nos dados atuais."
        />
      </Screen>
    );
  }

  return (
    <Screen title={recipe.nome} showBackButton>
      {isOfflineFavorite ? (
        <OfflineNotice message="Sem internet. Exibindo os detalhes salvos localmente desta receita favoritada." />
      ) : null}
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.meta, { color: colors.primary }]}>{formatMealCategory(recipe.refeicao)}</Text>
        <Text style={[styles.meta, { color: colors.text }]}>{formatDuration(recipe.tempoPreparo)}</Text>
        <Text style={[styles.meta, { color: colors.text }]}>{formatServings(recipe.porcoes)}</Text>
      </View>

      <Button
        title={isFavorite(recipe.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        onPress={() => {
          void toggleFavorite(recipe.id, recipe);
        }}
        variant={isFavorite(recipe.id) ? 'ghost' : 'primary'}
      />

      <SectionTitle title="Ingredientes" />
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {recipe.ingredientes.map((ingredient) => {
          const ingredientName = ingredient.ingrediente?.nome;

          return (
            <View key={`${recipe.id}-${ingredient.id}`} style={styles.ingredientRow}>
              <Text style={[styles.bullet, { color: colors.primary }]}>-</Text>
              <Text style={[styles.item, { color: colors.text }]}>
                {ingredientName}: {ingredient.quantidade} {formatUnit(ingredient.ingrediente?.unidade)}
              </Text>
            </View>
          );
        })}
      </View>

      <SectionTitle title="Modo de preparo" />
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {recipe.passos.split('\n').map((step, index) => (
          <Text key={`${recipe.id}-step-${index}`} style={[styles.item, { color: colors.text }]}>
            {index + 1}. {step}
          </Text>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.xl,
  },
  meta: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  item: {
    fontSize: 15,
    lineHeight: 22,
  },
  ingredientRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bullet: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
});
