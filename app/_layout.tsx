// ✅ app/_layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";

import "./globals.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* As telas são carregadas automaticamente baseadas nos arquivos */}
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(common)" />
      </Stack>
    </AuthProvider>
  );
}