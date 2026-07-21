import Header from '@/components/header';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_MONTH = '2026.04';

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
  const budgetPercent = Math.min(100, MOCK_SUMMARY.budgetUsedPercent);
  const budgetRemaining = MOCK_SUMMARY.budgetTotal - MOCK_SUMMARY.budgetUsed;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        left={
          <TouchableOpacity style={styles.monthSelector} hitSlop={8}>
            <Text style={styles.monthText}>{MOCK_MONTH}</Text>
            <MaterialIcons name="expand-more" size={22} color="#11181C" />
          </TouchableOpacity>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.greeting}>
          반가워요! <Text style={styles.greetingBold}>오늘의 씀씀이</Text>는 어떤가요?
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>이번 달 잔액</Text>
          <Text style={styles.summaryBalance}>{formatWon(MOCK_SUMMARY.balance)} 원</Text>

          <View style={styles.summaryStatsRow}>
            <View style={styles.summaryStatItem}>
              <View style={styles.summaryStatLabelRow}>
                <View style={[styles.dot, { backgroundColor: '#3DD68C' }]} />
                <Text style={styles.summaryStatLabel}>수입</Text>
              </View>
              <Text style={styles.summaryStatValue}>+ {formatWon(MOCK_SUMMARY.income)}</Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStatItem}>
              <View style={styles.summaryStatLabelRow}>
                <View style={[styles.dot, { backgroundColor: '#F2A93D' }]} />
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
            <Text style={styles.budgetCaptionHighlight}>{MOCK_SUMMARY.budgetUsedPercent}%</Text>{' '}
            사용 남은 금액 {formatWon(budgetRemaining)} 원
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} hitSlop={8}>
        <MaterialIcons name="edit" size={22} color="#11181C" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  greeting: {
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#4B5563',
    fontFamily: 'Pretendard',
    marginBottom: 12,
  },
  greetingBold: {
    fontWeight: '700',
    color: '#11181C',
  },
  summaryCard: {
    marginHorizontal: 16,
    backgroundColor: '#1F4F3A',
    borderRadius: 20,
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
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Pretendard',
  },
  summaryStatValue: {
    fontSize: 13,
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
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#E5B84B',
  },
  budgetCaption: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    fontFamily: 'Pretendard',
  },
  budgetCaptionHighlight: {
    color: '#0d0c0b',
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4C430',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
