import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/lib/theme';

type Option = { key: string; label: string };

type Props = {
  options: readonly Option[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  // When true, tapping the selected chip clears the selection.
  allowDeselect?: boolean;
};

export function Chips({ options, selected, onSelect, allowDeselect = true }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const active = option.key === selected;
        return (
          <Pressable
            key={option.key}
            onPress={() => onSelect(active && allowDeselect ? null : option.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    fontSize: 13,
    color: colors.text,
  },
  labelActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
