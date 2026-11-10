export default {
  slug: 'verification-inbox',
  number: 2,
  name: 'Verification inbox',
  accent: 'auth',
  title: 'One inbox for your codes',
  line: 'Login codes from verified businesses go to one short-lived, read-only inbox in WhatsApp, not into your chat list.',
  problem: [
    'Big vendors now send login codes through WhatsApp. The student author says it works well, but codes and other business messages crowd his main chat list. This is one person\'s report (n=1).',
    'A code is useless after a minute or two, so it cannot wait in a folder for a day. WhatsApp\'s tested Offers & Updates folder moves messages after up to 24 hours. I found nothing on how it treats codes.',
    'Scammers also exploit codes. A real code and a fake "I sent my code by mistake" request look alike in the same chat list as family.',
  ],
  users: [
    {
      who: 'Students and young adults',
      job: 'When I sign in to a food, exam, college or UPI app, I want the code right now, so I can finish in one visit.',
      cost: 'Abandoned logins, repeated resends, and a chat list buried under business threads.',
    },
    {
      who: 'Older or less confident users',
      job: 'When a code arrives, I want to know it is genuine and what it is for, so I do not hand it to a stranger.',
      cost: 'Highest scam exposure. A fake request for a code looks the same as a real code message.',
    },
    {
      who: 'Small apps and startups',
      job: 'When a user signs up, I want the code delivered cheaply and reliably, so I do not lose the signup.',
      cost: 'Lost conversions. They lack the volume to negotiate rates or a large support team.',
    },
    {
      who: 'Large enterprises and banks',
      job: 'When a customer pays or logs in, I want proof the code reached them and was used, so I stay compliant.',
      cost: 'Failed payments, regulatory scrutiny and support load.',
    },
  ],
  evidence: [
    {
      fact: 'Meta delivers authentication codes only to the primary device and masks them on linked devices. This is on by default and Cloud API only.',
      source: 'Meta docs; the 7 Oct 2024 go-live date comes from Qiscus (Medium)',
      trust: 'High',
    },
    {
      fact: 'Authentication is already its own message category, with a code lifetime of 1 to 90 minutes and copy-code, one-tap or zero-tap buttons.',
      source: 'Meta docs',
      trust: 'High',
    },
    {
      fact: 'India\'s telecom regulator made every commercial SMS traceable from 11 December 2024. I found no evidence that this pushed senders to WhatsApp.',
      source: 'Storyboard18 and Inc42, Dec 2024',
      trust: 'High',
    },
    {
      fact: 'CERT-In flagged the GhostPairing account-hijack technique on 19 to 20 December 2025. Attackers trick users into sharing a code or scanning a QR to link their device.',
      source: 'ETV Bharat, Dec 2025',
      trust: 'High',
    },
    {
      fact: 'The RBI directions require two distinct factors, one dynamic. A law-firm summary finds no prescribed channel and no mention of WhatsApp. I did not read the RBI text itself.',
      source: 'Khaitan & Co, 2026',
      trust: 'Medium',
    },
    {
      fact: 'WhatsApp is testing an Offers & Updates folder for large businesses with a delay of up to 24 hours. Nothing is known about codes.',
      source: 'Android Headlines, 31 Jul 2026',
      trust: 'Medium',
    },
    {
      fact: 'OTPs clutter personal chats, but reliability is good. This is one student\'s report, not a sample.',
      source: 'Student\'s answers in the Deep dive tab, 2026',
      trust: 'Low',
    },
  ],
  options: [
    {
      label: 'A. Pooled verification inbox',
      note: 'One read-only, short-lived place for all verified-sender authentication messages.',
      weakness: 'Vulnerable if apps keep using other channels. Build cost is high.',
      picked: false,
      score: 20,
    },
    {
      label: 'B. Per-business threads with auto-collapse and TTL',
      note: 'Keep each sender\'s thread but fold it away and delete old codes automatically.',
      weakness: 'Weaker abuse resistance than a pooled place.',
      picked: false,
      score: 21,
    },
    {
      label: 'C. OS-level autofill, no inbox',
      note: 'Rely on Android one-tap and zero-tap and iOS AutoFill to fill codes without a visible place.',
      weakness: 'Leaves apps without autofill, such as iPhone or manual entry, untouched.',
      picked: false,
      score: 22,
    },
    {
      label: 'D. Passkeys or another phishing-resistant replacement',
      note: 'Remove the code step for apps that adopt it.',
      weakness: 'Depends on every app and issuer, which neither WhatsApp nor a student controls.',
      picked: false,
      score: 20,
    },
    {
      label: 'E. SMS as the only channel',
      note: 'Do nothing on WhatsApp. Senders use SMS under the TRAI traceability regime.',
      weakness: 'Leaves the clutter and the code-sharing scam untouched.',
      picked: false,
      score: 23,
    },
    {
      label: 'F. Hybrid',
      note: 'Inbox (A), plus autofill (C) where the app supports it, plus SMS fallback, plus a path to passkeys (D).',
      weakness: 'Build cost is still high, and it rests on a user need shown by one student\'s report.',
      picked: true,
      score: 23,
    },
  ],
  scoreMax: 30,
  recommendation: {
    headline: 'I recommend the hybrid: a pooled verification inbox backed by SMS fallback and OS autofill, built in the order C, A, D.',
    why: 'The totals are close, so the table is a tool for argument, not an answer. F keeps the inbox benefits while borrowing autofill\'s low friction and SMS reliability.',
    firstPhase: 'Phase 0 measures time-to-code-use, resend rate and notification reads for authentication messages in existing chats, so every metric has a baseline.',
  },
  requirements: [
    {
      id: 'R1',
      text: 'Route messages declared as authentication category from verified senders to the Verification inbox.',
      priority: 'P0',
      accept: '100% of test authentication messages land in the inbox; none in personal chats.',
    },
    {
      id: 'R2',
      text: 'Deliver with no added delay compared with a normal chat message.',
      priority: 'P0',
      accept: '95th percentile arrival time is no worse than the control arm.',
    },
    {
      id: 'R3',
      text: 'Show each code as a card: verified sender name, purpose, time left, copy button.',
      priority: 'P0',
      accept: 'All four fields show, and 5 of 5 test users find the code in under 5 seconds.',
    },
    {
      id: 'R4',
      text: 'Expire the code at the sender\'s declared lifetime (1 to 90 minutes) and delete the card after expiry.',
      priority: 'P0',
      accept: 'Card greyed at expiry and removed within a set grace time, with no copy possible after expiry.',
    },
    {
      id: 'R5',
      text: 'No reply, forward, share or screenshot prompt from a card.',
      priority: 'P0',
      accept: 'Reply and forward controls are absent; share sheet blocked for code text.',
    },
    {
      id: 'R6',
      text: 'A chat the user started, or any non-verified sender, can never appear in the inbox.',
      priority: 'P0',
      accept: 'Red-team test: 0 successful impersonations in the inbox.',
    },
    {
      id: 'R7',
      text: 'Hide code content in lock-screen notifications and show "Verification code received".',
      priority: 'P0',
      accept: 'Locked-device test shows no digits.',
    },
    {
      id: 'R8',
      text: 'Show codes only on the primary device, keeping the existing linked-device mask.',
      priority: 'P0',
      accept: 'Linked devices show the mask text and no digits.',
    },
    {
      id: 'R9',
      text: 'Keep one-tap and zero-tap autofill working for apps that use them.',
      priority: 'P1',
      accept: 'Existing autofill flows pass regression tests.',
    },
    {
      id: 'R10',
      text: 'Fall back to SMS when the user is offline or the message is undelivered.',
      priority: 'P1',
      accept: 'Sender can configure fallback; fallback fires within the sender\'s timeout.',
    },
  ],
  flows: [
    {
      title: 'Code requested and arrives',
      steps: [
        'The user taps "Log in" in a sender\'s app, which asks for a code.',
        'A notification says "Verification code received" with no digits on the lock screen.',
        'The user opens WhatsApp. The inbox shows a new card with sender, purpose and time left.',
        'The user taps copy, or the app autofills it.',
      ],
    },
    {
      title: 'Code expires',
      steps: [
        'The timer on the card runs down to the sender\'s declared lifetime.',
        'At expiry the digits are hidden and the card shows "Expired".',
        'The card is deleted after a short grace time.',
        'The user can request a new code from the app.',
      ],
    },
    {
      title: 'The user suspects a scam',
      steps: [
        'A stranger or a contact asks for the code, or an unrequested card arrives.',
        'The user opens the card and taps "This was not me".',
        'The card is hidden and the sender is told.',
        'The user sees advice to never share the code and to check linked devices.',
        'If the request came from a chat, the user can block and report it.',
      ],
    },
  ],
  metrics: [
    {
      metric: 'Time from request to code use',
      definition: 'Seconds from the app requesting a code to the user submitting it. Target: median no worse than today, then 10% faster.',
      guardrail: '95th percentile must not rise.',
    },
    {
      metric: 'OTP failure and resend rate',
      definition: 'Share of requests with no successful verification, and share with a second request inside 5 minutes. Target: 15% fewer resends.',
      guardrail: 'Failure rate not above control.',
    },
    {
      metric: 'Support contacts',
      definition: 'Sender tickets tagged "code not received" per 1,000 requests. Target: down in the pilot arm.',
      guardrail: 'No rise in other login tickets.',
    },
    {
      metric: 'Fraud reports',
      definition: 'Reports of code-sharing or account takeover, per million active users. Target: no increase, then down 10% after two quarters.',
      guardrail: 'Any rise pauses rollout.',
    },
    {
      metric: 'Sender adoption',
      definition: 'Verified senders sending authentication messages through the inbox, as a share of pilot senders. Target: 70% at the end of phase 2.',
      guardrail: 'Senders must not move traffic to SMS because of the inbox.',
    },
    {
      metric: 'Inbox read share',
      definition: 'Share of codes first seen in the inbox versus in a normal chat or notification. Target: over 80% in the pilot arm.',
      guardrail: 'Notification-only reads must not drop below the control arm\'s read rate.',
    },
  ],
  experiments: {
    arms: [
      'Control: codes arrive in the normal chat thread (baseline).',
      'Arm A: Verification inbox, notification shows no digits (core proposal).',
      'Arm B: per-business thread, auto-collapsed with TTL (tests whether a pooled place is needed).',
      'Arm C: Arm A plus the first-use warning card (tests whether the warning changes scam reports).',
    ],
    guardrail: 'Users are split by user, not by sender. Median and 95th percentile time to code use must be no worse than control, and fraud reports not higher.',
    kill: [
      'The 95th percentile arrival time is slower than control by a margin agreed in advance.',
      'Failed verifications rise in Arm A relative to control.',
      'A confirmed spoofing path lets a non-verified message appear as a card.',
      'Senders move volume to SMS or other channels because of the inbox.',
      'Code-sharing or account-takeover reports rise in Arm A relative to control.',
      'A bank or the RBI states that inbox delivery is non-compliant for payment authentication.',
    ],
  },
  rollout: [
    {
      phase: 'Phase 0: Measure',
      what: 'Instrument time-to-code-use, resend rate and notification reads in existing chats. Exit when baselines are recorded for every metric.',
    },
    {
      phase: 'Phase 1: Internal and design test',
      what: 'Employee and volunteer devices, with a red-team of spoofing and lock-screen leaks. Exit on zero impersonations and no digits on locked screens.',
    },
    {
      phase: 'Phase 2: Pilot with a few large senders',
      what: '2 to 5 senders already sending WhatsApp authentication messages, Android first, opt-in users in one region. Exit when guardrails hold for 4 weeks.',
    },
    {
      phase: 'Phase 3: Widen',
      what: 'More senders, then iOS, then all verified senders by default. Exit when adoption and fraud metrics stay stable over two quarters.',
    },
  ],
  risks: [
    {
      risk: 'Routing adds delay to codes.',
      mitigation: 'Treat authentication as priority traffic, apply kill criterion 1, and fall back to threads.',
    },
    {
      risk: 'Senders mislabel marketing as authentication to reach the inbox.',
      mitigation: 'Category enforcement, penalties, and automated checks on message content.',
    },
    {
      risk: 'A spoofed message appears as a card.',
      mitigation: 'Server-side verification only, and a red-team test in phase 1.',
    },
    {
      risk: 'Users trust the inbox and read codes aloud to scammers.',
      mitigation: 'No reply and no share, the first-use warning (R12), and tracking scam reports in Arm C.',
    },
    {
      risk: 'Senders do not adopt because their SMS pipeline works.',
      mitigation: 'Pilot with senders already on WhatsApp, with no integration cost.',
    },
    {
      risk: 'A compromised phone reads the inbox.',
      mitigation: 'This cannot be fully fixed. Point apps toward passkeys.',
    },
  ],
  against: [
    {
      objection: 'Autofill already solves the problem.',
      answer: 'If one-tap and zero-tap cover most apps, users never see an inbox. The inbox helps mostly where autofill is absent, such as iPhone or manual entry.',
    },
    {
      objection: 'The clutter complaint rests on one person.',
      answer: 'True. The author says reliability is fine, and one heavy user is not proof of a general problem. This needs testing.',
    },
    {
      objection: 'One place with every code is a bigger target.',
      answer: 'Codes are spread across senders today, so one leak costs less. The same concentration argument applies to Google\'s OTP category. The inbox cannot fix a compromised phone.',
    },
    {
      objection: 'Passkeys will make it obsolete.',
      answer: 'The inbox is a bridge, and I do not know how long the bridge is. It is built to shrink as apps adopt passkeys.',
    },
  ],
  openQuestions: [
    'How many Indian users receive authentication messages in a week, and how many per user?',
    'What is the real delivery latency for authentication messages versus SMS?',
    'Does the Offers & Updates folder include or exempt authentication messages?',
    'How does zero-tap interact with primary-device-only visibility?',
    'Would any Indian issuer accept a WhatsApp-delivered code as its dynamic factor in writing?',
    'Does the 1 October 2026 India rate card change the price comparison with SMS?',
  ],
  limits: [
    'The clutter problem rests on one student\'s report (n=1). The data on the size of the problem is thin and mostly vendor-sourced.',
    'I did not read the RBI directions themselves, only a law-firm summary.',
    'Vendor prices (about Rs 0.115 per authentication message against Rs 0.10 to 0.20 for SMS) may be out of date after the 1 October 2026 rate card.',
    'The Google Messages OTP precedent comes from a search snippet only. Claims about Android 16 lock-screen hiding and accessibility-service malware come from pages I did not open.',
    'Option scores are my judgement, and the totals are close. Targets and thresholds are proposals because no baselines are public.',
  ],
  sources: [
    {
      name: 'Meta: authentication templates',
      href: 'https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/authentication-templates/authentication-templates/',
      trust: 'High',
    },
    {
      name: 'Meta: WhatsApp pricing',
      href: 'https://developers.facebook.com/docs/whatsapp/pricing',
      trust: 'High',
    },
    {
      name: 'Khaitan & Co: RBI authentication directions',
      href: 'https://khaitanco.com/thought-leadership/RBI-Authentication-Mechanisms-for-Digital-Payments-Transactions-Directions',
      trust: 'Medium',
    },
    {
      name: 'Qiscus: codes visible only on primary device',
      href: 'https://support.qiscus.com/hc/en-us/articles/38654951967001-WhatsApp-Authentication-Codes-Now-Visible-Only-on-Your-Primary-Device',
      trust: 'Medium',
    },
    {
      name: 'ETV Bharat: CERT-In GhostPairing advisory',
      href: 'https://www.etvbharat.com/en/technology/indian-cyber-agency-flags-whatsapp-hijack-enn25122004542',
      trust: 'High',
    },
    {
      name: 'Inc42: TRAI and OTPs',
      href: 'https://inc42.com/buzz/trai-assures-no-delay-in-otp-delivery-after-december-1',
      trust: 'High',
    },
    {
      name: 'Storyboard18: SMS traceability',
      href: 'https://www.storyboard18.com/digital/trai-implements-traceability-framework-for-commercial-sms-aims-to-combat-spam-enhance-consumer-trust-51109.htm',
      trust: 'High',
    },
    {
      name: 'Android Headlines: Offers & Updates folder',
      href: 'https://www.androidheadlines.com/2026/07/whatsapp-tests-new-folders-to-organize-messages-from-businesses.html',
      trust: 'Medium',
    },
    {
      name: 'Rest of World: passive consent and spam in India',
      href: 'https://restofworld.org/2022/india-whatsapp-spam/',
      trust: 'Medium',
    },
  ],
}
