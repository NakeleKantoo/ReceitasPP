import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from '@/data/mockUsers';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user, login } = useAuth();
  const [email, setEmail] = useState(DEMO_USER_EMAIL);
  const [password, setPassword] = useState(DEMO_USER_PASSWORD);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace(user.account_type === 'superadmin' ? '/(admin)/dashboard' : '/(user)/home');
    }
  }, [router, user]);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      const loggedUser = await login(email, password);
      router.replace(loggedUser.account_type === 'superadmin' ? '/(admin)/dashboard' : '/(user)/home');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Nao foi possivel entrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <Screen
      title="Entrar"
      subtitle="Use uma conta comum para o fluxo principal do app ou uma conta superadmin para a area administrativa."
      scroll={false}>
      <View style={styles.form}>
        <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button title="Entrar" onPress={() => void handleLogin()} loading={isSubmitting} />
        <Button title="Criar conta" onPress={() => router.push('/cadastro')} variant="ghost" />
      </View>

      <View style={[styles.demoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.demoTitle, { color: colors.text }]}>Contas de teste</Text>
        <Text style={[styles.demoText, { color: colors.mutedText }]}>
          Usuario comum: {DEMO_USER_EMAIL} / {DEMO_USER_PASSWORD}
        </Text>
        <Text style={[styles.demoText, { color: colors.mutedText }]}>
          Superadmin: {DEMO_ADMIN_EMAIL} / {DEMO_ADMIN_PASSWORD}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  error: {
    fontSize: 13,
  },
  demoCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: 'auto',
    padding: spacing.xl,
  },
  demoTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  demoText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
