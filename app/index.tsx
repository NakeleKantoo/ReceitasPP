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
      subtitle="Descubra receitas inteligentes com base no que você tem em casa, com acesso separado para usuário comum e Superadmin."
      scroll={false}
      contentWidth="narrow"
      headerAlign="center">
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.primary }]}>Tela Inicial</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Entre, crie sua conta e comece a cozinhar com mais critério.
        </Text>
        <Text style={[styles.description, { color: colors.mutedText }]}>
          Busque receitas, filtre por ingredientes e quantidades disponíveis, salve favoritas e acompanhe o fluxo administrativo quando necessário.
        </Text>
      </View>

      <View style={[styles.actions, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
    gap: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.xxl,
  },
  kicker: {
    alignSelf: 'center',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 'auto',
    padding: spacing.xl,
  },
});
