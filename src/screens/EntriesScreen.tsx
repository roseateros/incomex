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
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, FAB } from '@rneui/themed';
import { format } from 'date-fns';

import { createEntry, fetchEntries } from '../services/entries';
import type { Entry, EntryDraft } from '../types/entry';
import type { Session } from '@supabase/supabase-js';

const DATE_INPUT_FORMAT = 'yyyy-MM-dd';

type EntriesScreenProps = {
  session: Session;
};

export const EntriesScreen = ({ session }: EntriesScreenProps) => {
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
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardCategory}>{item.category ?? 'Sin categoría'}</Text>
          <Text style={[styles.cardAmount, item.amount >= 0 ? styles.positive : styles.negative]}>
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 2,
            }).format(item.amount)}
          </Text>
        </View>
        <Text style={styles.cardDate}>{formattedDate}</Text>
        {item.note ? <Text style={styles.cardNote}>{item.note}</Text> : null}
      </View>
    );
  }, []);

  const emptyListComponent = useMemo(() => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateTitle}>No hay movimientos todavía</Text>
        <Text style={styles.emptyStateSubtitle}>Agrega tu primer ingreso o gasto using el botón azul.</Text>
      </View>
    );
  }, [loading]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={entries.length === 0 ? styles.emptyList : undefined}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={emptyListComponent}
        />
      )}

      <FAB
        icon={{ name: 'add', color: 'white' }}
        color="#2563eb"
        placement="right"
        onPress={handleOpenModal}
        accessibilityLabel="Agregar movimiento"
      />

      <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nuevo movimiento</Text>

          <Text style={styles.inputLabel}>Fecha</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={draft.entry_date}
            onChangeText={(value) => setDraft((prev) => ({ ...prev, entry_date: value }))}
          />

          <Text style={styles.inputLabel}>Categoría</Text>
          <TextInput
            style={styles.input}
            placeholder="Categoría"
            value={draft.category}
            onChangeText={(value) => setDraft((prev) => ({ ...prev, category: value }))}
          />

          <Text style={styles.inputLabel}>Monto (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType={Platform.select({ ios: 'decimal-pad', android: 'numeric', default: 'numeric' })}
            value={draft.amount ? String(draft.amount) : ''}
            onChangeText={(value) =>
              setDraft((prev) => ({ ...prev, amount: Number(value.replace(',', '.')) || 0 }))
            }
          />

          <Text style={styles.inputLabel}>Nota</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Descripción opcional"
            multiline
            numberOfLines={3}
            value={draft.note ?? ''}
            onChangeText={(value) => setDraft((prev) => ({ ...prev, note: value }))}
          />

          <View style={styles.modalActions}>
            <Button title="Cancelar" type="outline" onPress={() => setModalVisible(false)} containerStyle={styles.modalButton} />
            <Button title="Guardar" onPress={handleSubmitEntry} containerStyle={styles.modalButton} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  positive: {
    color: '#16a34a',
  },
  negative: {
    color: '#dc2626',
  },
  cardDate: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  cardNote: {
    marginTop: 8,
    fontSize: 14,
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: '#111827',
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9fafb',
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
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
