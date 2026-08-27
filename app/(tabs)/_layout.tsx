import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeedScreen from './index';
import LedgerScreen from './ledger';
import SettingsScreen from './settings';
import StatsScreen from './stats';

// "작성"은 더 이상 탭이 아니라 가계부 화면의 플로팅 버튼으로 진입하는
// 모달 라우트(app/write.tsx)로 뺐음. 탭에 남겨두면 뒤로가기 버튼이나
// 오늘 날짜 기본값 같은 문제가 생겨서 목적지(피드/가계부/통계/설정) 4개만 유지.
const TABS = [
  { name: '피드', icon: 'article' as const, iconSize: 24 },
  { name: '가계부', icon: 'account-balance-wallet' as const, iconSize: 24 },
  { name: '통계', icon: 'bar-chart' as const, iconSize: 24 },
  { name: '설정', icon: 'settings' as const, iconSize: 24 },
];

export default function TabLayout() {
  const pagerRef = useRef<PagerView>(null);
  const [activeTab, setActiveTab] = useState(0);

  function goToTab(index: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pagerRef.current?.setPage(index);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >
        <View key="0">
          <FeedScreen />
        </View>
        <View key="1">
          <LedgerScreen />
        </View>
        <View key="2">
          <StatsScreen />
        </View>
        <View key="3">
          <SettingsScreen />
        </View>
      </PagerView>

      <View style={styles.tabBar}>
        {TABS.map((tab, index) => {
          const active = activeTab === index;
          return (
            <TouchableOpacity key={index} style={styles.tabItem} onPress={() => goToTab(index)}>
              <MaterialIcons
                name={tab.icon}
                size={tab.iconSize}
                color={active ? '#1F4F3A' : '#868686'}
              />
              {tab.name ? (
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.name}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pager: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  tabLabelActive: {
    color: '#1F4F3A',
    fontWeight: '600',
  },
});
