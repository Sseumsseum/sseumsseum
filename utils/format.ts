const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const absolute = `${yyyy}.${mm}.${dd}`;

  const diff = Date.now() - date.getTime();
  const relative =
    diff < MINUTE ? '방금 전' :
    diff < HOUR ? `${Math.floor(diff / MINUTE)}분 전` :
    diff < DAY ? `${Math.floor(diff / HOUR)}시간 전` :
    `${Math.floor(diff / DAY)}일 전`;

  return `${absolute} · ${relative}`;
}

export const AVATAR_COLORS = ['#9B5DE5', '#F77F00', '#00BBF9', '#F15BB5', '#00BFA6', '#FEE440'];

export function avatarColorFor(nickname: string): string {
  let hash = 0;

  for (let i = 0; i < nickname.length; i++)
    hash = (hash * 31 + nickname.charCodeAt(i)) | 0;

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
