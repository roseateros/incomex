import { SOURCE_DESCRIPTORS } from '@constants/sources';
import { SourceAggregate } from '@hooks/useEntries';
import { formatCurrency } from '@utils/format';
import { StyleSheet, Text, View } from 'react-native';
import { palette, theme } from '@theme/colors';

interface SourceBreakdownListProps {
  data: SourceAggregate[];
  total: number;
}

export function SourceBreakdownList({ data, total }: SourceBreakdownListProps) {
  if (!data.length || total <= 0) {
    return (
      <Text style={styles.empty}>Sin datos disponibles.</Text>
    );
  }

  return (
    <View style={styles.container}>
      {data.map((item) => {
        const descriptor = SOURCE_DESCRIPTORS[item.source];
        const percentage = ((item.total / total) * 100).toFixed(1);
        return (
          <View key={item.source} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: descriptor.color }]} />
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{descriptor.label}</Text>
              <Text style={styles.percentage}>{percentage}%</Text>
            </View>
            <Text style={styles.amount}>{formatCurrency(item.total)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  labelContainer: {
    flex: 1
  },
  label: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: 15
  },
  percentage: {
    color: palette.textSecondary,
    fontSize: 12
  },
  amount: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  empty: {
    color: palette.textSecondary,
    textAlign: 'center',
    marginVertical: theme.spacing.lg
  }
});
