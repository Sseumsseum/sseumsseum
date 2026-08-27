import type MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export type CategoryIconInfo = {
  icon: MaterialIconName;
  bg: string;
  color: string;
};

// 카테고리 이름 → 아이콘/색상 매핑. 서버 Category 타입에 아이콘 필드가 없어서
// 이름 기준으로 클라이언트에서 매핑함. 작성화면 카테고리 시트와 가계부 목록의
// 거래 아이콘이 같은 매핑을 공유하도록 여기 한곳에서만 관리.
export const CATEGORY_ICONS: Record<string, CategoryIconInfo> = {
  '식비': { icon: 'restaurant', bg: '#FBE3D5', color: '#E0793F' },
  '카페·간식': { icon: 'local-cafe', bg: '#FCEFC7', color: '#C9891F' },
  '교통': { icon: 'directions-bus', bg: '#DCE9F7', color: '#3DA9F2' },
  '쇼핑': { icon: 'shopping-cart', bg: '#DDEEE4', color: '#1F4F3A' },
  '주거·생활': { icon: 'home', bg: '#FCEFC7', color: '#C9891F' },
  '의료': { icon: 'medical-services', bg: '#EDE3F7', color: '#8B5FBF' },
  '문화·여가': { icon: 'theater-comedy', bg: '#EDE3F7', color: '#8B5FBF' },
  '기타': { icon: 'more-horiz', bg: '#FBE3D5', color: '#E0793F' },
  // INCOME
  '월급': { icon: 'payments', bg: '#DDEEE4', color: '#1F4F3A' },
  '부수입': { icon: 'trending-up', bg: '#FCEFC7', color: '#C9891F' },
  '용돈': { icon: 'card-giftcard', bg: '#FDE2E4', color: '#D6336C' },
  // SAVING
  '적금': { icon: 'savings', bg: '#DCE9F7', color: '#3DA9F2' },
  '투자': { icon: 'show-chart', bg: '#EDE3F7', color: '#8B5FBF' },
  '비상금': { icon: 'security', bg: '#FBE3D5', color: '#E0793F' },
};

// 매핑에 없는 카테고리(사용자가 직접 추가한 카테고리 등)용 기본값.
export const DEFAULT_CATEGORY_ICON: CategoryIconInfo = {
  icon: 'label',
  bg: '#EEF2F6',
  color: '#868686',
};

export function getCategoryIcon(name: string): CategoryIconInfo {
  return CATEGORY_ICONS[name] ?? DEFAULT_CATEGORY_ICON;
}
