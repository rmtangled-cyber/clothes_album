import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { pickFromLibrary, takePhoto } from '@/lib/photos';
import { colors, spacing } from '@/lib/theme';

type Props = {
  uri: string | null;
  onChange: (uri: string) => void;
  aspectRatio?: number;
};

export function PhotoField({ uri, onChange, aspectRatio = 3 / 4 }: Props) {
  const pick = async (from: 'library' | 'camera') => {
    const picked = from === 'library' ? await pickFromLibrary() : await takePhoto();
    if (picked) onChange(picked);
  };

  return (
    <View>
      <Pressable onPress={() => pick('library')} style={[styles.preview, { aspectRatio }]}>
        {uri ? (
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={40} color={colors.subText} />
            <Text style={styles.placeholderText}>タップして写真を選ぶ</Text>
          </View>
        )}
      </Pressable>
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={() => pick('library')}>
          <Ionicons name="images-outline" size={18} color={colors.accent} />
          <Text style={styles.buttonText}>写真から選ぶ</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => pick('camera')}>
          <Ionicons name="camera-outline" size={18} color={colors.accent} />
          <Text style={styles.buttonText}>撮影する</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.accentSoft,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    color: colors.subText,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  buttonText: {
    color: colors.accent,
    fontWeight: '600',
  },
});
