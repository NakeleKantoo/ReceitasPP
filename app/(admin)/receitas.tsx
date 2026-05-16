import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { RecipeCard } from '@/components/RecipeCard';
import { Screen } from '@/components/Screen';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';

export default function ReceitasAdminScreen() {
  const router = useRouter();
  const { allRecipes } = useRecipes();

  return (
    <Screen
      title="Todas as receitas"
      subtitle="Catalogo administrativo com receitas aprovadas, pendentes e rejeitadas.">
      <View style={styles.list}>
        {allRecipes.map((recipe) => (
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
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});
