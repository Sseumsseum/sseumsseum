import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '@/providers/auth';

export default function AccountScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? '?';
  const initial = displayName[0].toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>계정 관리</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.profileRow}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>프로필</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <Text style={styles.rowLabel}>닉네임 변경</Text>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <Text style={styles.rowLabel}>프로필 사진 변경</Text>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <Text style={styles.rowLabel}>상태 메시지 변경</Text>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <View style={styles.sectionCard}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>이메일</Text>
              <Text style={styles.rowValue}>{user?.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>연결된 계정</Text>
              <Text style={styles.rowValue}>카카오</Text>
            </View>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <Text style={styles.rowLabel}>비밀번호 변경</Text>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기타</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.row} onPress={signOut} activeOpacity={0.7}>
              <Text style={[styles.rowLabel, styles.rowLabelDanger]}>로그아웃</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <Text style={[styles.rowLabel, styles.rowLabelMuted]}>회원탈퇴</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  headerSpacer: {
    width: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Pretendard',
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  profileEmail: {
    fontSize: 13,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#868686',
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontFamily: 'Pretendard',
  },
  sectionCard: {
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowLabel: {
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  rowLabelDanger: {
    color: '#FF3B30',
  },
  rowLabelMuted: {
    color: '#868686',
  },
  rowValue: {
    fontSize: 15,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
});
