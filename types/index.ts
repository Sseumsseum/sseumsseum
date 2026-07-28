export type Notification = {
  id: string;
  fromUser: string;
  avatarColor: string;
  type: 'LIKE' | 'COMMENT' | 'FRIEND_REQ' | 'FRIEND_ACCEPT';
  targetIdx: string;
  targetType: 'LEDGER' | 'COMMENT' | null;
  isRead: boolean;
  createdAt: string;
  commentContent?: string;
};

export type Heart = {
  id: string;
  tableType: 'LEDGER' | 'COMMENT';
  targetIdx: string;
  userId: string;
  createdAt: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CategoryGroupType = 'EXPENSE' | 'INCOME' | 'SAVING';

export type Category = {
  idx: number;
  groupType: CategoryGroupType;
  name: string;
};

export type FeedWriter = {
  nickname: string;
  profileImg: string | null;
};

export type FeedListItem = {
  ledgerIdx: number;
  name: string;
  amount: number | null;
  category: string;
  date: string;
  writer: FeedWriter;
  heartCount: number;
  isHearted: boolean;
  commentCount: number;
  images: string[];
};

export type FeedCommentBase = {
  commentIdx: number;
  content: string;
  writer: FeedWriter;
  heartCount: number;
  isHearted: boolean;
  createdAt: string;
};

export type FeedComment = FeedCommentBase & {
  replies: FeedCommentBase[];
};

export type NewComment = {
  commentIdx: number;
  content: string;
  writer: FeedWriter;
  heartCount: number;
  createdAt: string;
};

export type FeedDetail = {
  ledgerIdx: number;
  name: string;
  amount: number | null;
  category: string;
  date: string;
  memo: string | null;
  images: string[];
  writer: FeedWriter & { idx: number };
  heartCount: number;
  isHearted: boolean;
  commentCount: number;
  comments: FeedComment[];
};
