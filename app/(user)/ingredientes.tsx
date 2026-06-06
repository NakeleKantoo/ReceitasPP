import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { IngredientQuantityInput } from '@/components/IngredientQuantityInput';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';
import { validatePositiveNumber } from '@/utils/validators';

export default function IngredientesScreen() {
  const router = useRouter();
  const { ingredientCatalog, runCompatibilityCheck } = useRecipes();
  const [selectionState, setSelectionState] = useState<Record<string, { selected: boolean; quantity: string }>>(
    Object.fromEntries(
      ingredientCatalog.map((ingredient) => [
        ingredient.id,
        {
          selected: false,
          quantity: '',
        },
      ])
    )
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectionState(
      Object.fromEntries(
        ingredientCatalog.map((ingredient) => [
          ingredient.id,
          {
            selected: false,
            quantity: '',
          },
        ])
      )
    );
  }, [ingredientCatalog]);

  const handleToggle = (ingredientId: number) => {
    setSelectionState((currentState) => ({
      ...currentState,
      [ingredientId]: {
        ...currentState[ingredientId],
        selected: !currentState[ingredientId].selected,
      },
    }));
  };

  const handleQuantityChange = (ingredientId: number, quantity: string) => {
    setSelectionState((currentState) => ({
      ...currentState,
      [ingredientId]: {
        ...currentState[ingredientId],
        quantity,
      },
    }));
  };

  const handleSearch = async () => {
    const selectedIngredients = ingredientCatalog
      .filter((ingredient) => selectionState[ingredient.id]?.selected)
      .map((ingredient) => ({
        ingredientId: ingredient.id,
        quantity: Number(selectionState[ingredient.id]?.quantity),
        unit: ingredient.unidade,
      }));

    if (selectedIngredients.length === 0) {
      Alert.alert('Selecione ingredientes', 'Escolha pelo menos um ingrediente para o filtro.');
      return;
    }

    if (selectedIngredients.some((ingredient) => !validatePositiveNumber(ingredient.quantity))) {
      Alert.alert(
        'Quantidade invalida',
        'Informe quantidades numericas maiores que zero para todos os ingredientes selecionados.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      runCompatibilityCheck(selectedIngredients);
      router.push('/(user)/resultados');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen
      title="Minha despensa"
      subtitle="Selecione os ingredientes que voce tem e informe a quantidade disponivel para cada um deles.">
      <SectionTitle
        title="Ingredientes disponiveis"
        subtitle="A receita so aparece nos resultados se todos os ingredientes estiverem presentes e com quantidade suficiente."
      />
      <View style={styles.list}>
        {ingredientCatalog.map((ingredient) => (
          <IngredientQuantityInput
            key={ingredient.id}
            isSelected={selectionState[ingredient.id]?.selected ?? false}
            label={ingredient.nome}
            onQuantityChange={(value) => handleQuantityChange(ingredient.id, value)}
            onToggle={() => handleToggle(ingredient.id)}
            quantity={selectionState[ingredient.id]?.quantity ?? ''}
            unit={ingredient.unidade}
          />
        ))}
      </View>
      <Button title="Encontrar receitas possiveis" onPress={() => void handleSearch()} loading={isSubmitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});
