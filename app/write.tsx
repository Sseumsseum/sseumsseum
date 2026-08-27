import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import CategorySheet from '@/components/ledger/category-sheet';
import DatePickerModal from '@/components/ledger/date-picker-modal';
import { useAuth } from '@/providers/auth';
import { fetchCategories } from '@/services/categories';
import { fetchPayments } from '@/services/payments';
import type { Category, CategoryGroupType } from '@/types';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type SelectOption = { key: string; label: string };

const TYPE_TABS: { key: CategoryGroupType; label: string }[] = [
  { key: 'INCOME', label: '수입' },
  { key: 'EXPENSE', label: '지출' },
  { key: 'SAVING', label: '저축' },
];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MAX_IMAGES = 5;
const MEMO_MAX_LENGTH = 50;

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${WEEKDAYS[date.getDay()]})`;
}

function formatAmountDigits(raw: string) {
  const digitsOnly = raw.replace(/[^0-9]/g, '');
  return digitsOnly.replace(/^0+(?=\d)/, '');
}

// 폼 행 컴포넌트
function FormRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  placeholder,
  onPress,
  children,
}: {
  icon: MaterialIconName;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  children?: ReactNode;
}) {
  const content = (
    <>
      <View style={[styles.formRowIcon, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.formRowBody}>
        <Text style={styles.formRowLabel}>{label}</Text>
        {children ?? (
          <Text style={[styles.formRowValue, !value && styles.formRowPlaceholder]}>
            {value || placeholder}
          </Text>
        )}
      </View>
      {onPress && <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.formRow} onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.formRow}>{content}</View>;
}

function SelectSheet({
  visible,
  title,
  options,
  selectedKey,
  loading,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedKey: string | null;
  loading?: boolean;
  onSelect: (option: SelectOption) => void;
  onClose: () => void;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const backdropOpacity = useSharedValue(0);
  // 실제 렌더된 시트 높이. onLayout으로 측정되기 전(첫 오픈 시)엔 windowHeight를
  // 안전한 기본값으로 씀. 콘텐츠 크기가 가변적(결제수단/카테고리 개수 다름)이라
  // DatePickerModal처럼 고정 비율로 못 박을 수 없어서 측정 방식을 씀.
  const sheetHeight = useSharedValue(0);
  const sheetTranslateY = useSharedValue(windowHeight);

  function handleSheetLayout(event: LayoutChangeEvent) {
    const measured = event.nativeEvent.layout.height;
    if (measured > 0) {
      sheetHeight.value = measured;
    }
  }

  // visible 상태가 바뀔 때마다 시트 애니메이션 처리
  useEffect(() => {
    const offscreenY = sheetHeight.value || windowHeight;
    if (visible) {
      setIsMounted(true);
      backdropOpacity.value = withTiming(1, { duration: 200 });
      sheetTranslateY.value = withTiming(0, { duration: 250 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetTranslateY.value = withTiming(offscreenY, { duration: 250 }, (finished) => {
        if (finished) {
          scheduleOnRN(setIsMounted, false);
        }
      });
    }
  }, [visible, windowHeight, backdropOpacity, sheetHeight, sheetTranslateY]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  if (!isMounted) {
    return null;
  }

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.sheetContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.sheetBackdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheetSafeArea, sheetStyle]} onLayout={handleSheetLayout}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitleText}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <MaterialIcons name="close" size={22} color="#868686" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator style={styles.sheetLoading} color="#1F4F3A" />
            ) : (
              <ScrollView contentContainerStyle={styles.sheetList}>
                {options.map((option) => {
                  const selected = option.key === selectedKey;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={styles.sheetOptionRow}
                      onPress={() => onSelect(option)}
                    >
                      <Text
                        style={[styles.sheetOptionText, selected && styles.sheetOptionTextSelected]}
                      >
                        {option.label}
                      </Text>
                      {selected && <MaterialIcons name="check" size={20} color="#1F4F3A" />}
                    </TouchableOpacity>
                  );
                })}
                {options.length === 0 && (
                  <Text style={styles.sheetEmptyText}>선택할 수 있는 항목이 없어요.</Text>
                )}
              </ScrollView>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function WriteScreen() {
  const router = useRouter();
  const { token } = useAuth();
  // 가계부 화면에서 날짜를 고르고 플로팅 버튼으로 들어온 경우 그 날짜로 시작.
  // 파라미터가 없으면(다른 경로로 진입 등) 오늘 날짜로 기본값 처리.
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();

  const [type, setType] = useState<CategoryGroupType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => dateParam || getTodayString());
  const [name, setName] = useState('');
  const [memo, setMemo] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [shareToFeed, setShareToFeed] = useState(true);
  const [detailExpanded, setDetailExpanded] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<SelectOption | null>(null);
  const [payments, setPayments] = useState<SelectOption[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);

  const typeLabel = TYPE_TABS.find((tab) => tab.key === type)?.label ?? '지출';

  async function handlePickImage() {
    if (images.length >= MAX_IMAGES) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      // TODO: 권한 거부 시 안내(설정으로 이동 등) UI 필요하면 추가
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...uris].slice(0, MAX_IMAGES));
    }
  }

  function handleRemoveImage(uri: string) {
    setImages((prev) => prev.filter((image) => image !== uri));
  }

  useEffect(() => {
    let cancelled = false;
    setPaymentsLoading(true);

    fetchPayments()
      .then((data) => {
        if (!cancelled) setPayments(data.map((p) => ({ key: p.idx, label: p.name })));
      })
      .catch((err) => {
        console.error('[write] fetchPayments 실패:', err);
        if (!cancelled) setPayments([]);
      })
      .finally(() => {
        if (!cancelled) setPaymentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []); // 결제수단은 type과 무관하니 마운트 시 한 번만

  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    setCategory(null);

    fetchCategories(type, token)
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((err) => {
        // 0개"인지 요청 실패인지 구분이 안 돼서 로그.
        console.error('[write] fetchCategories 실패:', err);
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type, token]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 뒤로가기 버튼 */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={8} onPress={() => router.back()}>
          <MaterialIcons name="chevron-left" size={30} color="#11181C" />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        {/* 수입/지출/저축 탭 */}
        <View style={styles.segmentedControl}>
          {TYPE_TABS.map((tab) => {
            const active = tab.key === type;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.segmentedItem, active && styles.segmentedItemActive]}
                onPress={() => setType(tab.key)}
              >
                <Text style={[styles.segmentedText, active && styles.segmentedTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>금액 입력</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              value={amount ? Number(amount).toLocaleString() : ''}
              onChangeText={(text) => setAmount(formatAmountDigits(text))}
              placeholder="0"
              placeholderTextColor="#CBD5E1"
              keyboardType="number-pad"
            />
            <Text style={styles.amountUnit}>원</Text>
          </View>
          <View style={styles.amountUnderline} />
          <Text style={styles.amountCaption}>탭하면 키보드가 올라와요</Text>
        </View>

        <View style={styles.card}>
          <FormRow
            icon="event"
            iconBg="#EFF5F1"
            iconColor="#1F4F3A"
            label="날짜"
            value={formatDateLabel(date)}
            onPress={() => {
              Keyboard.dismiss();
              setShowDatePicker(true);
            }}
          />
          <View style={styles.rowDivider} />
          <FormRow icon="storefront" iconBg="#FFFBE3" iconColor="#C9891F" label={`${typeLabel}명`}>
            <TextInput
              style={styles.formInlineInput}
              placeholder="내용을 입력하세요."
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </FormRow>
          <View style={styles.rowDivider} />
          <FormRow
            icon="credit-card"
            iconBg="#FDF3ED"
            iconColor="#E0793F"
            label="결제수단"
            value={paymentMethod?.label}
            placeholder="결제수단을 선택하세요."
            onPress={() => {
              Keyboard.dismiss();
              setShowPaymentSheet(true);
            }}
          />
          <View style={styles.rowDivider} />
          <FormRow
            icon="local-offer"
            iconBg="#EDF7FD"
            iconColor="#4A90E2"
            label="카테고리"
            value={category?.name}
            placeholder="카테고리를 선택하세요."
            onPress={() => {
              Keyboard.dismiss();
              setShowCategorySheet(true);
            }}
          />
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.detailHeader}
            onPress={() => setDetailExpanded((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View style={styles.detailHeaderLeft}>
              <MaterialIcons name="cancel" size={20} color="#1F4F3A" />
              <Text style={styles.detailHeaderText}>상세 입력(선택사항)</Text>
            </View>
            <MaterialIcons
              name={detailExpanded ? 'expand-less' : 'expand-more'}
              size={22}
              color="#868686"
            />
          </TouchableOpacity>

          {detailExpanded && (
            <View style={styles.detailBody}>
              <Text style={styles.detailLabel}>메모</Text>
              <TextInput
                style={styles.memoInput}
                placeholder="내용을 입력하세요."
                placeholderTextColor="#94A3B8"
                value={memo}
                onChangeText={setMemo}
                // multiline
                maxLength={MEMO_MAX_LENGTH}
              />
              <Text style={styles.memoCounter}>
                {memo.length}/{MEMO_MAX_LENGTH}
              </Text>

              <View style={styles.attachmentSection}>
                <View style={styles.attachmentHeaderRow}>
                  <Text style={styles.detailLabel}>첨부파일</Text>
                  <Text style={styles.attachmentCount}>
                    {images.length}/{MAX_IMAGES}
                  </Text>
                </View>
                <View style={styles.attachmentRow}>
                  {images.length < MAX_IMAGES && (
                    <TouchableOpacity
                      style={styles.attachmentAdd}
                      activeOpacity={0.7}
                      onPress={handlePickImage}
                    >
                      <MaterialIcons name="add" size={22} color="#94A3B8" />
                      <Text style={styles.attachmentAddText}>사진추가</Text>
                    </TouchableOpacity>
                  )}
                  {images.map((uri) => (
                    <View key={uri} style={styles.attachmentThumbWrapper}>
                      <Image source={{ uri }} style={styles.attachmentThumb} contentFit="cover" />
                      <TouchableOpacity
                        style={styles.attachmentRemoveButton}
                        hitSlop={8}
                        onPress={() => handleRemoveImage(uri)}
                      >
                        <MaterialIcons name="close" size={13} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.shareRow}>
          <View style={[styles.formRowIcon, { backgroundColor: '#DDEEE4' }]}>
            <MaterialIcons name="share" size={18} color="#1F4F3A" />
          </View>
          <View style={styles.shareBody}>
            <Text style={styles.shareTitle}>피드에 공유</Text>
            <Text style={styles.shareSubtitle}>친구들이 내 {typeLabel}을 볼 수 있어요.</Text>
          </View>
          <Switch
            value={shareToFeed}
            onValueChange={setShareToFeed}
            trackColor={{ false: '#E2E8F0', true: '#1F4F3A' }}
            thumbColor="#fff"
          />
        </View>
      </KeyboardAwareScrollView>

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={date}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={setDate}
      />

      <SelectSheet
        visible={showPaymentSheet}
        title="결제수단 선택"
        options={payments}
        loading={paymentsLoading}
        selectedKey={paymentMethod?.key ?? null}
        onSelect={(option) => {
          setPaymentMethod(option);
          setShowPaymentSheet(false);
        }}
        onClose={() => setShowPaymentSheet(false)}
      />

      {/* TODO: 카테고리 직접 추가 플로우 생기면 onAddCategory 연결 (지금은 "추가" 타일 숨김) */}
      <CategorySheet
        visible={showCategorySheet}
        categories={categories}
        selectedIdx={category?.idx ?? null}
        loading={categoriesLoading}
        onSelect={setCategory}
        onClose={() => setShowCategorySheet(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
  },
  segmentedItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentedItemActive: {
    backgroundColor: '#1F4F3A',
  },
  segmentedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Pretendard',
  },
  segmentedTextActive: {
    color: '#fff',
  },
  amountSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  amountLabel: {
    fontSize: 13,
    color: '#868686',
    fontFamily: 'Pretendard',
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '800',
    color: '#11181C',
    fontFamily: 'PretendardBold',
    padding: 0,
  },
  amountUnit: {
    fontSize: 16,
    color: '#868686',
    fontFamily: 'Pretendard',
    marginLeft: 8,
    marginBottom: 6,
  },
  amountUnderline: {
    height: 2,
    backgroundColor: '#1E293B',
    marginTop: 8,
  },
  amountCaption: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontFamily: 'Pretendard',
    marginTop: 8,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF1F5',
    paddingHorizontal: 16,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  formRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formRowBody: {
    flex: 1,
    gap: 3,
  },
  formRowLabel: {
    fontSize: 13,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  formRowValue: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  formRowPlaceholder: {
    fontWeight: '400',
    color: '#94A3B8',
  },
  formInlineInput: {
    fontSize: 15.5,
    color: '#11181C',
    fontFamily: 'Pretendard',
    padding: 0,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EEF2F6',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  detailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'PretendardBold',
  },
  detailBody: {
    paddingBottom: 18,
  },
  detailLabel: {
    fontSize: 13,
    color: '#868686',
    fontFamily: 'Pretendard',
    marginBottom: 8,
  },
  memoInput: {
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    textAlignVertical: 'top',
  },
  memoCounter: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Pretendard',
    textAlign: 'right',
    marginTop: 4,
  },
  attachmentSection: {
    marginTop: 22,
  },
  attachmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 8,
  },
  attachmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  attachmentThumbWrapper: {
    width: 72,
    height: 72,
  },
  attachmentThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  attachmentRemoveButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#11181C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  attachmentAdd: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  attachmentAddText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Pretendard',
  },
  attachmentCount: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: 'Pretendard',
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF1F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  shareBody: {
    flex: 1,
    gap: 3,
  },
  shareTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'PretendardBold',
  },
  shareSubtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontFamily: 'Pretendard',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetSafeArea: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sheetTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'PretendardBold',
  },
  sheetList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  sheetOptionText: {
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  sheetOptionTextSelected: {
    color: '#1F4F3A',
    fontWeight: '700',
  },
  sheetEmptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontFamily: 'Pretendard',
    paddingVertical: 24,
    fontSize: 14,
  },
  sheetLoading: {
    marginVertical: 40,
  },
});
