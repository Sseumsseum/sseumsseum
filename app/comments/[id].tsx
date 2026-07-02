import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Ledger = {
  user: string;
  avatarColor: string;
  date: string;
  type: '지출' | '수입' | '저축';
  name: string;
  amount: number;
  memo: string | null;
  amountPublic: boolean;
};

type Comment = {
  id: string;
  user: string;
  avatarColor: string;
  time: string;
  content: string;
  parentCommentIdx: string | null;
};

const MOCK_POSTS: Record<string, Ledger> = {
  '1': { user: '희원', avatarColor: '#9B5DE5', date: '2026.04.04 · 1시간 전', type: '지출', name: '르칵투스 명일동점', amount: 15000, amountPublic: true, memo: '와 된장 파스타 처음 먹어보는데 생각보다 맛있다' },
  '2': { user: '진실', avatarColor: '#F77F00', date: '2026.04.04 · 43분 전', type: '지출', name: '에이블리', amount: 32000, amountPublic: true, memo: '카고 팬츠 너무 귀여움 ㅜㅜ 사이즈도 딱 맞았어' },
};

const MOCK_COMMENTS: Record<string, Comment[]> = {
  '1': [
    { id: 'c1', user: '진실', avatarColor: '#F77F00', time: '30분 전', content: '된장 파스타라는 게 있어? ㅋㅋㅋ 신기하다', parentCommentIdx: null },
    { id: 'c2', user: '희원', avatarColor: '#9B5DE5', time: '30분 전', content: '나도 몰랐는데 있더라구 ㅋㅋㅋ', parentCommentIdx: 'c1' },
    { id: 'c3', user: '희진', avatarColor: '#00BBF9', time: '방금 전', content: '헐 ㅠㅠ 개맛있어 보인다 다음에 우리랑도 같이가자', parentCommentIdx: null },
    { id: 'c4', user: '희원', avatarColor: '#9B5DE5', time: '방금 전', content: '가자가자', parentCommentIdx: null },
  ],
  '2': [],
  '3': [],
};

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [input, setInput] = useState('');

  const post = MOCK_POSTS[id ?? '1'];
  const comments = MOCK_COMMENTS[id ?? '1'] ?? [];

  const isExpense = post.type === '지출';
  const amountText = isExpense ? `-${post.amount.toLocaleString()}원` : `+${post.amount.toLocaleString()}원`;

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
          <Text style={styles.headerTitle}>댓글 {comments.length}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.postSnippet}>
            <View style={[styles.postAvatar, { backgroundColor: post.avatarColor }]}>
              <Text style={styles.postAvatarText}>{post.user[0]}</Text>
            </View>
            <View style={styles.postBody}>
              <View style={styles.postTopRow}>
                <Text style={styles.postUser}>{post.user}</Text>
                <Text style={styles.postDate}>{post.date}</Text>
                <Text style={[styles.postAmount, isExpense ? styles.expense : styles.income]}>
                  {amountText}
                </Text>
              </View>
              {post.memo ? <Text style={styles.postContent}>{post.memo}</Text> : null}
            </View>
          </View>

          <View style={styles.divider} />

          {comments.map((comment) => (
            <View
              key={comment.id}
              style={[styles.commentRow, comment.parentCommentIdx !== null && styles.replyRow]}
            >
              <View style={[styles.commentAvatar, { backgroundColor: comment.avatarColor }]}>
                <Text style={styles.commentAvatarText}>{comment.user[0]}</Text>
              </View>
              <View style={styles.commentBody}>
                <View style={styles.commentTopRow}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentTime}>{comment.time}</Text>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity hitSlop={8}>
                    <MaterialIcons name="favorite-border" size={14} color="#868686" />
                  </TouchableOpacity>
                  <TouchableOpacity hitSlop={8}>
                    <Text style={styles.replyLabel}>답글달기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <View style={[styles.inputAvatar, { backgroundColor: '#00BBF9' }]}>
            <Text style={styles.inputAvatarText}>희</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="댓글을 입력하세요"
            placeholderTextColor="#868686"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendButton}>
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
  postSnippet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Pretendard',
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
  income: {
    color: '#1F4F3A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  replyRow: {
    paddingLeft: 40,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'Pretendard',
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
  replyLabel: {
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
});
