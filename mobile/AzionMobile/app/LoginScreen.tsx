import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { apiUrl } from '@/api/config'; 
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './types';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface SessionCheckResponse {
  message: string;
  accessToken?: string;
}

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const saveSecureData = async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('Failed to save secure data', e);
    }
  };

  const getSecureData = async (key: string) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        return value;
      }
    } catch (e) {
      console.error('Failed to fetch secure data', e);
    }
  };

  const handleLogin = () => {
    const data = { email, password };

    axios.post<LoginResponse>(`${apiUrl}/auth/login`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      const { accessToken, refreshToken } = response.data;
      saveSecureData('azionAccessToken', accessToken);
      saveSecureData('azionRefreshToken', refreshToken);
      setIsOtpSent(true);
      Alert.alert('Login Successful', 'Please enter the OTP sent to your email.');
    })
    .catch((error) => {
      console.error(error.response ? error.response : error);
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    });
  };

  const handleVerifyOtp = () => {
    const data = { email, otp };

    axios.post(`${apiUrl}/auth/verify-otp`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      Alert.alert('OTP Verified', 'You have been logged in successfully.');
      navigation.navigate('Home');
    })
    .catch((error) => {
      console.error(error.response ? error.response : error);
      Alert.alert('OTP Verification Failed', 'Please check your OTP and try again.');
    });
  };

  useEffect(() => {
    const checkSession = async () => {
      const accessToken = await getSecureData('azionAccessToken');
      const refreshToken = await getSecureData('azionRefreshToken');
      if (accessToken && refreshToken) {
        const data = { accessToken, refreshToken };
        axios.post<SessionCheckResponse>(`${apiUrl}/token/session/check`, data, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          const { message, accessToken: newAccessToken } = response.data;
          if (message === 'newAccessToken generated' && newAccessToken) {
            saveSecureData('azionAccessToken', newAccessToken);
          }
        })
        .catch((error) => {
          console.error(error.response ? error.response : error);
          SecureStore.deleteItemAsync('azionAccessToken');
          SecureStore.deleteItemAsync('azionRefreshToken');
        });
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>
      {!isOtpSent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Login" onPress={handleLogin} />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOtp} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LoginScreen;