import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import FeedScreen from './index';
import LedgerScreen from './ledger';
import StatsScreen from './stats';
import SettingsScreen from './settings';

const TABS = [
  { name: '피드', icon: 'article' as const },
  { name: '가계부', icon: 'account-balance-wallet' as const },
  { name: '통계', icon: 'bar-chart' as const },
  { name: '설정', icon: 'settings' as const },
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
        <View key="0"><FeedScreen /></View>
        <View key="1"><LedgerScreen /></View>
        <View key="2"><StatsScreen /></View>
        <View key="3"><SettingsScreen /></View>
      </PagerView>

      <View style={styles.tabBar}>
        {TABS.map((tab, index) => {
          const active = activeTab === index;
          return (
            <TouchableOpacity key={index} style={styles.tabItem} onPress={() => goToTab(index)}>
              <MaterialIcons
                name={tab.icon}
                size={24}
                color={active ? '#1F4F3A' : '#868686'}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.name}
              </Text>
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
