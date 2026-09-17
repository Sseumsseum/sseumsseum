import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { NotificationSetting } from '@/types';

type ToggleKey =
  | 'likeAlarm'
  | 'commentAlarm'
  | 'friendReqAlarm'
  | 'dailyReminder'
  | 'budgetExceed'
  | 'fixedExpAlarm';

type ToggleRow = {
  key: ToggleKey;
  label: string;
  description: string;
};

const SOCIAL_ROWS: ToggleRow[] = [
  { key: 'likeAlarm', label: '좋아요', description: '좋아요가 달렸을 때 알림' },
  { key: 'commentAlarm', label: '댓글', description: '댓글이 달렸을 때 알림' },
  { key: 'friendReqAlarm', label: '친구 요청', description: '친구 요청이 왔을 때 알림' },
];

const LEDGER_ROWS: ToggleRow[] = [
  { key: 'dailyReminder', label: '일일 리마인더', description: '매일 가계부 기록 알림' },
  { key: 'budgetExceed', label: '예산 초과', description: '예산 초과했을 때 알림' },
  { key: 'fixedExpAlarm', label: '고정지출 알림', description: '고정지출 결제일 알림' },
];

const INITIAL_SETTING: NotificationSetting = {
  userIdx: 0,
  allAlarm: true,
  likeAlarm: true,
  commentAlarm: true,
  friendReqAlarm: true,
  dailyReminder: true,
  reminderTime: '21:00',
  budgetExceed: true,
  fixedExpAlarm: true,
  dndYn: true,
  dndStart: '22:00',
  dndEnd: '08:00',
  updatedAt: '2026-01-01T00:00:00Z',
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [setting, setSetting] = useState<NotificationSetting>(INITIAL_SETTING);

  function toggle(key: ToggleKey) {
    setSetting((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function renderRow(row: ToggleRow) {
    return (
      <View key={row.key} style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{row.label}</Text>
          <Text style={styles.rowDescription}>{row.description}</Text>
        </View>
        <Switch
          value={setting[row.key]}
          onValueChange={() => toggle(row.key)}
          trackColor={{ false: '#E5E7EB', true: '#1F4F3A' }}
          thumbColor="#fff"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.allRow}>
          <View style={styles.rowText}>
            <Text style={styles.allRowLabel}>전체 알림</Text>
            <Text style={styles.rowDescription}>모든 알림을 켜거나 끕니다</Text>
          </View>
          <Switch
            value={setting.allAlarm}
            onValueChange={(value) => setSetting((prev) => ({ ...prev, allAlarm: value }))}
            trackColor={{ false: '#E5E7EB', true: '#1F4F3A' }}
            thumbColor="#fff"
          />
        </View>

        <Text style={styles.sectionTitle}>소셜</Text>
        <View style={styles.sectionCard}>{SOCIAL_ROWS.map(renderRow)}</View>

        <Text style={styles.sectionTitle}>가계부</Text>
        <View style={styles.sectionCard}>
          {renderRow(LEDGER_ROWS[0])}
          <TouchableOpacity style={styles.row} activeOpacity={0.7}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>리마인더 시간</Text>
              <Text style={styles.rowDescription}>가계부 기록 알림 시간 설정</Text>
            </View>
            <Text style={styles.rowValue}>{setting.reminderTime}</Text>
          </TouchableOpacity>
          {LEDGER_ROWS.slice(1).map(renderRow)}
        </View>

        <Text style={styles.sectionTitle}>알림 시간대</Text>
        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>방해금지 시간 설정</Text>
              <Text style={styles.rowDescription}>설정한 시간에 알림 미발송</Text>
            </View>
            <Switch
              value={setting.dndYn}
              onValueChange={(value) => setSetting((prev) => ({ ...prev, dndYn: value }))}
              trackColor={{ false: '#E5E7EB', true: '#1F4F3A' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.timeRangeRow}>
            <TouchableOpacity style={styles.timeBox} activeOpacity={0.7}>
              <Text style={styles.timeBoxText}>{setting.dndStart}</Text>
            </TouchableOpacity>
            <Text style={styles.timeRangeSeparator}>~</Text>
            <TouchableOpacity style={styles.timeBox} activeOpacity={0.7}>
              <Text style={styles.timeBoxText}>{setting.dndEnd}</Text>
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
  allRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },
  allRowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#868686',
    fontWeight: '600',
    paddingTop: 20,
    paddingBottom: 8,
    fontFamily: 'Pretendard',
  },
  sectionCard: {
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
    marginRight: 16,
  },
  rowLabel: {
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  rowDescription: {
    fontSize: 13,
    color: '#868686',
    marginTop: 4,
    fontFamily: 'Pretendard',
  },
  rowValue: {
    fontSize: 14,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  timeRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  timeBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeBoxText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  timeRangeSeparator: {
    fontSize: 14,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
});
