import Header from '@/components/common/header';
import DatePickerModal from '@/components/ledger/date-picker-modal';
import LedgerTabs from '@/components/ledger/ledger-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatSelectedMonth(dateString: string) {
  return dateString.slice(0, 7).replaceAll('-', '.');
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MOCK_SUMMARY = {
  balance: 1055400,
  income: 3000000,
  expense: 67400,
  savings: 1500000,
  budgetUsed: 144600,
  budgetTotal: 1000000,
  budgetUsedPercent: 11,
};

function formatWon(amount: number) {
  return amount.toLocaleString();
}

export default function LedgerScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayString);
  const [calendarJumpKey, setCalendarJumpKey] = useState(0);

  function handleHeaderSelectDate(date: string) {
    setSelectedDate(date);
    setCalendarJumpKey((key) => key + 1);
  }

  const budgetPercent = Math.min(100, MOCK_SUMMARY.budgetUsedPercent);
  const budgetRemaining = MOCK_SUMMARY.budgetTotal - MOCK_SUMMARY.budgetUsed;

  const renderHeader = () => (
    <View style={styles.topSection}>
      <Text style={styles.greeting}>
        반가워요! <Text style={styles.greetingBold}>오늘의 씀씀이</Text>는 어떤가요?
      </Text>

      {/* 요약 */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>이번 달 잔액</Text>
        <Text style={styles.summaryBalance}>{formatWon(MOCK_SUMMARY.balance)} 원</Text>

        <View style={styles.summaryStatsRow}>
          <View style={styles.summaryStatItem}>
            <View style={styles.summaryStatLabelRow}>
              <View style={[styles.dot, { backgroundColor: '#00FFA6' }]} />
              <Text style={styles.summaryStatLabel}>수입</Text>
            </View>
            <Text style={styles.summaryStatValue}>+ {formatWon(MOCK_SUMMARY.income)}</Text>
          </View>
          <View style={styles.summaryStatDivider} />
          <View style={styles.summaryStatItem}>
            <View style={styles.summaryStatLabelRow}>
              <View style={[styles.dot, { backgroundColor: '#FFA100' }]} />
              <Text style={styles.summaryStatLabel}>지출</Text>
            </View>
            <Text style={styles.summaryStatValue}>- {formatWon(MOCK_SUMMARY.expense)}</Text>
          </View>
          <View style={styles.summaryStatDivider} />
          <View style={styles.summaryStatItem}>
            <View style={styles.summaryStatLabelRow}>
              <View style={[styles.dot, { backgroundColor: '#3DA9F2' }]} />
              <Text style={styles.summaryStatLabel}>저축</Text>
            </View>
            <Text style={styles.summaryStatValue}>{formatWon(MOCK_SUMMARY.savings)}</Text>
          </View>
        </View>

        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>이번 달 예산</Text>
          <Text style={styles.budgetValue}>
            {formatWon(MOCK_SUMMARY.budgetUsed)} / {formatWon(MOCK_SUMMARY.budgetTotal)} 원
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${budgetPercent}%` }]} />
        </View>
        <Text style={styles.budgetCaption}>
          예산의{' '}
          <Text style={styles.budgetCaptionHighlight}>{MOCK_SUMMARY.budgetUsedPercent}%</Text> 사용
          남은 금액 {formatWon(budgetRemaining)} 원
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        left={
          <TouchableOpacity
            style={styles.monthSelector}
            hitSlop={8}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.monthText}>{formatSelectedMonth(selectedDate)}</Text>
            <MaterialIcons name="expand-more" size={22} color="#11181C" />
          </TouchableOpacity>
        }
      />
      <View style={styles.tabsContainer}>
        <LedgerTabs
          renderHeader={renderHeader}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          calendarJumpKey={calendarJumpKey}
        />
      </View>
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleHeaderSelectDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    paddingBottom: 12,
  },
  tabsContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  greeting: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'NanumSquareNeo',
    marginLeft: 20,
    marginBottom: 12,
  },
  greetingBold: {
    fontFamily: 'NanumSquareNeoBold',
    color: '#11181C',
  },
  summaryCard: {
    marginHorizontal: 16,
    backgroundColor: '#284C3D',
    borderRadius: 16,
    padding: 20,
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Pretendard',
  },
  summaryBalance: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Pretendard',
    marginTop: 6,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    marginTop: 16,
    paddingVertical: 14,
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  summaryStatLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  summaryStatLabel: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'Pretendard',
  },
  summaryStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Pretendard',
  },
  summaryStatDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  budgetLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Pretendard',
  },
  budgetValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Pretendard',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#E5B84B',
  },
  budgetCaption: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Pretendard',
  },
  budgetCaptionHighlight: {
    color: '#FADD4B',
    fontWeight: '900',
  },
});
