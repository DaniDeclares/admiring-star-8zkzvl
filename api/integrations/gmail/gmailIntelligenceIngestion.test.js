import { walkGmailParts, gmailTextBodies, normalizeGmailMessage, uniqueHistoryMessageIds, isStaleHistoryResponse, gmailSyncMode, gmailBackfillState, shouldIngestCommunication, completeGmailBackfillMetadata, nextGmailSyncMetadata } from './gmailIntelligenceIngestion.js';

const enc = s => Buffer.from(s).toString('base64url');

describe('Gmail intelligence normalization', () => {
  it('extracts bodies and attachments with lineage', () => {
    const payload = { mimeType: 'multipart/mixed', parts: [
      { partId: '1', mimeType: 'text/plain', body: { data: enc('research body') } },
      { partId: '2', mimeType: 'application/pdf', filename: 'guide.pdf', body: { attachmentId: 'att-1', size: 123 } }
    ]};
    expect(gmailTextBodies(payload)[0].text).toBe('research body');
    expect(walkGmailParts(payload)[0]).toMatchObject({ filename: 'guide.pdf', attachmentId: 'att-1' });
  });

  it('normalizes message provenance without granting authority', () => {
    const result = normalizeGmailMessage({ accountEmail: 'vendors@danideclares.com', message: { id: 'm1', threadId: 't1', historyId: 'h1', internalDate: '1', labelIds: ['INBOX'], snippet: 'x', payload: { headers: [{ name: 'Subject', value: 'S' }] } } });
    expect(result).toMatchObject({ externalMessageId: 'm1', externalThreadId: 't1', historyId: 'h1', authorityStatus: 'OBSERVATION_ONLY' });
  });

  it('deduplicates ids across Gmail history pages', () => {
    expect(uniqueHistoryMessageIds([{ messagesAdded: [{ message: { id: 'a' } }, { message: { id: 'a' } }] }, { messages: [{ id: 'b' }] }])).toEqual(['a', 'b']);
  });

  it('detects stale history cursor recovery condition', () => {
    expect(isStaleHistoryResponse(404, { error: { message: 'HistoryId too old' } })).toBe(true);
  });

  it('uses bounded backfill until a verified cursor/backfill state exists', () => {
    expect(gmailSyncMode({ metadata: {} }).mode).toBe('BOUNDED_BACKFILL');
    expect(gmailSyncMode({ metadata: { gmail_history_id: '123', gmail_intelligence_backfill_complete: true } })).toEqual({ mode: 'INCREMENTAL', historyId: '123' });
  });

  it('preserves unrelated connection metadata while updating sync state', () => {
    expect(nextGmailSyncMetadata({ email: 'x' }, { gmail_history_id: '9' })).toMatchObject({ email: 'x', gmail_history_id: '9', gmail_intelligence_sync_version: 2 });
  });
  it('tracks historical pagination separately from live communication ingestion', () => {
    expect(gmailBackfillState({ metadata: { gmail_intelligence_backfill_page_token: 'p2' } })).toEqual({ pageToken: 'p2', complete: false });
    expect(shouldIngestCommunication('BOUNDED_BACKFILL')).toBe(false);
    expect(shouldIngestCommunication('INCREMENTAL')).toBe(true);
  });

  it('marks backfill complete and anchors a Gmail history cursor', () => {
    const result = completeGmailBackfillMetadata({ unrelated: true, gmail_intelligence_backfill_page_token: 'p2' }, '777');
    expect(result).toMatchObject({ unrelated: true, gmail_intelligence_backfill_page_token: null, gmail_intelligence_backfill_complete: true, gmail_history_id: '777', gmail_intelligence_sync_version: 2 });
  });
});
