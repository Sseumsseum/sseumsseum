import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { Setting } from '@/types';

type ToggleKey = 'showDailySum' | 'showHoliday' | 'showFixedExp';

type ToggleRow = {
  key: ToggleKey;
  label: string;
  description: string;
};

const DISPLAY_ROWS: ToggleRow[] = [
  { key: 'showDailySum', label: '일별 합계 표시', description: '달력에 날짜별 지출 합계 표시' },
  { key: 'showHoliday', label: '공휴일 표시', description: '공휴일 달력에 표시' },
  { key: 'showFixedExp', label: '고정지출 표시', description: '고정지출 예정일 표시' },
];

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// 그 달에 없는 날짜(예: 2월 30일)는 그 달의 마지막 날로 보정한다.
function cycleBoundaryDate(year: number, month: number, day: number): Date {
  return new Date(year, month, Math.min(day, daysInMonth(year, month)));
}

function getCycleGrid(today: Date, startWeekday: number, startDate: number) {
  let cycleStartYear = today.getFullYear();
  let cycleStartMonth = today.getMonth();
  const thisMonthStartDay = Math.min(startDate, daysInMonth(cycleStartYear, cycleStartMonth));
  if (today.getDate() < thisMonthStartDay) {
    cycleStartMonth -= 1;
    if (cycleStartMonth < 0) {
      cycleStartMonth = 11;
      cycleStartYear -= 1;
    }
  }

  const cycleStart = cycleBoundaryDate(cycleStartYear, cycleStartMonth, startDate);
  const cycleEndExclusive = cycleBoundaryDate(cycleStartYear, cycleStartMonth + 1, startDate);

  const dates: Date[] = [];
  const cursor = new Date(cycleStart);
  while (cursor < cycleEndExclusive) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const leadingBlanks = (cycleStart.getDay() - startWeekday + 7) % 7;
  const grid: (Date | null)[] = [...Array(leadingBlanks).fill(null), ...dates];

  return { grid, cycleStart, cycleEnd: dates[dates.length - 1] };
}

function CalendarPreview({ startWeekday, startDate }: { startWeekday: number; startDate: number }) {
  const today = new Date();
  const { grid, cycleStart, cycleEnd } = getCycleGrid(today, startWeekday, startDate);
  const weekLabels = [...WEEKDAY_LABELS.slice(startWeekday), ...WEEKDAY_LABELS.slice(0, startWeekday)];
  const title =
    startDate === 1
      ? `${cycleStart.getFullYear()}년 ${cycleStart.getMonth() + 1}월`
      : `${cycleStart.getMonth() + 1}월 ${cycleStart.getDate()}일 ~ ${cycleEnd.getMonth() + 1}월 ${cycleEnd.getDate()}일`;

  return (
    <View style={styles.calendarCard}>
      <Text style={styles.calendarTitle}>{title}</Text>
      <View style={styles.calendarWeekRow}>
        {weekLabels.map((label) => {
          const originalIndex = WEEKDAY_LABELS.indexOf(label);
          return (
            <Text
              key={label}
              style={[
                styles.calendarWeekLabel,
                originalIndex === 0 && styles.calendarSunday,
                originalIndex === 6 && styles.calendarSaturday,
              ]}
            >
              {label}
            </Text>
          );
        })}
      </View>
      <View style={styles.calendarGrid}>
        {grid.map((date, index) => {
          const isToday = date !== null && isSameDate(date, today);
          const weekday = (index + startWeekday) % 7;
          return (
            <View key={index} style={styles.calendarCell}>
              {date ? (
                <View style={[styles.calendarDateCircle, isToday && styles.calendarDateToday]}>
                  <Text
                    style={[
                      styles.calendarDateText,
                      weekday === 0 && styles.calendarSunday,
                      weekday === 6 && styles.calendarSaturday,
                      isToday && styles.calendarDateTextToday,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const INITIAL_SETTING: Setting = {
  userIdx: 0,
  budget: null,
  startDay: 1,
  startWeekday: WEEKDAY_LABELS[0],
  showDailySum: true,
  showHoliday: true,
  showFixedExp: true,
  theme: null,
  font: null,
  updatedAt: '2026-01-01T00:00:00Z',
};

export default function CalendarSettingsScreen() {
  const router = useRouter();
  const [setting, setSetting] = useState<Setting>(INITIAL_SETTING);
  const [weekdayPickerVisible, setWeekdayPickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const startWeekdayIndex = Math.max(0, WEEKDAY_LABELS.indexOf(setting.startWeekday ?? WEEKDAY_LABELS[0]));

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
        <Text style={styles.headerTitle}>달력 설정</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <CalendarPreview startWeekday={startWeekdayIndex} startDate={setting.startDay} />

        <Text style={styles.sectionTitle}>기본 설정</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setWeekdayPickerVisible(true)}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>시작 요일</Text>
              <Text style={styles.rowDescription}>달력의 첫번째 요일 설정</Text>
            </View>
            <Text style={styles.rowValue}>{setting.startWeekday}요일</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setDatePickerVisible(true)}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>시작 날짜</Text>
              <Text style={styles.rowDescription}>달력의 첫번째 날짜 설정</Text>
            </View>
            <Text style={styles.rowValue}>{setting.startDay}일</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>표시 설정</Text>
        <View style={styles.sectionCard}>{DISPLAY_ROWS.map(renderRow)}</View>
      </ScrollView>

      <Modal
        visible={weekdayPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWeekdayPickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setWeekdayPickerVisible(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>시작 요일</Text>
            {WEEKDAY_LABELS.map((label, index) => (
              <TouchableOpacity
                key={label}
                style={styles.pickerItem}
                onPress={() => {
                  setSetting((prev) => ({ ...prev, startWeekday: label }));
                  setWeekdayPickerVisible(false);
                }}
              >
                <Text style={[styles.pickerItemText, index === startWeekdayIndex && styles.pickerItemTextActive]}>
                  {label}요일
                </Text>
                {index === startWeekdayIndex ? (
                  <MaterialIcons name="check" size={18} color="#1F4F3A" />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={datePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDatePickerVisible(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>시작 날짜</Text>
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                <TouchableOpacity
                  key={date}
                  style={styles.pickerItem}
                  onPress={() => {
                    setSetting((prev) => ({ ...prev, startDay: date }));
                    setDatePickerVisible(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, date === setting.startDay && styles.pickerItemTextActive]}>
                    {date}일
                  </Text>
                  {date === setting.startDay ? (
                    <MaterialIcons name="check" size={18} color="#1F4F3A" />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  calendarCard: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11181C',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Pretendard',
  },
  calendarWeekRow: {
    flexDirection: 'row',
  },
  calendarWeekLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDateToday: {
    backgroundColor: '#1F4F3A',
  },
  calendarDateText: {
    fontSize: 13,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  calendarDateTextToday: {
    color: '#fff',
    fontWeight: '700',
  },
  calendarSunday: {
    color: '#D92D20',
  },
  calendarSaturday: {
    color: '#3B82F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#11181C',
    textAlign: 'center',
    paddingVertical: 16,
    fontFamily: 'Pretendard',
  },
  pickerScroll: {
    maxHeight: 320,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  pickerItemText: {
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  pickerItemTextActive: {
    color: '#1F4F3A',
    fontWeight: '700',
  },
});
