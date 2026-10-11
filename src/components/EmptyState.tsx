import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/lib/theme';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 64,
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  message: {
    textAlign: 'center',
    color: colors.subText,
    lineHeight: 20,
  },
});
