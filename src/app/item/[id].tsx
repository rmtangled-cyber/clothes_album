import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { DangerButton } from '@/components/Form';
import { OutfitGrid } from '@/components/OutfitGrid';
import { deleteItem, getItem, listOutfits, type Item, type Outfit } from '@/db/queries';
import { categoryLabel } from '@/lib/categories';
import { deletePhoto, photoUri } from '@/lib/photos';
import { colors, spacing } from '@/lib/theme';
import { lastWornText } from '@/lib/wear';

export default function ItemDetailScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  useFocusEffect(
    useCallback(() => {
      getItem(db, Number(id)).then(setItem);
      listOutfits(db, { itemId: Number(id) }).then(setOutfits);
    }, [db, id])
  );

  if (!item) return null;

  const confirmDelete = () => {
    Alert.alert(
      'このアイテムを削除しますか？',
      'コーデの記録は残りますが、このアイテムとのつながりは消えます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await deleteItem(db, item.id);
            deletePhoto(item.photo);
            router.back();
          },
        },
      ]
    );
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.top}>
        {item.photo ? (
          <Image source={{ uri: photoUri(item.photo) }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Ionicons name="shirt-outline" size={36} color={colors.subText} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {categoryLabel(item.category)}
            {item.color ? `・${item.color}` : ''}
          </Text>
          <Text style={styles.meta}>
            {lastWornText({ wear_count: outfits.length, last_worn: outfits[0]?.date ?? null })}
          </Text>
          {item.memo ? <Text style={styles.memo}>{item.memo}</Text> : null}
        </View>
      </View>
      <Text style={styles.heading}>このアイテムを使ったコーデ</Text>
    </View>
  );

  return (
    <OutfitGrid
      outfits={outfits}
      header={header}
      empty={
        <View>
          <Text style={styles.empty}>まだコーデに使われていません</Text>
          <DangerButton title="このアイテムを削除" onPress={confirmDelete} />
        </View>
      }
      footer={outfits.length > 0 ? <DangerButton title="このアイテムを削除" onPress={confirmDelete} /> : undefined}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.subText,
  },
  memo: {
    marginTop: 4,
    fontSize: 14,
    color: colors.text,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  empty: {
    textAlign: 'center',
    color: colors.subText,
    paddingVertical: spacing.xl,
  },
});
