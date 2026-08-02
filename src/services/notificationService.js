// filename: src/services/notificationService.js
// DANI DECLARES LLC — TEAM NOTIFICATION HOOK (Slack & Email)

export async function sendNewRequestNotification(publicId, clientName, serviceCategory) {
  const webhookUrl = process.env.TEAM_NOTIFICATION_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: false, reason: 'missing-webhook' };
  }

  const payload = {
    text: [
      'New Dani Declares intake received.',
      `Request ID: ${publicId}`,
      `Client: ${clientName || 'Unknown'}`,
      `Category: ${serviceCategory || 'Unspecified'}`,
      `Source: ${process.env.NODE_ENV === 'production' ? 'production' : 'local-test'}`
    ].join('\n')
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return { success: true };
  } catch (error) {
    console.error('Notification Hook Error:', error);
    return { success: false, reason: 'request-failed', error: error.message };
  }
}
