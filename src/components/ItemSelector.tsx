import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Item } from '@/db/types';
import { CATEGORIES } from '@/lib/categories';
import { photoUri } from '@/lib/photos';
import { colors, spacing } from '@/lib/theme';

type Props = {
  items: Item[];
  selectedIds: number[];
  onToggle: (id: number) => void;
};

export function ItemSelector({ items, selectedIds, onToggle }: Props) {
  const groups = CATEGORIES.map((c) => ({
    ...c,
    items: items.filter((i) => i.category === c.key),
  })).filter((g) => g.items.length > 0);

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <Text style={styles.groupLabel}>{group.label}</Text>
          <View style={styles.wrap}>
            {group.items.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onToggle(item.id)}
                  style={[styles.item, selected && styles.itemSelected]}
                >
                  {item.photo ? (
                    <Image source={{ uri: photoUri(item.photo) }} style={styles.thumb} contentFit="cover" />
                  ) : null}
                  <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {selected ? <Ionicons name="checkmark-circle" size={16} color={colors.accent} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  group: {
    gap: 6,
  },
  groupLabel: {
    fontSize: 12,
    color: colors.subText,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  itemSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  name: {
    flexShrink: 1,
    fontSize: 13,
    color: colors.text,
    paddingLeft: 4,
  },
  nameSelected: {
    fontWeight: '600',
  },
});
