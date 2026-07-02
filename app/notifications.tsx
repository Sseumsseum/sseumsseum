import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type NotificationItem = {
  id: string;
  user: string;
  avatarColor: string;
  message: string;
  time: string;
  type: 'comment' | 'like' | 'friend_request';
  isNew: boolean;
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', user: '희원', avatarColor: '#9B5DE5', message: '희원님이 댓글을 남겼습니다: 가자가자', time: '방금 전', type: 'comment', isNew: true },
  { id: 'n2', user: '희원', avatarColor: '#9B5DE5', message: '희원님이 희원님의 글을 좋아합니다.', time: '방금 전', type: 'like', isNew: true },
  { id: 'n3', user: '진실', avatarColor: '#F77F00', message: '진실님이 희원님의 글을 좋아합니다.', time: '10분 전', type: 'like', isNew: true },
  { id: 'n4', user: '희원', avatarColor: '#9B5DE5', message: '희원님이 희원님의 글을 좋아합니다.', time: '4월 2일', type: 'like', isNew: false },
  { id: 'n5', user: '희원', avatarColor: '#9B5DE5', message: '희원님이 희원님의 글을 좋아합니다.', time: '4월 1일', type: 'like', isNew: false },
  { id: 'n6', user: '진실', avatarColor: '#F77F00', message: '진실님이 희원님의 글을 좋아합니다.', time: '4월 1일', type: 'like', isNew: false },
  { id: 'n7', user: '진실', avatarColor: '#F77F00', message: '진실님이 댓글을 남겼습니다: 야 최희진 돈 아낀다매 ㅋㅋㅋ', time: '4월 1일', type: 'comment', isNew: false },
  { id: 'n8', user: '희원', avatarColor: '#9B5DE5', message: '희원님이 친구 요청을 보냈습니다.', time: '3월 31일', type: 'friend_request', isNew: false },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [accepted, setAccepted] = useState<Set<string>>(new Set(['n8']));

  const newItems = MOCK_NOTIFICATIONS.filter((n) => n.isNew);
  const prevItems = MOCK_NOTIFICATIONS.filter((n) => !n.isNew);

  function renderItem(item: NotificationItem) {
    return (
      <View key={item.id} style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{item.user[0]}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{item.time}</Text>
          {item.type === 'friend_request' && (
            <TouchableOpacity
              style={[styles.acceptButton, accepted.has(item.id) && styles.acceptedButton]}
              onPress={() => setAccepted((prev) => new Set([...prev, item.id]))}
              disabled={accepted.has(item.id)}
            >
              <Text style={[styles.acceptText, accepted.has(item.id) && styles.acceptedText]}>
                {accepted.has(item.id) ? '수락함' : '수락하기'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {newItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>새로운 알림</Text>
            {newItems.map(renderItem)}
          </>
        )}
        {prevItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>이전 알림</Text>
            {prevItems.map(renderItem)}
          </>
        )}
      </ScrollView>
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#868686',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontFamily: 'Pretendard',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Pretendard',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  message: {
    fontSize: 14,
    color: '#11181C',
    lineHeight: 20,
    fontFamily: 'Pretendard',
  },
  time: {
    fontSize: 12,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  acceptButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1F4F3A',
  },
  acceptedButton: {
    backgroundColor: '#F1F5F9',
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Pretendard',
  },
  acceptedText: {
    color: '#868686',
  },
});
