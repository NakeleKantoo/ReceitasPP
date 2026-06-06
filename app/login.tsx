import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return <Redirect href={user.account_type === 'superadmin' ? '/(admin)/dashboard' : '/(user)/home'} />;
  }

  return (
    <Screen
      title="Entrar"
      subtitle="Use uma conta comum para o fluxo principal do app ou uma conta superadmin para a area administrativa."
      scroll={false}
      contentWidth="narrow"
      headerAlign="center">
      <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.helper, { color: colors.mutedText }]}>
          Informe suas credenciais para acessar suas receitas ou o painel administrativo.
        </Text>

        <View style={styles.form}>
        <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button title="Entrar" onPress={() => void handleLogin()} loading={isSubmitting} />
        <Button title="Criar conta" onPress={() => router.push('/cadastro')} variant="ghost" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    borderRadius: 26,
    borderWidth: 1,
    gap: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  helper: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    textAlign: 'center',
  },
});
