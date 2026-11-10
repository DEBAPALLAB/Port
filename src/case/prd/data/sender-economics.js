export default {
  slug: 'sender-economics',
  number: 6,
  name: 'Sender economics',
  accent: 'marketing',
  title: 'Spam is cheap to send',
  line: 'Senders keep the gain from every promotional message and users pay the cost, so I propose tuning price and enforcement.',
  problem: [
    'Indian users get more promotional WhatsApp messages than they want. The sender gains from each message. The user pays with attention, a cluttered inbox and the effort of blocking.',
    'Meta earns a fee for each delivered template and also sets the caps and the brakes. Meta says it invests in user controls. The point is about structure, not blame.',
    'Penalties are weak or opaque. Frequency caps are dynamic and undisclosed, and block, report and mute rates are not public. Growth in a paid channel and rising complaints can coexist.'
  ],
  users: [
    {
      who: 'Students',
      job: 'When I get an order or ticket update, I want it in WhatsApp, so I can act without opening five apps.',
      cost: 'A flooded inbox hides a real OTP or delivery message. Blocking is the only exit, and it also silences useful senders.'
    },
    {
      who: 'Elders',
      job: 'When a message arrives, I want to know quickly if it is genuine, so I can avoid a scam or a wrong tap.',
      cost: 'Promotional clutter lowers trust in the app and raises exposure to fraud that imitates brands.'
    },
    {
      who: 'Small honest sellers',
      job: 'When a past customer might reorder, I want to message them cheaply, so I can sell without paying for ads.',
      cost: 'A blunt cap or large price rise removes their only low-cost channel. They lack lawyers, account managers and appeal routes.'
    },
    {
      who: 'Large brands and BSPs',
      job: 'When I run a campaign, I want predictable reach and cost, so I can plan budgets.',
      cost: 'Undisclosed, changing caps make planning hard. Policy shocks hit BSP margins and client contracts.'
    }
  ],
  evidence: [
    {
      fact: 'In India, a marketing message costs ₹0.8631 and a utility message ₹0.115 before 18% GST. That is 7.5 times more, so mislabelling pays.',
      source: 'Whautomate BSP guide, Oct 2026 (vendor-reported; Meta rate card not read)',
      trust: 'Medium'
    },
    {
      fact: '96% of Indian respondents get unsolicited commercial messages daily, and 19% get eight or more, up from 11% in 2023. 59% block senders and spammers return.',
      source: 'Storyboard18, 4 Feb 2026 (survey method not examined)',
      trust: 'Medium'
    },
    {
      fact: 'Meta other revenue was $1.007 billion in Q2 2026, up 73%. It includes Meta Verified, so it overstates paid messaging.',
      source: 'Meta Q2 2026 results',
      trust: 'High'
    },
    {
      fact: 'One founder reported 20% cart recovery by WhatsApp against 8% by email, and 80% of messages viewed within five minutes.',
      source: 'Rest of World, 2022 (one founder)',
      trust: 'Medium'
    },
    {
      fact: 'Meta announced a monthly limit on messages to people who do not reply. The threshold is undisclosed.',
      source: 'TechCrunch, 17 Oct 2025',
      trust: 'High'
    },
    {
      fact: 'WhatsApp banned 72,14,702 Indian accounts in May 2026 and acted on 399 of 19,859 user grievances. The article does not split spam from other reasons.',
      source: 'MediaNama, 2026',
      trust: 'Medium'
    },
    {
      fact: 'Marketing frequency caps began in Feb 2024. Their values are dynamic and undisclosed.',
      source: 'Gupshup BSP blog',
      trust: 'Low'
    }
  ],
  options: [
    { label: 'A. Status quo plus caps', note: 'Keep hidden frequency caps, quality tiers and the unanswered-message limit.', weakness: 'Unmeasured. Senders cannot plan and users cannot see results.', picked: false, score: 26 },
    { label: 'B. Quality-adjusted pricing', note: 'Marketing price rises with a sender\'s not-interested and block rates, and falls for clean senders.', weakness: 'Noisy for small senders. Needs trusted signals.', picked: true, score: 25 },
    { label: 'C. Caps by user preference', note: 'A user\'s choice, such as "fewer promotions", sets that user\'s cap.', weakness: 'Opt-in is low for most users. Senders may shift to other channels.', picked: true, score: 26 },
    { label: 'D. Template-category audits', note: 'Compare declared category with content and behaviour. Reprice and restrict mislabelled templates.', weakness: 'False positives on genuine utility. Build cost.', picked: true, score: 25 },
    { label: 'E. User-priced attention', note: 'A receiver sets a rate or allow-list, and senders pay to pass.', weakness: 'Hard to build, hurts small sellers, raises consumer-protection questions.', picked: false, score: 20 },
    { label: 'F. Transparency and audit', note: 'Publish block, report and category statistics. Allow outside audit.', weakness: 'Does not change behaviour by itself.', picked: true, score: 27 },
    { label: 'G. DND-style registry', note: 'A national do-not-disturb list for WhatsApp marketing.', weakness: 'Needs a legal basis for OTT services. Heavy, and identity-based rather than signal-based.', picked: false, score: 16 }
  ],
  scoreMax: 35,
  recommendation: {
    headline: 'I recommend category audits, user-preference caps and a transparency regime first, then a tested quality-adjusted price.',
    why: 'The totals are close, so the gap is a reason to sequence, not to pick one. A flat price rise is the weakest option, and the 7.5x price gap is the strongest abuse incentive.',
    firstPhase: 'Months 0 to 3: measure internal baselines, sample categories for audit, and write the OTP and transactional exemption into policy.'
  },
  requirements: [
    { id: 'R1', text: 'Authentication and verified order-status utility messages are exempt from quality-based price changes, promotion-linked caps and throttles.', priority: 'P0', accept: 'Zero price or cap change for authentication in every experiment arm. Delivery time and success rate unchanged.' },
    { id: 'R2', text: 'Publish quarterly India statistics: delivered marketing messages, not-interested, block and report rates, and template category counts.', priority: 'P0', accept: 'First report within two quarters. Definitions published. An independent reviewer can reproduce the aggregates.' },
    { id: 'R3', text: 'Publish the rules for template categories and the penalty ladder, with examples for Indian use cases.', priority: 'P0', accept: 'Public page with at least 20 worked examples. Changes announced 30 days before they bite.' },
    { id: 'R4', text: 'Category audit: compare declared category with content and sender behaviour. Reclassify to marketing and bill at the marketing rate on a positive finding.', priority: 'P1', accept: 'Quarterly random audit sample. False-positive rate on OTP and order templates below 0.5%.' },
    { id: 'R5', text: 'Appeal route for any reclassification, with human review and a decision in 7 days.', priority: 'P1', accept: '90% of appeals decided in 7 days. Overturn rate published.' },
    { id: 'R6', text: 'In-chat preference: a user can pick "fewer promotions" or "no promotions" per business or globally, and the choice lowers that user\'s cap.', priority: 'P1', accept: 'Choice takes effect within one message. It does not block OTP or order messages.' },
    { id: 'R7', text: 'Sender dashboard showing own negative-signal rate, cap status and price multiplier, updated daily.', priority: 'P1', accept: 'Every sender sees its own rate and multiplier. BSPs get the same data by API.' },
    { id: 'R8', text: 'Quality-adjusted marketing price pilot, randomised by sender on a small share of India marketing traffic.', priority: 'P1', accept: 'Pre-registered metrics, thresholds and kill criteria.' },
    { id: 'R9', text: 'Volume floor: no multiplier above 1x until a sender has 1,000 delivered messages in the window.', priority: 'P1', accept: 'A sender under the floor always pays the base rate or less.' }
  ],
  flows: [
    {
      title: 'Category audit and appeal',
      steps: [
        'Check declared category against template text and recipient behaviour.',
        'Flag a utility template that draws marketing-like not-interested taps.',
        'Human review, with the benefit of doubt on mixed evidence.',
        'Warning, then reclassification to marketing with back-billing, then restriction.',
        'Sender appeals, and a human decides within 7 days.'
      ]
    },
    {
      title: 'User sets their own limit',
      steps: [
        'User picks "fewer promotions" or "no promotions" in chat.',
        'The choice lowers only that user\'s cap.',
        'The sender is not penalised for a user who asked for less.',
        'OTP and order messages still arrive.'
      ]
    },
    {
      title: 'Governance review',
      steps: [
        'A review group of Meta staff and outside members meets.',
        'Members include a consumer-protection academic, a small-business representative, a BSP and a digital-rights group.',
        'Meta owns the final decision.',
        'The group\'s advice and Meta\'s reasons for any departure are published.',
        'Aggregates are published. Sender-level data stay private.'
      ]
    }
  ],
  metrics: [
    { metric: 'Not-interested rate', definition: '"Not interested" or unsubscribe taps per 1,000 delivered marketing messages, 30-day rolling, by sender. Target: 20% relative fall in 12 months.', guardrail: 'Does not rise in untreated senders by more than 5%.' },
    { metric: 'Block rate', definition: 'Blocks plus spam reports per 1,000 delivered marketing messages. Target: 15% relative fall in the treated group.', guardrail: 'Block rate for utility messages stays flat.' },
    { metric: 'Miscategorisation share', definition: 'Marketing-intent messages sent under a utility template, found in audit samples, as a share of utility volume. Target: below 2%.', guardrail: 'No false positive on OTP or order templates above 0.5% of audited items.' },
    { metric: 'Small-business reach', definition: 'Delivered marketing messages per month from senders under 10,000 a month, against control. Target: within 5% of control.', guardrail: 'Kill if it falls by more than 10%.' },
    { metric: 'OTP delivery', definition: 'Median and 95th percentile delivery time and success rate of authentication messages. Target: unchanged.', guardrail: 'Zero throttling or price change for authentication.' },
    { metric: 'Meta paid-messaging revenue', definition: 'India marketing and utility message revenue. This is not a target.', guardrail: 'Report change against control. Escalate if the net decline passes a threshold agreed in advance, for example 5%.' }
  ],
  experiments: {
    arms: [
      'Treatment: quality-adjusted marketing price with a rebate for clean senders, randomised by sender, about 5% of India marketing traffic.',
      'Control: current pricing. Strata: sender size band, category of goods and BSP.',
      'Authentication, utility and senders under the 1,000-message floor are excluded.'
    ],
    guardrail: 'Proceed only if the block rate falls by at least 10% relative, small-seller reach stays within 5% of control, revenue stays within the agreed band, and the miscategorisation share does not rise. Run at least 8 weeks.',
    kill: [
      'Any authentication or order-update message is throttled, delayed or surcharged because of the rule.',
      'Small-seller delivered volume falls more than 10% relative to control.',
      'Miscategorisation share rises by more than 25% relative to baseline.',
      'Appeals overturn more than 20% of reclassifications.',
      'Net revenue falls beyond the agreed band with no matching fall in negative signals.',
      'A regulator or court order makes part of the design unlawful.'
    ]
  },
  rollout: [
    { phase: 'Phase 0 and 1: Measure, then publish (months 0 to 6)', what: 'Internal baselines, category audit sample, OTP exemption in policy, then the R2 report, R3 rules, R5 appeals and a read-only sender dashboard.' },
    { phase: 'Phase 2: Category integrity (months 6 to 9)', what: 'R4 audits with reclassification and back-billing, and the R9 floor. Exit: appeal overturn rate under 20%.' },
    { phase: 'Phase 3: User preference (months 6 to 12)', what: 'R6 "fewer promotions" choice in chat. Exit: no rise in OTP or order-message complaints.' },
    { phase: 'Phase 4 and 5: Price pilot, then decide (months 9 to 15)', what: 'R8 quality-adjusted price on a randomised slice. At month 15, scale, adjust or stop, and publish results and audit.' }
  ],
  risks: [
    { risk: 'Honest small sellers pay more or lose reach', mitigation: 'Volume floor, rebate for clean senders, appeal route, and a kill criterion on small-seller reach.' },
    { risk: 'False positives in category audits hit genuine order updates', mitigation: 'Human review, benefit of the doubt on mixed evidence, and a 0.5% false-positive guardrail.' },
    { risk: 'Gaming: cheap consent, baiting users into replies, or splitting into many accounts', mitigation: 'Use not-interested and block signals, not only replies. Link accounts at portfolio level.' },
    { risk: 'Spam moves to SMS, email or voice', mitigation: 'Track cross-channel signals in the pilot and coordinate with TRAI SMS rules.' },
    { risk: 'Revenue loss reduces Meta\'s willingness to adopt', mitigation: 'Revenue is a guardrail. Model 2 shows about -4% at constant volume under an assumed mix.' },
    { risk: 'Negative-signal data are biased by mistaken taps or brigading', mitigation: 'Weight by unique recipients, cap per-recipient effect, and audit for brigading.' }
  ],
  against: [
    { objection: 'It hurts small sellers.', answer: 'Partly true. A uniform multiplier does: the small seller drops out at 5x, before the big brand. So price is keyed to user signals, with a floor, a rebate and a kill criterion. If harm shows, the price rule is dropped.' },
    { objection: 'It pushes spam to other channels.', answer: 'Possible. Each channel\'s controls push senders to the next one. This PRD cannot close that loop. It measures the shift and treats a large one as a reason to ease the price signal.' },
    { objection: 'Meta loses revenue, so it will not do this.', answer: 'Plausible, and I do not assume bad faith. Unwanted promotion can erode the value of the channel Meta sells. The test measures that trade-off, and revenue stays a guardrail.' },
    { objection: 'Users can just block.', answer: 'Blocking is a high-friction exit. In the survey, 59% block and spammers return. It also removes useful senders. A lighter control fits the need to keep order updates.' }
  ],
  openQuestions: [
    'What are current block, report and mute rates by category and sender decile in India?',
    'What share of utility templates are marketing in intent, and how many have been warned or restricted?',
    'How noisy are not-interested signals at small volumes?',
    'What fraction of India paid-messaging revenue comes from senders in the top decile of negative signals?',
    'How do senders respond to price changes, such as the 1 Oct 2026 rate-card change?',
    'How do tier limits, frequency caps and the unanswered-message limit trade off in practice?'
  ],
  limits: [
    'India rates come from a BSP guide. I could not read Meta\'s downloadable rate card, so the rupee figures are vendor-reported.',
    'Every input in the price models is the author\'s assumption, including conversion rates, margins, thresholds and the revenue mix. Real distributions are unknown.',
    'Baselines for block, report and mute rates are not public, so all targets are proposals, not forecasts.',
    'The 96% spam survey was read as reported, and its sample was not examined.',
    'Miscategorisation penalties, frequency caps and SMS history are vendor-reported or summarised, not checked against primary documents.'
  ],
  sources: [
    { name: 'Meta pricing page', href: 'https://developers.facebook.com/docs/whatsapp/pricing', trust: 'High' },
    { name: 'Meta Q4 and full year 2025 results', href: 'https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Fourth-Quarter-and-Full-Year-2025-Results/default.aspx', trust: 'High' },
    { name: 'Meta Q2 2026 results', href: 'https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Second-Quarter-2026-Results/default.aspx', trust: 'High' },
    { name: 'Q4 2025 earnings call transcript, Investing.com', href: 'https://www.investing.com/news/transcripts/earnings-call-transcript-meta-platforms-beats-expectations-with-strong-q4-2025-93CH-4481034', trust: 'Medium' },
    { name: 'WhatsApp API pricing India, Whautomate (vendor guide)', href: 'https://whautomate.com/whatsapp-business-api-pricing-india', trust: 'Medium' },
    { name: 'MediaNama, May 2026 WhatsApp bans', href: 'https://www.medianama.com/2026/07/223-whatsapp-bans-72-lakh-indian-accounts-may/', trust: 'Medium' },
    { name: 'ThePrint, NCLAT order', href: 'https://theprint.in/economy/nclat-sets-aside-cci-ban-on-whatsapp-sharing-of-user-data-with-meta-upheld-rs-213-14cr-penalty/2777026/', trust: 'Medium' },
    { name: 'Inc42, minister on OTT and telecom bill', href: 'https://inc42.com/buzz/telecom-bill-2023-excludes-ott-confirms-ashwini-vaishnaw/', trust: 'Medium' },
    { name: 'India Briefing, DPDP Rules 2025', href: 'https://www.india-briefing.com/news/dpdp-rules-2025-india-data-protection-law-compliance-40769.html/', trust: 'Medium' },
    { name: 'Storyboard18, 4 Feb 2026', href: 'https://www.storyboard18.com/social-media/whatsapp-spam-hits-96-of-users-in-india-reveals-survey-amid-sc-heat-on-meta-88863.htm', trust: 'Medium' }
  ]
};
