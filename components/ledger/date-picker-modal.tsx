import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import '@/components/ledger/calendar-locale-config';

type DatePickerModalProps = {
  visible: boolean;
  selectedDate: string;
  onClose: () => void;
  onSelectDate: (dateString: string) => void;
};

const DISMISS_THRESHOLD = 100;
const DISMISS_VELOCITY = 800;

export default function DatePickerModal({
  visible,
  selectedDate,
  onClose,
  onSelectDate,
}: DatePickerModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(windowHeight);
  const dragY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      dragY.value = 0;
      backdropOpacity.value = withTiming(1, { duration: 200 });
      sheetTranslateY.value = withTiming(0, { duration: 250 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetTranslateY.value = withTiming(windowHeight, { duration: 250 }, (finished) => {
        if (finished) {
          scheduleOnRN(setIsMounted, false);
        }
      });
    }
  }, [visible, windowHeight, backdropOpacity, sheetTranslateY, dragY]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-15, 15])
    .onUpdate((event) => {
      dragY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (dragY.value > DISMISS_THRESHOLD || event.velocityY > DISMISS_VELOCITY) {
        scheduleOnRN(onClose);
      } else {
        dragY.value = withTiming(0, { duration: 150 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value + dragY.value }],
  }));

  if (!isMounted) {
    return null;
  }

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheetWrapper, { height: windowHeight * 0.62 }, sheetStyle]}>
          <SafeAreaView edges={['bottom']}>
            <GestureDetector gesture={panGesture}>
              <View>
                <View style={styles.handle} />

                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>날짜 선택</Text>
                  <TouchableOpacity onPress={onClose} hitSlop={8}>
                    <MaterialIcons name="close" size={22} color="#868686" />
                  </TouchableOpacity>
                </View>

                <Calendar
                  current={selectedDate}
                  monthFormat="yyyy년 MMMM"
                  onDayPress={(day: DateData) => {
                    onSelectDate(day.dateString);
                    onClose();
                  }}
                  markedDates={{
                    [selectedDate]: { selected: true, selectedColor: '#1F4F3A' },
                  }}
                  style={styles.calendar}
                  theme={{
                    calendarBackground: '#fff',
                    textSectionTitleColor: '#868686',
                    todayTextColor: '#1F4F3A',
                    arrowColor: '#1F4F3A',
                    monthTextColor: '#11181C',
                    selectedDayBackgroundColor: '#1F4F3A',
                    selectedDayTextColor: '#fff',
                    textDayFontFamily: 'Pretendard',
                    textMonthFontFamily: 'PretendardBold',
                    textDayHeaderFontFamily: 'Pretendard',
                    textMonthFontSize: 16,
                    textDayFontSize: 15,
                  }}
                />
              </View>
            </GestureDetector>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetWrapper: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'PretendardBold',
  },
  calendar: {
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
});
