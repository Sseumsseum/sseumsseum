import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/providers/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);
  const [rememberId, setRememberId] = useState(true);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      await signIn(email.trim(), password);
      Alert.alert('로그인 성공', '환영합니다!', [
        { text: '확인', onPress: () => router.replace('/(tabs)' as any) },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(message);
      Alert.alert('로그인 실패', message);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.topSection}>
            <View style={styles.avatar}>

            </View>
            <ThemedText type="title" style={styles.nameText}>
              씀씀이
            </ThemedText>
            <ThemedText style={styles.subtitleText}>친구랑 같이 쓰는 가계부</ThemedText>
          </View>

          <View style={styles.body}>
            <ThemedText style={styles.label}>이메일</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              placeholderTextColor="#868686"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <ThemedText style={[styles.label, styles.marginTop]}>비밀번호</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor="#868686"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxContainer}>
                <Pressable style={styles.checkboxRow} onPress={() => setAutoLogin((prev) => !prev)}>
                  <View style={[styles.checkbox, autoLogin && styles.checkboxChecked]}>
                    {autoLogin ? <View style={styles.checkboxIndicator} /> : null}
                  </View>
                  <ThemedText style={styles.checkboxLabel}>자동 로그인</ThemedText>
                </Pressable>
                <Pressable style={[styles.checkboxRow, { marginLeft: 16 }]} onPress={() => setRememberId((prev) => !prev)}>
                  <View style={[styles.checkbox, rememberId && styles.checkboxChecked]}>
                    {rememberId ? <View style={styles.checkboxIndicator} /> : null}
                  </View>
                  <ThemedText style={styles.checkboxLabel}>아이디 저장</ThemedText>
                </Pressable>
              </View>
            </View>

            {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

            <ThemedText style={styles.helpText}>아이디 찾기 / 비밀번호 재설정</ThemedText>
            <TouchableOpacity style={styles.loginButton} onPress={handleSubmit} disabled={loading}>
              <ThemedText type="subtitle" style={styles.loginButtonText}>
                로그인
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.kakaoButton} onPress={() => null}>
              <ThemedText type="subtitle" style={styles.kakaoText}>
                카카오로 로그인
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <ThemedText style={styles.footerText}>아직 계정이 없으신가요?</ThemedText>
              <Link href={'/signup' as any}>
                <ThemedText type="defaultSemiBold" style={styles.footerLink}>회원가입</ThemedText>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 50,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 16,
    backgroundColor: '#1F4F3A',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  avatar: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  avatarText: {
    color: '#284C3B',
    fontFamily: 'Pretendard',
  },
  nameText: {
    color: '#FADD4B',
    fontFamily: 'Pretendard'
  },
  subtitleText: {
    color: '#fff',
    opacity: 0.7,
    marginTop: 8,
    fontFamily: 'Pretendard'
  },
  body: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
    marginTop: 0,
  },
  label: {
    marginBottom: 8,
    color: '#284C3B',
    fontFamily: 'Pretendard',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
    color: '#284C3B',
    fontFamily: 'Pretendard',
  },
  marginTop: {
    marginTop: 16,
  },
  checkboxGroup: {
    marginTop: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    marginTop: 16,
    color: '#284C3B',
    fontSize: 13,
    textAlign: 'right',
    fontFamily: 'Pretendard',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#868686',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#284C3B',
    backgroundColor: '#284C3B',
  },
  checkboxIndicator: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#284C3B',
    fontFamily: 'Pretendard',
  },
  linkText: {
    fontSize: 14,
    color: '#284C3B',
    fontFamily: 'Pretendard',
  },
  errorText: {
    color: '#D92D20',
    marginTop: 16,
    fontFamily: 'Pretendard',
  },
  loginButton: {
    marginTop: 8,
    backgroundColor: '#1F4F3A',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontFamily: 'Pretendard',
  },
  kakaoButton: {
    marginTop: 16,
    backgroundColor: '#FCD100',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  kakaoText: {
    color: '#000',
    fontFamily: 'Pretendard',
  },
  footerRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  footerLink: {
    color: '#284C3B',
    fontFamily: 'Pretendard',
  },
});
