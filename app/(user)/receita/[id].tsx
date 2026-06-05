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
import { formatDuration, formatServings, formatUnit } from '@/utils/formatters';
import { useEffect, useState } from 'react';
import { Recipe } from '@/types/recipe';

import { ChevronRight } from 'lucide-react-native';

export default function ReceitaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { ingredientCatalog, getRecipeById } = useRecipes();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [recipe, setRecipe] = useState(null as Recipe | null);

  useEffect(() => {
    async function populate(id:string) {
      setRecipe(await getRecipeById(id));
    }

    populate(id);
  }, [])

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
    <Screen title={recipe.nome}>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.meta, { color: colors.primary }]}>{recipe.refeicao}</Text>
        <Text style={[styles.meta, { color: colors.text }]}>{formatDuration(recipe.tempoPreparo)}</Text>
        <Text style={[styles.meta, { color: colors.text }]}>{formatServings(recipe.porcoes)}</Text>
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
        {recipe.ingredientes.map((ingredient) => {
          const ingredientName = ingredient.ingrediente?.nome;

          return (
            <View key={`${recipe.id}-${ingredient.id}`} style={{flexDirection: 'row'}}>
            <ChevronRight color={'#fff'}/>
            <Text style={[styles.item, { color: colors.text }]}>
              {ingredientName}: {ingredient.quantidade}
              {formatUnit(ingredient.ingrediente?.unidade)}
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
});
