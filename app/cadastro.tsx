import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import { validateEmail } from '@/utils/validators';

export default function CadastroScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      setError('Informe seu nome.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Informe um e-mail valido.');
      return;
    }

    if (!password.trim()) {
      setError('Informe uma senha.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await register(name, email, password);
      router.replace('/(user)/home');
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Nao foi possivel cadastrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return <Redirect href={user.account_type === 'superadmin' ? '/(admin)/dashboard' : '/(user)/home'} />;
  }

  return (
    <Screen
      title="Criar conta"
      subtitle="O cadastro cria um novo usuario comum e ja abre a area interna com sessao persistida localmente."
      scroll={false}
      contentWidth="narrow"
      headerAlign="center">
      <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.helper, { color: colors.mutedText }]}>
          Preencha seus dados para acessar o app e comecar a montar sua despensa inteligente.
        </Text>

        <View style={styles.form}>
        <Input label="Nome" value={name} onChangeText={setName} />
        <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button title="Cadastrar" onPress={() => void handleRegister()} loading={isSubmitting} />
        <Button title="Ja tenho conta" onPress={() => router.push('/login')} variant="ghost" />
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
