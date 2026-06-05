import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';

export default function AprovacoesScreen() {
  const { colors } = useAppTheme();
  const { pendingRecipes } = useRecipes();

  return (
    <Screen
      title="Receitas pendentes"
      subtitle="Fila inicial para o superadmin validar receitas enviadas por usuarios.">
      <View style={styles.list}>
        {pendingRecipes.length === 0 ? (
          <EmptyState title="Sem pendencias" description="Nao ha receitas pendentes nos mocks atuais." />
        ) : (
          pendingRecipes.map((recipe) => (
            <View
              key={recipe.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>{recipe.nome}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>{recipe.description}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>Categoria: {recipe.refeicao}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>Autor mockado: {recipe.autor}</Text>
            </View>
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
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
  },
});
