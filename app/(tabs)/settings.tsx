import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '@/providers/auth';

type MenuItem = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  iconBg: string;
  label: string;
};

type Section = {
  title: string;
  items: MenuItem[];
};

const SECTIONS: Section[] = [
  {
    title: '소셜',
    items: [
      { icon: 'group', iconBg: '#34C759', label: '친구 관리' },
      { icon: 'notifications', iconBg: '#FF9500', label: '알림 설정' },
    ],
  },
  {
    title: '가계부',
    items: [
      { icon: 'calendar-today', iconBg: '#007AFF', label: '달력 설정' },
      { icon: 'widgets', iconBg: '#AF52DE', label: '위젯 설정' },
      { icon: 'flag', iconBg: '#FF6B35', label: '카테고리 관리' },
      { icon: 'credit-card', iconBg: '#30D158', label: '결제수단 관리' },
      { icon: 'attach-money', iconBg: '#FF2D55', label: '고정지출 관리' },
    ],
  },
];

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? '?';
  const initial = displayName[0].toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 프로필 */}
        <TouchableOpacity style={styles.profileRow} activeOpacity={0.7}>
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
              {section.items.map((item, index) => (
                <View key={item.label}>
                  <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                    <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                      <MaterialIcons name={item.icon} size={18} color="#fff" />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#C7C7CC" />
                  </TouchableOpacity>
                  {index < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* 로그아웃 */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuRow} onPress={signOut} activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: '#FF3B30' }]}>
                <MaterialIcons name="logout" size={18} color="#fff" />
              </View>
              <Text style={[styles.menuLabel, styles.menuLabelDanger]}>로그아웃</Text>
              <MaterialIcons name="chevron-right" size={20} color="#C7C7CC" />
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
    backgroundColor: '#F8FAFC',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
    marginBottom: 8,
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
    marginBottom: 8,
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
    paddingVertical: 16,
    gap: 16,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
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
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 64,
  },
});
