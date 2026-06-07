import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  contentWidth?: 'default' | 'narrow';
  headerAlign?: 'start' | 'center';
  showBackButton?: boolean;
  backLabel?: string;
  onBackPress?: () => void;
}

export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
  contentStyle,
  contentWidth = 'default',
  headerAlign = 'start',
  showBackButton = false,
  backLabel = 'Voltar',
  onBackPress,
}: ScreenProps) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const Container = scroll ? ScrollView : View;
  const isCenteredHeader = headerAlign === 'center';
  const handleBackPress =
    onBackPress ??
    (() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      router.replace('/');
    });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Container
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          !scroll && styles.nonScrollContent,
          contentStyle,
        ]}>
        {showBackButton ? (
          <View style={[contentWidth === 'narrow' && styles.narrowContent]}>
            <Pressable onPress={handleBackPress} style={styles.backButton}>
              <FontAwesome color={colors.text} name="arrow-left" size={14} />
              <Text style={[styles.backLabel, { color: colors.text }]}>{backLabel}</Text>
            </Pressable>
          </View>
        ) : null}
        {title ? (
          <View
            style={[
              styles.header,
              contentWidth === 'narrow' && styles.narrowContent,
              isCenteredHeader && styles.headerCentered,
            ]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedText }]}>{subtitle}</Text> : null}
          </View>
        ) : null}
        <View style={[contentWidth === 'narrow' && styles.narrowContent, styles.childrenWrapper]}>{children}</View>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  nonScrollContent: {
    flex: 1,
  },
  childrenWrapper: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerCentered: {
    alignItems: 'center',
  },
  narrowContent: {
    alignSelf: 'center',
    maxWidth: 430,
    width: '100%',
  },
  title: {
    fontSize: typography.titleLarge,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 22,
    maxWidth: 360,
  },
});
