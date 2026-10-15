import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Chips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { FloatingButton } from '@/components/FloatingButton';
import { OutfitGrid } from '@/components/OutfitGrid';
import { useDb } from '@/db/provider';
import { listOutfits, listPeople } from '@/db/queries';
import type { Outfit } from '@/db/types';

export default function OutfitsScreen() {
  const db = useDb();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [person, setPerson] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      listOutfits(db, { person: person ?? undefined }).then(setOutfits);
      listPeople(db).then(setPeople);
    }, [db, person])
  );

  return (
    <View style={{ flex: 1 }}>
      <OutfitGrid
        outfits={outfits}
        header={
          people.length > 0 ? (
            <Chips
              options={people.map((p) => ({ key: p, label: p }))}
              selected={person}
              onSelect={setPerson}
            />
          ) : undefined
        }
        empty={
          person ? (
            <EmptyState title="見つかりませんでした" message={`${person}と会った日のコーデはまだありません。`} />
          ) : (
            <EmptyState
              title="まだコーデがありません"
              message={'右下の＋ボタンから、今日のコーデを登録してみよう。\n友達と撮った写真でもOK！'}
            />
          )
        }
      />
      <FloatingButton label="コーデを登録" onPress={() => router.push('/outfit/new')} />
    </View>
  );
}
