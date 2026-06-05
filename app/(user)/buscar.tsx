import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { RecipeCard } from '@/components/RecipeCard';
import { Screen } from '@/components/Screen';
import { useFavorites } from '@/hooks/useFavorites';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';

export default function BuscarScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { approvedRecipes, categories } = useRecipes();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return approvedRecipes.filter((recipe) => {
      const matchesQuery =
        !normalizedQuery ||
        recipe.nome.toLowerCase().includes(normalizedQuery) ||
        recipe.description.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === 'Todas' || recipe.refeicao === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [approvedRecipes, query, selectedCategory]);

  return (
    <Screen
      title="Buscar receitas"
      subtitle="Pesquise por nome e refine o catalogo por categoria antes de abrir os detalhes.">
      <Input
        label="Pesquisar por nome"
        value={query}
        onChangeText={setQuery}
        placeholder="Ex.: omelete, bolo, frango..."
      />

      <View style={styles.chips}>
        {categories.map((category) => (
          <Pressable
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.chip,
              {
                backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
                borderColor: selectedCategory === category ? colors.primary : colors.border,
              },
            ]}>
            <Text style={{ color: selectedCategory === category ? '#fff' : colors.text, fontWeight: '600' }}>
              {category}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.list}>
        {filteredRecipes.length === 0 ? (
          <EmptyState
            title="Nenhuma receita encontrada"
            description="Tente outro nome ou limpe o filtro de categoria para ampliar os resultados."
          />
        ) : (
          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={isFavorite(recipe.id)}
              onToggleFavorite={() => {
                void toggleFavorite(recipe.id);
              }}
              onPress={() =>
                router.push({
                  pathname: '/(user)/receita/[id]',
                  params: { id: recipe.id },
                })
              }
            />
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
});
