// Pure normalization for the existing Gmail -> communication-events rail.
// This is evidence handling only; it never grants permission to contact anyone.
export function header(headers, name) {
  return (headers || []).find(h => String(h.name || '').toLowerCase() === name.toLowerCase())?.value || '';
}

export function emailAddresses(value) {
  // Match addr-specs rather than splitting commas inside quoted display names.
  return [...new Set((String(value || '').match(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])
    .map(address => address.toLowerCase()))];
}

export function messageReceipt(message, accountEmail, connectionId) {
  const labels = message.labelIds || [];
  if (labels.includes('DRAFT')) return null;
  const headers = message.payload?.headers || [];
  const sender = emailAddresses(header(headers, 'From'))[0] || '';
  const isSent = labels.includes('SENT');
  // Own-address messages without SENT are not proof of a completed send.
  if (!isSent && sender === String(accountEmail || '').trim().toLowerCase()) return null;
  const timestamp = Number(message.internalDate);
  if (!message.id || !message.internalDate || !Number.isFinite(timestamp) || timestamp <= 0) {
    throw new Error('GMAIL_MESSAGE_RECEIPT_INCOMPLETE');
  }
  const receivedAt = new Date(timestamp);
  if (Number.isNaN(receivedAt.getTime())) throw new Error('GMAIL_MESSAGE_RECEIPT_INCOMPLETE');
  return {
    p_external_message_id: message.id,
    p_external_thread_id: message.threadId || null,
    p_direction: isSent ? 'OUTBOUND' : 'INBOUND',
    p_sender_address: sender,
    p_recipient_addresses: [...new Set(['To', 'Cc', 'Bcc'].flatMap(name => emailAddresses(header(headers, name))))],
    p_subject: header(headers, 'Subject') || null,
    p_body_excerpt: message.snippet || null,
    p_received_at: receivedAt.toISOString(),
    p_raw_metadata: {
      history_id: message.historyId || null,
      label_ids: labels,
      gmail_connection_id: connectionId,
      account_email: accountEmail || null,
      // SENT establishes Gmail acceptance, never delivery, reading or a sale.
      receipt_basis: isSent ? 'GMAIL_SENT_LABEL' : 'GMAIL_INBOUND_MESSAGE'
    }
  };
}
