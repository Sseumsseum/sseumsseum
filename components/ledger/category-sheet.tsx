import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import type { Category } from '@/types';

import { getCategoryIcon } from './category-icons';

type CategorySheetProps = {
  visible: boolean;
  categories: Category[];
  selectedIdx: number | null;
  loading?: boolean;
  onSelect: (category: Category) => void;
  onClose: () => void;
  onAddCategory?: () => void;
};

export default function CategorySheet({
  visible,
  categories,
  selectedIdx,
  loading,
  onSelect,
  onClose,
  onAddCategory,
}: CategorySheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const backdropOpacity = useSharedValue(0);
  const sheetHeight = useSharedValue(0);
  const sheetTranslateY = useSharedValue(windowHeight);

  function handleSheetLayout(event: LayoutChangeEvent) {
    const measured = event.nativeEvent.layout.height;
    if (measured > 0) {
      sheetHeight.value = measured;
    }
  }

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
              <Text style={styles.sheetTitleText}>카테고리</Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <MaterialIcons name="close" size={22} color="#868686" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator style={styles.sheetLoading} color="#1F4F3A" />
            ) : (
              <View style={styles.grid}>
                {categories.map((category) => {
                  const { icon, bg, color } = getCategoryIcon(category.name);
                  const selected = category.idx === selectedIdx;
                  return (
                    <TouchableOpacity
                      key={category.idx}
                      style={styles.gridItem}
                      onPress={() => {
                        onSelect(category);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.gridIconCircle,
                          { backgroundColor: bg },
                          selected && styles.gridIconCircleSelected,
                        ]}
                      >
                        <MaterialIcons name={icon} size={22} color={color} />
                      </View>
                      <Text style={styles.gridLabel} numberOfLines={1}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {onAddCategory && (
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={onAddCategory}
                    activeOpacity={0.7}
                  >
                    <View style={styles.gridAddCircle}>
                      <MaterialIcons name="add" size={22} color="#94A3B8" />
                    </View>
                    <Text style={styles.gridLabel}>추가</Text>
                  </TouchableOpacity>
                )}

                {categories.length === 0 && !onAddCategory && (
                  <Text style={styles.sheetEmptyText}>선택할 수 있는 카테고리가 없어요.</Text>
                )}
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: '80%',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  gridIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridIconCircleSelected: {
    borderColor: '#1F4F3A',
  },
  gridAddCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  gridLabel: {
    fontSize: 12,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  sheetEmptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontFamily: 'Pretendard',
    paddingVertical: 24,
    fontSize: 14,
    width: '100%',
  },
  sheetLoading: {
    marginVertical: 40,
  },
});
