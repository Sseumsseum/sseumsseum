import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  type GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '@/providers/auth';
import { fetchCategories } from '@/services/categories';
import { avatarColorFor, hslToHex } from '@/utils/format';
import type { Category, CategoryGroupType } from '@/types';

type ColoredCategory = Category & { color: string };

const TABS: { key: CategoryGroupType; label: string }[] = [
  { key: 'EXPENSE', label: '지출' },
  { key: 'INCOME', label: '수입' },
  { key: 'SAVING', label: '저축' },
];

const HUE_STOPS = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'] as const;
const DEFAULT_HUE = 150;

function ColorHueBar({ hue, onChange }: { hue: number; onChange: (hue: number) => void }) {
  const [width, setWidth] = useState(0);

  function handleTouch(evt: GestureResponderEvent) {
    if (!width) return;
    const x = Math.max(0, Math.min(width, evt.nativeEvent.locationX));
    onChange(Math.round((x / width) * 360));
  }

  return (
    <View
      style={styles.hueBar}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleTouch}
      onResponderMove={handleTouch}
    >
      <View style={[styles.hueBarClip, StyleSheet.absoluteFill]}>
        <LinearGradient colors={HUE_STOPS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </View>
      {width > 0 ? (
        <View pointerEvents="none" style={[styles.hueIndicator, { left: (hue / 360) * width - 11 }]} />
      ) : null}
    </View>
  );
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { token, initializing } = useAuth();

  const [activeTab, setActiveTab] = useState<CategoryGroupType>('EXPENSE');
  const [categories, setCategories] = useState<Category[]>([]);
  const [localCategories, setLocalCategories] = useState<ColoredCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addVisible, setAddVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHue, setNewHue] = useState(DEFAULT_HUE);
  const newColor = hslToHex(newHue, 70, 55);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCategories(activeTab, token);
      setCategories(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '카테고리를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (initializing) return;
    load();
  }, [initializing, load]);

  const visibleCategories: ColoredCategory[] = [
    ...categories.map((category) => ({ ...category, color: avatarColorFor(category.name) })),
    ...localCategories.filter((category) => category.groupType === activeTab),
  ];

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setLocalCategories((prev) => [
      ...prev,
      {
        idx: -Date.now(),
        groupType: activeTab,
        name,
        userIdx: null,
        createdAt: new Date().toISOString(),
        color: newColor,
      },
    ]);
    setNewName('');
    setNewHue(DEFAULT_HUE);
    setAddVisible(false);
  }

  function removeLocal(idx: number) {
    setLocalCategories((prev) => prev.filter((category) => category.idx !== idx));
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>카테고리 관리</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#1F4F3A" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {visibleCategories.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>등록된 카테고리가 없어요.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {visibleCategories.map((category) => (
                <View key={category.idx} style={styles.categoryRow}>
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {category.idx < 0 ? (
                    <TouchableOpacity hitSlop={8} onPress={() => removeLocal(category.idx)}>
                      <MaterialIcons name="close" size={18} color="#868686" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => setAddVisible(true)}>
            <MaterialIcons name="add" size={18} color="#11181C" />
            <Text style={styles.addButtonText}>카테고리 추가</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={addVisible} transparent animationType="fade" onRequestClose={() => setAddVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setAddVisible(false)}>
            <Pressable style={styles.addSheet} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.addSheetTitle}>카테고리 추가</Text>
              <Text style={styles.addSheetSubtitle}>{TABS.find((t) => t.key === activeTab)?.label} 카테고리</Text>
              <TextInput
                style={styles.addInput}
                placeholder="카테고리 이름"
                placeholderTextColor="#868686"
                value={newName}
                onChangeText={setNewName}
                autoFocus
                onSubmitEditing={handleAdd}
              />

              <View style={styles.colorSection}>
                <View style={styles.colorSectionHeader}>
                  <Text style={styles.colorLabel}>색상</Text>
                  <View style={styles.colorPreviewRow}>
                    <View style={[styles.colorPreviewDot, { backgroundColor: newColor }]} />
                    <Text style={styles.colorPreviewText}>{newColor}</Text>
                  </View>
                </View>
                <ColorHueBar hue={newHue} onChange={setNewHue} />
              </View>

              <TouchableOpacity
                style={[styles.confirmButton, !newName.trim() && styles.confirmButtonDisabled]}
                onPress={handleAdd}
                disabled={!newName.trim()}
              >
                <Text style={styles.confirmButtonText}>추가하기</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
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
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
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
  list: {
    paddingTop: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    marginTop: 16,
    marginBottom: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  addSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  addSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  addSheetSubtitle: {
    fontSize: 13,
    color: '#868686',
    marginTop: 4,
    marginBottom: 16,
    fontFamily: 'Pretendard',
  },
  addInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  colorSection: {
    marginTop: 20,
  },
  colorSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  colorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#868686',
    fontFamily: 'Pretendard',
  },
  colorPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorPreviewDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  colorPreviewText: {
    fontSize: 13,
    color: '#11181C',
    fontFamily: 'Pretendard',
  },
  hueBar: {
    height: 28,
  },
  hueBarClip: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  hueIndicator: {
    position: 'absolute',
    top: -2,
    width: 22,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  confirmButton: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1F4F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Pretendard',
  },
});
