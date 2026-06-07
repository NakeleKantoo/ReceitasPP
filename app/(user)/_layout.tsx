import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={18} style={{ margin: 0 }} {...props} />;
}

export default function UserLayout() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (user.account_type === 'superadmin') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          borderRadius: 0,
          height: 64 + insets.bottom,
          margin: 0,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingHorizontal: 0,
          paddingTop: 10,
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 0,
        },
        tabBarIconStyle: {
          marginBottom: 0,
          marginTop: 0,
        },
        tabBarLabelStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ingredientes"
        options={{
          title: 'Ingredientes',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen name="resultados" options={{ href: null }} />
      <Tabs.Screen name="minhas-receitas" options={{ href: null }} />
      <Tabs.Screen name="nova-receita" options={{ href: null }} />
      <Tabs.Screen name="receita/[id]" options={{ href: null }} />
    </Tabs>
  );
}
