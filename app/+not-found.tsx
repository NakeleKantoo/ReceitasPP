import { useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen scroll={false}>
      <EmptyState
        title="Página não encontrada"
        description="A rota que você tentou acessar não existe ou foi movida durante a reorganização do app."
      />
      <Button title="Voltar para a tela inicial" onPress={() => router.replace('/')} />
    </Screen>
  );
}
