export default {
  slug: 'account-takeover',
  number: 5,
  name: 'Account takeover',
  accent: 'people',
  title: 'Don\'t hand over your account',
  line: 'A hijacked WhatsApp account sends scams from a name you trust, so I propose clearer prompts, risk-based friction and humane recovery.',
  problem: [
    'Account takeover turns a stranger\'s approach into a scam that arrives from someone you trust. The message comes from a saved contact, in an existing chat, with a real profile photo.',
    'The public record names five routes: shared codes, device-linking tricks, QR scans, malware and SIM swap. One hijacked account then becomes dozens of senders, because it re-sends the lure to all its contacts and groups.',
    'WhatsApp has already added device-linking warnings. This PRD asks what is still missing after that first layer. It is an independent student proposal built only on public sources.'
  ],
  users: [
    {
      who: 'Students in India',
      job: 'When I get a link or "verify" page from a friend, I want to know if it is real, so I can keep class groups, family and part-time work on one number.',
      cost: 'Lost chats and groups, friends tricked into sending money, and a hijacked account used against classmates.'
    },
    {
      who: 'Students abroad, on Wi-Fi',
      job: 'When my Indian SIM is out of reach, I want a way back into my account, so I can stay in touch with home without roaming costs.',
      cost: 'A longer lock-out, and parents receive the scam messages.'
    },
    {
      who: 'Elders',
      job: 'When a message arrives from a known name, I want a clear prompt in my language, so I can talk to family without losing money.',
      cost: 'Money sent to a "relative", no one to restore the account, and loss of confidence in the app.'
    },
    {
      who: 'Small businesses on one number',
      job: 'When I take orders on one number, I want it kept safe, so I can share payment details with customers.',
      cost: 'Lost orders, customers told to pay a wrong account, and reputation harm.'
    }
  ],
  evidence: [
    {
      fact: 'CERT-In rated the GhostPairing device-linking hijack "high" severity in December 2025. No password or SIM swap is needed.',
      source: 'ETV Bharat, 19 to 20 Dec 2025 (advisory text not opened)',
      trust: 'High'
    },
    {
      fact: 'The attack abuses "link device via phone number". The victim enters a number on a fake page, then receives a code or QR to use.',
      source: 'Malwarebytes, Dec 2025',
      trust: 'High'
    },
    {
      fact: 'Meta announced warnings when behavioural signals suggest a device-linking request is fraudulent. WhatsApp\'s own post was not opened.',
      source: 'BleepingComputer, 11 Mar 2026',
      trust: 'Medium'
    },
    {
      fact: 'The link alert shows approximate location and what access the device would get. WhatsApp says the warning "can\'t completely eliminate the risk".',
      source: 'WABetaInfo, Jun 2026',
      trust: 'Medium'
    },
    {
      fact: 'I4C said over 10,000 Indians were protected from a campaign using files like "RBI.zip" and "MCA.zip" that hijack WhatsApp Web. "Protected" is not defined.',
      source: 'Free Press Journal, 7 Aug 2026',
      trust: 'High'
    },
    {
      fact: 'About 9,400 accounts were banned in 12 weeks from January 2026 for digital-arrest scams. This is scam-account enforcement, not a takeover measure.',
      source: 'Moneylife, 2026',
      trust: 'High'
    },
    {
      fact: 'The Centre directed WhatsApp on 21 Mar 2026 to adopt SIM binding within 4 to 6 months. Another report says it was already in force, so the status is unresolved.',
      source: 'Inc42, 21 Mar 2026; Storyboard18, 2 Mar 2026',
      trust: 'Medium'
    }
  ],
  options: [
    {
      label: 'A. Prompts only',
      note: 'Clearer link-device and code prompts with plain-language warnings and no new blocking.',
      weakness: 'Scores only 2 on abuse resistance. Warnings age quickly as attackers adapt.',
      picked: true,
      score: 22
    },
    {
      label: 'B. Cool-off with primary approval',
      note: 'A delay on newly linked devices, with approval or cancel on the primary phone.',
      weakness: 'Adds friction for honest users, so it should apply only to risky attempts.',
      picked: true,
      score: 21
    },
    {
      label: 'C. Mandatory two-step or passkey to link',
      note: 'Require two-step verification or a passkey before any device can be linked.',
      weakness: 'Mandatory enrolment locks out people who forget a PIN.',
      picked: false,
      score: 19
    },
    {
      label: 'D. SIM binding',
      note: 'Registered SIM present and active, with periodic checks and a six-hour web logout, as reported.',
      weakness: 'Does not stop a victim typing a code into a fake page, and strains Wi-Fi-only and multi-device use.',
      picked: false,
      score: 17
    },
    {
      label: 'E. Risk scoring',
      note: 'Score link attempts on non-content signals and add friction only for risky ones.',
      weakness: 'Costly to build. Signals that separate hostile from honest links are unproven.',
      picked: true,
      score: 21
    },
    {
      label: 'F. Recovery and trusted contacts',
      note: 'Faster, safer ways to regain an account, including named trusted contacts.',
      weakness: 'Scores only 2 on abuse resistance, and the trusted-contact feature could itself be abused.',
      picked: true,
      score: 19
    }
  ],
  scoreMax: 30,
  recommendation: {
    headline: 'I recommend a layered combination: prompts everywhere, risk scoring to target a short cool-off, a two-step nudge, and funded recovery. Comply with SIM binding if and when it applies, and share data on its limits.',
    why: 'Prompts alone score 2 on abuse resistance, and the total weights every criterion equally. So the recommendation is not simply the highest sum.',
    firstPhase: 'Ship clearer prompts and instant primary-device alerts first, because they are cheap and reversible. Measure baselines before any change, then run risk scoring in shadow.'
  },
  requirements: [
    {
      id: 'R1',
      text: 'Every device-link prompt names the method, shows approximate location and device type, and states what the device can do.',
      priority: 'P0',
      accept: 'In tests in Hindi, Tamil and English, at least 80% of participants correctly say what the prompt does.'
    },
    {
      id: 'R2',
      text: 'Any screen that shows a registration or link code carries one line: WhatsApp staff and other services never ask for it.',
      priority: 'P0',
      accept: 'Copy reviewed in 5 Indian languages. The line appears on every code screen.'
    },
    {
      id: 'R3',
      text: 'The primary device gets an immediate alert for any new linked device, with a one-tap "Not me, remove" action.',
      priority: 'P0',
      accept: 'Alert shown within one minute of link in 99% of cases on a phone with network access.'
    },
    {
      id: 'R4',
      text: 'Each link attempt gets a risk score from non-content signals. High-risk attempts see stronger friction.',
      priority: 'P0',
      accept: 'Score computed without reading messages. False-block rate stays within the guardrail.'
    },
    {
      id: 'R9',
      text: 'An in-app "I think I was hacked" flow lists linked devices, removes them and warns contacts.',
      priority: 'P0',
      accept: 'Flow completes in under 3 minutes in tests with first-time users.'
    },
    {
      id: 'R5',
      text: 'Hold new linked devices in a cool-off for accounts without two-step verification, cancellable from the primary phone.',
      priority: 'P1',
      accept: 'Hold applies only above a risk threshold. Owner can approve early. No hold for two-step users.'
    },
    {
      id: 'R6',
      text: 'Nudge towards two-step verification after a first linked device, a risky link or an alert, with simple PIN reset by email.',
      priority: 'P1',
      accept: 'Enrolment completion tracked. Forgotten-PIN lock-outs stay within guardrail.'
    },
    {
      id: 'R8',
      text: 'Trusted contacts for recovery: a named person can vouch for a recovery attempt.',
      priority: 'P1',
      accept: 'A contact cannot recover an account alone. Every recovery alerts the old primary device where one exists.'
    },
    {
      id: 'R10',
      text: 'With the owner\'s consent, tell recent chats "this account may have been compromised".',
      priority: 'P1',
      accept: 'Notice appears in chats only after the owner confirms.'
    }
  ],
  flows: [
    {
      title: 'Someone asks for a code',
      steps: [
        'A contact or unknown account asks the user to share a code.',
        'The code screen reminds them that no one legitimate asks for it.',
        'If the code is shared and a registration happens on another phone, the old device gets an alert.',
        'The new registration carries a short hold for key actions.'
      ]
    },
    {
      title: 'A new device is linked',
      steps: [
        'The link completes and the primary phone alerts at once.',
        'With no two-step verification and elevated risk, the new device is read-only for a short hold.',
        'Messages that would send are queued for owner approval.',
        'The owner can approve early or remove the device in one tap.'
      ]
    },
    {
      title: 'The user suspects takeover',
      steps: [
        'The user opens Settings and picks "I think I was hacked".',
        'The app shows linked devices and removes unknown ones.',
        'It prompts for two-step verification.',
        'With consent, it offers a pre-written notice to recent chats.'
      ]
    }
  ],
  metrics: [
    {
      metric: 'Takeover reports per million accounts',
      definition: 'Confirmed hijack reports per 1,000,000 monthly active accounts in India. Target (proposal): 50% lower within two quarters of full rollout.',
      guardrail: 'Report volume must not fall merely because the report button is harder to find.'
    },
    {
      metric: 'Time to detect',
      definition: 'Median hours from a hostile link to the primary-device alert being seen or the link cancelled. Target: under 1 hour.',
      guardrail: 'No rise in alerts per user that causes alert fatigue (watch dismiss-all rates).'
    },
    {
      metric: 'Link-device abandonment after warning',
      definition: 'Share of warned link attempts cancelled, split into legitimate and later-reported-hostile. Target: no more than a 2 point rise among legitimate ones.',
      guardrail: 'Legitimate users completing a link within 10 minutes stays within 5% of control.'
    },
    {
      metric: 'Two-step verification adoption',
      definition: 'Share of Indian accounts with two-step verification on. Target: +10 points in 12 months.',
      guardrail: 'Forgotten-PIN lock-outs per 1,000 new enrolments must not exceed control.'
    },
    {
      metric: 'Recovery success and time',
      definition: 'Share of takeover victims regaining control within 24 hours. Target: 90%.',
      guardrail: 'Recovery path cannot be completed by the attacker. Track recoveries later reversed.'
    },
    {
      metric: 'False-block rate',
      definition: 'Legitimate new-device links delayed or blocked, per 1,000 links. Target: under 1% in the high-friction arm.',
      guardrail: 'Support contacts about blocked links tracked weekly.'
    }
  ],
  experiments: {
    arms: [
      'Control: existing warnings only.',
      'Arm 1: clearer prompts and alerts (R1 to R3).',
      'Arm 2: Arm 1 plus risk-based friction on high-score attempts (R4).',
      'Arm 3: Arm 2 plus a cool-off for accounts without two-step verification (R5).'
    ],
    guardrail: 'Arms are compared with each other, not with absolute numbers, because reports are undercounted and arrive late. All baselines are not public, so Meta must set sample sizes from its own data.',
    kill: [
      'Legitimate-link completion within 10 minutes falls by more than 5% against control for two consecutive weeks.',
      'The false-block rate exceeds 1% in the high-friction arm.',
      'Forgotten-PIN lock-outs per 1,000 enrolments exceed control after a PIN-nudge change.',
      'A recovery path is shown to be completed by an attacker, even once, until fixed.',
      'After two quarters of full exposure, takeover reports per million accounts have not fallen against control.'
    ]
  },
  rollout: [
    {
      phase: '0. Baseline',
      what: 'No change for all India accounts. Measure link attempts, warnings shown, cancellations, report volume and recovery time.'
    },
    {
      phase: '1. Prompts',
      what: 'A randomised share of Indian accounts gets the new prompt copy and alerts (R1 to R3).'
    },
    {
      phase: '2. Risk scoring in shadow',
      what: 'The score (R4) is logged beside actual outcomes with no user-visible effect.'
    },
    {
      phase: '3. Friction, then recovery',
      what: 'Randomised arms test friction, cool-off and the nudge (R4 to R6). Recovery tools (R8 to R10) follow, opt-in first, then general availability with a review at 2 quarters.'
    }
  ],
  risks: [
    {
      risk: 'Warning fatigue: users click through prompts.',
      mitigation: 'Show prompts only at real decision points, test wording and measure dismiss rates.'
    },
    {
      risk: 'Lock-out of legitimate users, especially elders and students abroad.',
      mitigation: 'Cool-off only above a risk threshold, with email and trusted-contact recovery and two kill criteria.'
    },
    {
      risk: 'Attackers adapt to the new prompts and hold.',
      mitigation: 'Rotate signals, keep the hold small, and combine with recovery and contact notices.'
    },
    {
      risk: 'The trusted-contact feature is abused to take over accounts.',
      mitigation: 'A contact cannot complete recovery alone, the old device is alerted, and contact-initiated recovery is delayed.'
    },
    {
      risk: 'Regulatory push towards SIM binding overrides this design.',
      mitigation: 'Share evidence on SIM binding limits and design for compliance with minimum friction.'
    },
    {
      risk: 'Privacy criticism of device signals.',
      mitigation: 'Publish the signal classes, keep retention short and use no content signals.'
    }
  ],
  against: [
    {
      objection: 'Friction will hurt more people than it saves.',
      answer: 'This is plausible, since most link attempts are honest. The answer is limited scope (high-risk attempts, unprotected accounts), a kill criterion on completion time, and an experiment that can prove it wrong.'
    },
    {
      objection: 'Lock-outs will fall on elders and students abroad.',
      answer: 'True for any recovery rule. The design can only reduce this risk with email, trusted contacts and local-language help, and test those groups explicitly before scaling.'
    },
    {
      objection: 'This is security theatre: attackers will just change the script.',
      answer: 'Partly true, and WhatsApp says its warning "can\'t completely eliminate the risk". The cool-off and primary-device alert change the economics, because a hijack must stay hidden for the whole hold.'
    },
    {
      objection: 'The state wants SIM binding, so why not just do it?',
      answer: 'It targets traceability, not the moment of deception. A victim who types a code into a fake page still loses the account. WhatsApp may have no legal choice, so the design must work alongside it.'
    }
  ],
  openQuestions: [
    'What are takeover reports per million Indian accounts, and how do they split by technique?',
    'How many warned link attempts are cancelled, and by whom?',
    'What is the real recovery success rate and time, split by age band and by users abroad?',
    'What share of takeover victims had two-step verification on?',
    'Which risk signals actually separate hostile from honest links, and by how much?',
    'How does the SIM-binding directive treat Wi-Fi-only, eSIM and travel in the final text?'
  ],
  limits: [
    'No public source gives takeovers per year in India, rupee losses, or how many warned link attempts are cancelled. This PRD estimates none of them.',
    'SIM binding status is unresolved. Reports say in force from 1 March, a 4 to 6 month window, and a deadline that "may" move to December. The final directive text was not opened.',
    'WhatsApp\'s own announcement of link warnings was not opened. It was seen only through press reports, and the reported alert delay did not appear on the page opened.',
    'Targets are round numbers chosen to be falsifiable. The 50% takeover-rate target is a placeholder with no benchmark behind it.',
    'Option scores are the author\'s judgement, not data. The CERT-In advisory itself was not opened, only press reports.'
  ],
  sources: [
    {
      name: 'ETV Bharat, CERT-In GhostPairing advisory report',
      href: 'https://www.etvbharat.com/en/technology/indian-cyber-agency-flags-whatsapp-hijack-enn25122004542',
      trust: 'High'
    },
    {
      name: 'Malwarebytes, GhostPairing analysis',
      href: 'https://www.malwarebytes.com/blog/news/2025/12/the-ghosts-of-whatsapp-how-ghostpairing-hijacks-accounts',
      trust: 'High'
    },
    {
      name: 'Free Press Journal, I4C campaign',
      href: 'https://www.freepressjournal.in/tech/i4c-blocks-whatsapp-account-takeover-campaign-protects-over-10000-indians-from-malware-attack',
      trust: 'High'
    },
    {
      name: 'Inc42, 21 Mar 2026 directive',
      href: 'https://inc42.com/?p=552692',
      trust: 'High'
    },
    {
      name: 'Moneylife, 9,400 banned accounts',
      href: 'https://moneylife.in/article/whatsapp-banned-9400-accounts-used-for-digital-arrest-scams-in-2026-ag-tells-supreme-court/80326.html',
      trust: 'High'
    },
    {
      name: 'BleepingComputer, Meta anti-scam tools',
      href: 'https://www.bleepingcomputer.com/news/security/meta-adds-new-whatsapp-facebook-and-messenger-anti-scam-tools/',
      trust: 'Medium'
    },
    {
      name: 'WABetaInfo, device linking protection',
      href: 'https://wabetainfo.com/whatsapp-protects-users-from-a-common-device-linking-scam/',
      trust: 'Medium'
    },
    {
      name: 'Businessday NG, linked device alerts',
      href: 'https://businessday.ng/technology/article/whatsapp-introduces-linked-device-alerts-to-help-users-detect-account-takeover-attempts/',
      trust: 'Medium'
    },
    {
      name: 'Storyboard18, SIM binding explainer',
      href: 'https://www.storyboard18.com/brand-makers/sim-binding-now-mandatory-for-whatsapp-telegram-all-you-need-to-know-91053.htm',
      trust: 'Low'
    },
    {
      name: 'WhatsApp security page',
      href: 'https://www.whatsapp.com/security',
      trust: 'Medium'
    }
  ]
};
