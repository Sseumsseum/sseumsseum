import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type ToggleRow = {
  key: string;
  label: string;
  description: string;
};

const CONTENT_ROWS: ToggleRow[] = [
  { key: 'todaySpending', label: '오늘 지출', description: '오늘 사용한 금액 표시' },
  { key: 'monthTotal', label: '이번 달 합계', description: '이번 달 총 지출 표시' },
  { key: 'budgetRemaining', label: '예산 잔액', description: '남은 예산 표시' },
  { key: 'recentHistory', label: '최근 내역', description: '가장 최근 가계부 항목 표시' },
];

const WIDGET_SIZES = [
  { key: 'small', label: '작게', width: 140, height: 90 },
  { key: 'medium', label: '보통', width: 200, height: 110 },
  { key: 'large', label: '크게', width: 260, height: 140 },
] as const;

function WidgetPreview({
  enabled,
  size,
  hideAmounts,
  toggles,
}: {
  enabled: boolean;
  size: (typeof WIDGET_SIZES)[number];
  hideAmounts: boolean;
  toggles: Record<string, boolean>;
}) {
  const mock: Record<string, string> = {
    todaySpending: '-12,000원',
    monthTotal: '-450,000원',
    budgetRemaining: '550,000원',
    recentHistory: '마라탕 -17,000원',
  };

  return (
    <View style={styles.previewWrap}>
      <View style={[styles.widget, { width: size.width, height: size.height }, !enabled && styles.widgetDisabled]}>
        {enabled ? (
          <>
            <View style={styles.widgetHeader}>
              <View style={styles.widgetLogo}>
                <MaterialIcons name="account-balance-wallet" size={12} color="#fff" />
              </View>
              <Text style={styles.widgetHeaderText}>씀씀이</Text>
            </View>
            {CONTENT_ROWS.filter((row) => toggles[row.key]).map((row) => (
              <View key={row.key} style={styles.widgetRow}>
                <Text style={styles.widgetLabel} numberOfLines={1}>{row.label}</Text>
                <Text style={styles.widgetValue} numberOfLines={1}>{hideAmounts ? '••••••' : mock[row.key]}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.widgetOffText}>위젯이 꺼져 있어요</Text>
        )}
      </View>
    </View>
  );
}

export default function WidgetSettingsScreen() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [sizeKey, setSizeKey] = useState<(typeof WIDGET_SIZES)[number]['key']>('medium');
  const [sizePickerVisible, setSizePickerVisible] = useState(false);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    todaySpending: true,
    monthTotal: true,
    budgetRemaining: false,
    recentHistory: true,
  });

  const size = WIDGET_SIZES.find((s) => s.key === sizeKey) ?? WIDGET_SIZES[1];

  function toggle(key: string) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function renderRow(row: ToggleRow) {
    return (
      <View key={row.key} style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{row.label}</Text>
          <Text style={styles.rowDescription}>{row.description}</Text>
        </View>
        <Switch
          value={toggles[row.key]}
          onValueChange={() => toggle(row.key)}
          trackColor={{ false: '#E5E7EB', true: '#1F4F3A' }}
          thumbColor="#fff"
          disabled={!enabled}
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
        <Text style={styles.headerTitle}>위젯 설정</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <WidgetPreview enabled={enabled} size={size} hideAmounts={hideAmounts} toggles={toggles} />

        <Text style={styles.sectionTitle}>기본 설정</Text>
        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>위젯 사용</Text>
              <Text style={styles.rowDescription}>홈 화면에 위젯 표시</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: '#E5E7EB', true: '#1F4F3A' }}
              thumbColor="#fff"
            />
          </View>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            disabled={!enabled}
            onPress={() => setSizePickerVisible(true)}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>위젯 크기</Text>
              <Text style={styles.rowDescription}>홈 화면 위젯 크기 설정</Text>
            </View>
            <Text style={styles.rowValue}>{size.label}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>표시 항목</Text>
        <View style={styles.sectionCard}>{CONTENT_ROWS.map(renderRow)}</View>

        <Text style={styles.sectionTitle}>보안</Text>
        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>금액 숨기기</Text>
              <Text style={styles.rowDescription}>위젯에서 금액을 ••••••로 표시</Text>
            </View>
            <Switch
              value={hideAmounts}
              onValueChange={setHideAmounts}
              trackColor={{ false: '#E5E7EB', true: '#1F4F3A' }}
              thumbColor="#fff"
              disabled={!enabled}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={sizePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSizePickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSizePickerVisible(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>위젯 크기</Text>
            {WIDGET_SIZES.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.pickerItem}
                onPress={() => {
                  setSizeKey(option.key);
                  setSizePickerVisible(false);
                }}
              >
                <Text style={[styles.pickerItemText, option.key === sizeKey && styles.pickerItemTextActive]}>
                  {option.label}
                </Text>
                {option.key === sizeKey ? <MaterialIcons name="check" size={18} color="#1F4F3A" /> : null}
              </TouchableOpacity>
            ))}
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
  previewWrap: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  widget: {
    backgroundColor: '#1F4F3A',
    borderRadius: 20,
    padding: 14,
    justifyContent: 'center',
  },
  widgetDisabled: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  widgetOffText: {
    fontSize: 13,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  widgetLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Pretendard',
  },
  widgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 2,
  },
  widgetLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Pretendard',
  },
  widgetValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Pretendard',
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
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#11181C',
    textAlign: 'center',
    paddingVertical: 16,
    fontFamily: 'Pretendard',
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
