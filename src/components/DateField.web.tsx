import { toDateString } from '@/lib/date';
import { colors } from '@/lib/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

// The native date picker library has no web support, so use the browser's date input.
export function DateField({ value, onChange }: Props) {
  return (
    <input
      type="date"
      value={value}
      max={toDateString(new Date())}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      style={{
        alignSelf: 'flex-start',
        padding: '8px 12px',
        fontSize: 16,
        border: 'none',
        borderRadius: 8,
        backgroundColor: colors.accentSoft,
        color: colors.text,
        fontFamily: 'inherit',
      }}
    />
  );
}
