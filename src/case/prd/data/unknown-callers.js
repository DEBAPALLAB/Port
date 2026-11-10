export default {
  slug: 'unknown-callers',
  number: 4,
  name: 'Unknown callers',
  accent: 'utility',
  title: 'A stranger can ring anyone',
  line: 'Anyone with your number can ring you, and "digital arrest" scams start there. I propose a context card on every first call.',
  problem: [
    'Any WhatsApp number can ring any other user. The "Silence Unknown Callers" setting, announced on 20 June 2023, is opt-in. Most people never open it, so the default protects almost no one who needs it.',
    'A "digital arrest" scam usually runs in four steps: a call about a parcel, SIM or TRAI problem, a handover to a "police" or "CBI" officer, a WhatsApp video call, then UPI transfers. The IIT Bombay case followed this path.',
    'The state is acting. The Supreme Court opened a case in October 2025. On 21 March 2026 the Centre directed WhatsApp to add caller information and detect prolonged scam calls.'
  ],
  users: [
    {
      who: 'Students and young adults',
      job: 'When a stranger calls, I want to know if they are from my college or group, so I can answer without risk.',
      cost: 'Savings, exam-fee money and loans. The IIT Bombay student lost Rs 7.29 lakh.'
    },
    {
      who: 'Parents and elders',
      job: 'When someone says police, I want a clear signal that this is not how police work, so I can hang up without shame.',
      cost: 'Retirement savings. The court case that began this process involved Rs 1.5 crore.'
    },
    {
      who: 'Small business owners',
      job: 'When a new customer rings, I want to take the call, so I do not lose a sale.',
      cost: 'Lost orders from over-blocking, or lost working capital to fake officials.'
    },
    {
      who: 'Couriers, doctors, landlords and freelancers',
      job: 'When I call a new contact, I want them to see who I am, so they pick up.',
      cost: 'A missed delivery, a missed patient or a lost client.'
    }
  ],
  evidence: [
    {
      fact: 'Silence Unknown Callers is opt-in, and silenced calls stay in the call list.',
      source: 'MediaNama, 20 Jun 2023',
      trust: 'High'
    },
    {
      fact: 'About 9,400 WhatsApp accounts were banned over 12 weeks from January 2026. Most ran from scam centres in Southeast Asia, using fake police and CBI names.',
      source: 'Moneylife, Attorney General submission, 2026',
      trust: 'High'
    },
    {
      fact: 'On 21 March 2026 the Centre directed WhatsApp to block device IDs, keep data 180 days, add caller information and adopt SIM binding in 4 to 6 months.',
      source: 'Inc42, 21 Mar 2026',
      trust: 'High'
    },
    {
      fact: 'I4C said police, CBI, customs, ED and judges do not arrest anyone on a video call.',
      source: 'ETV Bharat, 6 Oct 2024',
      trust: 'High'
    },
    {
      fact: 'The Supreme Court took suo motu notice after a couple lost Rs 1.5 crore. Another source says Rs 1.05 crore, so loss figures disagree.',
      source: 'Moneylife, 17 Oct 2025',
      trust: 'High'
    },
    {
      fact: 'TRAI sent CNAP recommendations to DoT on 28 Oct 2025: names from operator KYC data, on by default. Rollout status in October 2026 is unknown.',
      source: 'SCC Online, 1 Nov 2025',
      trust: 'High'
    },
    {
      fact: 'WhatsApp launched warnings for screen sharing with an unknown contact. The India rollout date is not stated.',
      source: '9to5Mac, 21 Oct 2025',
      trust: 'High'
    }
  ],
  options: [
    {
      label: 'A. Keep opt-in Silence Unknown Callers',
      note: 'Status quo since June 2023.',
      weakness: 'Off for the people who never find it.',
      picked: false,
      score: 18
    },
    {
      label: 'B. Default-silence all unknown callers, with a context card in the call list',
      note: 'Calls from non-contacts do not ring. I recommend a softened version: card first, silence only high risk.',
      weakness: 'Silences couriers, doctors and group-met friends too.',
      picked: true,
      score: 21
    },
    {
      label: 'C. Friction on first video call from an unknown account',
      note: 'Confirm screen, delay and warning before video connects.',
      weakness: 'Aimed at one step only.',
      picked: true,
      score: 23
    },
    {
      label: 'D. Verified-entity programme for officials and businesses',
      note: 'Badge plus verified caller name for police, banks and couriers.',
      weakness: 'Meta would have to run a verification process for Indian agencies. Phase two.',
      picked: true,
      score: 21
    },
    {
      label: 'E. In-call scam warnings and screen-share blocking',
      note: 'Banner mid-call. Block or confirm screen-share from strangers.',
      weakness: 'Acts late in the scam chain.',
      picked: true,
      score: 22
    },
    {
      label: 'F. Telecom-linked caller name (CNAP) or SIM binding',
      note: 'Operator KYC names. Account tied to an active SIM.',
      weakness: 'Depends on telecom operators, so WhatsApp cannot ship it alone. Use where it exists.',
      picked: false,
      score: 18
    },
    {
      label: 'G. Client-side on-device detection',
      note: 'A local model flags scam patterns.',
      weakness: 'Scammers adapt, and there is no accuracy data for Indian languages. A later experiment.',
      picked: false,
      score: 18
    }
  ],
  scoreMax: 30,
  recommendation: {
    headline: 'Show a context card on every first call from a non-contact, add friction on first video calls and screen-share, and silence only high-risk callers.',
    why: 'It is cheap and reversible, and it targets the video call and screen-share steps where the IIT Bombay chain turned. Labels come before blocks, so legitimate strangers stay reachable.',
    firstPhase: 'Phase 0 measures first-call volume, answer rate and report rate for 4 weeks with no visible change. Phase 1 pilots the card for a small share of Android users in 3 states.'
  },
  requirements: [
    {
      id: 'R1',
      text: 'Context card on first call from a non-contact showing name, photo, account age, country and mutual groups.',
      priority: 'P0',
      accept: 'Card renders before the answer button works. Shown on 100% of first non-contact calls in the test arm. Loads under 1 second on a low-end Android phone.'
    },
    {
      id: 'R2',
      text: 'Mutual-group label, "In your group: [group name]", and a normal ring.',
      priority: 'P0',
      accept: 'A caller sharing a group shows the group name and is never auto-silenced by risk score alone.'
    },
    {
      id: 'R3',
      text: 'Risk score from server signals: account age, report count, country versus claimed identity, and name match to an impersonation list.',
      priority: 'P0',
      accept: 'Score computed per call from metadata only. No call audio or video used. Logged for audit.'
    },
    {
      id: 'R4',
      text: 'Auto-silence above a high-risk threshold, with the call visible in the list and a reason.',
      priority: 'P0',
      accept: 'Silenced calls show a plain-language reason and a "call back" option.'
    },
    {
      id: 'R5',
      text: 'Impersonation warning when a name or logo matches police, CBI, TRAI, bank or courier terms and the account is unverified.',
      priority: 'P0',
      accept: 'Warning shown in the user\'s chosen language. Listed names and logos trigger it in test.'
    },
    {
      id: 'R6',
      text: 'Friction on first video call from an unknown account: one extra confirmation screen with a warning, camera off by default.',
      priority: 'P0',
      accept: 'Shown on all first video calls from non-contacts. Contacts and mutual-group members skip it.'
    },
    {
      id: 'R7',
      text: 'Screen-share from a stranger needs a second explicit confirmation. Sharing is blocked for high-risk accounts.',
      priority: 'P0',
      accept: 'Block applies when risk score is high. Confirmation is required otherwise.'
    },
    {
      id: 'R8',
      text: 'Report in two taps from the card and in-call, with reason options in Indian languages.',
      priority: 'P0',
      accept: 'Report done in 2 taps. Reason list in at least 10 Indian languages at pilot (assumption).'
    },
    {
      id: 'R9',
      text: 'Mid-call banner if a first-time stranger call runs long with a high risk score.',
      priority: 'P1',
      accept: 'Banner uses metadata only (duration, risk score). Threshold set from pilot data.'
    },
    {
      id: 'R10',
      text: 'Verified status for government agencies and listed businesses on the card.',
      priority: 'P1',
      accept: 'Verified badge shown. Process documented. Revocation within 24 hours of misuse (proposed).'
    }
  ],
  flows: [
    {
      title: 'An unknown call arrives',
      steps: [
        'A number not in contacts rings the user.',
        'The phone shows the context card: name, photo, account age, country, mutual groups, risk label.',
        'The user picks Answer, Decline or Report.',
        'If risk is high, the card turns amber and the call is silenced into the list.'
      ]
    },
    {
      title: 'The caller claims to be police',
      steps: [
        'The display name or logo matches a government term and the account is unverified.',
        'The card shows a red notice in the user\'s language.',
        'The notice says the account is not verified as an official government account.',
        'If answered, an in-call strip says police do not arrest people on video calls.'
      ]
    },
    {
      title: 'The call becomes a video call',
      steps: [
        'The stranger requests video.',
        'The user sees a confirmation screen with a warning.',
        'The camera stays off until the user accepts.',
        'Declining returns to audio, and the event feeds the risk score.'
      ]
    }
  ],
  metrics: [
    {
      metric: 'Scam call completion proxy',
      definition: 'Share of calls from accounts later banned for impersonation that were answered for more than 60 seconds. Target: at least 30% relative reduction vs control.',
      guardrail: 'Must not rise on any language cohort.'
    },
    {
      metric: 'Answer rate of unknown calls',
      definition: 'Answered first calls from non-contacts divided by ringing first calls from non-contacts. Target: drop of no more than 10% relative for mutual-group or verified calls.',
      guardrail: 'A drop for flagged-risk calls is intended, not penalised.'
    },
    {
      metric: 'False-silence of legitimate calls',
      definition: 'Verified, mutual-group or known-good calls that were demoted, hidden or missed because of the feature. Target: under 1%.',
      guardrail: 'Hard stop above 3%.'
    },
    {
      metric: 'Time to account ban after report',
      definition: 'Median hours from first report to enforcement on an impersonation account. Target: under 24 hours (proposed, a stretch goal).',
      guardrail: 'Wrongful-ban appeals resolved within 7 days.'
    },
    {
      metric: 'Warning-heed rate',
      definition: 'Share of warned users who end the call, decline screen share or do not continue within 2 minutes. Target: at least 40% (assumption).',
      guardrail: 'Dismiss-without-reading under 50%.'
    },
    {
      metric: 'Elderly adoption',
      definition: 'Share of users aged 60+ who see the card and choose an action rather than dismissing. Target: at least 60%.',
      guardrail: 'No increase in app uninstalls among 60+.'
    }
  ],
  experiments: {
    arms: [
      'Control: today\'s behaviour (opt-in silencing).',
      'Card-only: context card and impersonation warnings, no auto-silence.',
      'Default-silence: auto-silence above the risk threshold, plus card.',
      'Default-silence plus friction: silence, card, video friction and screen-share block.'
    ],
    guardrail: 'Assign users, not calls, and stratify by age band, language and device class. Run a 1 to 2% holdback for at least 8 weeks to see drift.',
    kill: [
      'False-silence of legitimate calls exceeds 3% for two consecutive weeks.',
      'Uninstalls among users aged 60+ rise by a statistically significant margin versus control.',
      'Warning-heed stays under 20% after two redesign rounds.',
      'Report abuse (mass false reports) exceeds 5% of reports.',
      'The scam completion proxy does not fall in the card-plus-friction arm after 8 weeks.'
    ]
  },
  rollout: [
    {
      phase: 'Phase 0: Measure (4 weeks)',
      what: 'Log first-call volume, answer rate, report rate and mutual-group share. No user-visible change.'
    },
    {
      phase: 'Phase 1: Card-only pilot (6 weeks)',
      what: 'Card, group label, impersonation warning and reporting for a small share of Android users in 3 states. Gate: false-silence under 1%, no uninstall rise, heed at or above 40%.'
    },
    {
      phase: 'Phase 2: Friction pilot (6 weeks)',
      what: 'Add risk silencing, video friction and screen-share confirmation. Gate: scam proxy down at least 30%, false-silence under 3%.'
    },
    {
      phase: 'Phase 3: India rollout (8 to 12 weeks)',
      what: 'All users, staged by language, with R9 to R11. Same gates across every language and age band. Phase 4 later adds verified entities, CNAP and trusted-contact alerts.'
    }
  ],
  risks: [
    {
      risk: 'Legitimate unknown calls are missed (courier, doctor, landlord, freelancer).',
      mitigation: 'Label first, silence only high risk, give businesses verified status, keep the call in the list with call-back.'
    },
    {
      risk: 'Scammers adapt: aged accounts, Indian SIMs, stolen verified accounts, or a move to messages.',
      mitigation: 'Rotate signals, use a holdback arm to detect drift, and share patterns with I4C.'
    },
    {
      risk: 'Warning fatigue: users tap through.',
      mitigation: 'Show the card only on first contact and high risk, test frequency, and apply kill criterion 3.'
    },
    {
      risk: 'The group signal is gamed by joining large public groups.',
      mitigation: 'Cap its weight and ignore groups above a member count (threshold to be set).'
    },
    {
      risk: 'Privacy exposure from showing mutual groups.',
      mitigation: 'Show only visible groups, and run a legal review.'
    },
    {
      risk: 'Pressure to add traceability or content access.',
      mitigation: 'State the metadata-only line publicly.'
    }
  ],
  against: [
    {
      objection: 'Missed legitimate calls will cost more than the scams.',
      answer: 'A missed call costs minutes, and one scam can cost lakhs. But that holds only if missed calls are few. So the design labels before it silences, with a hard stop at 3% false-silence. I do not claim the trade is free.'
    },
    {
      objection: 'Scammers will adapt, so this only moves the problem.',
      answer: 'Partly true. Warning and friction raise the cost per victim contacted, but the result may be small. A holdback arm will test it, and kill criterion 5 applies if the proxy does not fall.'
    },
    {
      objection: 'Over-warning will train users to ignore warnings.',
      answer: 'Likely at high volume. So the card shows on first contact only, in one sentence, and amber and red are saved for real risk. If heed stays under 20%, the card is noise and should be cut.'
    },
    {
      objection: 'WhatsApp already does this.',
      answer: 'Some of it: first-message warnings, account age in some chats and a screen-share warning. It is not public whether a call-level card exists in India or how often anyone heeds it. I propose to measure and consolidate.'
    }
  ],
  openQuestions: [
    'What share of scam calls reaching Indian victims comes over WhatsApp, versus the phone network or other apps?',
    'What is the answer rate and legitimate share of calls from non-contacts, by age band and language?',
    'How many Indian users have Silence Unknown Callers on, and who are they?',
    'What are the false-positive and false-negative rates of current impersonation detection?',
    'Do current first-message and screen-share warnings change behaviour, and for whom?',
    'Is SIM binding live, and what does it change for incoming call risk?'
  ],
  limits: [
    'No baseline is public for answer rates, Silence Unknown Callers use, or how many scam calls arrive on WhatsApp. All targets are my proposals.',
    'The option scores are my judgement, not measurements.',
    'I could not verify that most harmful first contact comes by call, nor that cards change behaviour when users are rushed or frightened. No Indian study found.',
    'I read a news report of the I4C advisory, not the advisory itself. Legal review must check the wording.',
    'Several dossier figures were not verified and are not used, including a 52% fall in complaints and losses over Rs 3,000 crore.',
    'The author\'s own use of WhatsApp calls is one person (n=1).'
  ],
  sources: [
    {
      name: 'MediaNama, Silence Unknown Callers, 20 Jun 2023',
      href: 'https://www.medianama.com/2023/06/223-whatsapp-silence-unknown-callers-privacy-checkup/',
      trust: 'High'
    },
    {
      name: 'Moneylife, WhatsApp banned 9,400 accounts',
      href: 'https://moneylife.in/article/whatsapp-banned-9400-accounts-used-for-digital-arrest-scams-in-2026-ag-tells-supreme-court/80326.html',
      trust: 'High'
    },
    {
      name: 'Moneylife, Supreme Court suo motu, 17 Oct 2025',
      href: 'https://moneylife.in/article/supreme-court-takes-suo-motu-cognisance-of-digital-arrest-scams-seeks-response-from-centre-cbi/78615.html',
      trust: 'High'
    },
    {
      name: 'Inc42, Centre directions to WhatsApp, 21 Mar 2026',
      href: 'https://inc42.com/?p=552692',
      trust: 'High'
    },
    {
      name: 'Inc42, Airtel to TRAI, Aug 2024',
      href: 'https://inc42.com/?p=473844',
      trust: 'Medium'
    },
    {
      name: 'ETV Bharat, I4C advisory, 6 Oct 2024',
      href: 'https://www.etvbharat.com/en/!bharat/cbi-ed-police-dont-arrest-people-through-video-calls-indian-cyber-crime-coordination-centre-enn24100602996',
      trust: 'High'
    },
    {
      name: 'SCC Online, TRAI approves CNAP',
      href: 'https://www.scconline.com/blog/post/2025/11/01/trai-approves-verified-caller-id-cnap-scctimes-update/',
      trust: 'High'
    },
    {
      name: '9to5Mac, screen-share warning, 21 Oct 2025',
      href: 'https://9to5mac.com/2025/10/21/whatsapp-will-now-warn-scam-victims-against-screen-sharing-bank-details/',
      trust: 'High'
    },
    {
      name: 'Careers360, IIT Bombay case',
      href: 'https://news.careers360.com/iit-bombay-student-loses-rs-7-lakh-in-digital-arrest-scam',
      trust: 'Medium'
    }
  ]
};
