import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, theme } from '@theme/colors';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (next: T) => void;
}

function SegmentedControlComponent<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.item, active && styles.itemActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const SegmentedControl = memo(SegmentedControlComponent) as typeof SegmentedControlComponent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: 4
  },
  item: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    alignItems: 'center'
  },
  itemActive: {
    backgroundColor: palette.primary
  },
  label: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  labelActive: {
    color: '#ffffff'
  }
});
