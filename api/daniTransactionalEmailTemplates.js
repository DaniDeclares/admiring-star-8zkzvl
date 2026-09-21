// DANI DECLARES transactional email system — customer + operator templates.
// Email-safe: table layout, inline CSS, no client-side assets, graceful text fallback.

const BRAND = {
  burgundy: '#6B1F2B',
  burgundyDark: '#4F1720',
  burgundyLight: '#873340',
  ivory: '#F6F0E4',
  cream: '#EDE2D0',
  gold: '#C9A45C',
  goldLight: '#DCC58F',
  dark: '#21191A',
  white: '#FFFFFF',
  blue: '#245EA8',
};

const SITE_URL = 'https://danideclares.com';
const OPERATIONS_URL = 'https://danideclares.com/portal/operations';
const LOGO_URL = 'https://danideclares.com/dani-declares-logo.svg';

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function nl2br(value) {
  return esc(value).replace(/\\n/g, '<br>');
}

function formatDateTime(value) {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return esc(value);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  }).format(date) + ' ET';
}

function detailRow(label, value, options = {}) {
  const display = options.link
    ? '<a href="' + esc(options.link) + '" style="color:' + BRAND.blue + ';text-decoration:underline;">' + esc(value) + '</a>'
    : esc(value || 'Not provided');

  return '<tr>' +
    '<td style="padding:11px 14px;border-bottom:1px solid #E7DED0;width:34%;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#6F6562;">' + esc(label) + '</td>' +
    '<td style="padding:11px 14px;border-bottom:1px solid #E7DED0;font-family:Arial,sans-serif;font-size:14px;line-height:1.45;color:' + BRAND.dark + ';">' + display + '</td>' +
  '</tr>';
}

function shell({ eyebrow, title, intro, body, footerNote = 'WE HANDLE THE EXECUTION.' }) {
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + '</title></head>' +
    '<body style="margin:0;padding:0;background:#EFE9DE;color:' + BRAND.dark + ';font-family:Arial,Helvetica,sans-serif;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFE9DE;"><tr><td align="center" style="padding:28px 12px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;background:' + BRAND.white + ';">' +
      '<tr><td style="background:' + BRAND.burgundyDark + ';padding:25px 32px 22px;">' +
        '<div style="font-family:Georgia,Times New Roman,serif;font-size:28px;line-height:1;color:#FFFFFF;letter-spacing:.04em;">DANI DECLARES</div>' +
        '<div style="margin-top:8px;font-family:Arial,sans-serif;font-size:10px;line-height:1.4;letter-spacing:.18em;text-transform:uppercase;color:' + BRAND.goldLight + ';">' + esc(footerNote) + '</div>' +
        '<div style="margin-top:17px;height:2px;width:72px;background:' + BRAND.gold + ';"></div>' +
      '</td></tr>' +
      '<tr><td style="padding:34px 32px 10px;">' +
        '<div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:' + BRAND.gold + ';">' + esc(eyebrow) + '</div>' +
        '<h1 style="margin:12px 0 12px;font-family:Georgia,Times New Roman,serif;font-size:36px;line-height:1.08;font-weight:400;color:' + BRAND.dark + ';">' + esc(title) + '</h1>' +
        '<p style="margin:0 0 22px;font-family:Arial,sans-serif;font-size:16px;line-height:1.65;color:#514847;">' + esc(intro) + '</p>' +
      '</td></tr>' +
      '<tr><td style="padding:0 32px 32px;">' + body + '</td></tr>' +
      '<tr><td style="background:' + BRAND.burgundyDark + ';padding:22px 32px;">' +
        '<div style="font-family:Georgia,Times New Roman,serif;font-size:18px;color:#FFFFFF;">DANI DECLARES LLC</div>' +
        '<div style="margin-top:6px;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#EDE2D0;">Property support, people first.</div>' +
        '<div style="margin-top:10px;font-family:Arial,sans-serif;font-size:12px;line-height:1.7;color:#FFFFFF;">' +
          '<a href="tel:+14704857173" style="color:' + BRAND.goldLight + ';text-decoration:none;">(470) 485-7173</a> &nbsp;•&nbsp; ' +
          '<a href="mailto:admin@danideclares.com" style="color:' + BRAND.goldLight + ';text-decoration:none;">admin@danideclares.com</a> &nbsp;•&nbsp; ' +
          '<a href="' + SITE_URL + '" style="color:' + BRAND.goldLight + ';text-decoration:none;">danideclares.com</a>' +
        '</div>' +
      '</td></tr>' +
    '</table>' +
    '<div style="max-width:680px;padding:13px 12px 0;text-align:center;font-family:Arial,sans-serif;font-size:10px;line-height:1.5;color:#756D69;">DANI DECLARES LLC • Metro Atlanta, Georgia &amp; Regional South Carolina</div>' +
    '</td></tr></table></body></html>';
}

export function renderCustomerRequestReceivedEmail(data = {}) {
  const details =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #DED5C8;border-radius:12px;border-collapse:separate;overflow:hidden;background:#FFFEFB;">' +
      detailRow('Request ID', data.requestId) +
      detailRow('Service', data.service || 'Request received') +
      detailRow('Requested time', formatDateTime(data.requestedStartAt)) +
      detailRow('Location', data.location || 'Not specified') +
    '</table>' +
    '<div style="margin-top:22px;padding:18px 20px;background:#F4F7FB;border-left:4px solid ' + BRAND.blue + ';border-radius:8px;">' +
      '<div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:' + BRAND.dark + ';">Your requested time is not a final appointment.</div>' +
      '<div style="margin-top:5px;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#514847;">DANI DECLARES will confirm scope, availability and scheduling before the appointment is finalized.</div>' +
    '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;"><tr>' +
      '<td width="33%" valign="top" style="padding:0 12px 0 0;border-top:2px solid ' + BRAND.gold + ';"><div style="padding-top:13px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:' + BRAND.burgundy + ';">What happens next</div><div style="margin-top:6px;font-family:Arial,sans-serif;font-size:13px;line-height:1.55;color:#514847;">We review your request and reach out with the next step.</div></td>' +
      '<td width="33%" valign="top" style="padding:0 12px;border-top:2px solid ' + BRAND.gold + ';"><div style="padding-top:13px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:' + BRAND.burgundy + ';">Questions</div><div style="margin-top:6px;font-family:Arial,sans-serif;font-size:13px;line-height:1.55;color:#514847;">Call or text <a href="tel:+14704857173" style="color:' + BRAND.burgundy + ';">(470) 485-7173</a>.</div></td>' +
      '<td width="33%" valign="top" style="padding:0 0 0 12px;border-top:2px solid ' + BRAND.gold + ';"><div style="padding-top:13px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:' + BRAND.burgundy + ';">Next step</div><div style="margin-top:6px;font-family:Arial,sans-serif;font-size:13px;line-height:1.55;color:#514847;">We will follow up after the request is reviewed.</div></td>' +
    '</tr></table>' +
    '<div style="margin-top:28px;font-family:Georgia,Times New Roman,serif;font-size:24px;font-style:italic;color:' + BRAND.burgundy + ';">Consider it handled.</div>';

  return shell({
    eyebrow: 'Request received',
    title: 'Thank you for your request.',
    intro: 'We’ve received your request and it is now in the DANI DECLARES system. Our team will review the details and follow up with the next step.',
    body: details,
    footerNote: 'WE HANDLE THE EXECUTION.',
  });
}

export function renderOperatorServiceRequestEmail(data = {}) {
  const rows =
    detailRow('Request ID', data.requestId) +
    detailRow('Customer name', data.customerName) +
    detailRow('Customer email', data.customerEmail, data.customerEmail ? { link: 'mailto:' + data.customerEmail } : {}) +
    detailRow('Customer phone', data.customerPhone, data.customerPhone ? { link: 'tel:' + String(data.customerPhone).replace(/[^+\\d]/g, '') } : {}) +
    detailRow('Customer type', data.customerType) +
    detailRow('Starting point', data.frontDoorCode) +
    detailRow('Service', data.service) +
    detailRow('Service reference', data.serviceReference) +
    detailRow('Location', data.location) +
    detailRow('Requested time', formatDateTime(data.requestedStartAt)) +
    detailRow('Timeline', data.timeline) +
    detailRow('Budget', data.budget) +
    detailRow('Booking hold', data.bookingHold);

  const body =
    '<div style="padding:18px 20px;background:' + BRAND.ivory + ';border:1px solid #DED5C8;border-radius:12px;">' +
      '<div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:' + BRAND.burgundy + ';margin-bottom:10px;">Request details</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + rows + '</table>' +
    '</div>' +
    '<div style="margin-top:22px;padding:20px;background:#FBF4DE;border:1px solid ' + BRAND.goldLight + ';border-radius:12px;">' +
      '<div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:' + BRAND.burgundy + ';">Next steps</div>' +
      '<ul style="margin:10px 0 16px;padding-left:20px;font-family:Arial,sans-serif;font-size:13px;line-height:1.75;color:#514847;">' +
        '<li>Review request details and source path.</li>' +
        '<li>Confirm service scope and requirements.</li>' +
        '<li>Check availability and provider capacity.</li>' +
        '<li>Move the request through the governed commercial path.</li>' +
      '</ul>' +
      '<a href="' + OPERATIONS_URL + '" style="display:inline-block;padding:12px 18px;background:' + BRAND.burgundy + ';color:#FFFFFF;text-decoration:none;border-radius:7px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;">Open Operations HQ &rarr;</a>' +
    '</div>';

  return shell({
    eyebrow: 'New service request',
    title: 'New request received.',
    intro: 'A new request has been submitted through the DANI DECLARES platform. The request is ready for operational review.',
    body,
    footerNote: 'OPERATIONS • EXECUTION • SUPPORT',
  });
}

export function renderTransactionalEmail({ template, data, fallbackText = '' } = {}) {
  if (template === 'customer-request-received') return renderCustomerRequestReceivedEmail(data);
  if (template === 'operator-service-request') return renderOperatorServiceRequestEmail(data);
  return '<!doctype html><html><body style="font-family:Arial,sans-serif;color:#21191A;background:#F6F0E4;padding:24px;"><p>' + nl2br(fallbackText) + '</p></body></html>';
}
