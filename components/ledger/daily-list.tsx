import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';

import { getCategoryIcon } from './category-icons';

type Transaction = {
  id: string;
  category: string;
  name: string;
  method: string;
  amount: number;
  isExpense: boolean;
  sharedToFeed: boolean;
};

export type DaySection = {
  title: string;
  weekday: string;
  expenseTotal: number;
  data: Transaction[];
};

export const MOCK_SECTIONS: DaySection[] = [
  {
    title: '7월 28일',
    weekday: '금요일',
    expenseTotal: 38400,
    data: [
      {
        id: '1',
        category: '카페·간식',
        name: '투썸플레이스',
        method: '신용카드',
        amount: 6800,
        isExpense: true,
        sharedToFeed: true,
      },
      {
        id: '2',
        category: '식비',
        name: '김밥천국',
        method: '체크카드',
        amount: 9200,
        isExpense: true,
        sharedToFeed: false,
      },
      {
        id: '3',
        category: '쇼핑',
        name: 'GS25 편의점',
        method: '신용카드',
        amount: 4400,
        isExpense: true,
        sharedToFeed: false,
      },
      {
        id: '4',
        category: '교통',
        name: '지하철',
        method: '교통카드',
        amount: 1400,
        isExpense: true,
        sharedToFeed: true,
      },
    ],
  },
];

export function formatWon(amount: number) {
  return amount.toLocaleString();
}

export function renderDaySectionHeader({ section }: { section: DaySection }) {
  return (
    <View style={styles.dayHeader}>
      <View style={styles.dayHeaderLeft}>
        <Text style={styles.dayHeaderDate}>{section.title}</Text>
        <Text style={styles.dayHeaderWeekday}>{section.weekday}</Text>
      </View>
      <Text style={styles.dayHeaderTotal}>
        지출 <Text style={styles.dayHeaderTotalAmount}>{formatWon(section.expenseTotal)}원</Text>
      </Text>
    </View>
  );
}

export function TransactionRow({ item }: { item: Transaction }) {
  const { icon, bg, color } = getCategoryIcon(item.category);
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowMethod}>{item.method}</Text>
      </View>
      <View style={styles.rowAmountColumn}>
        <Text style={[styles.rowAmount, item.isExpense && styles.rowAmountExpense]}>
          {item.isExpense ? '-' : '+'}
          {formatWon(item.amount)}
          <Text style={styles.rowAmountUnit}>원</Text>
        </Text>
        {item.sharedToFeed && (
          <View style={styles.sharedBadge}>
            <Text style={styles.sharedBadgeText}>피드 공개</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function DailyList() {
  return (
    <Tabs.SectionList
      sections={MOCK_SECTIONS}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) =>
        renderDaySectionHeader({ section: section as DaySection })
      }
      renderItem={({ item }) => <TransactionRow item={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

export const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 14,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 10,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  dayHeaderDate: {
    fontSize: 19,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  dayHeaderWeekday: {
    fontSize: 13,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  dayHeaderTotal: {
    fontSize: 14,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  dayHeaderTotalAmount: {
    fontWeight: '700',
    color: '#FFA100',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  rowMethod: {
    fontSize: 13,
    color: '#868686',
    marginTop: 2,
    fontFamily: 'Pretendard',
  },
  rowAmountColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  rowAmountExpense: {
    color: '#F19153',
  },
  rowAmountUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#868686',
  },
  sharedBadge: {
    backgroundColor: '#FDF6DC',
    borderWidth: 1,
    borderColor: '#F0DFA0',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sharedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A6D1F',
    fontFamily: 'Pretendard',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
});
