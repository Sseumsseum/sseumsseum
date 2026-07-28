import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { Notification } from '@/types';

const MOCK_NOTIFICATIONS: (Notification & { avatarColor: string })[] = [
  { id: 'n1', fromUser: '희원', avatarColor: '#9B5DE5', type: 'COMMENT', targetIdx: 'c4', targetType: 'COMMENT', isRead: false, createdAt: '방금 전', commentContent: '가자가자' },
  { id: 'n2', fromUser: '희원', avatarColor: '#9B5DE5', type: 'LIKE', targetIdx: '1', targetType: 'LEDGER', isRead: false, createdAt: '방금 전' },
  { id: 'n3', fromUser: '진실', avatarColor: '#F77F00', type: 'LIKE', targetIdx: '1', targetType: 'LEDGER', isRead: false, createdAt: '10분 전' },
  { id: 'n4', fromUser: '희원', avatarColor: '#9B5DE5', type: 'LIKE', targetIdx: '1', targetType: 'LEDGER', isRead: true, createdAt: '4월 2일' },
  { id: 'n5', fromUser: '희원', avatarColor: '#9B5DE5', type: 'LIKE', targetIdx: '2', targetType: 'LEDGER', isRead: true, createdAt: '4월 1일' },
  { id: 'n6', fromUser: '진실', avatarColor: '#F77F00', type: 'LIKE', targetIdx: '2', targetType: 'LEDGER', isRead: true, createdAt: '4월 1일' },
  { id: 'n7', fromUser: '진실', avatarColor: '#F77F00', type: 'COMMENT', targetIdx: 'c1', targetType: 'COMMENT', isRead: true, createdAt: '4월 1일', commentContent: '야 최희진 돈 아낀다매 ㅋㅋㅋ' },
  { id: 'n8', fromUser: '희원', avatarColor: '#9B5DE5', type: 'FRIEND_REQ', targetIdx: '1', targetType: null, isRead: true, createdAt: '3월 31일' },
];

function getMessage(item: (typeof MOCK_NOTIFICATIONS)[0]): string {
  switch (item.type) {
    case 'LIKE':
      return `${item.fromUser}님이 게시물을 좋아합니다.`;
    case 'COMMENT':
      return `${item.fromUser}님이 댓글을 남겼습니다: ${item.commentContent ?? ''}`;
    case 'FRIEND_REQ':
      return `${item.fromUser}님이 친구 요청을 보냈습니다.`;
    case 'FRIEND_ACCEPT':
      return `${item.fromUser}님이 친구 요청을 수락했습니다.`;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [accepted, setAccepted] = useState<Set<string>>(new Set(['n8']));

  const newItems = MOCK_NOTIFICATIONS.filter((n) => !n.isRead);
  const prevItems = MOCK_NOTIFICATIONS.filter((n) => n.isRead);

  function renderItem(item: (typeof MOCK_NOTIFICATIONS)[0]) {
    return (
      <View key={item.id} style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{item.fromUser[0]}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.message}>{getMessage(item)}</Text>
          <Text style={styles.time}>{item.createdAt}</Text>
          {item.type === 'FRIEND_REQ' && (
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
    paddingHorizontal: 24,
    paddingVertical: 8,
    minWidth: 96,
    borderRadius: 8,
    backgroundColor: '#1F4F3A',
    alignItems: 'center',
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
