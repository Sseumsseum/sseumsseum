import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { RegularExpense } from '@/types';

type DisplayExpense = RegularExpense & { reminderEnabled: boolean };

const CATEGORIES: { idx: number; label: string }[] = [
  { idx: 1, label: '구독' },
  { idx: 2, label: '보험' },
  { idx: 3, label: '통신비' },
  { idx: 4, label: '주거비' },
  { idx: 5, label: '대출/할부' },
  { idx: 6, label: '기타' },
];
const PAYMENT_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const INITIAL_EXPENSES: DisplayExpense[] = [
  {
    idx: 1,
    userIdx: 0,
    name: '넷플릭스',
    amount: 17000,
    categoryIdx: 1,
    paymentIdx: null,
    cycle: 'MONTHLY',
    dayOfCycle: 5,
    isDeleted: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    reminderEnabled: true,
  },
  {
    idx: 2,
    userIdx: 0,
    name: '월세',
    amount: 500000,
    categoryIdx: 4,
    paymentIdx: null,
    cycle: 'MONTHLY',
    dayOfCycle: 1,
    isDeleted: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    reminderEnabled: true,
  },
];

export default function FixedExpensesScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<DisplayExpense[]>(INITIAL_EXPENSES);
  const [addVisible, setAddVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategoryIdx, setNewCategoryIdx] = useState<number>(CATEGORIES[0].idx);
  const [newDay, setNewDay] = useState(1);
  const [newReminderEnabled, setNewReminderEnabled] = useState(true);
  const [dayPickerVisible, setDayPickerVisible] = useState(false);

  function remove(idx: number) {
    setExpenses((prev) => prev.filter((expense) => expense.idx !== idx));
  }

  function handleAdd() {
    const name = newName.trim();
    const amount = Number(newAmount);
    if (!name || !amount) return;
    setExpenses((prev) => [
      ...prev,
      {
        idx: Date.now(),
        userIdx: 0,
        name,
        amount,
        categoryIdx: newCategoryIdx,
        paymentIdx: null,
        cycle: 'MONTHLY',
        dayOfCycle: newDay,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reminderEnabled: newReminderEnabled,
      },
    ]);
    setNewName('');
    setNewAmount('');
    setNewCategoryIdx(CATEGORIES[0].idx);
    setNewDay(1);
    setNewReminderEnabled(true);
    setAddVisible(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>고정지출 관리</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {expenses.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>등록된 고정지출이 없어요.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {expenses.map((expense) => (
              <View key={expense.idx} style={styles.row}>
                <View style={styles.icon}>
                  <MaterialIcons name="event-repeat" size={18} color="#fff" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{expense.name}</Text>
                  <View style={styles.typeLine}>
                    <Text style={styles.type}>
                      {CATEGORIES.find((category) => category.idx === expense.categoryIdx)?.label} · 매월{' '}
                      {expense.dayOfCycle}일 · {expense.amount.toLocaleString()}원
                    </Text>
                    {expense.reminderEnabled ? (
                      <MaterialIcons name="notifications" size={13} color="#868686" />
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity hitSlop={8} onPress={() => remove(expense.idx)}>
                  <MaterialIcons name="close" size={20} color="#868686" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => setAddVisible(true)}>
          <MaterialIcons name="add" size={18} color="#11181C" />
          <Text style={styles.addButtonText}>고정지출 추가</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={addVisible} transparent animationType="fade" onRequestClose={() => setAddVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.modalOverlay} onPress={() => setAddVisible(false)}>
            <Pressable style={styles.addSheet} onPress={(e) => e.stopPropagation()}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.addSheetTitle}>고정지출 추가</Text>

                <TextInput
                  style={styles.addInput}
                  placeholder="고정지출 이름 (예: 넷플릭스)"
                  placeholderTextColor="#868686"
                  value={newName}
                  onChangeText={setNewName}
                  autoFocus
                />

                <TextInput
                  style={[styles.addInput, styles.amountInput]}
                  placeholder="금액"
                  placeholderTextColor="#868686"
                  value={newAmount}
                  onChangeText={setNewAmount}
                  keyboardType="number-pad"
                />

                <View style={styles.typeRow}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.idx}
                      style={[styles.typeChip, newCategoryIdx === category.idx && styles.typeChipActive]}
                      onPress={() => setNewCategoryIdx(category.idx)}
                    >
                      <Text
                        style={[styles.typeChipText, newCategoryIdx === category.idx && styles.typeChipTextActive]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.creditSection}>
                  <TouchableOpacity style={styles.selectRow} activeOpacity={0.7} onPress={() => setDayPickerVisible(true)}>
                    <Text style={styles.creditLabel}>결제일</Text>
                    <View style={styles.selectValueRow}>
                      <Text style={styles.selectValue}>매월 {newDay}일</Text>
                      <MaterialIcons name="expand-more" size={20} color="#868686" />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.reminderRow}>
                    <View style={styles.reminderText}>
                      <Text style={styles.rowLabel}>결제일 알림</Text>
                      <Text style={styles.rowDescription}>매월 {newDay}일에 결제일 알림 받기</Text>
                    </View>
                    <Switch
                      value={newReminderEnabled}
                      onValueChange={setNewReminderEnabled}
                      trackColor={{ false: '#E5E7EB', true: '#1F4F3A' }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.confirmButton, (!newName.trim() || !Number(newAmount)) && styles.confirmButtonDisabled]}
                  onPress={handleAdd}
                  disabled={!newName.trim() || !Number(newAmount)}
                >
                  <Text style={styles.confirmButtonText}>추가하기</Text>
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={dayPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDayPickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDayPickerVisible(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>결제일</Text>
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              {PAYMENT_DAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={styles.pickerItem}
                  onPress={() => {
                    setNewDay(day);
                    setDayPickerVisible(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, day === newDay && styles.pickerItemTextActive]}>
                    {day}일
                  </Text>
                  {day === newDay ? <MaterialIcons name="check" size={18} color="#1F4F3A" /> : null}
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 14,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  list: {
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF2D55',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  typeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  type: {
    fontSize: 13,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  addSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '85%',
  },
  addSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 16,
    fontFamily: 'Pretendard',
  },
  addInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  amountInput: {
    marginTop: 12,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  typeChip: {
    paddingHorizontal: 14,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeChipActive: {
    backgroundColor: '#1F4F3A',
    borderColor: '#1F4F3A',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  creditSection: {
    marginTop: 20,
  },
  creditLabel: {
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  selectValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  selectValue: {
    fontSize: 14,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  reminderText: {
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
  confirmButton: {
    marginTop: 20,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1F4F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Pretendard',
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
