import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { migrateDb } from '@/db/migrate';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="album.db" onInit={migrateDb}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.text },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="outfit/new" options={{ title: 'コーデを登録', presentation: 'modal' }} />
        <Stack.Screen name="outfit/[id]" options={{ title: 'コーデ' }} />
        <Stack.Screen name="item/new" options={{ title: 'アイテムを登録', presentation: 'modal' }} />
        <Stack.Screen name="item/[id]" options={{ title: 'アイテム' }} />
      </Stack>
    </SQLiteProvider>
  );
}
