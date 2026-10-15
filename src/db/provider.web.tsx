import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { loadPhotoCache } from '@/lib/photos.web';
import { colors } from '@/lib/theme';

import { WebDb } from './queries.web';

const DbContext = createContext<WebDb | null>(null);

export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<WebDb | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ask the browser not to evict our data when storage runs low.
    navigator.storage?.persist?.().catch(() => {});
    Promise.all([WebDb.load(), loadPhotoCache()])
      .then(([loaded]) => setDb(loaded))
      .catch((e) => setError(String(e)));
  }, []);

  if (!db) {
    return (
      <View style={styles.center}>
        {error ? <Text style={styles.error}>データを読み込めませんでした：{error}</Text> : <ActivityIndicator color={colors.accent} />}
      </View>
    );
  }
  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
}

export function useDb(): WebDb {
  const db = useContext(DbContext);
  if (!db) throw new Error('useDb must be used inside DbProvider');
  return db;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  error: {
    color: colors.danger,
  },
});
