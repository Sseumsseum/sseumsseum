import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '@/providers/auth';

type MenuItem = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  iconBg: string;
  iconColor: string;
  label: string;
  route?: string;
};

type Section = {
  title: string;
  items: MenuItem[];
};

const SECTIONS: Section[] = [
  {
    title: '소셜',
    items: [
      { icon: 'group', iconBg: '#E3F5E9', iconColor: '#34C759', label: '친구 관리', route: '/friends' },
      { icon: 'notifications', iconBg: '#FFF3D9', iconColor: '#FFB020', label: '알림 설정', route: '/notification-settings' },
    ],
  },
  {
    title: '가계부',
    items: [
      { icon: 'calendar-today', iconBg: '#E3EFFF', iconColor: '#3B82F6', label: '달력 설정', route: '/calendar-settings' },
      { icon: 'widgets', iconBg: '#F3E8FF', iconColor: '#AF52DE', label: '위젯 설정', route: '/widget-settings' },
      { icon: 'flag', iconBg: '#FFEAE0', iconColor: '#FF6B35', label: '카테고리 관리', route: '/categories' },
      { icon: 'credit-card', iconBg: '#E1F7EC', iconColor: '#12B884', label: '결제수단 관리', route: '/payment-methods' },
      { icon: 'attach-money', iconBg: '#FFE3EC', iconColor: '#FF2D55', label: '고정지출 관리', route: '/fixed-expenses' },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? '?';
  const initial = displayName[0].toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 프로필 */}
        <TouchableOpacity
          style={styles.profileRow}
          activeOpacity={0.7}
          onPress={() => router.push('/account' as any)}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        {/* 섹션 */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuRow}
                  activeOpacity={0.7}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                    <MaterialIcons name={item.icon} size={18} color={item.iconColor} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* 로그아웃 */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuRow} onPress={signOut} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: '#FFE3E3' }]}>
                <MaterialIcons name="logout" size={18} color="#FF3B30" />
              </View>
              <Text style={[styles.menuLabel, styles.menuLabelDanger]}>로그아웃</Text>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Pretendard',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
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
    marginBottom: 12,
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  menuLabelDanger: {
    color: '#FF3B30',
  },
});
