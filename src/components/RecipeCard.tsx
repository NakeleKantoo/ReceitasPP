import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import { formatDuration, formatServings, formatStatus } from '@/utils/formatters';
import type { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  statusLabel?: boolean;
}

export function RecipeCard({
  recipe,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  statusLabel = false,
}: RecipeCardProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
          <Text style={[styles.category, { color: colors.primary }]}>{recipe.category}</Text>
        </View>
        {onToggleFavorite ? (
          <Pressable
            onPress={onToggleFavorite}
            style={[styles.favoriteButton, { borderColor: colors.border }]}>
            <FontAwesome
              color={isFavorite ? colors.primary : colors.mutedText}
              name={isFavorite ? 'star' : 'star-o'}
              size={16}
            />
          </Pressable>
        ) : null}
      </View>
      <Text style={[styles.description, { color: colors.mutedText }]}>{recipe.description}</Text>
      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: colors.text }]}>{formatDuration(recipe.preparationTime)}</Text>
        <Text style={[styles.metaText, { color: colors.text }]}>{formatServings(recipe.servings)}</Text>
        {statusLabel ? (
          <Text style={[styles.metaText, { color: colors.secondary }]}>{formatStatus(recipe.status)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  category: {
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  favoriteButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
