import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

interface IngredientQuantityInputProps {
  label: string;
  unit: string;
  quantity: string;
  isSelected: boolean;
  onToggle: () => void;
  onQuantityChange: (value: string) => void;
}

export function IngredientQuantityInput({
  label,
  unit,
  quantity,
  isSelected,
  onToggle,
  onQuantityChange,
}: IngredientQuantityInputProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Pressable onPress={onToggle} style={styles.toggleRow}>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isSelected ? colors.primary : 'transparent',
              borderColor: isSelected ? colors.primary : colors.border,
            },
          ]}
        />
        <View style={styles.texts}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.unit, { color: colors.mutedText }]}>Quantidade em {unit}</Text>
        </View>
      </Pressable>
      <TextInput
        editable={isSelected}
        keyboardType="numeric"
        onChangeText={onQuantityChange}
        placeholder="0"
        placeholderTextColor={colors.mutedText}
        style={[
          styles.input,
          {
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: isSelected ? colors.card : colors.background,
          },
        ]}
        value={quantity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  toggleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  checkbox: {
    borderRadius: 8,
    borderWidth: 2,
    height: 22,
    width: 22,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  unit: {
    fontSize: 13,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
});
