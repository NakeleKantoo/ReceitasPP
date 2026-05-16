import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getAllUsers } from '@/services/adminService';
import { spacing } from '@/theme/spacing';
import type { User } from '@/types/user';
import { formatDate } from '@/utils/formatters';

export default function UsuariosScreen() {
  const { colors } = useAppTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      const nextUsers = await getAllUsers();
      setUsers(nextUsers);
      setIsLoading(false);
    }

    void loadUsers();
  }, []);

  return (
    <Screen
      title="Usuarios cadastrados"
      subtitle="Lista de perfis persistidos localmente para os fluxos de login e administracao.">
      <View style={styles.list}>
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.info, { color: colors.mutedText }]}>Carregando usuarios locais...</Text>
          </View>
        ) : (
          users.map((user) => (
            <View
              key={user.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>{user.email}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>Perfil: {user.role}</Text>
              <Text style={[styles.info, { color: colors.mutedText }]}>
                Criado em {formatDate(user.createdAt)}
              </Text>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  loadingState: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 120,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.xl,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
  },
});
