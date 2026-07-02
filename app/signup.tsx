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

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    if (!email || !nickname || !password || !confirmPassword) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      setError('약관 동의가 필요합니다.');
      return;
    }

    try {
      await signUp(email.trim(), password, nickname.trim());
      Alert.alert('회원가입 완료', '로그인해주세요.', [
        { text: '확인', onPress: () => router.replace('/login' as any) }
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      setError(message);
      Alert.alert('회원가입 실패', message);
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

            <ThemedText style={[styles.label, styles.marginTop]}>닉네임</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor="#868686"
              autoCapitalize="none"
              value={nickname}
              onChangeText={setNickname}
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

            <ThemedText style={[styles.label, styles.marginTop]}>비밀번호 확인</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 다시 입력하세요"
              placeholderTextColor="#868686"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.checkboxGroup}>
              <Pressable style={styles.checkboxRow} onPress={() => setAgreeTerms((prev) => !prev)}>
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms ? <View style={styles.checkboxIndicator} /> : null}
                </View>
                <ThemedText style={styles.checkboxLabel}>이용약관 동의</ThemedText>
              </Pressable>
              <Pressable style={[styles.checkboxRow, styles.marginTop]} onPress={() => setAgreePrivacy((prev) => !prev)}>
                <View style={[styles.checkbox, agreePrivacy && styles.checkboxChecked]}>
                  {agreePrivacy ? <View style={styles.checkboxIndicator} /> : null}
                </View>
                <ThemedText style={styles.checkboxLabel}>개인정보 수집 동의</ThemedText>
              </Pressable>
            </View>

            {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

            <TouchableOpacity style={styles.loginButton} onPress={handleSubmit} disabled={loading}>
              <ThemedText type="subtitle" style={styles.loginButtonText}>
                회원가입
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <ThemedText style={styles.footerText}>이미 계정이 있으신가요?</ThemedText>
              <Link href={'/login' as any}>
                <ThemedText type="defaultSemiBold" style={styles.footerLink}>로그인</ThemedText>
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
    fontFamily: 'Pretendard',
  },
  subtitleText: {
    color: '#fff',
    opacity: 0.7,
    marginTop: 8,
    fontFamily: 'Pretendard',
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  errorText: {
    color: '#D92D20',
    marginTop: 16,
    fontFamily: 'Pretendard',
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: '#1F4F3A',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
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
