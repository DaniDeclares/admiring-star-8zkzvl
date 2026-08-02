import { sendNewRequestNotification } from '../notificationService.js';

describe('sendNewRequestNotification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('posts a formatted payload to the configured webhook', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock;
    process.env.TEAM_NOTIFICATION_WEBHOOK_URL = 'https://hooks.example.test/abc';

    const result = await sendNewRequestNotification('REQ-1234', 'Ava Patel', 'prop');

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://hooks.example.test/abc',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' })
      })
    );

    const [, options] = fetchMock.mock.calls[0];
    const payload = JSON.parse(options.body);
    expect(payload.text).toContain('REQ-1234');
    expect(payload.text).toContain('Ava Patel');
    expect(payload.text).toContain('prop');
  });

  test('returns a skipped result when no webhook URL is configured', async () => {
    delete process.env.TEAM_NOTIFICATION_WEBHOOK_URL;

    const result = await sendNewRequestNotification('REQ-1234', 'Ava Patel', 'prop');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('missing-webhook');
  });
});
