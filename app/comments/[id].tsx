import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '@/providers/auth';
import { createComment, deleteComment, fetchComments, fetchFeedDetail } from '@/services/feeds';
import { resolveImageUrl } from '@/services/api';
import { formatRelativeDate, avatarColorFor } from '@/utils/format';
import type { FeedComment, FeedCommentBase, FeedDetail } from '@/types';

const PAGE_SIZE = 10;

function Avatar({ nickname, profileImg, size }: { nickname: string; profileImg: string | null; size: number }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (profileImg && !failed) {
    return (
      <Image
        source={{ uri: resolveImageUrl(profileImg) }}
        style={style}
        accessibilityLabel={`${nickname}님의 프로필 사진`}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View style={[style, styles.avatarFallback]} accessibilityLabel={`${nickname}님의 프로필 사진`}>
      <MaterialIcons name="person" size={size * 0.6} color="#94A3B8" />
    </View>
  );
}

function CommentRow({
  item,
  isReply,
  isOwn,
  onLikePress,
  onReplyPress,
  onDeletePress,
}: {
  item: FeedCommentBase;
  isReply: boolean;
  isOwn: boolean;
  onLikePress: () => void;
  onReplyPress: () => void;
  onDeletePress: () => void;
}) {
  return (
    <View style={[styles.commentRow, isReply && styles.replyRow]}>
      <Avatar nickname={item.writer.nickname} profileImg={item.writer.profileImg} size={32} />
      <View style={styles.commentBody}>
        <View style={styles.commentTopRow}>
          <Text style={styles.commentUser}>{item.writer.nickname}</Text>
          <Text style={styles.commentTime}>{formatRelativeDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity hitSlop={8} style={styles.commentHeart} onPress={onLikePress}>
            <MaterialIcons
              name={item.isHearted ? 'favorite' : 'favorite-border'}
              size={14}
              color={item.isHearted ? '#D92D20' : '#868686'}
            />
            {item.heartCount > 0 ? <Text style={styles.commentHeartCount}>{item.heartCount}</Text> : null}
          </TouchableOpacity>
          <TouchableOpacity hitSlop={8} onPress={onReplyPress}>
            <Text style={styles.replyLabel}>답글달기</Text>
          </TouchableOpacity>
          {isOwn ? (
            <TouchableOpacity hitSlop={8} onPress={onDeletePress}>
              <Text style={[styles.replyLabel, styles.deleteLabel]}>삭제</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, initializing, user } = useAuth();
  const currentUserName = user?.name ?? user?.email?.split('@')[0];

  const ledgerIdx = Number(id);
  const [input, setInput] = useState('');
  const [detail, setDetail] = useState<FeedDetail | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<{ parentCommentIdx: number; nickname: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(ledgerIdx)) {
      setError('잘못된 게시글입니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [detailResult, commentsPage] = await Promise.all([
        fetchFeedDetail(ledgerIdx, token),
        fetchComments(ledgerIdx, null, PAGE_SIZE, token),
      ]);
      setDetail(detailResult);
      setComments(commentsPage);
      setCursor(commentsPage.length > 0 ? commentsPage[commentsPage.length - 1].commentIdx : null);
      setHasMore(commentsPage.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [ledgerIdx, token]);

  useEffect(() => {
    if (initializing) return;
    load();
  }, [initializing, load]);

  async function loadMoreComments() {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const page = await fetchComments(ledgerIdx, cursor, PAGE_SIZE, token);
      setComments((prev) => [...prev, ...page]);
      setCursor(page.length > 0 ? page[page.length - 1].commentIdx : cursor);
      setHasMore(page.length === PAGE_SIZE);
    } catch {
      // 다음 페이지 로드 실패 시 조용히 중단하고 다음 스크롤에서 재시도할 수 있도록 둔다.
    } finally {
      setLoadingMore(false);
    }
  }

  function toggleCommentHeart(commentIdx: number) {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.commentIdx === commentIdx) {
          return {
            ...comment,
            isHearted: !comment.isHearted,
            heartCount: comment.heartCount + (comment.isHearted ? -1 : 1),
          };
        }
        return {
          ...comment,
          replies: comment.replies.map((reply) =>
            reply.commentIdx === commentIdx
              ? { ...reply, isHearted: !reply.isHearted, heartCount: reply.heartCount + (reply.isHearted ? -1 : 1) }
              : reply,
          ),
        };
      }),
    );
  }

  async function handleSubmit() {
    const content = input.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    try {
      const created = await createComment(ledgerIdx, content, replyTarget?.parentCommentIdx ?? null, token);
      const newComment: FeedCommentBase = { ...created, isHearted: false };

      if (replyTarget) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.commentIdx === replyTarget.parentCommentIdx
              ? { ...comment, replies: [...comment.replies, newComment] }
              : comment,
          ),
        );
      } else {
        setComments((prev) => [...prev, { ...newComment, replies: [] }]);
      }

      setDetail((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev));
      setInput('');
      setReplyTarget(null);
    } catch (err) {
      Alert.alert('댓글 작성 실패', err instanceof Error ? err.message : '잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCommentByIdx(commentIdx: number) {
    try {
      await deleteComment(commentIdx, token);
      setComments((prev) =>
        prev
          .filter((comment) => comment.commentIdx !== commentIdx)
          .map((comment) => ({
            ...comment,
            replies: comment.replies.filter((reply) => reply.commentIdx !== commentIdx),
          })),
      );
      setDetail((prev) => (prev ? { ...prev, commentCount: Math.max(0, prev.commentCount - 1) } : prev));
    } catch (err) {
      Alert.alert('삭제 실패', err instanceof Error ? err.message : '잠시 후 다시 시도해주세요.');
    }
  }

  function confirmDeleteComment(commentIdx: number) {
    Alert.alert('댓글 삭제', '댓글을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => deleteCommentByIdx(commentIdx) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#11181C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>댓글 {detail?.commentCount ?? ''}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#1F4F3A" />
          </View>
        ) : error || !detail ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error ?? '게시글을 불러오지 못했습니다.'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={load}>
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(comment) => String(comment.commentIdx)}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.4}
            onEndReached={loadMoreComments}
            ListHeaderComponent={
              <>
                <View style={styles.postSnippet}>
                  <Avatar nickname={detail.writer.nickname} profileImg={detail.writer.profileImg} size={40} />
                  <View style={styles.postBody}>
                    <View style={styles.postTopRow}>
                      <Text style={styles.postUser}>{detail.writer.nickname}</Text>
                      <Text style={styles.postDate}>{formatRelativeDate(detail.date)}</Text>
                      <Text style={[styles.postAmount, detail.amount !== null ? styles.expense : styles.amountHidden]}>
                        {detail.amount !== null ? `-${detail.amount.toLocaleString()}원` : '금액 비공개'}
                      </Text>
                    </View>
                    {detail.memo ? <Text style={styles.postContent}>{detail.memo}</Text> : null}
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            }
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>아직 댓글이 없어요.</Text>
              </View>
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator color="#1F4F3A" />
                </View>
              ) : null
            }
            renderItem={({ item: comment }) => (
              <View>
                <CommentRow
                  item={comment}
                  isReply={false}
                  isOwn={comment.writer.nickname === currentUserName}
                  onLikePress={() => toggleCommentHeart(comment.commentIdx)}
                  onReplyPress={() =>
                    setReplyTarget({ parentCommentIdx: comment.commentIdx, nickname: comment.writer.nickname })
                  }
                  onDeletePress={() => confirmDeleteComment(comment.commentIdx)}
                />
                {comment.replies.map((reply) => (
                  <CommentRow
                    key={reply.commentIdx}
                    item={reply}
                    isReply
                    isOwn={reply.writer.nickname === currentUserName}
                    onLikePress={() => toggleCommentHeart(reply.commentIdx)}
                    onReplyPress={() =>
                      setReplyTarget({ parentCommentIdx: comment.commentIdx, nickname: reply.writer.nickname })
                    }
                    onDeletePress={() => confirmDeleteComment(reply.commentIdx)}
                  />
                ))}
              </View>
            )}
          />
        )}

        {replyTarget ? (
          <View style={styles.replyBanner}>
            <Text style={styles.replyBannerText}>{replyTarget.nickname}님에게 답글 남기는 중</Text>
            <TouchableOpacity hitSlop={8} onPress={() => setReplyTarget(null)}>
              <MaterialIcons name="close" size={16} color="#868686" />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.inputBar}>
          <View style={[styles.inputAvatar, { backgroundColor: avatarColorFor(currentUserName ?? '') }]}>
            <Text style={styles.inputAvatarText}>{currentUserName?.[0] ?? '?'}</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder={replyTarget ? `${replyTarget.nickname}님에게 답글쓰기` : '댓글을 입력하세요'}
            placeholderTextColor="#868686"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || submitting) && styles.sendButtonDisabled]}
            onPress={handleSubmit}
            disabled={!input.trim() || submitting}
          >
            <MaterialIcons name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  postSnippet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  postBody: {
    flex: 1,
    gap: 8,
  },
  postTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  postDate: {
    flex: 1,
    fontSize: 12,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  postAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Pretendard',
  },
  postContent: {
    fontSize: 14,
    color: '#11181C',
    lineHeight: 20,
    fontFamily: 'Pretendard',
  },
  expense: {
    color: '#D92D20',
  },
  amountHidden: {
    color: '#868686',
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  replyRow: {
    paddingLeft: 40,
  },
  commentBody: {
    flex: 1,
    gap: 8,
  },
  commentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  commentTime: {
    fontSize: 12,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  commentText: {
    fontSize: 14,
    color: '#11181C',
    lineHeight: 20,
    fontFamily: 'Pretendard',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentHeart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentHeartCount: {
    fontSize: 12,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  replyLabel: {
    fontSize: 12,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  deleteLabel: {
    color: '#D92D20',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },
  replyBannerText: {
    fontSize: 12,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#fff',
    marginHorizontal: 0,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F4F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputAvatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Pretendard',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#11181C',
    fontFamily: 'Pretendard',
    maxHeight: 80,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F4F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
