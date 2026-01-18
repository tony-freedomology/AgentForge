import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  CONNECTION_TOKEN: 'arcane_spire_connection_token',
  LAST_CONNECTION_URL: 'arcane_spire_last_connection_url',
  LAST_CONNECTION_NAME: 'arcane_spire_last_connection_name',
  DEVICE_ID: 'arcane_spire_device_id',
  PUSH_TOKEN: 'arcane_spire_push_token',
} as const;

class StorageService {
  // Generic get/set
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  // Connection token
  async getConnectionToken(): Promise<string | null> {
    return this.get<string>(STORAGE_KEYS.CONNECTION_TOKEN);
  }

  async setConnectionToken(token: string): Promise<void> {
    return this.set(STORAGE_KEYS.CONNECTION_TOKEN, token);
  }

  async removeConnectionToken(): Promise<void> {
    return this.remove(STORAGE_KEYS.CONNECTION_TOKEN);
  }

  // Last connection
  async getLastConnection(): Promise<{ url: string; name: string } | null> {
    const url = await this.get<string>(STORAGE_KEYS.LAST_CONNECTION_URL);
    const name = await this.get<string>(STORAGE_KEYS.LAST_CONNECTION_NAME);
    if (url && name) {
      return { url, name };
    }
    return null;
  }

  async setLastConnection(url: string, name: string): Promise<void> {
    await this.set(STORAGE_KEYS.LAST_CONNECTION_URL, url);
    await this.set(STORAGE_KEYS.LAST_CONNECTION_NAME, name);
  }

  // Device ID (for identifying this device to the daemon)
  async getDeviceId(): Promise<string> {
    let deviceId = await this.get<string>(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await this.set(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  }

  // Push token
  async getPushToken(): Promise<string | null> {
    return this.get<string>(STORAGE_KEYS.PUSH_TOKEN);
  }

  async setPushToken(token: string): Promise<void> {
    return this.set(STORAGE_KEYS.PUSH_TOKEN, token);
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export class for testing
export { StorageService };
