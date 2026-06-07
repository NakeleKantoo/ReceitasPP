import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { RecipeCard } from '@/components/RecipeCard';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { approvedRecipes, getUserRecipes } = useRecipes();
  const { isFavorite, toggleFavorite } = useFavorites();

  const featuredRecipes = approvedRecipes.slice(0, 3);
  const myRecipes = user ? getUserRecipes(user.id) : [];
  const pendingRecipesCount = myRecipes.filter((recipe) => recipe.status === 'pending').length;
  const approvedRecipesCount = myRecipes.filter((recipe) => recipe.status === 'approved').length;
  const latestMyRecipes = myRecipes.slice(0, 2);

  return (
    <Screen
      title={`Olá, ${user?.username?.split(' ')[0] ?? 'chef'}!`}
      subtitle="Compartilhe suas receitas e acompanhe com clareza o que já foi aprovado ou ainda está em moderação.">
      <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.bannerTitle, { color: colors.text }]}>Publique sua próxima receita</Text>
        <Text style={[styles.bannerText, { color: colors.mutedText }]}>
          Cadastre uma receita com ingredientes, porções e modo de preparo. Depois, acompanhe o status da moderação sem sair do app.
        </Text>
        <View style={styles.bannerActions}>
          <Button title="Adicionar nova receita" onPress={() => router.push('/(user)/nova-receita')} />
          <Button
            title="Acompanhar minhas receitas"
            onPress={() => router.push('/(user)/minhas-receitas')}
            variant="ghost"
          />
        </View>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard
          title="Receitas enviadas"
          description={`${myRecipes.length} receita(s) cadastrada(s) na sua conta.`}
        />
        <SummaryCard
          title="Em moderação"
          description={`${pendingRecipesCount} aguardando análise do Superadmin.`}
        />
        <SummaryCard
          title="Já aprovadas"
          description={`${approvedRecipesCount} pronta(s) para aparecer nas buscas.`}
        />
      </View>

      <SectionTitle
        title="Suas receitas mais recentes"
        subtitle="Acesse rapidamente o que você enviou por último e acompanhe o status de cada envio."
      />
      <View style={styles.list}>
        {latestMyRecipes.length === 0 ? (
          <EmptyState
            title="Sua cozinha ainda está vazia"
            description="Toque em “Adicionar nova receita” para começar a montar o seu catálogo."
          />
        ) : (
          latestMyRecipes.map((recipe) => (
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

      <SectionTitle
        title="Receitas em destaque"
        subtitle="Quando quiser explorar o catálogo ou usar o filtro por ingredientes, a barra inferior continua disponível."
      />
      <View style={styles.list}>
        {featuredRecipes.length === 0 ? (
          <EmptyState
            title="Nenhuma receita em destaque"
            description="Assim que houver receitas aprovadas, elas aparecerão aqui para facilitar a exploração."
          />
        ) : (
          featuredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={isFavorite(recipe.id)}
              onToggleFavorite={() => {
                void toggleFavorite(recipe.id, recipe);
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

function SummaryCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[styles.summaryTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.summaryDescription, { color: colors.mutedText }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xxl,
  },
  bannerActions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  bannerText: {
    fontSize: 15,
    lineHeight: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minWidth: 160,
    padding: spacing.xl,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: spacing.md,
  },
});
