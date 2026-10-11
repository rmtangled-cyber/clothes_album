import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { formatDate, fromDateString, toDateString } from '@/lib/date';
import { colors, spacing } from '@/lib/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function DateField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  // iOS shows a compact inline button that opens its own calendar.
  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={fromDateString(value)}
        mode="date"
        display="compact"
        locale="ja-JP"
        maximumDate={new Date()}
        onValueChange={(_, date) => onChange(toDateString(date))}
        style={styles.iosPicker}
      />
    );
  }

  return (
    <>
      <Pressable style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.buttonText}>{formatDate(value)}</Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={fromDateString(value)}
          mode="date"
          maximumDate={new Date()}
          onValueChange={(_, date) => {
            setOpen(false);
            onChange(toDateString(date));
          }}
          onDismiss={() => setOpen(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  iosPicker: {
    alignSelf: 'flex-start',
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
  },
  buttonText: {
    color: colors.text,
  },
});
