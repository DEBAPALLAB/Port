export default {
  slug: 'consent-centre',
  number: 3,
  name: 'Consent centre',
  accent: 'people',
  title: `Why am I seeing this?`,
  line: `I propose one screen that shows which businesses claim permission to message you on WhatsApp, and lets you stop them.`,
  problem: [
    `In India, a business can message you on WhatsApp after you only typed a phone number at checkout. You cannot see why, or switch it off in one place.`,
    `The problem is a missing record, not only too many messages. No screen says which business holds a claimed opt-in, where it was collected, and what it covers. Blocking removes one number, not the cause.`,
    `The law is about to ask for this record. India's DPDP Rules put the burden of proving valid consent on the business. The core consent rules take effect on 13 May 2027.`,
  ],
  users: [
    {
      who: `Student or young adult`,
      job: `When I type my number to buy something or get a coupon, I want to know what I agreed to and cancel offers but keep delivery updates, so I can keep WhatsApp for friends, family and study groups.`,
      cost: `The main chat app fills with offers. The author (n=1) calls it a real problem because he rarely used SMS.`,
    },
    {
      who: `Older or less digital user`,
      job: `When a shop or bank messages me and I am unsure it is genuine, I want a clear way to see who has permission and to stop it without typing commands, so I can avoid scams and keep family chats readable.`,
      cost: `May not find a hidden setting. May mistake promotions or fake offers for notices.`,
    },
    {
      who: `Small business (kirana, boutique, tutor)`,
      job: `When I collect numbers on paper or by phone, I want a cheap, simple way to record consent and prove it, so I can message regulars without being banned or fined.`,
      cost: `Number flagged or banned if users report. Cannot afford a compliance team.`,
    },
    {
      who: `Compliance team and regulator`,
      job: `When a complaint or audit arrives, I want an auditable consent record with date, wording and channel, so I can show valid notice and consent, or investigate a claim.`,
      cost: `Cannot prove consent. The Data Protection Board has no evidence to test.`,
    },
  ],
  evidence: [
    {
      fact: `96% of 42,000+ surveyed users in 324 districts get unsolicited commercial messages daily. 19% get eight or more, up from 11% in 2023. The survey is online and self-selected.`,
      source: `Storyboard18, 4 Feb 2026`,
      trust: 'Medium',
    },
    {
      fact: `59% of surveyed users block senders, and spammers return from new numbers. Blocking does not solve the problem.`,
      source: `Storyboard18, 4 Feb 2026`,
      trust: 'Medium',
    },
    {
      fact: `WhatsApp relaxed its explicit opt-in requirement in July 2020. Users say they do not remember giving permission.`,
      source: `Rest of World, Oct 2022`,
      trust: 'Medium',
    },
    {
      fact: `Meta's rule says businesses must state the person is opting in, name the business, and follow applicable law. Opt-out should be honoured per category. There is no evidence on enforcement.`,
      source: `Meta opt-in documentation`,
      trust: 'High',
    },
    {
      fact: `WhatsApp tested category controls: interested or not interested, and stop or resume by category. India launch status is unknown.`,
      source: `TechCrunch, 20 Nov 2024`,
      trust: 'High',
    },
    {
      fact: `WhatsApp added broader controls: opt-in routes, block and report, message preferences, broadcast limits, template approval and quality monitoring. Rollout in India is unclear.`,
      source: `Business Today, 3 Apr 2025`,
      trust: 'Medium',
    },
    {
      fact: `DPDP Act s6(1) and s6(10) put the burden of proving consent on the business. Rules were notified 13 Nov 2025. Core rules apply from 13 May 2027.`,
      source: `SCC Online, 29 Jul 2026; DPDP Act s6`,
      trust: 'High',
    },
  ],
  options: [
    {
      label: `A. Status quo plus stricter policy`,
      note: `Keep today's opt-in rule and block and report tools, and enforce harder.`,
      weakness: `Cheap, but it leaves the person with no view of consent.`,
      picked: false,
      score: 19,
    },
    {
      label: `B. Per-message unsubscribe link`,
      note: `Each marketing message carries a stop action, as email does.`,
      weakness: `Handles one business at a time and gives no consent record.`,
      picked: false,
      score: 20,
    },
    {
      label: `C. Platform preference centre with provenance`,
      note: `One screen with per-business and per-category controls, consent source, receipts and a global marketing switch.`,
      weakness: `Does little against scammers who claim no consent. Build cost is high.`,
      picked: true,
      score: 22,
    },
    {
      label: `D. Third-party consent manager under DPDP`,
      note: `A registered Consent Manager holds the person's choices and relays them to businesses.`,
      weakness: `Good for portability, but it needs a new party and users to adopt it.`,
      picked: false,
      score: 19,
    },
    {
      label: `E. Regulator-mandated registry, like DND`,
      note: `A national preference list covering OTT messaging.`,
      weakness: `Strong and uniform, but TRAI's reach over WhatsApp is uncertain. It needs a rule change outside Meta's control.`,
      picked: false,
      score: 15,
    },
    {
      label: `F. User allow-list by default (opt-in only)`,
      note: `No business can message until the person approves it in the app.`,
      weakness: `Strongest control, but it can break order updates and small-business reach.`,
      picked: false,
      score: 21,
    },
  ],
  scoreMax: 30,
  recommendation: {
    headline: `I recommend a platform-level preference centre with consent provenance (option C), narrowly ahead of an opt-in-only default (option F).`,
    why: `C scores 22 against 21 for F, a gap too small to decide alone. C wins on business impact and reversibility. It keeps legitimate marketing, can be tightened later, and gives the records D and E would need.`,
    firstPhase: `Phase 0 measures block, report and stop rates and interviews 30 to 50 students. Phase 1 shows a read-only "Why am I seeing this?" record in a small pilot in Q1 2027.`,
  },
  requirements: [
    {
      id: 'R1',
      text: `Each business-initiated marketing or utility conversation stores a consent record: source type, business name, category, date, wording version.`,
      priority: 'P0',
      accept: `Template send is rejected if the record is missing, after a grace period. Record is visible to the user.`,
    },
    {
      id: 'R2',
      text: `A "Why am I seeing this?" action on every business message.`,
      priority: 'P0',
      accept: `Opens the record in at most 2 taps, with text in the user's app language.`,
    },
    {
      id: 'R3',
      text: `A Business preferences screen listing all businesses with a claimed opt-in.`,
      priority: 'P0',
      accept: `Lists every business that messaged in the last 12 months, sortable by recent.`,
    },
    {
      id: 'R4',
      text: `Per-business and per-category stop and resume.`,
      priority: 'P0',
      accept: `Stopping marketing blocks marketing templates within 60 seconds. Utility continues.`,
    },
    {
      id: 'R5',
      text: `One global marketing switch.`,
      priority: 'P0',
      accept: `One toggle stops all business marketing templates. OTPs and order updates are unaffected.`,
    },
    {
      id: 'R6',
      text: `Withdrawal as easy as giving consent, as DPDP s6(4) requires.`,
      priority: 'P0',
      accept: `Stop takes no more taps than the opt-in did. No login to a third-party site.`,
    },
    {
      id: 'R7',
      text: `A consent receipt the user can save or share.`,
      priority: 'P1',
      accept: `Shareable summary with business, source, date and wording. No message content.`,
    },
    {
      id: 'R8',
      text: `A way to dispute an opt-in claim.`,
      priority: 'P1',
      accept: `One-tap flag. The business must respond with evidence in 7 days (proposed). Upheld flags lower quality rating.`,
    },
    {
      id: 'R9',
      text: `A business consent upload API and dashboard.`,
      priority: 'P1',
      accept: `API accepts source, timestamp and wording version. Dashboard exports CSV.`,
    },
    {
      id: 'R10',
      text: `A list-import check, because imported lists are the main bypass.`,
      priority: 'P1',
      accept: `Imported contacts need a declared source. Unverified imports are rate-limited until the first reply.`,
    },
  ],
  flows: [
    {
      title: `First message from a business`,
      steps: [
        `A business sends its first template to a number.`,
        `WhatsApp checks the consent record. If missing, it holds the message and tells the sender why.`,
        `If present, the chat opens with a banner: "Rahul's Store says you agreed on its website on 12 Mar 2026."`,
        `The banner offers Keep, Stop marketing and Why.`,
        `The person's choice is saved against that business.`,
      ],
    },
    {
      title: `Why am I seeing this?`,
      steps: [
        `The person long-presses a business message and taps Why.`,
        `A sheet shows source, date, the wording the person saw, and category.`,
        `Buttons: Stop this category, Stop this business, Dispute this claim, Save receipt.`,
      ],
    },
    {
      title: `Revoke`,
      steps: [
        `The person opens Business preferences and picks a business.`,
        `They switch off Marketing and keep Orders.`,
        `The business receives an opt-out signal and must stop.`,
        `The person sees confirmation with the time.`,
      ],
    },
  ],
  metrics: [
    {
      metric: `Visible consent source`,
      definition: `Share of business chats with a recorded source, date and category shown to the user. Target: 90% of marketing chats within 12 months of full launch.`,
      guardrail: `Utility delivery rate must not fall by more than 2 points.`,
    },
    {
      metric: `Opt-out completion time`,
      definition: `Median seconds from opening a business chat to marketing stopped. Target: under 30 seconds, at most 3 taps.`,
      guardrail: `Error rate (wrong business muted) under 1%.`,
    },
    {
      metric: `Block and report rate`,
      definition: `Blocks and reports per 1,000 marketing messages delivered. Target: fall by 25% against the control arm.`,
      guardrail: `Do not meet the target by hiding block.`,
    },
    {
      metric: `Complaints`,
      definition: `Disputed opt-in flags per 10,000 business-initiated sessions, and share upheld.`,
      guardrail: `Flag abuse rate under 5% of flags.`,
    },
    {
      metric: `Business opt-in conversion`,
      definition: `Opt-in completion rate on compliant flows. Target: no more than 10% relative drop against current flows.`,
      guardrail: `Small-business adoption above 50% of active senders by month 12.`,
    },
    {
      metric: `DPDP readiness`,
      definition: `Share of active marketing senders whose consent record meets itemised notice and withdrawal fields. Target: 80% by 13 May 2027.`,
      guardrail: `No sender blocked solely for paperwork in the first 90 days.`,
    },
  ],
  experiments: {
    arms: [
      `Control: current controls. Primary measure is block and report rate per 1,000 marketing messages.`,
      `Show only: the Why action and record, no new controls. Primary measure is complaints per 10,000 sessions.`,
      `Show and control: full preference screen and global switch. Primary measures are block rate and opt-out time.`,
      `Strict: opt-in only by default (option F) for a small cohort that volunteers. Primary measure is a subjective inbox quality score.`,
    ],
    guardrail: `Sample size cannot be computed until Phase 0 gives a baseline block rate. Then use a standard two-proportion test.`,
    kill: [
      `Utility or authentication delivery falls by more than 2 points against control.`,
      `Business opt-in conversion falls by more than 10% relative with no drop in blocks or reports.`,
      `Wrong-business mutes exceed 1% of actions.`,
      `More than 5% of dispute flags are abusive.`,
      `A legal review concludes the record creates liability for WhatsApp that cannot be mitigated.`,
    ],
  },
  rollout: [
    {
      phase: `0. Measure (before launch)`,
      what: `Log block, report and stop rates for business chats. Interview 30 to 50 students. Gate: baselines for all "not public" metrics.`,
    },
    {
      phase: `1. Show (Q1 2027)`,
      what: `"Why am I seeing this?" and a read-only consent record, in a small pilot in selected Indian cities. Gate: 60% of pilot users who open it understand the source.`,
    },
    {
      phase: `2. Control (Q2 2027, before 13 May 2027)`,
      what: `Preference screen, per-category stop and global marketing switch. Template send requires a consent record. Gate: opt-out under 30 seconds at the median.`,
    },
    {
      phase: `3. Enforce (after 13 May 2027)`,
      what: `Disputes, list-import checks, quality-score impact and a Consent Manager interface. Gate: sender adoption above 50% of active marketing senders.`,
    },
  ],
  risks: [
    {
      risk: `Fake consent records: senders declare a source that never happened.`,
      mitigation: `Declared source and wording version, disputes, quality score, sampling audits, and penalties on upheld fake claims.`,
    },
    {
      risk: `Users ignore the screen, so nothing changes.`,
      mitigation: `Entry point from the message itself. A global switch prompt after the first dispute or block.`,
    },
    {
      risk: `Small businesses cannot comply and lose customers.`,
      mitigation: `Free consent tool in the Business app and a 90-day grace period.`,
    },
    {
      risk: `Utility messages are blocked by mistake.`,
      mitigation: `Separate categories, utility not affected by the global switch, and a wrong-mute guardrail.`,
    },
    {
      risk: `Legal liability for WhatsApp as a record-keeper.`,
      mitigation: `Legal review before Phase 2. The record is framed as sender-declared.`,
    },
    {
      risk: `Conflict with Meta's revenue from marketing messages.`,
      mitigation: `Be honest that fewer low-intent messages may cut revenue. PRD 6 explains the incentive problem.`,
    },
  ],
  against: [
    {
      objection: `Users do not read consent screens.`,
      answer: `True for the first notice. So the record sits on the message and lets the person act once. The measure is use of the stop and why actions, not screen views.`,
    },
    {
      objection: `The sender can lie, so the record is worthless.`,
      answer: `It is weaker than platform verification but stronger than nothing. It creates a claim that can be disputed and a trail for the Data Protection Board, and it makes fake claims costly.`,
    },
    {
      objection: `This hurts small Indian businesses that depend on WhatsApp.`,
      answer: `A real cost. The mitigation is cheap tooling, a grace period, and a design where compliant opt-ins convert as well as today. Kill criterion 2 enforces the 10% limit.`,
    },
    {
      objection: `Meta already tested category controls, so this adds nothing.`,
      answer: `Those controls handle stop and resume. They do not show where consent came from or let the person contest it. If they are already live in India with high use, extend them.`,
    },
  ],
  openQuestions: [
    `What fraction of business-initiated sessions today carry a stored opt-in source of any kind?`,
    `What are current block, report and stop rates on business chats in India?`,
    `Are the 2024 category controls live in India, and how many people use them?`,
    `Is WhatsApp a Data Fiduciary, a processor or both for consent records?`,
    `What counts as a "clear affirmative action" for a Click-to-WhatsApp ad tap or a phone number typed at checkout?`,
    `How would WhatsApp know an account belongs to someone under 18?`,
  ],
  limits: [
    `This is an independent student proposal. It is not legal advice, and anyone acting on it should consult a qualified Indian lawyer.`,
    `No public source gives the share of invalid business opt-ins. The 96% figure measures what users receive, not what businesses collected.`,
    `The survey behind the 96% figure is online and self-selected. The student account is one person (n=1).`,
    `Scores, targets and thresholds are my judgement and proposals, not data. Most baselines are not public.`,
    `The record is sender-declared. WhatsApp cannot verify that a customer ticked a box on a third-party website. The Kantar 91% figure is unopened company research, and the DPDP penalty amounts are reported only.`,
  ],
  sources: [
    { name: `Rest of World, Oct 2022`, href: 'https://restofworld.org/2022/india-whatsapp-spam/', trust: 'Medium' },
    { name: `Storyboard18, 4 Feb 2026`, href: 'https://www.storyboard18.com/social-media/whatsapp-spam-hits-96-of-users-in-india-reveals-survey-amid-sc-heat-on-meta-88863.htm', trust: 'Medium' },
    { name: `TechCrunch, 20 Nov 2024`, href: 'https://techcrunch.com/2024/11/20/whatsapp-will-finally-let-you-unsubscribe-from-business-marketing-spam', trust: 'High' },
    { name: `Business Today, 3 Apr 2025`, href: 'https://www.businesstoday.in/amp/technology/news/story/whatsapp-sharpens-focus-on-business-chats-with-new-controls-and-broadcast-tools-470514-2025-04-03', trust: 'Medium' },
    { name: `SCC Online, 29 Jul 2026`, href: 'https://www.scconline.com/blog/post/2026/07/29/whatsapp-chatbot-opt-in-consent-dpdp-act-compliance/', trust: 'High' },
    { name: `DPDP Act s6`, href: 'https://www.dpdpa.com/dpdpa2023/chapter-2/section6.html', trust: 'High' },
    { name: `DPDP Act s9`, href: 'https://www.dpdpa.com/dpdpa2023/chapter-2/section9.html', trust: 'High' },
    { name: `Meta opt-in documentation`, href: 'https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in', trust: 'High' },
    { name: `Light Reading, 17 Feb 2025`, href: 'https://www.lightreading.com/regulatory-politics/india-s-telcos-voice-concerns-over-new-spam-rules', trust: 'Medium' },
    { name: `Medianama, Nov 2025`, href: 'https://www.medianama.com/2025/11/223-cci-nclat-whatsapp-ad-data-sharing-users-india/', trust: 'Medium' },
  ],
}
