export default {
  slug: 'business-tab',
  number: 1,
  name: 'Business tab',
  accent: 'marketing',
  title: 'A business tab for WhatsApp',
  line: `Give business messages their own pooled tab, sorted at once by the category the sender declared.`,
  problem: [
    `Promotions, delivery updates and OTPs share a chat list with family. The app people rely on most is the one they can least tune out.`,
    `Businesses that hold a phone number from checkout can message it. Blocking fails because senders return from new numbers.`,
    `In a February 2026 LocalCircles survey, 96% of respondents reported unsolicited commercial messages daily, and 19% reported eight or more. The survey is online and self-selected, so it is a signal, not a census.`
  ],
  users: [
    {
      who: `Students and young adults`,
      job: `When I get a code, a delivery update and a sale alert within the same hour, I want them sorted so I can see my friends' messages first, so I can reply to people without scrolling past brands.`,
      cost: `A missed group message about an exam, hostel or placement is costly. Overload also pushes some users to mute or leave the app.`
    },
    {
      who: `Parents and older users`,
      job: `When a bank, gas agency or school writes to me, I want to find the message without learning a new feature, so I do not miss a payment, a delivery or a fee notice.`,
      cost: `An older user may not know a folder exists. A message moved out of sight is, for them, a message that never arrived.`
    },
    {
      who: `Small shops and local businesses`,
      job: `When a customer orders from my shop, I want my confirmation to reach them promptly and look trustworthy, so I avoid phone calls asking whether the order went through.`,
      cost: `If a tab hides small-shop messages, or treats them as spam, the shop loses customers.`
    },
    {
      who: `Enterprises sending OTPs and alerts`,
      job: `When a customer must log in or approve a payment, I want the code to arrive and be seen within seconds, so the transaction completes.`,
      cost: `The highest of all segments. Any delay to authentication messages is a non-starter for this group.`
    }
  ],
  evidence: [
    {
      fact: `96% of 42,000+ respondents in 324 districts report unsolicited business messages daily. 19% get eight or more, up from 11% in 2023.`,
      source: `Storyboard18, 4 Feb 2026`,
      trust: 'Medium'
    },
    {
      fact: `59% block senders, but spammers return from new numbers. Real estate and financial services are each flagged by 71%.`,
      source: `Storyboard18, 4 Feb 2026`,
      trust: 'Medium'
    },
    {
      fact: `WhatsApp relaxed explicit opt-in in July 2020. Business app had 15 million monthly users in 2020, and 80% of messages were viewed within five minutes.`,
      source: `Rest of World, Oct 2022`,
      trust: 'Medium'
    },
    {
      fact: `WhatsApp tested interested or not interested and stop or resume controls by category in Nov 2024, and a limit on unanswered messages in Oct 2025.`,
      source: `TechCrunch, 20 Nov 2024 and 17 Oct 2025`,
      trust: 'High'
    },
    {
      fact: `Per-message pricing since 1 Jul 2025. First 1,000 service conversations a month are free. A new India rate card starts on 1 Oct 2026.`,
      source: `Meta developer pricing page`,
      trust: 'High'
    },
    {
      fact: `Messages already carry one of four declared categories. Meta reclassifies templates with promotional wording, enforced since 1 Jun 2024.`,
      source: `Exotel and DoubleTick vendor pages`,
      trust: 'Medium'
    },
    {
      fact: `Custom lists launched on 31 Oct 2024 to filter chats by category. There is no usage data.`,
      source: `WhatsApp blog, 31 Oct 2024`,
      trust: 'High'
    }
  ],
  options: [
    {
      label: `A. Do nothing plus existing filters`,
      note: `Rely on block, report, the Nov 2024 controls, custom lists and the unanswered-message limit.`,
      weakness: `Lowest user value. Does nothing about messages landing in the main list.`,
      picked: false,
      score: 33
    },
    {
      label: `B. Delayed folder for large senders`,
      note: `WhatsApp's Offers & Updates test. Messages move after up to 24 hours, large businesses only.`,
      weakness: `A promotion still lands in the main inbox first. Small shops are excluded. It sorts by sender size, not message type.`,
      picked: false,
      score: 37
    },
    {
      label: `C. Instant sorting into a pooled Business tab`,
      note: `Every business conversation lands in one tab on arrival, with different notification rules per category.`,
      weakness: `Highest build cost. A wrong label hides an urgent message at once, and senders can mislabel promotions.`,
      picked: true,
      score: 41
    },
    {
      label: `D. Sender pays for visibility`,
      note: `Businesses pay, or earn a quality tier, for reaching the main list.`,
      weakness: `Worst on regulatory fit. Meta also earns per message, which invites a conflict-of-interest finding.`,
      picked: false,
      score: 21
    },
    {
      label: `E. User-defined rules`,
      note: `Users build filters like email rules, extending custom lists.`,
      weakness: `Fails the older user. Rules need discovery and effort.`,
      picked: false,
      score: 37
    }
  ],
  scoreMax: 55,
  recommendation: {
    headline: `I recommend instant, category-based sorting into a pooled Business tab (option C), tested against Meta's delayed folder (option B).`,
    why: `Instant sorting fixes the delay gap. Category sorting fixes the type gap. The scores are my judgement, not measurements.`,
    firstPhase: `Ship B's reach and caution first. The tab includes only large, verified senders, and marketing is sorted at once. Small verified senders and the verification strip come later.`
  },
  requirements: [
    {
      id: 'R1',
      text: `A Business tab pools every conversation with a verified business account.`,
      priority: 'P0',
      accept: `A business chat appears in the tab within 5 seconds of its first message and not in the main list.`
    },
    {
      id: 'R2',
      text: `Sorting uses only sender-declared metadata: template category and verified status.`,
      priority: 'P0',
      accept: `Security review confirms no message content is read by the classifier.`
    },
    {
      id: 'R3',
      text: `Utility messages notify as normal and show the latest one on a pinned Business row in the main list.`,
      priority: 'P0',
      accept: `A delivery update raises a standard notification. The pinned row shows the preview.`
    },
    {
      id: 'R4',
      text: `Marketing messages arrive silently, with an unread badge on the tab only.`,
      priority: 'P0',
      accept: `No sound or vibration by default. The badge count is correct.`
    },
    {
      id: 'R5',
      text: `Authentication messages are never delayed and appear in a short-lived verification strip.`,
      priority: 'P0',
      accept: `OTP latency with the feature matches control at the 95th percentile.`
    },
    {
      id: 'R6',
      text: `One setting turns the whole feature off, and it persists across updates.`,
      priority: 'P0',
      accept: `The setting survives an app update and a reinstall from backup.`
    },
    {
      id: 'R7',
      text: `Per-business override: always notify, always quiet, or move to the main list.`,
      priority: 'P1',
      accept: `The override applies to all future messages from that business.`
    },
    {
      id: 'R8',
      text: `Search covers both the main list and the tab, with a business filter.`,
      priority: 'P1',
      accept: `Search finds an order message in under 2 seconds on a mid-range phone.`
    },
    {
      id: 'R9',
      text: `Verified small businesses can join the tab. Business app accounts are included once verified.`,
      priority: 'P1',
      accept: `A verified small shop appears in the tab with the same rules.`
    },
    {
      id: 'R10',
      text: `A first-run explainer in plain language and the user's app language, with a visible Undo.`,
      priority: 'P1',
      accept: `90% of pilot users can find a moved message in a usability test.`
    }
  ],
  flows: [
    {
      title: `First run`,
      steps: [
        `The user opens WhatsApp after the update and sees a one-screen explainer.`,
        `The user chooses Turn on or Not now. The default is on, with an Undo link.`,
        `Existing business chats move to the tab. The main list shows a pinned Business row.`,
        `The user sees where the tab lives in the filter bar.`
      ]
    },
    {
      title: `A delivery update arrives`,
      steps: [
        `A courier sends a utility template.`,
        `It lands in the Business tab and updates the pinned row preview.`,
        `The phone notifies as normal, with the business name and a verified mark.`,
        `The user taps to see tracking, and can search for it later.`
      ]
    },
    {
      title: `A promotion arrives`,
      steps: [
        `A retailer sends a marketing template.`,
        `It lands in the Business tab silently and raises the tab badge.`,
        `The user opens the tab when they choose. The main list is untouched.`
      ]
    }
  ],
  metrics: [
    {
      metric: `North-star: healthy retention`,
      definition: `Users with the tab on at day 30 who also open utility messages within their usual time. Target: at least 60% of exposed users (my proposal).`,
      guardrail: `Falls under 40%: pause rollout.`
    },
    {
      metric: `Main-list business share`,
      definition: `Share of chat-list rows and notifications from business accounts per user per week. Target: down 50% from control.`,
      guardrail: `Personal-chat reply time must not worsen.`
    },
    {
      metric: `Missed time-sensitive messages`,
      definition: `Utility or authentication messages unopened after 24 hours, per 1,000 delivered. Target: no worse than control.`,
      guardrail: `Any rise beyond 0.2 percentage points stops the arm.`
    },
    {
      metric: `OTP completion`,
      definition: `Share of OTPs entered within 60 seconds of delivery. Target: no worse than control.`,
      guardrail: `Zero tolerance for OTP delay introduced by the feature.`
    },
    {
      metric: `Business conversion on utility messages`,
      definition: `Click or reply rate on delivery and order updates. Target: no worse than control.`,
      guardrail: `Over 5% relative drop: investigate.`
    },
    {
      metric: `Opt-out rate`,
      definition: `Users who switch the feature off in week 1. Target: under 15% (assumption).`,
      guardrail: `Over 25%: redesign.`
    }
  ],
  experiments: {
    arms: [
      `Control: no tab, current behaviour`,
      `Instant: marketing sorted into the tab on arrival`,
      `6-hour delay: marketing sorted after 6 hours`,
      `24-hour delay: marketing sorted after 24 hours, as the folder test`
    ],
    guardrail: `Users are randomised at the user level. Utility and authentication are never delayed in any arm. Ship the arm with the best main-list business share, provided missed messages stay within 0.2 points of control.`,
    kill: [
      `Any measurable OTP latency or completion drop caused by the feature.`,
      `Missed time-sensitive messages above control by more than 0.2 points in any arm for two consecutive weeks.`,
      `Week-one opt-out above 25%.`,
      `A rise in support contacts about missing messages that cannot be explained by novelty.`,
      `A regulatory objection that cannot be resolved within the pilot window.`
    ]
  },
  rollout: [
    {
      phase: `0. Internal and usability`,
      what: `Staff devices plus 20 older users and 20 students in India, tested in Hindi and English. Exit gate: 90% find a moved message, and no OTP latency change.`
    },
    {
      phase: `1. Pilot`,
      what: `Large verified senders only, small share of users in India, instant sort for marketing only. Exit gate: guardrails flat for 4 weeks.`
    },
    {
      phase: `2. Experiment`,
      what: `Four arms, still large senders. Exit gate: the decision rule is met.`
    },
    {
      phase: `3. Expand`,
      what: `Verified small businesses, then other languages and regions. Exit gate: small-sender complaint rate no higher than large.`
    }
  ],
  risks: [
    {
      risk: `A time-sensitive message is sorted quietly and missed`,
      mitigation: `Utility is never silenced. Pinned row, per-business override, and the guardrail kills the arm.`
    },
    {
      risk: `Senders mislabel promotions as utility`,
      mitigation: `Existing reclassification, plus a user "this is promotional" signal that feeds sender quality.`
    },
    {
      risk: `Older users cannot find moved messages`,
      mitigation: `Pinned row, plain labels, one-tap show everything, and a usability gate in phase 0.`
    },
    {
      risk: `Small shops lose customers or are treated as spam`,
      mitigation: `Include only verified small senders, and track a separate complaint metric.`
    },
    {
      risk: `Scam senders copy the business format and sit in a trusted tab`,
      mitigation: `Verified mark. Show only verified senders in the pool. Scams stay in the main list as unknown contacts.`
    },
    {
      risk: `Conflict of interest: Meta earns per message and controls visibility`,
      mitigation: `Publish the sorting rules, rule out pay-for-visibility, and report category outcomes.`
    }
  ],
  against: [
    {
      objection: `A tab treats the symptom, not the cause.`,
      answer: `Correct. Senders still pay little to message, and blocked ones return from new numbers. The tab is the first of three layers. Consent control and sender costs are PRDs 3 and 6.`
    },
    {
      objection: `Users will not open a tab, so businesses lose and Meta loses revenue.`,
      answer: `Possible, and it is the real tension. Gmail's tabs raised the same fear, though my evidence is from search snippets only. The conversion and visibility guardrails exist to measure it.`
    },
    {
      objection: `The folder test already does this.`,
      answer: `Partly. It covers large senders and sorts after a delay. I add instant sorting, sorting by message type, small verified senders and a verification strip. The experiment tests whether those matter.`
    },
    {
      objection: `Sorting by sender-declared category is easy to game.`,
      answer: `True, and mislabelling already needs policing today. A user override and the sender's quality score are the backstop. The design does not claim to end gaming.`
    }
  ],
  openQuestions: [
    `What are the block, report and mute rates for business chats, split by template category?`,
    `How does the folder test treat OTPs and utility messages, and does it exempt them?`,
    `What share of templates is reclassified, and how often do senders appeal?`,
    `What share of folder-test users switch it off, and after how long?`,
    `Would a Business tab change the volume of marketing templates sent, and the revenue Meta earns on them?`,
    `Is WhatsApp business messaging in TRAI's scope for transactional-message accessibility?`
  ],
  limits: [
    `This is an independent student proposal built on public sources and one student's own experience (n=1).`,
    `All percentages, thresholds, scores and sample sizes are my proposals, not sourced data.`,
    `No public data shows what a pooled tab does to behaviour. The evidence supports the problem well and the solution poorly.`,
    `The 19% eight-or-more figure is split differently across coverage. The survey is online and self-selected.`,
    `I found no Meta primary source on how the folder test treats OTPs and utility messages. Reports differ between a few hours and up to 24 hours.`
  ],
  sources: [
    {
      name: `Android Headlines, Jul 2026: Offers & Updates folder test`,
      href: 'https://www.androidheadlines.com/2026/07/whatsapp-tests-new-folders-to-organize-messages-from-businesses.html',
      trust: 'Medium'
    },
    {
      name: `ETV Bharat, 18 Apr 2026: Android beta 2.26.15.9`,
      href: 'https://www.etvbharat.com/en/technology/whatsapp-developing-automatic-business-chat-separation-to-reduce-inbox-clutter-enn26041803817',
      trust: 'Medium'
    },
    {
      name: `TechCrunch, 20 Nov 2024: business marketing controls`,
      href: 'https://techcrunch.com/2024/11/20/whatsapp-will-finally-let-you-unsubscribe-from-business-marketing-spam',
      trust: 'High'
    },
    {
      name: `TechCrunch, 17 Oct 2025: limit on unanswered messages`,
      href: 'https://techcrunch.com/2025/10/17/whatsapp-will-curb-the-number-of-messages-people-and-businesses-can-send-without-a-response',
      trust: 'High'
    },
    {
      name: `Meta developer pricing page`,
      href: 'https://developers.facebook.com/docs/whatsapp/pricing',
      trust: 'High'
    },
    {
      name: `Rest of World, Oct 2022: India WhatsApp spam`,
      href: 'https://restofworld.org/2022/india-whatsapp-spam/',
      trust: 'Medium'
    },
    {
      name: `Storyboard18, 4 Feb 2026: LocalCircles survey`,
      href: 'https://www.storyboard18.com/social-media/whatsapp-spam-hits-96-of-users-in-india-reveals-survey-amid-sc-heat-on-meta-88863.htm',
      trust: 'Medium'
    },
    {
      name: `WhatsApp blog, 31 Oct 2024: custom lists`,
      href: 'https://blog.whatsapp.com/focus-on-what-matters-with-custom-lists',
      trust: 'High'
    },
    {
      name: `SCC Online, 29 Jul 2026: DPDP consent dates`,
      href: 'https://www.scconline.com/blog/post/2026/07/29/whatsapp-chatbot-opt-in-consent-dpdp-act-compliance/',
      trust: 'Medium'
    },
    {
      name: `Exotel: template categories (vendor page)`,
      href: 'https://developer.exotel.com/docs/whatsapp-support/template-categories',
      trust: 'Medium'
    }
  ]
}
