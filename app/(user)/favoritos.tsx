import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { RecipeCard } from '@/components/RecipeCard';
import { Screen } from '@/components/Screen';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';

export default function FavoritosScreen() {
  const router = useRouter();
  const { allRecipes } = useRecipes();
  const { favoriteRecipeIds, isFavorite, removeFavorite } = useFavorites();

  const favoriteRecipes = allRecipes.filter((recipe) => favoriteRecipeIds.includes(recipe.id));

  return (
    <Screen
      title="Favoritos"
      subtitle="Receitas marcadas por voce ficam vinculadas ao usuario logado e persistidas localmente.">
      <View style={styles.list}>
        {favoriteRecipes.length === 0 ? (
          <EmptyState
            title="Nenhum favorito salvo"
            description="Abra uma receita e toque na estrela para guardar suas favoritas."
          />
        ) : (
          favoriteRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={isFavorite(recipe.id)}
              onToggleFavorite={() => {
                void removeFavorite(recipe.id);
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
  list: {
    gap: spacing.md,
  },
});
