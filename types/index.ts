export type Notification = {
  notificationIdx: number;
  type: 'LIKE' | 'COMMENT' | 'FRIEND_REQ' | 'FRIEND_ACCEPT';
  fromUser: FeedWriter & { idx: number };
  targetIdx: number;
  targetType: 'LEDGER' | 'COMMENT' | null;
  createdAt: string;
  read: boolean;
};

export type Heart = {
  idx: number;
  tableType: 'LEDGER' | 'COMMENT';
  targetIdx: number;
  userIdx: number;
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
  userIdx: number | null;
  createdAt: string;
};

export type Member = {
  idx: number;
  email: string;
  nickname: string;
  profileImg: string | null;
  socialYn: boolean;
  kakaoEmail: string | null;
  autoLoginYn: boolean;
  saveIdYn: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMethod = {
  idx: number;
  name: string;
  userIdx: number | null;
  createdAt: string;
};

export type Ledger = {
  idx: number;
  userIdx: number;
  type: CategoryGroupType;
  name: string;
  amount: number;
  categoryIdx: number;
  paymentIdx: number | null;
  date: string;
  memo: string | null;
  feedYn: boolean;
  amountPublicYn: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LedgerImage = {
  idx: number;
  ledgerIdx: number;
  path: string;
  createdAt: string;
};

export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type Friend = {
  idx: number;
  fromUserIdx: number;
  toUserIdx: number;
  status: FriendStatus;
  createdAt: string;
  updatedAt: string;
};

export type Setting = {
  userIdx: number;
  budget: number | null;
  startDay: number;
  startWeekday: string | null;
  showDailySum: boolean;
  showHoliday: boolean;
  showFixedExp: boolean;
  theme: string | null;
  font: string | null;
  updatedAt: string;
};

export type NotificationSetting = {
  userIdx: number;
  allAlarm: boolean;
  likeAlarm: boolean;
  commentAlarm: boolean;
  friendReqAlarm: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  budgetExceed: boolean;
  fixedExpAlarm: boolean;
  dndYn: boolean;
  dndStart: string | null;
  dndEnd: string | null;
  updatedAt: string;
};

export type RegularExpenseCycle = 'MONTHLY' | 'WEEKLY';

export type RegularExpense = {
  idx: number;
  userIdx: number;
  name: string;
  amount: number;
  categoryIdx: number;
  paymentIdx: number | null;
  cycle: RegularExpenseCycle;
  dayOfCycle: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FeedWriter = {
  nickname: string;
  profileImg: string | null;
};

export type FeedHeartResult = {
  ledgerIdx: number;
  heartCount: number;
  hearted: boolean;
};

export type FeedListItem = {
  ledgerIdx: number;
  name: string;
  amount: number | null;
  category: string;
  date: string;
  memo: string | null;
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
  isMine: boolean;
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
  isMine: boolean;
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

export type Payment = {
  idx: string;
  name: string;
};
