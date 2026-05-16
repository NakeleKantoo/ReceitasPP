import { useColorScheme } from 'react-native';

import { appColors } from '@/theme/colors';

export function useAppTheme() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return {
    colorScheme,
    colors: appColors[colorScheme],
  };
}
