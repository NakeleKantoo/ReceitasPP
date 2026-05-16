import { StyleSheet, View } from 'react-native';

import { RecipeCard } from '@/components/RecipeCard';
import { Screen } from '@/components/Screen';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';

export default function ReceitasAdminScreen() {
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
