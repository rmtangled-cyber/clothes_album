import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ReactElement } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { Outfit } from '@/db/queries';
import { formatDate } from '@/lib/date';
import { photoUri } from '@/lib/photos';
import { colors, spacing } from '@/lib/theme';

const COLUMNS = 2;

type Props = {
  outfits: Outfit[];
  header?: ReactElement;
  empty?: ReactElement;
  footer?: ReactElement;
};

export function OutfitGrid({ outfits, header, empty, footer }: Props) {
  const { width } = useWindowDimensions();
  const tileWidth = (width - spacing.lg * 2 - spacing.sm * (COLUMNS - 1)) / COLUMNS;

  return (
    <FlatList
      data={outfits}
      keyExtractor={(o) => String(o.id)}
      numColumns={COLUMNS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={footer}
      renderItem={({ item }) => (
        <Pressable
          style={{ width: tileWidth }}
          onPress={() => router.push(`/outfit/${item.id}`)}
        >
          <Image
            source={{ uri: photoUri(item.photo) }}
            style={[styles.photo, { height: (tileWidth * 4) / 3 }]}
            contentFit="cover"
            transition={150}
          />
          <View style={styles.caption}>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            {item.people ? (
              <Text style={styles.people} numberOfLines={1}>
                with {item.people}
              </Text>
            ) : null}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96,
  },
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  photo: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
  },
  caption: {
    paddingTop: 6,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  people: {
    fontSize: 12,
    color: colors.subText,
  },
});
