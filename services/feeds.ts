import { deleteData, deleteDataResult, getData, postData } from '@/services/api';
import type { FeedComment, FeedDetail, FeedHeartResult, FeedListItem, NewComment } from '@/types';

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function fetchFeeds(cursor: number | null, size: number, token: string | null) {
  const params = new URLSearchParams();
  if (cursor !== null) params.set('cursor', String(cursor));
  params.set('size', String(size));
  return getData<FeedListItem[]>(`/feeds?${params.toString()}`, authHeaders(token));
}

export function fetchFeedDetail(ledgerIdx: number, token: string | null) {
  return getData<FeedDetail>(`/feeds/${ledgerIdx}`, authHeaders(token));
}

export function fetchComments(ledgerIdx: number, cursor: number | null, size: number, token: string | null) {
  const params = new URLSearchParams();
  if (cursor !== null) params.set('cursor', String(cursor));
  params.set('size', String(size));
  return getData<FeedComment[]>(`/ledgers/${ledgerIdx}/comments?${params.toString()}`, authHeaders(token));
}

export function createComment(ledgerIdx: number, content: string, parentCommentIdx: number | null, token: string | null) {
  const body: { content: string; parentCommentIdx?: number } = { content };
  if (parentCommentIdx !== null) body.parentCommentIdx = parentCommentIdx;
  return postData<NewComment>(`/ledgers/${ledgerIdx}/comments`, body, authHeaders(token));
}

export function deleteComment(commentIdx: number, token: string | null) {
  return deleteData(`/comments/${commentIdx}`, authHeaders(token));
}

export function hideFeed(ledgerIdx: number, token: string | null) {
  return postData<null>(`/feeds/${ledgerIdx}/hide`, undefined, authHeaders(token));
}

export function unhideFeed(ledgerIdx: number, token: string | null) {
  return deleteData(`/feeds/${ledgerIdx}/hide`, authHeaders(token));
}

export function likeFeed(ledgerIdx: number, token: string | null) {
  return postData<FeedHeartResult>(`/feeds/${ledgerIdx}/heart`, undefined, authHeaders(token));
}

export function unlikeFeed(ledgerIdx: number, token: string | null) {
  return deleteDataResult<FeedHeartResult>(`/feeds/${ledgerIdx}/heart`, authHeaders(token));
}
