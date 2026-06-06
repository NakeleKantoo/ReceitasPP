import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { IngredientQuantityInput } from '@/components/IngredientQuantityInput';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { useRecipes } from '@/hooks/useRecipes';
import { spacing } from '@/theme/spacing';
import type { NewRecipeInput } from '@/types/recipe';
import { validatePositiveNumber, validateRecipeInput } from '@/utils/validators';

export default function NovaReceitaScreen() {
  const router = useRouter();
  const { ingredientCatalog, createRecipe, isLoading } = useRecipes();
  const [nome, setNome] = useState('');
  const [refeicao, setRefeicao] = useState('');
  const [tempoPreparo, setTempoPreparo] = useState('');
  const [porcoes, setPorcoes] = useState('');
  const [passos, setPassos] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionState, setSelectionState] = useState<Record<number, { selected: boolean; quantity: string }>>({});

  const ingredientState = useMemo(
    () =>
      ingredientCatalog.map((ingredient) => ({
        ...ingredient,
        selected: selectionState[ingredient.id]?.selected ?? false,
        quantity: selectionState[ingredient.id]?.quantity ?? '',
      })),
    [ingredientCatalog, selectionState]
  );

  const handleToggle = (ingredientId: number) => {
    setSelectionState((currentState) => ({
      ...currentState,
      [ingredientId]: {
        selected: !currentState[ingredientId]?.selected,
        quantity: currentState[ingredientId]?.quantity ?? '',
      },
    }));
  };

  const handleQuantityChange = (ingredientId: number, quantity: string) => {
    setSelectionState((currentState) => ({
      ...currentState,
      [ingredientId]: {
        selected: currentState[ingredientId]?.selected ?? false,
        quantity,
      },
    }));
  };

  const selectedIngredients = ingredientState
    .filter((ingredient) => ingredient.selected)
    .map((ingredient) => ({
      id: ingredient.id,
      ingrediente: ingredient,
      quantidade: Number(ingredient.quantity),
    }));

  const handleSubmit = async () => {
    const recipeInput: NewRecipeInput = {
      nome,
      refeicao,
      tempoPreparo: Number(tempoPreparo),
      porcoes: Number(porcoes),
      ingredientes: selectedIngredients,
      passos,
    };

    const validationErrors = validateRecipeInput(recipeInput);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    if (selectedIngredients.some((ingredient) => !validatePositiveNumber(ingredient.quantidade))) {
      setError('Informe quantidades validas para todos os ingredientes selecionados.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await createRecipe({
        nome: recipeInput.nome.trim(),
        refeicao: recipeInput.refeicao.trim(),
        tempoPreparo: recipeInput.tempoPreparo,
        porcoes: recipeInput.porcoes,
        passos: recipeInput.passos.trim(),
        ingredientes: recipeInput.ingredientes.map((ingredient) => ({
          ingredienteId: ingredient.ingrediente.id,
          quantidade: ingredient.quantidade,
        })),
      });

      Alert.alert(
        'Receita enviada',
        'Sua receita foi cadastrada com status pendente e ja esta disponivel para moderacao do Superadmin.'
      );
      router.replace('/(user)/minhas-receitas');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Nao foi possivel enviar a receita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && ingredientCatalog.length === 0) {
    return (
      <Screen title="Nova receita" subtitle="Carregando ingredientes disponiveis para o formulario.">
        <EmptyState
          title="Preparando formulario"
          description="Aguarde enquanto os ingredientes cadastrados sao carregados."
        />
      </Screen>
    );
  }

  if (!isLoading && ingredientCatalog.length === 0) {
    return (
      <Screen title="Nova receita" subtitle="Nao foi possivel montar o formulario completo agora.">
        <EmptyState
          title="Ingredientes indisponiveis"
          description="Os ingredientes nao foram carregados. Volte mais tarde ou refaça o login para tentar novamente."
        />
      </Screen>
    );
  }

  return (
    <Screen
      title="Nova receita"
      subtitle="Cadastre uma nova receita com ingredientes, quantidades e modo de preparo. O envio vai para moderacao.">
      <View style={styles.form}>
        <Input label="Nome da receita" value={nome} onChangeText={setNome} placeholder="Ex.: Lasanha de frango" />
        <Input
          label="Categoria / refeicao"
          value={refeicao}
          onChangeText={setRefeicao}
          placeholder="Ex.: Almoco, Lanche, Sobremesa"
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Input
              label="Tempo de preparo"
              value={tempoPreparo}
              onChangeText={setTempoPreparo}
              keyboardType="numeric"
              placeholder="Minutos"
            />
          </View>
          <View style={styles.rowItem}>
            <Input
              label="Porcoes"
              value={porcoes}
              onChangeText={setPorcoes}
              keyboardType="numeric"
              placeholder="Ex.: 4"
            />
          </View>
        </View>

        <Input
          label="Modo de preparo"
          value={passos}
          onChangeText={setPassos}
          placeholder={'Uma etapa por linha.\nEx.: Refogue os ingredientes.\nAdicione agua.\nCozinhe por 20 minutos.'}
          multiline
        />

        <SectionTitle
          title="Ingredientes"
          subtitle="Selecione os ingredientes usados na receita e informe a quantidade exigida de cada um."
        />

        <View style={styles.ingredientList}>
          {ingredientState.map((ingredient) => (
            <IngredientQuantityInput
              key={ingredient.id}
              label={ingredient.nome}
              unit={ingredient.unidade}
              quantity={ingredient.quantity}
              isSelected={ingredient.selected}
              onToggle={() => handleToggle(ingredient.id)}
              onQuantityChange={(value) => handleQuantityChange(ingredient.id, value)}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Enviar receita para moderacao" onPress={() => void handleSubmit()} loading={isSubmitting} />
        <Button title="Voltar para minhas receitas" onPress={() => router.push('/(user)/minhas-receitas')} variant="ghost" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  ingredientList: {
    gap: spacing.md,
  },
  error: {
    color: '#c24633',
    fontSize: 13,
    textAlign: 'center',
  },
});
