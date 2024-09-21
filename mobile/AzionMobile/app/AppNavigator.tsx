import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './(auth)/LoginScreen';
import RegisterScreen from './(auth)/RegisterScreen';
import AuthChoiceScreen from './(auth)/index';
import TabLayout from './(tabs)/_layout';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="(auth)">
      <Stack.Screen name="(auth)" component={AuthChoiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="(tabs)" component={TabLayout} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;