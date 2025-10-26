import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { palette, theme } from '@theme/colors';

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'calendar-blank-outline', title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={32} color={palette.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl
  },
  title: {
    color: palette.textSecondary,
    fontSize: 16,
    fontWeight: '600'
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 13,
    textAlign: 'center'
  }
});
