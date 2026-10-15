import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DbProvider } from '@/db/provider';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <DbProvider>
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
    </DbProvider>
  );
}
