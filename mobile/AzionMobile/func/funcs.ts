import * as SecureStore from "expo-secure-store";

const saveSecureData = (key: string, value: string) => {
  try {
     SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.error('Failed to save secure data', e);
  }
};

const getSecureData = (key: string) => {
  try {
    const value =  SecureStore.getItemAsync(key);
    if (value) {
      return value;
    }
    return null; 
  } catch (e) {
    console.error('Failed to fetch secure data', e);
    return null;
  }
};

const deleteSecureData = (key: string) => {
  try {
     SecureStore.deleteItemAsync(key);
  } catch (e) {
    console.error('Failed to delete secure data', e);
  }
};

interface SessionCheckResponse {
    message: string;
    accessToken?: string;
    refreshToken?: string;
}

export { saveSecureData, getSecureData, deleteSecureData, SessionCheckResponse };