import React from 'react';

// How far to trust each source, and what it was used for. "Snippet" means I saw it in a search result and did not read the page.
export const SOURCES = [
  { name: 'Meta developer pricing page', use: 'Per-message pricing since 1 July 2025, free service messages, the 1 October 2026 India rate card', trust: 'High', href: 'https://developers.facebook.com/docs/whatsapp/pricing' },
  { name: 'TechCrunch, Nov 2024 and Oct 2025', use: 'Controls on business messages, and the limit on unanswered messages', trust: 'High', href: 'https://techcrunch.com/2024/11/20/whatsapp-will-finally-let-you-unsubscribe-from-business-marketing-spam' },
  { name: 'ETV Bharat, Dec 2025', use: 'CERT-In advisory on the GhostPairing linking trick', trust: 'High', href: 'https://www.etvbharat.com/en/technology/indian-cyber-agency-flags-whatsapp-hijack-enn25122004542' },
  { name: 'Storyboard18, 4 Feb 2026', use: 'The LocalCircles survey of 42,000+ people', trust: 'Medium', note: 'Online, self-selected sample', href: 'https://www.storyboard18.com/social-media/whatsapp-spam-hits-96-of-users-in-india-reveals-survey-amid-sc-heat-on-meta-88863.htm' },
  { name: 'Rest of World, Oct 2022', use: 'The opening quote, user quotes, opt-in relaxed in July 2020, 550 million users', trust: 'Medium', note: 'Quote wording to be checked against the page', href: 'https://restofworld.org/2022/india-whatsapp-spam/' },
  { name: 'Android Headlines, 31 Jul 2026', use: 'The Offers and Updates folder test', trust: 'Medium', href: 'https://www.androidheadlines.com/2026/07/whatsapp-tests-new-folders-to-organize-messages-from-businesses.html' },
  { name: 'Business Today, 2015 and Apr 2025', use: 'About 70 million users, the operators\' complaint, and the April 2025 controls', trust: 'Medium', href: 'https://www.businesstoday.in/magazine/focus/story/telecom-operators-revenue-concern-on-whatsapp-internet-calls-144270-2015-01-17' },
  { name: 'Light Reading, Aug 2016', use: 'Voice above 80% of operator sales', trust: 'Medium', href: 'https://www.lightreading.com/mobile-core/the-voip-dilemma-of-india-s-telcos' },
  { name: 'Digit, May 2017', use: '160 to 200 million users and 50 million video minutes a day', trust: 'Medium', note: 'WhatsApp\'s own figure, now old', href: 'https://www.digit.in/news/apps/indians-make-50-million-minutes-of-video-calls-on-whatsapp-every-day-35032.html/amp/' },
  { name: 'Moneylife and Inc42, 2026', use: 'The Attorney General\'s count of banned accounts and the Centre\'s directions', trust: 'Medium', href: 'https://moneylife.in/article/whatsapp-banned-9400-accounts-used-for-digital-arrest-scams-in-2026-ag-tells-supreme-court/80326.html' },
  { name: 'Careers360, Nov 2024', use: 'The IIT Bombay student\'s "digital arrest" case', trust: 'Medium', href: 'https://news.careers360.com/iit-bombay-student-loses-rs-7-lakh-in-digital-arrest-scam' },
  { name: 'SCC Online, Jul 2026', use: 'Consent rules and dates under India\'s data protection law', trust: 'Medium', href: 'https://www.scconline.com/blog/post/2026/07/29/whatsapp-chatbot-opt-in-consent-dpdp-act-compliance/' },
  { name: 'Vendor rate guides, Jan 2026', use: 'India per-message rates for each category', trust: 'Low', note: 'Sellers of WhatsApp tools; may be superseded', href: 'https://www.authgear.com/post/whatsapp-api-pricing/' },
  { name: 'Mailjet, Wikipedia, MessageCentral', use: 'Gmail tabs in 2013 and the dates of India\'s SMS rules', trust: 'Low', note: 'Mostly search snippets', href: 'https://www.mailjet.com/blog/deliverability/gmail-promotions-tab/' },
];

export const TO_VERIFY = [
  'The Rest of World quote, word for word, and the names of the three users quoted.',
  'RBI\'s own text on which channel a one-time code may use.',
  'Meta\'s India rate card from 1 October 2026, which replaces the vendor figures above.',
  'Whether the Offers and Updates folder includes one-time codes. Meta\'s own statement, not press coverage.',
  'SIM binding: one report says it applied from 1 March 2026, Inc42 says within four to six months, a later report says the deadline may move.',
  'Any figure for Meta\'s paid-messaging revenue. I left it out because I could not confirm it.',
];

export function SourceTable() {
  return <div className="wi-sources" data-reveal>
    <ul>
      {SOURCES.map(item => <li key={item.name} data-trust={item.trust}>
        <a href={item.href} target="_blank" rel="noreferrer">{item.name}<span aria-hidden="true"> ↗</span></a>
        <span className="wi-src-use">{item.use}{item.note ? `. ${item.note}.` : ''}</span>
        <b className="wi-src-trust">{item.trust}</b>
      </li>)}
    </ul>
  </div>;
}
