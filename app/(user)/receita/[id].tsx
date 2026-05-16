import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { useFavorites } from '@/hooks/useFavorites';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';
import { formatDuration, formatServings, formatStatus, formatUnit } from '@/utils/formatters';

export default function ReceitaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { ingredientCatalog, getRecipeById } = useRecipes();
  const { isFavorite, toggleFavorite } = useFavorites();

  const recipe = id ? getRecipeById(id) : undefined;

  if (!recipe) {
    return (
      <Screen title="Receita nao encontrada">
        <EmptyState
          title="Receita indisponivel"
          description="Nao foi possivel localizar a receita nos dados atuais."
        />
      </Screen>
    );
  }

  return (
    <Screen title={recipe.title} subtitle={recipe.description}>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.meta, { color: colors.primary }]}>{recipe.category}</Text>
        <Text style={[styles.meta, { color: colors.text }]}>{formatDuration(recipe.preparationTime)}</Text>
        <Text style={[styles.meta, { color: colors.text }]}>{formatServings(recipe.servings)}</Text>
        <Text style={[styles.meta, { color: colors.secondary }]}>{formatStatus(recipe.status)}</Text>
      </View>

      <Button
        title={isFavorite(recipe.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        onPress={() => {
          void toggleFavorite(recipe.id);
        }}
        variant={isFavorite(recipe.id) ? 'ghost' : 'primary'}
      />

      <SectionTitle title="Ingredientes" />
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {recipe.ingredients.map((ingredient) => {
          const ingredientName =
            ingredientCatalog.find((item) => item.id === ingredient.ingredientId)?.name ??
            ingredient.ingredientId;

          return (
            <Text key={`${recipe.id}-${ingredient.ingredientId}`} style={[styles.item, { color: colors.text }]}>
              - {ingredientName}: {ingredient.quantity}
              {formatUnit(ingredient.unit)}
            </Text>
          );
        })}
      </View>

      <SectionTitle title="Modo de preparo" />
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {recipe.preparationMode.map((step, index) => (
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
});
