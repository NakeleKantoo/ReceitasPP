import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

export default function EntryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useAuth();

  if (user) {
    return <Redirect href={user.account_type === 'superadmin' ? '/(admin)/dashboard' : '/(user)/home'} />;
  }

  return (
    <Screen
      title="Receitas++"
      subtitle="Descubra receitas inteligentes com base no que voce tem em casa, com acesso separado para usuario comum e Superadmin."
      scroll={false}>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.primary }]}>Tela Inicial</Text>
        <Text style={[styles.title, { color: colors.text }]}>Entre, crie sua conta e comece a cozinhar com mais criterio.</Text>
        <Text style={[styles.description, { color: colors.mutedText }]}>
          Busque receitas, filtre por ingredientes e quantidades disponiveis, salve favoritas e acompanhe o fluxo administrativo quando necessario.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Entrar" onPress={() => router.push('/login')} />
        <Button title="Criar conta" onPress={() => router.push('/cadastro')} variant="ghost" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xxl,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
    marginTop: 'auto',
  },
});
