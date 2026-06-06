import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
import { resetPassword } from '@/services/authService';
import { spacing } from '@/theme/spacing';

export default function EsqueciSenhaScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError('A confirmacao da senha precisa ser igual a nova senha.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await resetPassword(email, password);
      Alert.alert('Senha redefinida', 'Sua senha foi atualizada com sucesso. Faca login com a nova senha.');
      router.replace('/login');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Nao foi possivel redefinir a senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen
      title="Redefinir senha"
      subtitle="Para esta demonstracao, informe o e-mail cadastrado e defina uma nova senha para a sua conta."
      scroll={false}
      contentWidth="narrow"
      headerAlign="center"
      showBackButton>
      <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.helper, { color: colors.mutedText }]}>
          A nova senha substitui a anterior imediatamente e ja pode ser usada no proximo login.
        </Text>

        <View style={styles.form}>
          <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input label="Nova senha" value={password} onChangeText={setPassword} secureTextEntry />
          <Input
            label="Confirmar nova senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
          <Button title="Redefinir senha" onPress={() => void handleResetPassword()} loading={isSubmitting} />
          <Button title="Voltar para o login" onPress={() => router.replace('/login')} variant="ghost" />
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
