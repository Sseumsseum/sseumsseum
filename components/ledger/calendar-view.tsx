import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { Tabs } from 'react-native-collapsible-tab-view';

import '@/components/ledger/calendar-locale-config';

import {
  MOCK_SECTIONS,
  TransactionRow,
  styles as dailyListStyles,
  renderDaySectionHeader,
  type DaySection,
} from './daily-list';

const MOCK_DAY_DATA: Record<string, { income?: string; expense?: string }> = {
  '2026-07-01': { income: '+280만' },
  '2026-07-02': { expense: '-6,600' },
  '2026-07-03': { expense: '-3,000' },
  '2026-07-04': { expense: '-8,200' },
  '2026-07-05': { income: '+5만', expense: '-8,000' },
  '2026-07-06': { expense: '-9,800' },
  '2026-07-07': { expense: '-1.9만' },
  '2026-07-08': { expense: '-1.1만' },
  '2026-07-09': { expense: '-3,000' },
  '2026-07-10': { income: '+5만', expense: '-8,000' },
  '2026-07-12': { expense: '-1.5만' },
  '2026-07-14': { expense: '-2.6만' },
  '2026-07-15': { income: '+20만' },
  '2026-07-16': { expense: '-1.8만' },
  '2026-07-18': { expense: '-1.9만' },
  '2026-07-20': { income: '+5만', expense: '-8,000' },
  '2026-07-28': { expense: '-3.8만' },
  '2026-07-22': { expense: '-2.3만' },
  '2026-07-24': { expense: '-2.4만' },
};

function weekdayColor(date: DateData) {
  const dayOfWeek = new Date(date.timestamp).getDay();
  if (dayOfWeek === 0) return '#D92D20';
  if (dayOfWeek === 6) return '#3DA9F2';
  return '#11181C';
}

type CalendarViewProps = {
  selectedDate: string;
  onSelectDate: (dateString: string) => void;
  calendarJumpKey: number;
};

export default function CalendarView({
  selectedDate,
  onSelectDate,
  calendarJumpKey,
}: CalendarViewProps) {
  const calendarGrid = (
    <View style={styles.calendarWrapper}>
      <Calendar
        key={calendarJumpKey}
        current={selectedDate}
        monthFormat="yyyy년 MMMM"
        onDayPress={(day: DateData) => onSelectDate(day.dateString)}
        dayComponent={({ date, state }) => {
          if (!date) {
            return null;
          }

          const dayData = MOCK_DAY_DATA[date.dateString];
          const isSelected = date.dateString === selectedDate;
          const isOutsideMonth = state === 'disabled';

          return (
            <TouchableOpacity style={styles.dayCell} onPress={() => onSelectDate(date.dateString)}>
              <View style={[styles.dateCircle, isSelected && styles.dateCircleSelected]}>
                <Text
                  style={[
                    styles.dateText,
                    { color: isOutsideMonth ? '#C4C4C4' : weekdayColor(date) },
                    isSelected && styles.dateTextSelected,
                  ]}
                >
                  {date.day}
                </Text>
              </View>
              {dayData?.income ? <Text style={styles.incomeText}>{dayData.income}</Text> : null}
              {dayData?.expense ? <Text style={styles.expenseText}>{dayData.expense}</Text> : null}
            </TouchableOpacity>
          );
        }}
        theme={{
          calendarBackground: '#fff',
          textSectionTitleColor: '#868686',
          arrowColor: '#1F4F3A',
          monthTextColor: '#11181C',
          textDayHeaderFontFamily: 'Pretendard',
          textMonthFontFamily: 'PretendardBold',
          textMonthFontSize: 18,
        }}
      />
    </View>
  );

  return (
    <Tabs.SectionList
      sections={MOCK_SECTIONS}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={dailyListStyles.listContent}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={calendarGrid}
      renderSectionHeader={({ section }) =>
        renderDaySectionHeader({ section: section as DaySection })
      }
      renderItem={({ item }) => <TransactionRow item={item} />}
      ItemSeparatorComponent={() => <View style={dailyListStyles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  calendarWrapper: {
    marginTop: 15,
  },
  dayCell: {
    height: 62,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
  },
  dateCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleSelected: {
    backgroundColor: '#1F4F3A',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Pretendard',
  },
  dateTextSelected: {
    color: '#fff',
  },
  incomeText: {
    fontSize: 9,
    lineHeight: 12,
    color: '#00A86B',
    fontFamily: 'Pretendard',
  },
  expenseText: {
    fontSize: 9,
    lineHeight: 12,
    color: '#FFA100',
    fontFamily: 'Pretendard',
  },
});
