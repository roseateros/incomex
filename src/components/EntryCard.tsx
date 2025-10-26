import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LedgerEntry } from '@models/ledger';
import { SOURCE_DESCRIPTORS } from '@constants/sources';
import { formatCurrency } from '@utils/format';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, theme } from '@theme/colors';

interface EntryCardProps {
  entry: LedgerEntry;
  onEdit: (entry: LedgerEntry) => void;
  onDelete: (entry: LedgerEntry) => void;
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const descriptor = SOURCE_DESCRIPTORS[entry.source];

  return (
    <View style={[styles.container, { borderColor: descriptor.accent }]}> 
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: descriptor.accent }]}> 
          <MaterialCommunityIcons
            name={entry.entry_type === 'income' ? 'arrow-bottom-left' : 'arrow-top-right'}
            size={18}
            color={descriptor.color}
          />
          <Text style={[styles.badgeLabel, { color: descriptor.color }]}>{descriptor.label}</Text>
        </View>
        <Text style={[styles.amount, { color: entry.entry_type === 'income' ? palette.success : palette.danger }]}>
          {formatCurrency(entry.amount)}
        </Text>
      </View>

      {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}

      <View style={styles.footer}>
  <Text style={styles.date}>{format(parseISO(entry.entry_date), "d MMM yyyy", { locale: es })}</Text>
        <View style={styles.actions}>
          <Pressable hitSlop={12} onPress={() => onEdit(entry)}>
            <MaterialCommunityIcons name="pencil" size={20} color={palette.textSecondary} />
          </Pressable>
          <Pressable hitSlop={12} onPress={() => onDelete(entry)}>
            <MaterialCommunityIcons name="delete-outline" size={20} color={palette.danger} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    gap: theme.spacing.sm
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    gap: 6
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  amount: {
    fontSize: 18,
    fontWeight: '700'
  },
  note: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  date: {
    color: palette.textSecondary,
    fontSize: 13
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  }
});
