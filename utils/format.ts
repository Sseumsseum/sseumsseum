const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();

  if (diff < MINUTE) return '방금 전';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}일 전`;

  const date = new Date(iso);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  
  return `${yyyy}.${mm}.${dd}`;
}

const AVATAR_COLORS = ['#9B5DE5', '#F77F00', '#00BBF9', '#F15BB5', '#00BFA6', '#FEE440'];

export function avatarColorFor(nickname: string): string {
  let hash = 0;

  for (let i = 0; i < nickname.length; i++)
    hash = (hash * 31 + nickname.charCodeAt(i)) | 0;

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
