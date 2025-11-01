import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createEntry, fetchEntries } from '../services/entries';
import type { Entry, EntryDraft } from '../types/entry';
import type { Session } from '@supabase/supabase-js';
import { AwardBackground } from '../components/AwardBackground';
import { useAwardPalette } from '../theme/awardPalette';

const DATE_INPUT_FORMAT = 'yyyy-MM-dd';

type EntriesScreenProps = {
  session: Session;
};

export const EntriesScreen = ({ session }: EntriesScreenProps) => {
  const palette = useAwardPalette();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [draft, setDraft] = useState<EntryDraft>(() => ({
    entry_date: format(new Date(), DATE_INPUT_FORMAT),
    category: '',
    amount: 0,
    note: '',
  }));

  const userId = session.user.id;

  const loadEntries = useCallback(
    async (showSpinner = true) => {
      try {
        if (showSpinner) {
          setLoading(true);
        }
        const data = await fetchEntries(userId);
        setEntries(data);
      } catch (error) {
        console.error('Error loading entries', error);
        Alert.alert('Error', 'No pudimos cargar tus movimientos.');
      } finally {
        if (showSpinner) {
          setLoading(false);
        }
      }
    },
    [userId],
  );

  useFocusEffect(
    useCallback(() => {
      void loadEntries();
    }, [loadEntries]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEntries(false)
      .catch(() => {
        // handled above
      })
      .finally(() => setRefreshing(false));
  }, [loadEntries]);

  const handleOpenModal = () => {
    setDraft({
      entry_date: format(new Date(), DATE_INPUT_FORMAT),
      category: '',
      amount: 0,
      note: '',
    });
    setModalVisible(true);
  };

  const handleSubmitEntry = async () => {
    if (!draft.category.trim()) {
      Alert.alert('Categoría requerida');
      return;
    }

    if (Number.isNaN(draft.amount) || draft.amount === 0) {
      Alert.alert('Monto inválido');
      return;
    }

    try {
      await createEntry(userId, {
        ...draft,
        amount: Number(draft.amount),
        note: draft.note?.trim() ?? null,
      });
      setModalVisible(false);
      await loadEntries();
    } catch (error) {
      console.error('Error creating entry', error);
      Alert.alert('Error', 'No pudimos guardar el movimiento.');
    }
  };

  const renderItem = useCallback(({ item }: { item: Entry }) => {
    const formattedDate = format(new Date(item.entry_date), 'dd MMM yyyy');
    const amountColor = item.amount >= 0 ? palette.positive : palette.negative;

    return (
      <View style={[styles.card, { backgroundColor: 'transparent', borderColor: palette.borderSoft }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardCategory, { color: palette.text }]}>{item.category ?? 'Sin categoría'}</Text>
          <Text style={[styles.cardAmount, { color: amountColor }]}>
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 2,
            }).format(item.amount)}
          </Text>
        </View>
        <Text style={[styles.cardDate, { color: palette.subtext }]}>{formattedDate}</Text>
        {item.note ? <Text style={[styles.cardNote, { color: palette.text }]}>{item.note}</Text> : null}
      </View>
    );
  }, [palette]);

  const emptyListComponent = useMemo(() => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyStateTitle, { color: palette.text }]}>No hay movimientos todavía</Text>
        <Text style={[styles.emptyStateSubtitle, { color: palette.subtext }]}>Agrega tu primer ingreso o gasto usando el botón.</Text>
      </View>
    );
  }, [loading, palette]);

  return (
    <AwardBackground>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.accent} />
            </View>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={entries.length === 0 ? [styles.listContent, styles.emptyListContent] : styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={emptyListComponent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: palette.accent, shadowColor: palette.accent }]}
          onPress={handleOpenModal}
          accessibilityLabel="Agregar movimiento"
          activeOpacity={0.88}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>Nuevo movimiento</Text>

            <Text style={[styles.inputLabel, { color: palette.subtext }]}>Fecha</Text>
            <TextInput
              style={[styles.input, { borderColor: palette.border, backgroundColor: palette.surfaceStrong, color: palette.text }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={palette.placeholder}
              value={draft.entry_date}
              onChangeText={(value) => setDraft((prev) => ({ ...prev, entry_date: value }))}
            />

            <Text style={[styles.inputLabel, { color: palette.subtext }]}>Categoría</Text>
            <TextInput
              style={[styles.input, { borderColor: palette.border, backgroundColor: palette.surfaceStrong, color: palette.text }]}
              placeholder="Categoría"
              placeholderTextColor={palette.placeholder}
              value={draft.category}
              onChangeText={(value) => setDraft((prev) => ({ ...prev, category: value }))}
            />

            <Text style={[styles.inputLabel, { color: palette.subtext }]}>Monto (€)</Text>
            <TextInput
              style={[styles.input, { borderColor: palette.border, backgroundColor: palette.surfaceStrong, color: palette.text }]}
              placeholder="0.00"
              placeholderTextColor={palette.placeholder}
              keyboardType={Platform.select({ ios: 'decimal-pad', android: 'numeric', default: 'numeric' })}
              value={draft.amount ? String(draft.amount) : ''}
              onChangeText={(value) =>
                setDraft((prev) => ({ ...prev, amount: Number(value.replace(',', '.')) || 0 }))
              }
            />

            <Text style={[styles.inputLabel, { color: palette.subtext }]}>Nota</Text>
            <TextInput
              style={[styles.input, styles.noteInput, { borderColor: palette.border, backgroundColor: palette.surfaceStrong, color: palette.text }]}
              placeholder="Descripción opcional"
              placeholderTextColor={palette.placeholder}
              multiline
              numberOfLines={3}
              value={draft.note ?? ''}
              onChangeText={(value) => setDraft((prev) => ({ ...prev, note: value }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalOutlineButton, { borderColor: palette.border }]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalOutlineText, { color: palette.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalPrimaryButton, { backgroundColor: palette.accent }]}
                onPress={handleSubmitEntry}
                activeOpacity={0.85}
              >
                <Text style={styles.modalPrimaryText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </AwardBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 34,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDate: {
    marginTop: 4,
    fontSize: 14,
  },
  cardNote: {
    marginTop: 8,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  noteInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOutlineButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  modalPrimaryButton: {
  },
  modalPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  modalOutlineText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
