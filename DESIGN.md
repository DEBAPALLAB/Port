# Follow a decision into its consequences

## The story, spoken: live voice, 15 October 2026

The personal invitation now offers a live conversation with an explicitly identified AI guide. The user's requested Gemini 3.1 Flash Live model is fixed in the server configuration; Orus is the selected synthetic voice. No avatar or voice clone is built. The existing biography and About link remain, and the voice surface becomes the primary action. On phones it follows the heading immediately, before the longer biography. The existing Manrope, ceramic green and coral remain; this is a component revision with no direction draw, new images or invented personal content.

The live thing is a conversation grounded in real biography, project decisions and contribution boundaries. It can surface an allowlisted case-study or About link without moving the page. Microphone conversation, listen-only mode and typed questions use the same live session. The waveform is an RMS-driven audio meter with a quiet static resting trace; it is not a pretend avatar. A resize observer handles the journey's initially hidden section, and actual output levels are exposed for future avatar speech animation.

Finite connection states, captions, an optional transcript, microphone/sound controls, permission recovery and explicit ending replace a passive postcard. Keys remain server-side: the browser receives one-use, constrained short-lived tokens. Input uses a streaming resampler in an AudioWorklet, output is scheduled as contiguous PCM, and interruption clears queued audio. Cancel, end, page exit and late permission resolution release device resources. The public endpoint has a per-instance throttle; deployment-wide controls and setup are described in `docs/voice.md`.

Screenshot review at 1440, 768 and 390px found two problems and corrected them: an initially blank hidden canvas and voice controls appearing too late on mobile. Final renders show a visible resting trace, readable captions and a reachable primary action. Internal visual review: design 7.5, usability 8, creativity 7.5, content 8 (7.7 weighted). The actual conversational delivery and latency cannot be judged without the real Gemini key. No real-provider success is claimed.

Validation: 39 tests pass, including eleven token/audio/lifecycle tests. Production build and component source lint pass. Browser checks at three widths use a fixture provider with real Web Audio, getUserMedia and AudioWorklet APIs; they cover missing-key UI, listen-only entry, typed prompts, captions, recommendations, PCM streaming, microphone/sound mute, track cleanup and denied-permission recovery. Captures: `.taste-skill/voice-experience/`. `check:voice:live` is ready to verify one real spoken reply when `GEMINI_API_KEY` is added to `.env.local`; the current local environment is unconfigured.

## Physical drawers with deliberate panels, 15 October 2026

Close synchronization correction: the paper well now ends at the drawer lip rather than extending below the case. Its lower clip edge shares the front's exact easing, duration and interruption lifecycle. GSAP also owns final file visibility; the independent CSS visibility delay is removed. This prevents paper strips lingering under a nearly closed drawer during switching. `check:drawer-close` samples the mask/front relationship every frame and verifies hover, selected files and interrupted reopening at desktop, tablet and phone widths.

Hover is the cabinet's primary physical invitation. A 120ms intent delay avoids opening drawers merely crossed by the pointer. Hover pulls the front and tray out and fans the three papers; it does not expose a side panel. The first click pins the drawer and opens its inspector, with the selected file raised. The original button stays under the pointer while its visible face travels. Hover papers are inert until pinning. Escape and Close dismiss both the hover and pinned states, with focus restored and no automatic page alignment.

`useDrawerMotion` owns one finite GSAP timeline per mechanism. The front uses a heavily damped spring response, papers a lighter response, with staggered lag, slight pitch and separate handle recoil. Closing tucks papers in before the case returns. Interrupted gestures continue from their current transform; repeated hover does not restart a completed entrance. Timelines are killed on unmount and reduced motion settles immediately. There is no continuous render loop or new Three.js scene.

Borders now describe the physical frame, recessed front, label holder, rails and paper stock. A bounded paper window clips the stack; the selected file clears the front and keeps its action reachable. The inspector has its own scrolling bounds, shows only after a click and remains within the desktop viewport. Mobile retains the inline selector and reserves space for the inspector. Browser scroll anchoring is suppressed while a drawer is expanded. Materials, project paper colours, Manrope and actual captures remain; no new direction, generated assets or sample content.

Review at 1440, 768 and 390px: the drawer is the focal object, exposed file tabs communicate the stack, the selected paper has a real screenshot, and the full panel leaves adjacent drawers visible during hover. The phone panel still requires manual scrolling below the drawer front. Internal component review: design 8, usability 8, creativity 8, content 8. Captures are under `.taste-skill/drawer-physics/`.

Validation: 28 unit/DOM tests, production build and component source lint pass. `check:drawer-physics` (also used by `check:drawer-cards`) dispatches real pointer, touch and keyboard input at three widths; checks cover first-click pinning at the original pointer position, hidden hover panels, crossing left/right neighbors toward the middle, spring settling, reversal, card clearance, clipping, file action hit targets, focus return, no page scrolling and reduced motion. `check:cabinet-stability` passes at 1440, 1024, 768 and 390px; `check:personal` covers filtering and keyboard navigation. The earlier whole-page inspector findings outside the cabinet remain outside this component revision.

## Refined drawer and card stack

The drawer reference's useful gesture is a card lifting out of a stack when its list item is selected. The cabinet now implements that with three real previews per project: its story, an actual captured interface, and its live destination (or concept scope). An adjacent selector controls which physical card rises; other papers settle back into the drawer without exposing clipped scraps of text. The active drawer stays crisp as the rest of the cabinet recedes. Materials are lighter enamel, muted project-specific paper and a slanted tray; project colours remain stable through filtering.

Desktop pointer hover and keyboard focus choose previews. Phones have a compact three-button selector below the drawer front, separate from the file/live actions, and selecting aligns the raised card into view. The open phone row reserves space for its controls instead of covering the next drawer. A short pointer-leave delay and transparent bridge allow movement into the companion panel. Escape, pinning, direct live links, complete file opening and reduced motion are retained. The layer uses finite CSS transitions; no new Three.js scene or render loop is introduced.

Cards use existing project screenshots, with Superforms' real builder and Culprit's working editor captures; no coupon artwork, made-up records or generated interfaces are used. The lifted card alone has a subtle shadow because it floats. Inactive preview text is visually and semantically hidden; the inspector remains the action surface. No new palette or direction is drawn for this component revision of the established cabinet.

Browser review corrected a caption behind the drawer front, clipped background text, and insufficient phone row space. Final internal review: design 7.5, usability 8.5, creativity 8, content 8; approximately 7.9 overall. The original reference has a hand-drawn surface; this implementation retains the portfolio's cleaner ceramic language. Captures are under `.taste-skill/drawer-cards/`. `check:drawer-cards` verifies actual desktop pointer hover, phone selection, raised-card clearance, real screenshot loading, live URL, physical action hit targets and overflow at 1440, 768 and 390px. Build, source lint, 26 unit/DOM tests, and the existing personal/cabinet browser checks pass.

## An invitation into the personal story

The ending previously asked visitors to choose a service and write a project brief. Its main action now leads into `/about/`: “Meet the person behind the pieces,” with a short introduction rooted in Dibrugarh, Nagpur, design and music. A postcard's two places and a manually drawn guitar give the invitation personal material. Its home, college and music links open their corresponding About chapters. The primary action is “Read my story”; email copying, a mail link and replay remain in a compact secondary close. The service board, brief textarea and business-pitch copy are removed.

This single section retains the established type and palette rather than drawing another direction. The idea is Debapallab's move from Dibrugarh to Nagpur becoming an invitation to open his personal story. No portrait or personal experience is invented. If `personalPhotos.portrait.src` is supplied, the illustration's postcard space becomes the actual portrait automatically. The guitar is a manual SVG, not a found or generated image. Motion staggers the copy and postcard contents, with finite hover feedback and reduced-motion support. Content remains visible without cinematic reveals.

Desktop, tablet and phone captures are in `.taste-skill/personal-invitation/`. The primary link opens the real About page; each headline fits two lines, and no page overflows. Source lint and production build pass. All 26 regression tests pass, including email fallback and replay; obsolete service-choice assertions are replaced with the new About action and absence of the form. Screenshot review: design 7.5, usability 8.5, creativity 7.5, content 8; approximately 7.8 overall. The eventual personal portrait will make the invitation more immediate. No conversion-rate improvement is claimed without visitor data.

## Complete project files

The embedded hero now sizes against the file's remaining reading viewport, rather than reserving another standalone-page height. At 1200×700, the complete metadata row fits in the opening for all nine files, with no horizontal overflow. Its 3D stage, heading scale, row gap and facts padding are reduced together; standalone and phone layouts retain their existing sizing. GDC screenshots and measured bounds are under `.taste-skill/file-fit/`. The complete-file browser check now includes this short laptop viewport.

The three-tab home reader was an incomplete destination: some “interaction” tabs fell back to a live-link card, although full case studies already existed. The cabinet now opens those full studies inside a native dialog. A hinged cover gives way to the actual case-study hero, real screens, interactive models, decision records, implementation notes and next steps. The composition and assets are reused from the established case-study direction; no new direction or stock imagery is drawn.

The dialog supplies chapter navigation, progress, previous/next files, a standalone-page link, and Return to cabinet. Embedded case studies omit their duplicate header/rail/next-project/footer; standalone pages retain them. Native dialog focus containment makes the background inert. The ready file focuses its own headline so keyboard reading scrolls within it. Escape works from both parent controls and the study, and closing restores the original folder action. Opening pins its drawer, including when the drawer was initially only hovered. The underlying page keeps its scroll position. Unmounting removes the frame and its observers; no hidden file scenes keep running. Reduced motion removes opening travel.

Screenshot review at 1440, 768 and 390px: the new first screen carries a full project argument and a working 3D object, rather than a descriptive card. Phones use a native chapter selector and edge-to-edge file. The complete file inherits the depth and visual limits of the existing case studies. Internal review: design 7.5, usability 8.5, creativity 8, content 8; approximately 7.9 overall. No generated or found images are added. Covers and the case-study scenes are drawn in code; screenshots come from the existing captures.

Checks are in `scripts/project-files-check.mjs`; captures in `.taste-skill/project-files/`. They verify all nine complete files, responsive layouts, real screenshot availability, chapter navigation, live edit replay, project switching, no overflow, focus restoration, Escape and reduced motion. The earlier three-tab tests are replaced with complete-file assertions; the ordinary unit suite retains 26 tests.

## Personal story and cabinet, 14 October 2026

The former About section was a contact invitation with two professional sentences. It is now Contact; About opens the independent `/about/` page without activating the domino journey. Direct links back to work unlock the requested home chapter.

About uses the split-stage direction, seed 1350391335, retaining Manrope, ceramic neutrals and coral links. On this page, Debapallab's move from Dibrugarh to IIIT Nagpur becomes a personal photo album beside a reading column. Visitors select a chapter; scrolling also changes its photo frame. Competitions form a selectable notebook, followed by a music chapter and an education/ongoing-learning close. Biography comes from the user's account and supplied résumé; Manthan from the user, the other competition records from the résumé. The earlier portfolio supplies the team reflection. No invented achievements, hobbies or outcome metrics are added.

The user requested photo spaces for portrait, home, school, college, Manthan and music. This overrides the skill's photo floor. `src/personalStory.js` holds the six image paths; `public/about/README.md` explains replacement. No stock or generated personal photographs are used. No personal footage was supplied, so the remaining inspector warning is intentional. The guitar is a manual SVG illustration.

The cabinet follows the user's references. Nine metal fronts, ring handles, keyholes, slanted trays and folder layers form the archive. Hover/focus previews; click pins; Escape closes and returns focus to the handle. Folder actions open the interactive reader or full case study. Closed actions are inert. Desktop has three columns, tablet two, phone one; phones open further so both 44px actions remain clickable. Motion uses finite transforms and opacity without a render loop, and immediate reduced-motion states.

Visual review: the cabinet is immediately recognizable and its open folder has a readable purpose. About has a large introduction and distinct story/notebook/music compositions. Review found covered phone links and backward keyboard order; both were corrected. Type was reduced to five role tokens. Internal scores: design 7, usability 8.5, creativity 7.5, content 8; approximately 7.6 overall. The absent personal photographs remain the visual limitation. These are internal judgments, not third-party scores.

Production build and all 26 unit/DOM tests pass. `npm run check:personal` passes at 1440, 768 and 390px: physical hit targets, drawer selection, Escape, filtering, navigation, competition selection, runtime errors, overflow, keyboard order and reduced motion. Source lint passes. About inspection has zero failures at all widths with `few-pictures` explicitly allowed for the requested photo spaces. Captures: `.taste-skill/personal-cabinet/` and `.taste-skill/about-inspect/`. Vite retains the existing lazy Three.js size warning. No publication is claimed.

The white / charcoal / coral direction and manually built imagery are retained from the user's brief. This is a revision of established sections, so no random direction is drawn.

## What the chapters prove

- The domino: one visitor action starts the journey.
- Superforms: the product promise is a shorter route from a brief to usable answers. The folio opens a brief, a rendered interface, and structured response data. Its printed faces follow the actual local demo state.
- The implementation note: control after generation needs guardrails. Inspection of the local Superforms edit sanitizer confirmed structured operations, identity preservation, rejection of malformed operations, and coercion of unsupported types. The portfolio uses a reduced reproduction and does not publish production source code.
- Working files: project purpose, an inspectable mechanism, and a real destination. The former tilted-paper transition and large symbolic artwork panels are removed.
- Contact: the visitor places a piece, writes an idea, and takes the selected direction and brief into an email.

## Meaningful interactions

The form study shares a question object across editing, preview, and validation. Required/optional changes affect what an answer needs to do. The unsafe-edit experiment preserves identity. Valid answers retain that identifier. The note opens as a readable document and downloads as Markdown.

Project files can be opened directly. On wide, tall desktop viewports, reading scroll keeps the file in view and opens the brief, mechanism, then live destination. It moves the document stack rather than merely revealing more decorative cards. Layout observers refresh scroll bounds after editable earlier content changes the chapter's absolute position.

Mindspace's study has entry, connecting, connected, interrupted, and retry states. CompareFi keeps chosen criteria aligned across alternatives without inventing financial data. Notaprompt illustrates stepwise propagation through a deterministic network. Poker's example balances three chip stacks and shows the settlement. Culprit follows an evidence trail and remains explicitly a concept. GDC opens the institutional entry. Luman expands its connected workspace. Lucide and Superforms retain actual outbound destinations.

These are portfolio mechanism studies, not claims that the production services execute inside this page. Mindspace remains an internship contribution from the new version onward. Real screenshots, personal decisions, results, and historical project documents are still to be supplied.

## Performance and accessibility

The existing lazy Three.js chunk is shared. Folio textures are reused; changed print data is coalesced into the demand-render queue and only painted when visible. Opening, layer changes, and document turns use finite GSAP motion. Paper tabs have equivalent HTML controls. No React state updates occur each render frame. Scroll updates change a CSS progress property; document state changes only at the three chapter boundaries.

Small viewports have explicit editor/respondent modes so an edited question can be tried immediately. The project reader does not pin on small/short viewports or with reduced motion. Contact needs no puzzle completion. Replay resets the local state. GPU resources, observers, handlers, and animations are disposed.

## Visual review

ROUND 1
Seen in one second: an opened product folio and a reader containing an actual interaction.
Idea: a decision becomes a rule, a rule becomes an interface, and an interaction produces something usable.
Live thing: edit and test a question; inspect the guard; open a project mechanism.
Layout words: hero=stage / Superforms=folio / engineering=editor+respondent / working-files=reader / invitation=placement+brief.
Scores: design 6.5 · usability 8 · creativity 7.5 · content 7 → overall 7.2.
Caps: the user's real product screenshots and contribution narratives remain unavailable; mechanism studies do not substitute for those proofs.
Top issues:
1. The decorative transition repeated a heading and had no purpose. Removed it.
2. Generic role tabs disconnected product and engineering. Replaced them with one shared, working artefact and a source-grounded identity constraint.
3. Mobile voice-study grid placement produced an unintended second column. Corrected its explicit column placement.

The generic image/video floor conflicts with the user's manual SVG/3D brief. Static entry-route still-page measurements cannot exercise the gated chapters. Existing hero conventions are retained. Dedicated browser captures and interaction checks exercise the unlocked current layout instead; no generic inspector pass is claimed for the unlocked chapter.

## Case-study completion review, 14 October 2026

The existing ceramic white, charcoal and coral direction is preserved. This is a completion of the established build, with no random redraw or new stock imagery. On Culprit, the distance between a symptom and its cause becomes the navigable model and code hunt. Its live experiment lets a visitor guess a function, inspect the mutation, change the blind-model baseline and reset the hunt.

The missing Culprit stylesheet blocked the entire multi-page production build. It now supplies the responsive code editor, graph, score sheet, severity slider and runtime flow. GDC and Poker retain their words and scenes with wider desktop text columns and two-line heroes. The shared case-study header, rail, screenshot addresses and decision labels now have a 13px minimum. White decision labels and the selected severity band use the darker coral for contrast. Statement widths now measure against their display size rather than the document's body size.

Visual review of the Culprit desktop hero, hunt and scorer, full-page sheets, and phone scorer: design 7, usability 8, creativity 8, content 8; weighted score 7.6. The ceramic scene is distinctive but pale, and the long decision chapter is still text-heavy. GDC and Poker desktop heroes now have clearer two-line hierarchy. These are internal review scores, not third-party ratings.

The Culprit inspector passed its measured gate with the existing project-name, metric and next-project labels allowed as an established portfolio convention. Its warnings about ceramic tones, size count, repeated decision panels, screenshot reels and the lack of photography/video remain deliberate: these pages show software, its real captures and working models. No found pictures, generated assets, new customer claims or invented outcomes were added. Local experiments and sample figures remain labeled in their respective pages.

`case-interactions.mjs` passes mobile decision and timeline selection on all nine pages, plus Superforms pipeline completion, CompareFi product switching, GDC notice creation/hiding and audit entries, and Culprit's correct guess, rejection gate and reset. The source lint for the added stylesheet passes. The unit/DOM suite passes all 26 tests; its GPU fallback and React act warnings remain test-environment limitations.

Final case sweep: all 27 combinations of nine pages and three widths passed, with scenes ready, no runtime errors, broken images, page overflow or h1/h2 headings over two lines. Results and chapter captures are saved in `.taste-skill/cases/`. The production build passes; Vite still reports the existing lazy Three.js chunk above 500kB. The local app is running on port 4187. No publication is claimed.

## Superforms focused revision

The user's requested ceramic direction is retained without a redraw. The opening now presents rearrange, rewrite and restyle as three faster beats, with a staggered entrance, shorter transition settling, readable holds and pause/next/replay. Pause stops automatic progression and ambient motion; reduced motion starts without autoplay. The visible wording leads with making a form one's own rather than a database identifier.

The problem chapter has larger full-ink text, a wider measure, more paragraph space, and a distinct product boundary. Product imagery now shows the real builder in Build, Design, Preview and Ask AI, plus one homepage capture. Desktop and phone captures render the original builder component and CSS against an isolated sample workshop form; services are stubbed, no credentials or customer data are used, and no production writes occur. System fallback fonts differ from the live app's loaded webfonts. Screens can be opened at full resolution. Metadata records capture provenance.

Chapter order is problem, product, 21 aesthetics, product/design decisions, edit demo, submission architecture, measured repository counts, history, distribution. The four decision entries show the choice, creator benefit, cost and evaluation criteria directly. Alternatives are optional reading. The simplified demo starts with a visible five-question form, offers three plain-language examples and one apply action, and puts its operation trace in a disclosure. Initialization was missing from the old 3D scene. A second bug matched the word dropdown to drop and selected the reorder proposal; word boundaries now keep those intentions separate.

The distribution section uses the user's stated target of 2,000+ users in three months. 8,000+ in twelve months is explicitly a four-quarter planning scenario; 20,000 visits and 10% signup conversion are assumptions, not analytics. The strategy covers intent-led template SEO, demonstrations of real workflows, first-form activation, repeat use and the repository's proposed response-outcome roadmap. Competitor figures are linked in the page to Google's official response-limit documentation and Typeform's company/pricing pages, checked 14 October 2026. Capacity, business adoption and pricing are distinguished, with no invented Google Forms adoption total or market-share claim.

Review: desktop hero and decisions, the populated demo, phone problem text, and responsive app captures. Internal scores: design 7.5, usability 8.5, creativity 8, content 8; weighted score 7.95. Remaining tradeoffs are the long technical chapter and system-font fidelity in isolated builder captures. Browser interactions pass at 1440 and 390, including a separate reduced-motion pass. The inspector has no failures with three documented allowances: established project/metric labels; the actual monospace Terminal aesthetic; and an interactive screenshot gallery whose small thumbnails are under its picture-area threshold. Ceramic tones, deliberate decision surfaces, type sizes, the history scrubber and lack of footage remain defended warnings. No stock or generated imagery was added.

Drawer interaction now has two stages: hover or keyboard focus pulls the drawer with its papers resting inside; click opens the note selector and lifts an individual card. The hover preview retains a direct product link. Escape closes notes back to the open drawer, then closes the drawer. Hidden note controls are inert, and phone spacing expands only when notes are opened.

File selection refinement: opening a drawer staggers three labelled paper files into a visible fan. Click a paper tab to show the companion list and raise that file. The list, previous/next buttons and range slider share one selection state; unselected papers settle into the tray. Story and screenshot cards open the full case, and the destination card links directly to the live product. Motion is disabled for reduced-motion visitors.

Cabinet stability pass: the scene now caps at 990px, uses two columns through 1100px and smaller 220px paper files. Opening notes anchors the drawer below the fixed header; the inspector stays within the available viewport and scrolls when needed. Resting files retain project headings and brief/interface/domain previews. Card transforms use a single 420ms easing with no state-change delays. Hover targets stay still, hover selection waits 80ms, stale timers cannot close another drawer, and mobile card selection leaves scroll position unchanged. The stability browser check exercises rapid selection and upper-edge openings at 1440, 1024, 768 and 390px.

Homepage motion pass: starting an already running frame loop no longer resets its timestamp on every scroll or pointer event; a regression verifies elapsed time under repeated input. Scroll measurement is coalesced per frame. The hero entrance/reset, folio hinge/chapter selection and complete-file cover use shorter travel and durations. Work copy and the personal invitation reveal in separate local groups and clear their inline transforms, preserving object hover poses. Shelf targets stay fixed, its perpetual camera sway is removed, rendering resolution is capped at 1.5 and pending navigation timers are disposed. Reduced-motion shelf selection snaps immediately. Existing case interactions and the complete-file workflow remain verified.
The homepage inspector allowances preserve established content and the requested physical cabinet: eyebrow project/place labels, the small ceramic CTA shadow, functional outlined paper/drawer surfaces, compact navigation/annotation type and the software-first imagery. Its still-page rule measures DOM transforms on a direct #work route, which deliberately bypasses cinematic GSAP entrances and cannot count WebGL motion. These allowances are independent of the motion regression and real browser journey checks. Desktop/mobile look-and-fix review retains the existing art direction; no stock imagery or invented photographs added.
