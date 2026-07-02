import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Ledger = {
  id: string;
  user: string;
  avatarColor: string;
  date: string;
  type: '지출' | '수입' | '저축';
  name: string;
  amount: number;
  category: string;
  memo: string | null;
  amountPublic: boolean;
  likes: number;
  comments: number;
};

const MOCK_FEED: Ledger[] = [
  {
    id: '1',
    user: '희원',
    avatarColor: '#9B5DE5',
    date: '2026.04.04 · 3시간 전',
    type: '지출',
    name: '르칵투스 명일동점',
    amount: 15000,
    category: '식비',
    memo: '와 된장 파스타 처음 먹어보는데 생각보다 맛있다',
    amountPublic: true,
    likes: 12,
    comments: 3,
  },
  {
    id: '2',
    user: '진실',
    avatarColor: '#F77F00',
    date: '2026.04.04 · 43분 전',
    type: '지출',
    name: '에이블리',
    amount: 32000,
    category: '의류',
    memo: '카고 팬츠 너무 귀여움 ㅜㅜ 사이즈도 딱 맞았어',
    amountPublic: true,
    likes: 8,
    comments: 1,
  },
  {
    id: '3',
    user: '민준',
    avatarColor: '#00BBF9',
    date: '2026.04.03 · 1일 전',
    type: '수입',
    name: '월급',
    amount: 2500000,
    category: '수입',
    memo: '드디어 월급날 🎉',
    amountPublic: true,
    likes: 5,
    comments: 0,
  },
];

function FeedCard({ item, onCommentPress }: { item: Ledger; onCommentPress: () => void }) {
  const isExpense = item.type === '지출';
  const amountText = isExpense ? `-${item.amount.toLocaleString()}원` : `+${item.amount.toLocaleString()}원`;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <MaterialIcons name="image" size={40} color="#CBD5E1" />
        </View>
        <LinearGradient
          colors={['rgba(0,0,0,0.22)', 'transparent']}
          style={styles.imageTopOverlay}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
              <Text style={styles.avatarText}>{item.user[0]}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.user}</Text>
              <Text style={styles.userDate}>{item.date}</Text>
            </View>
            <TouchableOpacity hitSlop={8}>
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
        <Text style={[styles.amount, isExpense ? styles.expense : styles.income]}>
          {amountText}
        </Text>
      </View>

      {item.memo ? <Text style={styles.content}>{item.memo}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionItem} hitSlop={8}>
          <MaterialIcons name="favorite-border" size={18} color="#868686" />
          <Text style={styles.actionCount}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem} hitSlop={8} onPress={onCommentPress}>
          <MaterialIcons name="chat-bubble-outline" size={18} color="#868686" />
          <Text style={styles.actionCount}>{item.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>피드</Text>
        <TouchableOpacity hitSlop={8} onPress={() => router.push('/notifications' as any)}>
          <MaterialIcons name="notifications-none" size={26} color="#11181C" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {MOCK_FEED.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            onCommentPress={() => router.push({ pathname: '/comments/[id]', params: { id: item.id } } as any)}
          />
        ))}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'Pretendard',
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
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Pretendard',
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
  income: {
    color: '#1F4F3A',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#11181C',
    lineHeight: 20,
    fontFamily: 'Pretendard',
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
});
