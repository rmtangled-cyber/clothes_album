import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import type { ReactNode } from 'react';

import { migrateDb } from './migrate';

export function DbProvider({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName="album.db" onInit={migrateDb}>
      {children}
    </SQLiteProvider>
  );
}

export const useDb = useSQLiteContext;
