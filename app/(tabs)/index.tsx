import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Header from '@/components/header';
import { useAuth } from '@/providers/auth';
import { fetchFeeds } from '@/services/feeds';
import { resolveImageUrl } from '@/services/api';
import { formatRelativeDate } from '@/utils/format';
import type { FeedListItem } from '@/types';

const PAGE_SIZE = 10;

function FeedCard({
  item,
  onLikePress,
  onCommentPress,
  onMenuPress,
}: {
  item: FeedListItem;
  onLikePress: () => void;
  onCommentPress: () => void;
  onMenuPress: () => void;
}) {
  const amountText = item.amount !== null ? `-${item.amount.toLocaleString()}원` : '금액 비공개';
  const image = item.images[0];
  const avatar = item.writer.profileImg;
  const [imageFailed, setImageFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {image && !imageFailed ? (
          <Image
            source={{ uri: resolveImageUrl(image) }}
            style={styles.imagePlaceholder}
            contentFit="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="image" size={40} color="#CBD5E1" />
          </View>
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.22)', 'transparent']}
          style={styles.imageTopOverlay}
        >
          <View style={styles.cardHeader}>
            {avatar && !avatarFailed ? (
              <Image
                source={{ uri: resolveImageUrl(avatar) }}
                style={styles.avatar}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <MaterialIcons name="person" size={24} color="#94A3B8" />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.writer.nickname}</Text>
              <Text style={styles.userDate}>{formatRelativeDate(item.date)}</Text>
            </View>
            <TouchableOpacity hitSlop={8} onPress={onMenuPress}>
              <MaterialIcons name="more-vert" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.infoStrip}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.storeName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.amount, item.amount !== null ? styles.expense : styles.amountHidden]}>{amountText}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionItem} hitSlop={8} onPress={onLikePress}>
          <MaterialIcons
            name={item.isHearted ? 'favorite' : 'favorite-border'}
            size={18}
            color={item.isHearted ? '#D92D20' : '#868686'}
          />
          <Text style={styles.actionCount}>{item.heartCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem} hitSlop={8} onPress={onCommentPress}>
          <MaterialIcons name="chat-bubble-outline" size={18} color="#868686" />
          <Text style={styles.actionCount}>{item.commentCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const { token, initializing, user } = useAuth();

  const [items, setItems] = useState<FeedListItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuItem, setMenuItem] = useState<FeedListItem | null>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchFeeds(null, PAGE_SIZE, token);
      setItems(page);
      setCursor(page.length > 0 ? page[page.length - 1].ledgerIdx : null);
      setHasMore(page.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : '피드를 불러오지 못했습니다.');
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
      const page = await fetchFeeds(cursor, PAGE_SIZE, token);
      setItems((prev) => [...prev, ...page]);
      setCursor(page.length > 0 ? page[page.length - 1].ledgerIdx : cursor);
      setHasMore(page.length === PAGE_SIZE);
    } catch {
      // 다음 페이지 로드 실패 시 조용히 중단하고 다음 스크롤에서 재시도할 수 있도록 둔다.
    } finally {
      setLoadingMore(false);
    }
  }

  function toggleHeart(ledgerIdx: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.ledgerIdx === ledgerIdx
          ? { ...item, isHearted: !item.isHearted, heartCount: item.heartCount + (item.isHearted ? -1 : 1) }
          : item,
      ),
    );
  }

  const currentUserName = user?.name ?? user?.email?.split('@')[0];
  const isOwn = menuItem?.writer.nickname === currentUserName;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header left={<Text style={styles.headerTitle}>피드</Text>} />

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
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.ledgerIdx)}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>아직 등록된 피드가 없어요.</Text>
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
            <FeedCard
              item={item}
              onLikePress={() => toggleHeart(item.ledgerIdx)}
              onMenuPress={() => setMenuItem(item)}
              onCommentPress={() =>
                router.push({ pathname: '/comments/[id]', params: { id: String(item.ledgerIdx) } } as any)
              }
            />
          )}
        />
      )}

      <Modal visible={menuItem !== null} transparent animationType="fade" onRequestClose={() => setMenuItem(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuItem(null)}>
          <View style={styles.menuSheet}>
            {isOwn ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={() => setMenuItem(null)}>
                  <Text style={styles.menuText}>수정하기</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => setMenuItem(null)}>
                  <Text style={[styles.menuText, styles.menuTextDanger]}>삭제하기</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => setMenuItem(null)}>
                  <Text style={styles.menuText}>나만보기</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => setMenuItem(null)}>
                  <Text style={styles.menuText}>공유하기</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={() => setMenuItem(null)}>
                  <Text style={styles.menuText}>이 글 숨기기</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => setMenuItem(null)}>
                  <Text style={[styles.menuText, styles.menuTextDanger]}>신고하기</Text>
                </TouchableOpacity>
              </>
            )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'Pretendard',
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
  card: {
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
  },
  imageTopOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Pretendard',
  },
  userDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Pretendard',
  },
  imagePlaceholder: {
    width: '100%',
    height: 240,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#1F4F3A',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Pretendard',
  },
  storeName: {
    flex: 1,
    fontSize: 13,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Pretendard',
  },
  expense: {
    color: '#D92D20',
  },
  amountHidden: {
    color: '#868686',
    fontWeight: '400',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 13,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuItem: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  menuTextDanger: {
    color: '#D92D20',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
