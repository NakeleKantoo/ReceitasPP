import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { RecipeCard } from '@/components/RecipeCard';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';

export default function MinhasReceitasScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getUserRecipes } = useRecipes();

  const myRecipes = user ? getUserRecipes(user.id) : [];

  return (
    <Screen
      title="Minhas receitas"
      subtitle="Receitas ja vinculadas ao seu usuario mockado, incluindo pendentes e rejeitadas.">
      <View style={styles.list}>
        {myRecipes.length === 0 ? (
          <EmptyState
            title="Nenhuma receita vinculada"
            description="Seu usuario ainda nao possui receitas mockadas nesta base."
          />
        ) : (
          myRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              statusLabel
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
