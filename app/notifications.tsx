import { useCallback, useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '@/providers/auth';
import { fetchNotifications } from '@/services/notifications';
import { resolveImageUrl } from '@/services/api';
import { formatRelativeDate } from '@/utils/format';
import type { Notification } from '@/types';

const PAGE_SIZE = 20;

function NotificationAvatar({ nickname, profileImg }: { nickname: string; profileImg: string | null }) {
  const [failed, setFailed] = useState(false);
  if (profileImg && !failed) {
    return (
      <Image
        source={{ uri: resolveImageUrl(profileImg) }}
        style={styles.avatar}
        accessibilityLabel={`${nickname}님의 프로필 사진`}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View style={[styles.avatar, styles.avatarFallback]} accessibilityLabel={`${nickname}님의 프로필 사진`}>
      <MaterialIcons name="person" size={24} color="#94A3B8" />
    </View>
  );
}

function getMessage(item: Notification): string {
  switch (item.type) {
    case 'LIKE':
      return `${item.fromUser.nickname}님이 게시물을 좋아합니다.`;
    case 'COMMENT':
      return `${item.fromUser.nickname}님이 댓글을 남겼습니다.`;
    case 'FRIEND_REQ':
      return `${item.fromUser.nickname}님이 친구 요청을 보냈습니다.`;
    case 'FRIEND_ACCEPT':
      return `${item.fromUser.nickname}님이 친구 요청을 수락했습니다.`;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { token, initializing } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<Set<number>>(new Set());

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchNotifications(null, PAGE_SIZE, token);
      setNotifications(page);
      setCursor(page.length > 0 ? page[page.length - 1].notificationIdx : null);
      setHasMore(page.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (initializing) return;
    loadInitial();
  }, [initializing, loadInitial]);

  async function loadMore() {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const page = await fetchNotifications(cursor, PAGE_SIZE, token);
      setNotifications((prev) => [...prev, ...page]);
      setCursor(page.length > 0 ? page[page.length - 1].notificationIdx : cursor);
      setHasMore(page.length === PAGE_SIZE);
    } catch {
      // 다음 페이지 로드 실패 시 조용히 중단하고 다음 스크롤에서 재시도할 수 있도록 둔다.
    } finally {
      setLoadingMore(false);
    }
  }

  const sections = [
    { title: '새로운 알림', data: notifications.filter((n) => !n.read) },
    { title: '이전 알림', data: notifications.filter((n) => n.read) },
  ].filter((section) => section.data.length > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#1F4F3A" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadInitial}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.notificationIdx)}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          renderSectionHeader={({ section }) => <Text style={styles.sectionLabel}>{section.title}</Text>}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>아직 알림이 없어요.</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color="#1F4F3A" />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <NotificationAvatar nickname={item.fromUser.nickname} profileImg={item.fromUser.profileImg} />
              <View style={styles.body}>
                <Text style={styles.message}>{getMessage(item)}</Text>
                <Text style={styles.time}>{formatRelativeDate(item.createdAt)}</Text>
                {item.type === 'FRIEND_REQ' && (
                  <TouchableOpacity
                    style={[styles.acceptButton, accepted.has(item.notificationIdx) && styles.acceptedButton]}
                    onPress={() => setAccepted((prev) => new Set([...prev, item.notificationIdx]))}
                    disabled={accepted.has(item.notificationIdx)}
                  >
                    <Text style={[styles.acceptText, accepted.has(item.notificationIdx) && styles.acceptedText]}>
                      {accepted.has(item.notificationIdx) ? '수락함' : '수락하기'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1F4F3A',
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Pretendard',
  },
  emptyText: {
    fontSize: 14,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  footerLoading: {
    paddingVertical: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#868686',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontFamily: 'Pretendard',
    backgroundColor: '#fff',
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
  avatarFallback: {
    backgroundColor: '#E2E8F0',
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
