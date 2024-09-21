import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import axios, { AxiosResponse } from 'axios';
import { apiUrl, originUrl } from '@/api/config'; 
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import { Stack } from 'expo-router';
import {saveSecureData, getSecureData, deleteSecureData, SessionCheckResponse} from '@/func/funcs';


const AxiosFunction = (data: any, navigation: NavigationProp<RootStackParamList>) => {
  axios
    .post(`${apiUrl}/auth/login`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': originUrl,
        'User-Agent': `AzionMobile/1.0 ${Platform.OS}/${Platform.Version}`,
      }
    })
    .then(function (response: AxiosResponse) {
      const accessToken = response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      saveSecureData('azionAccessToken', accessToken);
      saveSecureData('azionRefreshToken', refreshToken);
      navigation.navigate('(tabs)');
    })
    .catch(function (error: any) {
      console.log('Error:', error.message);
      console.log('Error Details:', error);
    });
};

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();



  const handleLogin = () => {
    setIsOtpSent(true); 
  };

  const handleSubmit = () => {
    const userData = {
      email,
      password,
      OTP: otp
    };
    AxiosFunction(userData, navigation);
  };

  useEffect(() => {
    const checkSession = async () => {
      const accessToken = await getSecureData('azionAccessToken');
      const refreshToken = await getSecureData('azionRefreshToken');
      if (accessToken && refreshToken) {
        const data = { accessToken, refreshToken };
        axios.post<SessionCheckResponse>(`${apiUrl}/token/session/check`, data, {
          headers: {
            'setUserAgent': 'AzionMobile',
            'Content-Type': 'application/json',
            'Origin': originUrl
          },
        })
        .then((response) => {
          const { message, accessToken: newAccessToken } = response.data;
          if (message === 'newAccessToken generated' && newAccessToken) {
            saveSecureData('azionAccessToken', newAccessToken);
          }
        })
        .catch((error) => {
          // console.error(error.response ? error.response : error);
          deleteSecureData('azionAccessToken');
          deleteSecureData('azionRefreshToken');
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
            placeholderTextColor="#FFFFFF" 
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#FFFFFF"
            secureTextEntry={true}
          />
          <Button title="Login" onPress={handleLogin} />
        </>
      ) : (
        <>
        <TouchableOpacity style={styles.circularButton} onPress={() => setIsOtpSent(false)}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="OTP"
            value={otp}
            onChangeText={setOtp}
            placeholderTextColor="#FFFFFF" 
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleSubmit} />
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
    backgroundColor: '#000',
  
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    color: 'white',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  circularButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000', 
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;