import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'my-app-token';
const REFRESH_TOKEN_KEY = 'my-app-refresh-token';

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