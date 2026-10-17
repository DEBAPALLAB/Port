// Short factual notes from the public case studies, not invented persona lore.
// Keep these aligned with src/case/studies when the public project record changes.
export const voiceProjectNotes={
  superforms:{
    source:'/work/superforms/',
    decisions:[
      'An AI edit must preserve question identity. Stored answers, CSV exports and Sheets links depend on stable question IDs; renumbering by position can silently put a name under an email question.',
      'The edit sanitizer strips identity changes, rejects malformed operations and coerces unsupported block types. The portfolio contains an interactive reproduction, not a production source dump.',
      'The case study shows 21 aesthetics and explains native, Google-sign-in-gated and raw-API submission paths. Native and gated paths share a submission vocabulary; raw API submissions use a different stored payload shape.',
    ],
  },
  luman:{
    source:'/work/luman/',
    decisions:[
      'Classic dashboard and God Mode run beside each other on the same database. God Mode is a spatial desk of windows for notes, chat, tasks, calendars, whiteboards and other tools; changing the layout does not change authorization.',
      'Debapallab’s recorded work includes the window store, desktop, dock, minimized-window blobs, layouts and tiling, agent tools, dust transition, presence, live note updates, calls, desktop sign-in and a security review.',
      'This is collaborative work. Dhruv contributed the Classic/God Mode picker, role-hierarchy and organization fixes, migrations, deployment setup and the desktop app icon. Do not claim all of Luman as solo work.',
    ],
  },
  mindspace:{
    source:'/work/mindspace/',
    decisions:[
      'This case study covers Debapallab’s internship contribution from the new version onward. The product includes AI voice sessions, assessments, booking and chat. Do not claim ownership of earlier versions or the entire product.',
      'The case study makes entry, connecting, connected, interrupted and retry states explicit. Its in-place retry interaction is a portfolio proposal, not a shipped claim.',
      'The product’s assistant is identified as AI, not a licensed professional. Discuss the interaction and recovery design, not therapy advice.',
    ],
  },
  comparefi:{
    source:'/work/comparefi/',
    decisions:[
      'Comparisons use a curated set of lenders, aligned criteria and first-year versus second-year costs because setup and recurring fees can change the apparent cheapest option.',
      'Debapallab worked on the home-page hero, fanned product cards, global styles, display cards and layout. LAS/LAMF product pages and the comparison table were shared work with Dhruv. The product decisions were made together.',
      'The case study credits Dhruv for comparison/product-page and navigation work and Soham for admin and deployment work. Explain financial comparison UX without recommending investments or making current rate claims.',
    ],
  },
  notaprompt:{
    source:'/work/notaprompt/',
    decisions:[
      'The project evolved from structured prompt builders to a clarification flow that asks what is missing before compiling a platform-aware brief. The latter trades an extra model call for fewer unsupported assumptions.',
      'The current public site describes agent-network decision simulations. The earlier repositories reviewed for the case study do not contain that current engine, so the case study explicitly distinguishes website claims from verified code.',
      'The portfolio’s 48-agent seeded simulator is an explanatory illustration, not a calibrated prediction engine. Do not present its curves, accuracy, uptime or adoption figures as measured product outcomes.',
    ],
  },
  poker:{
    source:'/work/poker/',
    decisions:[
      'Poker Gods handles home-game chips, buy-ins, blinds, betting and settlement. Its settlement algorithm matches debtors and creditors deterministically, with ID-based tie-breaking.',
      'The case study documents a room-state read consolidated from twelve database round trips into one, rather than assuming all latency was a cold start.',
      'The betting-rules verification checks chip conservation over 20,000 random hands. This is a repository test count, not a user count. The case study also lists unfinished rules and polling behavior; do not describe it as flawless or fully real-time.',
    ],
  },
  gdc:{
    source:'/work/gdc/',
    decisions:[
      'The Government Dental College Dibrugarh website serves multiple audiences, so its home page sorts access to institutional information and common tasks.',
      'Reading current database content on requests keeps notices and tender deadlines fresh. One parameterized route serves nine departments, and block-based editing lets staff update notices and fee tables without authoring HTML.',
      'The case study contains an explanatory notice-publishing interaction and distinguishes what exists from proposed next steps. Do not invent traffic or institutional outcome metrics.',
    ],
  },
  culprit:{
    source:'/work/culprit/',
    decisions:[
      'Culprit is a debugging product concept and browser prototype. It has a file tree, Monaco editor, live preview and thirty hand-written challenges.',
      'Its concept treats debugging as investigation: a customer symptom should not reveal the failing filename or stack trace. Proposed contest integrity relies on fresh problems and process evidence, rather than clipboard surveillance.',
      'The prototype’s tests inspect file text; terminal output and leaderboard data are mocked. Accounts, submissions, ratings and automatic mutation generation are not built. Clearly distinguish proposed Glicko-2/scoring ideas from working features.',
    ],
  },
  lucide:{
    source:'/work/lucide/',
    decisions:[
      'Lucide Tech’s studio site evolved through eight versions. Its current visual language uses a lamp-revealed headline, a synchronized pinned services rail and a sentence-like contact flow.',
      'The case study explicitly asks how a hover-led headline remains readable on a phone. It treats motion as an interaction with a touch fallback, not a reason to hide essential content.',
      'Debapallab records the design and implementation of the versions; version six was generated with Lovable from his specification. The studio is a team, and studio projects have their own individual credits.',
    ],
  },
};
