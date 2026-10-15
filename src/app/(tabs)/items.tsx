import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Chips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { FloatingButton } from '@/components/FloatingButton';
import { useDb } from '@/db/provider';
import { listItems } from '@/db/queries';
import type { ItemSort, ItemWithStats } from '@/db/types';
import { CATEGORIES, categoryLabel } from '@/lib/categories';
import { photoUri } from '@/lib/photos';
import { lastWornText } from '@/lib/wear';
import { colors, spacing } from '@/lib/theme';

const SORTS = [
  { key: 'newest', label: '登録が新しい順' },
  { key: 'leastRecentlyWorn', label: '最近着てない順' },
  { key: 'mostWorn', label: 'よく着る順' },
] as const;

export default function ItemsScreen() {
  const db = useDb();
  const [items, setItems] = useState<ItemWithStats[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<ItemSort>('newest');

  useFocusEffect(
    useCallback(() => {
      listItems(db, { category: category ?? undefined, sort }).then(setItems);
    }, [db, category, sort])
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingBottom: 96 }}
        ListHeaderComponent={
          <View>
            <Chips options={CATEGORIES} selected={category} onSelect={setCategory} />
            <Chips
              options={SORTS}
              selected={sort}
              onSelect={(key) => key && setSort(key as ItemSort)}
              allowDeselect={false}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="アイテムがありません"
            message="右下の＋ボタンから、持っている服を登録してみよう。"
          />
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/item/${item.id}`)}>
            {item.photo ? (
              <Image source={{ uri: photoUri(item.photo) }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Ionicons name="shirt-outline" size={24} color={colors.subText} />
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.meta}>
                {categoryLabel(item.category)}
                {item.color ? `・${item.color}` : ''}
              </Text>
              <Text style={styles.meta}>{lastWornText(item)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subText} />
          </Pressable>
        )}
      />
      <FloatingButton label="アイテムを登録" onPress={() => router.push('/item/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.subText,
  },
});
