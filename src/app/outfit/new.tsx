import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { Field, formStyles, Input, PrimaryButton } from '@/components/Form';
import { ItemSelector } from '@/components/ItemSelector';
import { PhotoField } from '@/components/PhotoField';
import { useDb } from '@/db/provider';
import { createOutfit, listItems, listPeople } from '@/db/queries';
import { splitPeople, type Item } from '@/db/types';
import { toDateString } from '@/lib/date';
import { notify } from '@/lib/dialog';
import { deletePhoto, savePhoto } from '@/lib/photos';
import { colors, spacing } from '@/lib/theme';

export default function NewOutfitScreen() {
  const db = useDb();
  const [photo, setPhoto] = useState<string | null>(null);
  const [date, setDate] = useState(toDateString(new Date()));
  const [people, setPeople] = useState('');
  const [memo, setMemo] = useState('');
  const [itemIds, setItemIds] = useState<number[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [knownPeople, setKnownPeople] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Reload on focus so items added via "新しいアイテム" show up when coming back.
  useFocusEffect(
    useCallback(() => {
      listItems(db).then(setItems);
      listPeople(db).then(setKnownPeople);
    }, [db])
  );

  const currentPeople = splitPeople(people);
  const suggestions = knownPeople.filter((p) => !currentPeople.includes(p));

  const toggleItem = (id: number) =>
    setItemIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  const save = async () => {
    if (!photo) {
      notify('写真を選んでね', 'コーデの写真は必須です。');
      return;
    }
    setSaving(true);
    let fileName: string | null = null;
    try {
      fileName = await savePhoto(photo);
      await createOutfit(db, {
        photo: fileName,
        date,
        people: currentPeople.join(', '),
        memo: memo.trim(),
        itemIds,
      });
      router.back();
    } catch (e) {
      deletePhoto(fileName);
      notify('保存できませんでした', String(e));
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={formStyles.container} keyboardShouldPersistTaps="handled">
      <PhotoField uri={photo} onChange={setPhoto} />

      <Field label="日付">
        <DateField value={date} onChange={setDate} />
      </Field>

      <Field label="一緒にいた人" hint="複数いるときは「,」か「、」で区切ってね">
        <Input value={people} onChangeText={setPeople} placeholder="例：さき、ゆい" />
        {suggestions.length > 0 ? (
          <View style={styles.suggestions}>
            {suggestions.map((p) => (
              <Pressable
                key={p}
                style={styles.suggestion}
                onPress={() => setPeople([...currentPeople, p].join('、'))}
              >
                <Text style={styles.suggestionText}>＋ {p}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </Field>

      <Field label="使ったアイテム">
        {items.length > 0 ? (
          <ItemSelector items={items} selectedIds={itemIds} onToggle={toggleItem} />
        ) : (
          <Text style={styles.note}>まだアイテムが登録されていません。</Text>
        )}
        <Pressable onPress={() => router.push('/item/new')}>
          <Text style={styles.link}>＋ 新しいアイテムを登録</Text>
        </Pressable>
      </Field>

      <Field label="メモ">
        <Input
          value={memo}
          onChangeText={setMemo}
          placeholder="例：〇〇でランチ、褒められた！"
          multiline
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
      </Field>

      <PrimaryButton title={saving ? '保存中…' : '保存する'} onPress={save} disabled={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestion: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
  },
  suggestionText: {
    fontSize: 13,
    color: colors.text,
  },
  note: {
    color: colors.subText,
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
  },
});
