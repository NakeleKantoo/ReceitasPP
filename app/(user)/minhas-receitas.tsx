import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { RecipeCard } from '@/components/RecipeCard';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';

export default function MinhasReceitasScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getUserRecipes, refreshRecipes } = useRecipes();

  const myRecipes = user ? getUserRecipes(user.id) : [];

  useFocusEffect(
    useCallback(() => {
      void refreshRecipes();
    }, [refreshRecipes])
  );

  return (
    <Screen
      title="Minhas receitas"
      subtitle="Acompanhe aqui as receitas criadas por voce e o status atual de moderacao de cada uma.">
      <Button title="Cadastrar nova receita" onPress={() => router.push('/(user)/nova-receita')} />
      <View style={styles.list}>
        {myRecipes.length === 0 ? (
          <EmptyState
            title="Nenhuma receita vinculada"
            description="Voce ainda nao cadastrou receitas. Use o botao acima para enviar sua primeira receita."
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
