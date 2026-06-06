import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

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
  const myRecipesCount = user ? getUserRecipes(user.id).length : 0;

  return (
    <Screen
      title={`Ola, ${user?.username?.split(' ')[0] ?? 'chef'}!`}
      subtitle="Escolha uma forma rapida de encontrar receitas que funcionem com a sua despensa.">
      <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.bannerTitle, { color: colors.text }]}>Seu atalho na cozinha</Text>
        <Text style={[styles.bannerText, { color: colors.mutedText }]}>
          Busque por nome, explore o catalogo ou use o filtro inteligente por ingredientes e quantidades.
        </Text>
      </View>

      <SectionTitle title="Acesso rapido" />
      <View style={styles.quickList}>
        <QuickAction
          title="Buscar receitas"
          description="Pesquise receitas aprovadas por nome e categoria."
          onPress={() => router.push('/(user)/buscar')}
        />
        <QuickAction
          title="Informar ingredientes"
          description="Descubra o que voce consegue preparar agora."
          onPress={() => router.push('/(user)/ingredientes')}
        />
        <QuickAction
          title="Favoritos"
          description="Acesse suas receitas salvas."
          onPress={() => router.push('/(user)/favoritos')}
        />
        <QuickAction
          title="Minhas receitas"
          description={`${myRecipesCount} receita(s) vinculada(s) ao seu usuario.`}
          onPress={() => router.push('/(user)/minhas-receitas')}
        />
      </View>

      <SectionTitle title="Receitas novas" />
      <View style={styles.list}>
        {featuredRecipes.map((recipe) => (
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
    </Screen>
  );
}

function QuickAction({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <Text style={[styles.quickTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.quickDescription, { color: colors.mutedText }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xxl,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  bannerText: {
    fontSize: 15,
    lineHeight: 22,
  },
  quickList: {
    gap: spacing.md,
  },
  quickCard: {
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  quickDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: spacing.md,
  },
});
