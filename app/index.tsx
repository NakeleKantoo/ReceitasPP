import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

export default function EntryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace(user.role === 'superadmin' ? '/(admin)/dashboard' : '/(user)/home');
    }
  }, [router, user]);

  if (user) {
    return null;
  }

  return (
    <Screen scroll={false}>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.primary }]}>Receitas++</Text>
        <Text style={[styles.title, { color: colors.text }]}>Receitas inteligentes com o que voce ja tem em casa</Text>
        <Text style={[styles.description, { color: colors.mutedText }]}>
          Entre com uma conta de teste ou crie um usuario comum para buscar receitas, ver detalhes e
          descobrir quais pratos sao realmente possiveis com a sua despensa.
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
