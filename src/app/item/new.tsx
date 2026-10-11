import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';

import { Chips } from '@/components/Chips';
import { Field, formStyles, Input, PrimaryButton } from '@/components/Form';
import { PhotoField } from '@/components/PhotoField';
import { createItem } from '@/db/queries';
import { CATEGORIES, type CategoryKey } from '@/lib/categories';
import { deletePhoto, savePhoto } from '@/lib/photos';

export default function NewItemScreen() {
  const db = useSQLiteContext();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryKey>('tops');
  const [color, setColor] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('名前を入れてね', '例：白のニット、デニムスカート');
      return;
    }
    setSaving(true);
    let fileName: string | null = null;
    try {
      if (photo) fileName = await savePhoto(photo);
      await createItem(db, {
        name: name.trim(),
        category,
        color: color.trim(),
        photo: fileName,
        memo: memo.trim(),
      });
      router.back();
    } catch (e) {
      deletePhoto(fileName);
      Alert.alert('保存できませんでした', String(e));
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={formStyles.container} keyboardShouldPersistTaps="handled">
      <PhotoField uri={photo} onChange={setPhoto} aspectRatio={1} />

      <Field label="名前">
        <Input value={name} onChangeText={setName} placeholder="例：白のニット" />
      </Field>

      <Field label="カテゴリ">
        <Chips
          options={CATEGORIES}
          selected={category}
          onSelect={(key) => key && setCategory(key as CategoryKey)}
          allowDeselect={false}
        />
      </Field>

      <Field label="色">
        <Input value={color} onChangeText={setColor} placeholder="例：ホワイト" />
      </Field>

      <Field label="メモ">
        <Input value={memo} onChangeText={setMemo} placeholder="例：〇〇で買った" />
      </Field>

      <PrimaryButton title={saving ? '保存中…' : '保存する'} onPress={save} disabled={saving} />
    </ScrollView>
  );
}
