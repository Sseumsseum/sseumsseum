import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ReanimatedLogLevel, configureReanimatedLogger } from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/providers/auth';

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

// react-native-collapsible-tab-view의 Lazy 컴포넌트가 렌더 중에 shared value를 읽어서
// 발생하는 strict mode 경고를 숨김. 라이브러리 내부 코드라 우리 쪽에서 고칠 수 없음.
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const inAuthRoute = (segments as string[]).some(
    (segment) => segment === 'login' || segment === 'signup',
  );

  useEffect(() => {
    if (initializing) {
      return;
    }

    if (!user && !inAuthRoute) {
      router.replace('/login' as any);
      return;
    }

    if (user && inAuthRoute) {
      router.replace('/(tabs)' as any);
    }
  }, [user, initializing, inAuthRoute, router]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="comments/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="write" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Pretendard: require('../assets/fonts/Pretendard-Medium.otf'),
    PretendardBold: require('../assets/fonts/Pretendard-Bold.otf'),
    NanumSquareNeo: require('../assets/fonts/NanumSquareNeoOTF-Rg.otf'),
    NanumSquareNeoBold: require('../assets/fonts/NanumSquareNeoOTF-Bd.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* KeyboardAwareScrollView(write.tsx 등)가 동작하려면 트리 어딘가에 KeyboardProvider가 있어야 함 */}
      <KeyboardProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
          <StatusBar
            style="dark"
            backgroundColor={
              colorScheme === 'dark' ? DarkTheme.colors.background : DefaultTheme.colors.background
            }
            translucent={false}
          />
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#11181C',
  },
});
