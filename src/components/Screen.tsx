import { ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
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
}

export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
  contentStyle,
  contentWidth = 'default',
  headerAlign = 'start',
}: ScreenProps) {
  const { colors } = useAppTheme();
  const Container = scroll ? ScrollView : View;
  const isCenteredHeader = headerAlign === 'center';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Container
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          !scroll && styles.nonScrollContent,
          contentStyle,
        ]}>
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
