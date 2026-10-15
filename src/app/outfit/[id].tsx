import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DangerButton } from '@/components/Form';
import { useDb } from '@/db/provider';
import { deleteOutfit, getOutfit } from '@/db/queries';
import { categoryLabel } from '@/lib/categories';
import { formatDate } from '@/lib/date';
import { confirmDestructive } from '@/lib/dialog';
import { deletePhoto, photoUri } from '@/lib/photos';
import { colors, spacing } from '@/lib/theme';

type Detail = NonNullable<Awaited<ReturnType<typeof getOutfit>>>;

export default function OutfitDetailScreen() {
  const db = useDb();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [outfit, setOutfit] = useState<Detail | null>(null);

  useFocusEffect(
    useCallback(() => {
      getOutfit(db, Number(id)).then(setOutfit);
    }, [db, id])
  );

  if (!outfit) return null;

  const confirmDelete = async () => {
    const ok = await confirmDestructive('このコーデを削除しますか？', '写真も一緒に削除されます。', '削除');
    if (!ok) return;
    await deleteOutfit(db, outfit.id);
    deletePhoto(outfit.photo);
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: photoUri(outfit.photo) }} style={styles.photo} contentFit="cover" />

      <View style={styles.section}>
        <Text style={styles.date}>{formatDate(outfit.date)}</Text>
        {outfit.people ? <Text style={styles.people}>with {outfit.people}</Text> : null}
        {outfit.memo ? <Text style={styles.memo}>{outfit.memo}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>使ったアイテム</Text>
        {outfit.items.length === 0 ? (
          <Text style={styles.subText}>アイテムは登録されていません</Text>
        ) : (
          outfit.items.map((item) => (
            <Pressable key={item.id} style={styles.itemRow} onPress={() => router.push(`/item/${item.id}`)}>
              {item.photo ? (
                <Image source={{ uri: photoUri(item.photo) }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Ionicons name="shirt-outline" size={20} color={colors.subText} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.subText}>{categoryLabel(item.category)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subText} />
            </Pressable>
          ))
        )}
      </View>

      <DangerButton title="このコーデを削除" onPress={confirmDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 48,
  },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
  },
  section: {
    gap: spacing.sm,
  },
  date: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  people: {
    fontSize: 15,
    color: colors.accent,
  },
  memo: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  subText: {
    fontSize: 12,
    color: colors.subText,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  itemName: {
    fontSize: 15,
    color: colors.text,
  },
});
