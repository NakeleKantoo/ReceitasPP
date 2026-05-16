import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/EmptyState';

export default function NovaReceitaScreen() {
  return (
    <Screen title="Nova receita" subtitle="Formulario previsto na arquitetura para as fases seguintes.">
      <EmptyState
        title="Cadastro de receita ainda nao ativo"
        description="A tela foi mantida para mostrar a estrutura final desejada, mas sem regra de negocio de submissao neste momento."
      />
    </Screen>
  );
}
