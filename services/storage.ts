import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = process.env.EXPO_PUBLIC_TOKEN_KEY || "retorna_token";
const REFRESH_TOKEN_KEY = process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY || "retorna_refresh_token";

export const storage = {
  saveToken: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  getToken: async () => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
  saveRefreshToken: async (token: string) => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },
  getRefreshToken: async () => {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  clearTokens: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};