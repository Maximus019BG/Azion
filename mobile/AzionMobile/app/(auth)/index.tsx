import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

type AuthChoiceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AuthChoice'>;

const AuthChoiceScreen: React.FC = () => {
  const [choice, setChoice] = useState<string>('');
  const navigation = useNavigation<AuthChoiceScreenNavigationProp>();

  if (choice === 'login') {
    return <LoginScreen />;
  } else if (choice === 'register') {
    return <RegisterScreen />;
  }

  return (
    <View style={styles.container}>
      <Button title="Login" onPress={() => setChoice('login')} />
      <Button title="Register" onPress={() => setChoice('register')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor:'#00070a',
    padding: 16,
  },
});

export default AuthChoiceScreen;