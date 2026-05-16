import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { RecipeCard } from '@/components/RecipeCard';
import { Screen } from '@/components/Screen';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';

export default function ResultadosScreen() {
  const router = useRouter();
  const { compatibleRecipes, latestAvailableIngredients } = useRecipes();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <Screen
      title="Receitas compativeis"
      subtitle="Aqui aparecem apenas as receitas aprovadas que combinam com todos os ingredientes e quantidades informados.">
      {latestAvailableIngredients.length === 0 ? (
        <EmptyState
          title="Nenhuma busca realizada"
          description="Volte para a tela de ingredientes, monte sua despensa e rode o filtro inteligente."
        />
      ) : compatibleRecipes.length === 0 ? (
        <EmptyState
          title="Nenhuma receita possivel"
          description="Com as quantidades informadas, nenhuma receita aprovada ficou totalmente compativel."
        />
      ) : (
        <View style={styles.list}>
          {compatibleRecipes.map((recipe) => (
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
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});
