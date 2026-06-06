import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import { formatDate } from '@/utils/formatters';

export default function PerfilScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Screen title="Perfil" subtitle="Informações básicas da conta atual e saída segura da sessão local.">
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.name, { color: colors.text }]}>{user?.username}</Text>
        <Text style={[styles.info, { color: colors.mutedText }]}>{user?.email}</Text>
        <Text style={[styles.info, { color: colors.mutedText }]}>
          Conta criada em {user ? formatDate(user.createdAt) : '--'}
        </Text>
        <Text style={[styles.info, { color: colors.mutedText }]}>
          Perfil: {user?.account_type === 'superadmin' ? 'Superadmin' : 'Usuário comum'}
        </Text>
      </View>
      <Button title="Sair da conta" onPress={() => void handleLogout()} variant="danger" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xxl,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
  },
});
