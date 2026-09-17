import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { Friend } from '@/types';

const TABS = ['내 친구', '받은 요청', '보낸 요청'] as const;

type FriendDisplay = Friend & { nickname: string; email: string; color: string };

const MY_FRIENDS: FriendDisplay[] = [
  { idx: 1, fromUserIdx: 1, toUserIdx: 101, status: 'ACCEPTED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', nickname: '희원', email: 'heewon@email.com', color: '#F2B8C6' },
  { idx: 2, fromUserIdx: 1, toUserIdx: 102, status: 'ACCEPTED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', nickname: '진실', email: 'jinsil@email.com', color: '#AAD4F0' },
  { idx: 3, fromUserIdx: 1, toUserIdx: 103, status: 'ACCEPTED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', nickname: '수정', email: 'soojung@email.com', color: '#B6B4E6' },
  { idx: 4, fromUserIdx: 1, toUserIdx: 104, status: 'ACCEPTED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', nickname: '희라', email: 'heera@email.com', color: '#F2D577' },
];

const RECEIVED_REQUESTS: FriendDisplay[] = [
  { idx: 5, fromUserIdx: 105, toUserIdx: 1, status: 'PENDING', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z', nickname: '민준', email: 'minjun@email.com', color: '#9AD6C4' },
  { idx: 6, fromUserIdx: 106, toUserIdx: 1, status: 'PENDING', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z', nickname: '서연', email: 'seoyeon@email.com', color: '#F0BC93' },
];

const FRIENDS_BY_TAB: Record<(typeof TABS)[number], FriendDisplay[]> = {
  '내 친구': MY_FRIENDS,
  '받은 요청': RECEIVED_REQUESTS,
  '보낸 요청': [],
};

const EMPTY_MESSAGE: Record<(typeof TABS)[number], string> = {
  '내 친구': '아직 친구가 없어요.',
  '받은 요청': '받은 친구 요청이 없어요.',
  '보낸 요청': '보낸 친구 요청이 없어요.',
};

export default function FriendsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('내 친구');
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>친구 관리</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#868686" />
          <TextInput
            style={styles.searchInput}
            placeholder="친구 검색"
            placeholderTextColor="#868686"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const count = FRIENDS_BY_TAB[tab].length;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {count > 0 ? `${tab} ${count}` : tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
          <MaterialIcons name="person-add" size={18} color="#11181C" />
          <Text style={styles.addButtonText}>친구 추가</Text>
        </TouchableOpacity>

        {FRIENDS_BY_TAB[activeTab].length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{EMPTY_MESSAGE[activeTab]}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {FRIENDS_BY_TAB[activeTab].map((friend) => (
              <View key={friend.idx} style={styles.friendRow}>
                <View style={[styles.avatar, { backgroundColor: friend.color }]} />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.nickname}</Text>
                  <Text style={styles.friendEmail}>{friend.email}</Text>
                </View>
                {activeTab === '받은 요청' ? (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.acceptButton} activeOpacity={0.7}>
                      <Text style={styles.acceptButtonText}>수락</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectButton} activeOpacity={0.7}>
                      <Text style={styles.rejectButtonText}>거절</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.manageButton} activeOpacity={0.7}>
                    <Text style={styles.manageButtonText}>관리</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
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
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#1F4F3A',
    borderColor: '#1F4F3A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  tabTextActive: {
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 14,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  list: {
    marginTop: 24,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  friendInfo: {
    flex: 1,
    gap: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  friendEmail: {
    fontSize: 13,
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  manageButton: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  manageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  acceptButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F4F3A',
    backgroundColor: '#1F4F3A',
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Pretendard',
  },
});
