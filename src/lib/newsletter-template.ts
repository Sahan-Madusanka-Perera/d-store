/**
 * The newsletter email, rendered once and used everywhere.
 *
 * The admin "Live Preview" and the mail that actually ships used to be two separate
 * hand-written markups that had already drifted — the preview promised a CTA button,
 * product links and an unsubscribe line that the real email didn't contain. Both now
 * render from this module, so the preview cannot lie.
 *
 * Email HTML is not web HTML. Outlook renders through Word, which ignores flexbox,
 * grid, and most of the box model, so everything below is presentational tables with
 * inline styles. Keep it that way.
 */

import { BRAND_TAGLINE as TAGLINE } from '@/lib/constants';

export interface NewsletterProduct {
  id: number | string;
  name: string;
  price: number;
  image_url?: string | null;
}

export interface NewsletterTemplateInput {
  heading: string;
  body: string;
  products?: NewsletterProduct[];
  /** Absolute origin, e.g. https://d-store.lk — required for logo and links to resolve in mail clients */
  siteUrl: string;
  /** Per-recipient unsubscribe URL. Omitted only for the admin preview. */
  unsubscribeUrl?: string;
}

// Brand: the site's own monochrome identity — white surface, black type — with the
// logo's cyan as the single accent. The logo art is black-on-transparent with a cyan
// glow, so it only reads on a light background; on a dark masthead the sword and the
// wordmark disappear and just the glow survives. Light also survives mail-client
// dark-mode auto-inversion far better than a dark template does.
const SHELL = '#F4F4F5';      // page surround, so the 600px card has an edge
const PAPER = '#FFFFFF';      // card surface
const CARD = '#FAFAFA';       // product rows
const HAIRLINE = '#E4E4E7';
const INK = '#0A0A0A';        // headings, buttons
const BODY = '#3F3F46';       // 10.8:1 on PAPER
const MUTED = '#71717A';      // 4.9:1 on PAPER
const ACCENT = '#0284C7';     // logo cyan deepened for text — 4.6:1 on PAPER
const ACCENT_BRIGHT = '#4FC3F7'; // the logo's actual cyan; rules and edges only, never text

const FONT = "'Helvetica Neue', Helvetica, Arial, 'Segoe UI', sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(price: number): string {
  return `LKR ${Number(price).toLocaleString('en-LK')}`;
}

/** First ~140 chars of the body: what inboxes show next to the subject line. */
function preheaderFrom(body: string): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length > 140 ? `${flat.slice(0, 137)}...` : flat;
}

function productRow(product: NewsletterProduct, siteUrl: string): string {
  const href = `${siteUrl}/products/${product.id}`;
  const name = escapeHtml(product.name);

  return `
  <tr>
    <td style="padding:0 0 12px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${CARD};border:1px solid ${HAIRLINE};">
        <tr>
          ${product.image_url ? `
          <td width="96" valign="top" style="padding:14px 0 14px 14px;">
            <a href="${href}" style="text-decoration:none;">
              <img src="${escapeHtml(product.image_url)}" width="96" height="96" alt="${name}"
                   style="display:block;width:96px;height:96px;object-fit:cover;border:0;background-color:${HAIRLINE};" />
            </a>
          </td>` : ''}
          <td valign="middle" style="padding:14px 18px;">
            <a href="${href}" style="color:${INK};text-decoration:none;font-family:${FONT};font-size:15px;font-weight:700;line-height:1.35;display:block;">${name}</a>
            <div style="color:${ACCENT};font-family:${FONT};font-size:15px;font-weight:700;padding-top:6px;letter-spacing:0.01em;">${formatPrice(product.price)}</div>
            <a href="${href}" style="color:${MUTED};text-decoration:underline;font-family:${FONT};font-size:12px;padding-top:8px;display:inline-block;">View details</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function renderNewsletterHtml(input: NewsletterTemplateInput): string {
  const { heading, body, products = [], siteUrl, unsubscribeUrl } = input;

  const safeHeading = escapeHtml(heading);
  // Admin writes plain text; preserve their line breaks without trusting their markup.
  const safeBody = escapeHtml(body).replace(/\n/g, '<br />');
  const preheader = escapeHtml(preheaderFrom(body));

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${safeHeading}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  /* Clients that support media queries get a tighter mobile layout; the rest keep the
     600px table, which is why nothing structural depends on this block. */
  @media only screen and (max-width:620px) {
    .shell { width:100% !important; }
    .gutter { padding-left:22px !important; padding-right:22px !important; }
    .display { font-size:28px !important; line-height:1.2 !important; }
  }
  a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
</style>
</head>
<body style="margin:0;padding:0;background-color:${SHELL};">

<div style="display:none;font-size:1px;color:${SHELL};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${SHELL};">
  <tr>
    <td align="center" style="padding:32px 12px;">

      <table role="presentation" class="shell" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">

        <!-- Masthead -->
        <tr>
          <td align="center" style="background-color:${PAPER};padding:34px 24px 26px 24px;border-top:3px solid ${ACCENT_BRIGHT};border-bottom:1px solid ${HAIRLINE};">
            <a href="${siteUrl}" style="text-decoration:none;">
              <img src="${siteUrl}/Logo.Trns.png" width="168" height="168" alt="D-Store"
                   style="display:block;width:168px;height:168px;border:0;margin:0 auto;" />
            </a>
            <div style="color:${MUTED};font-family:${FONT};font-size:11px;letter-spacing:0.24em;text-transform:uppercase;padding-top:10px;">${TAGLINE}</div>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td class="gutter" style="background-color:${PAPER};padding:40px 44px 8px 44px;">
            <h1 class="display" style="margin:0;color:${INK};font-family:${FONT};font-size:34px;line-height:1.15;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;">${safeHeading}</h1>
          </td>
        </tr>
        <tr>
          <td class="gutter" style="background-color:${PAPER};padding:18px 44px 36px 44px;">
            <div style="color:${BODY};font-family:${FONT};font-size:15px;line-height:1.75;">${safeBody}</div>
          </td>
        </tr>
${products.length > 0 ? `
        <!-- Featured -->
        <tr>
          <td class="gutter" style="background-color:${PAPER};padding:0 44px 18px 44px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="40" style="border-top:2px solid ${ACCENT_BRIGHT};font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding-left:14px;color:${INK};font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Featured</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="gutter" style="background-color:${PAPER};padding:0 44px 20px 44px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${products.map(p => productRow(p, siteUrl)).join('')}
            </table>
          </td>
        </tr>` : ''}

        <!-- Call to action -->
        <tr>
          <td align="center" class="gutter" style="background-color:${PAPER};padding:14px 44px 46px 44px;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${siteUrl}/products" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="0%" stroke="f" fillcolor="${INK}">
              <w:anchorlock/>
              <center style="color:${PAPER};font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:0.12em;">SHOP NEW ARRIVALS</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a href="${siteUrl}/products"
               style="background-color:${INK};color:${PAPER};display:inline-block;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:0.12em;line-height:50px;text-align:center;text-decoration:none;text-transform:uppercase;width:280px;">Shop New Arrivals</a>
            <!--<![endif]-->
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="gutter" style="background-color:${CARD};padding:30px 44px;border-top:1px solid ${HAIRLINE};">
            <div style="color:${INK};font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">D-Store</div>
            <div style="color:${MUTED};font-family:${FONT};font-size:12px;line-height:1.7;padding-top:10px;">
              Sri Lanka&rsquo;s home for manga, figures and otaku apparel.<br />
              You are receiving this because you subscribed to D-Store updates.
            </div>
            <div style="padding-top:16px;">
              <a href="${siteUrl}" style="color:${MUTED};font-family:${FONT};font-size:12px;text-decoration:underline;">Visit the store</a>
              ${unsubscribeUrl ? `<span style="color:${HAIRLINE};padding:0 8px;">|</span><a href="${unsubscribeUrl}" style="color:${MUTED};font-family:${FONT};font-size:12px;text-decoration:underline;">Unsubscribe</a>` : ''}
            </div>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * Plain-text alternative. Sending HTML with no text part is one of the strongest
 * spam signals there is, and it's what non-HTML clients fall back to.
 */
export function renderNewsletterText(input: NewsletterTemplateInput): string {
  const { heading, body, products = [], siteUrl, unsubscribeUrl } = input;

  const lines = [
    `D-STORE — ${TAGLINE}`,
    '',
    heading.toUpperCase(),
    '',
    body,
    '',
  ];

  if (products.length > 0) {
    lines.push('FEATURED', '');
    for (const p of products) {
      lines.push(`- ${p.name} — ${formatPrice(p.price)}`, `  ${siteUrl}/products/${p.id}`);
    }
    lines.push('');
  }

  lines.push(
    `Shop new arrivals: ${siteUrl}/products`,
    '',
    '---',
    'You are receiving this because you subscribed to D-Store updates.',
  );

  if (unsubscribeUrl) lines.push(`Unsubscribe: ${unsubscribeUrl}`);

  return lines.join('\n');
}
