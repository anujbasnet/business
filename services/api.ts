import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: Adjust to your LAN IP so the mobile device/emulator can reach the backend.
export const API_BASE_URL = `https://${process.env.EXPO_PUBLIC_SERVER_IP}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(async (cfg) => {
  try {
    const token = await AsyncStorage.getItem('BusinessToken');
    if (token) {
      const h: any = cfg.headers || {};
      h.Authorization = `Bearer ${token}`;
      cfg.headers = h;
    }
  } catch {}
  return cfg;
});
