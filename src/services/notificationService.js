// filename: src/services/notificationService.js
// DANI DECLARES LLC — TEAM NOTIFICATION HOOK (Slack & Email)

export async function sendNewRequestNotification(publicId, clientName, serviceCategory) {
  const webhookUrl = process.env.TEAM_NOTIFICATION_WEBHOOK_URL;
  if (!webhookUrl) return;

  const payload = {
    text: 
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Notification Hook Error:', error);
  }
}
