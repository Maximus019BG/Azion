import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SplashScreenAnimation } from '@/components/SplashScreenAnimation';
import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { deleteSecureData, getSecureData, saveSecureData } from '@/func/funcs';
import { apiUrl, originUrl } from '@/api/config';
import axios from 'axios';
import { RootStackParamList } from './types';
import { SessionCheckResponse } from '@/func/funcs';
import { navigationRef, navigate } from './navigationRef';
import AppNavigator from './AppNavigator';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [animationFinished, setAnimationFinished] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const accessToken = getSecureData('azionAccessToken');
      const refreshToken = getSecureData('azionRefreshToken');
      const data = { accessToken, refreshToken };
      axios.post<SessionCheckResponse>(`${apiUrl}/token/session/check`, data, {
        headers: {
          'User-Agent': `AzionMobile/1.0 ${Platform}`,
          'Content-Type': 'application/json',
          'Origin': originUrl,
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
        navigate('(auth)');
      });
    };

    const checkLoginStatus = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('azionAccessToken');
        setIsLoggedIn(!!accessToken);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    if (loaded) {
      SplashScreen.hideAsync();
      setTimeout(() => {
        setAnimationFinished(true);
        checkLoginStatus();
      }, 2000);
    }

    if(getSecureData('azionAccessToken') && getSecureData('azionRefreshToken')) {
      checkSession();
    }
  }, [loaded]);

  if (!loaded || !animationFinished || isLoggedIn === null) {
    return <SplashScreenAnimation />;
  }

  return (
    <NavigationContainer ref={navigationRef} independent={true}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppNavigator />
      </ThemeProvider>
    </NavigationContainer>
  );
}

export default RootLayout;