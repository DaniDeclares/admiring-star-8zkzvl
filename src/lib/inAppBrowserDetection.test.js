import { detectInAppBrowser } from './inAppBrowserDetection.js';

const UA = {
  facebookIOS: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.0;FBBV/123456;]',
  facebookAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.0;]',
  instagramIOS: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 320.0.0.0.0 (iPhone14,5; iOS 17_5; en_US; en-US)',
  linkedinAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 LinkedInApp/9.30.1234',
  tiktokIOS: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_25.4.0 BytedanceWebview/d8a21c6',
  safari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
};

describe('detectInAppBrowser', () => {
  test('flags Facebook in-app browser on iOS', () => {
    expect(detectInAppBrowser(UA.facebookIOS)).toEqual({ id: 'facebook', label: 'Facebook' });
  });

  test('flags Facebook in-app browser on Android', () => {
    expect(detectInAppBrowser(UA.facebookAndroid)).toEqual({ id: 'facebook', label: 'Facebook' });
  });

  test('flags Instagram in-app browser', () => {
    expect(detectInAppBrowser(UA.instagramIOS)).toEqual({ id: 'instagram', label: 'Instagram' });
  });

  test('flags LinkedIn in-app browser', () => {
    expect(detectInAppBrowser(UA.linkedinAndroid)).toEqual({ id: 'linkedin', label: 'LinkedIn' });
  });

  test('flags TikTok in-app browser', () => {
    expect(detectInAppBrowser(UA.tiktokIOS)).toEqual({ id: 'tiktok', label: 'TikTok' });
  });

  test('does not flag regular mobile Safari', () => {
    expect(detectInAppBrowser(UA.safari)).toBeNull();
  });

  test('does not flag regular desktop Chrome', () => {
    expect(detectInAppBrowser(UA.chrome)).toBeNull();
  });

  test('handles empty/undefined user agent', () => {
    expect(detectInAppBrowser('')).toBeNull();
    expect(detectInAppBrowser(undefined)).toBeNull();
  });
});
