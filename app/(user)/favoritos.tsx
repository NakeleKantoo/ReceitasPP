import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { OfflineNotice } from '@/components/OfflineNotice';
import { RecipeCard } from '@/components/RecipeCard';
import { Screen } from '@/components/Screen';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';

export default function FavoritosScreen() {
  const router = useRouter();
  const { allRecipes } = useRecipes();
  const { favoriteRecipeIds, favoriteRecipes, isFavorite, removeFavorite } = useFavorites();

  const recipesFromCatalog = allRecipes.filter((recipe) => favoriteRecipeIds.includes(recipe.id));
  const offlineOnlyFavorites = favoriteRecipes.filter(
    (recipe) => !recipesFromCatalog.some((catalogRecipe) => catalogRecipe.id === recipe.id)
  );
  const displayedFavoriteRecipes = [...recipesFromCatalog, ...offlineOnlyFavorites];
  const isShowingOfflineFavorites = offlineOnlyFavorites.length > 0;

  return (
    <Screen
      title="Favoritos"
      subtitle="Receitas marcadas por voce ficam vinculadas ao usuario logado e persistidas localmente.">
      {isShowingOfflineFavorites ? (
        <OfflineNotice message="Sem internet. Exibindo receitas favoritadas salvas localmente." />
      ) : null}

      <View style={styles.list}>
        {displayedFavoriteRecipes.length === 0 ? (
          <EmptyState
            title="Nenhum favorito salvo"
            description="Abra uma receita e toque na estrela para guardar as suas favoritas."
          />
        ) : (
          displayedFavoriteRecipes.map((recipe) => (
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
