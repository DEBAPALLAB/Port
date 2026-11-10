# About revision, 30 October 2026

The About page now uses the supplied LinkedIn writing as personal source material: product judgment, self-auditing, team dynamics, AI ethics, playful experiments and life outside work. All existing personal chapter anchors remain: home, school, college, hackathons and music. The shared competition records have more specific accounts; the voice setup continues to consume the same biography exports.

Direction: **Type and nothing else**, seed **476297537**. Manrope and the ceramic green/charcoal palette are retained. No redraws. The oversized opening is followed by the supplied personal photographs; the existing selectable competition notebook and chapter navigation are retained and redesigned inside this direction.

Idea: On this page, Dev's tendency to follow a question into a simulator, six PRDs or a panel conversation becomes a set of rabbit holes visitors can open.

Live thing: four question controls reveal the corresponding account, with links to the actual notaprompt and WhatsApp studies where applicable. Competition selection, scroll-aware chapter navigation, keyboard focus and reduced motion remain available.

Subject inventory: Dibrugarh; IIIT Nagpur; design beginning in Class 11; Snapchat Opinion Leader programme; Lucide Tech and Superforms; product work at Mindspace AI; a 54/100 self-audit; 140 agents in the Quibi backtest; six WhatsApp PRDs; FEEL! 2026; seven podium finishes across several disciplines; singing and guitar.

The argument is: curiosity leads to ambitious work (opening and current roles); concrete questions show how Dev thinks (question browser); public reasoning invites scrutiny (writing and actual product capture); design and engineering have a personal history (four chapters); collaboration matters beyond the trophy (competition notebook); music and community belong beside the work (personal close).

## Images and content

Three existing personal photographs from `public/my photos/` replace the empty photo reservations. They are used as supplied, with CSS crops only. The fourth raster image is the existing notaprompt product capture at `public/cases/notaprompt/desktop-0.jpg`. No stock imagery, generated portraits, sample accomplishments, found media or new drawings. No external image credits are needed. The candid alongside the music section is a personal photograph, not represented as a performance.

Competition dates not established by the new accounts are omitted rather than extrapolated from relative LinkedIn dates. One Quibi backtest is described as one data point, not proof of predictive accuracy. The build sprint remains something being put together, without a claim it happened.

## Visual review

ROUND 1
Seen in one second: I get carried away.
Idea (one sentence): The actual questions Dev pursues become the navigation into his thinking.
Live thing: Question browser with four distinct personal accounts.
Layout words by section: hero=type / photos=unequal spread / roles=split / questions=selector / writing=image split / history=sticky navigation / competitions=notebook / music=portrait split / contact=type.
Scores: design 7.5 · usability 7.5 · creativity 7.5 · content 8.5 → overall 7.6
Caps applied: initial inspector failures cap the result at 6.0 until corrected.
Top three problems:
1. Desktop page 02: three-line place stack; use a two-line route.
2. Mobile page 01: role statement too long at display-paragraph size; shorten and keep a lead size.
3. Desktop fold: left portrait crop loses the face; move its object position upward.

ROUND 2
Seen in one second: The oversized personal opening, then the photographs.
Idea (one sentence): Dev's questions are the entry points into specific decisions and experiences.
Live thing: Question selection and competition selection.
Layout words by section: hero=type / photos=spread / roles=split / questions=selector / writing=image split / history=sticky navigation / competitions=notebook / music=portrait split / contact=type.
Scores: design 7.5 · usability 8 · creativity 7.5 · content 8.5 → overall 7.75
Caps applied: inspector still flags photo captions as eyebrows; removed the nonessential duplicate captions.
Top three problems:
1. Mobile fold: duplicate photo captions take reading space and trip the eyebrow detector; retain descriptive alt text instead.
2. Desktop page 02: chapter selector can jump ahead to the following chapter; narrow the observer's reading band.
3. Tablet: too many intermediate type sizes; consolidate into five roles.

ROUND 3
Seen in one second: I get carried away.
Idea (one sentence): A builder's curiosity becomes four selectable stories about product reasoning, ethics and experimentation.
Live thing: Four working question controls, plus the existing competition notebook.
Layout words by section: hero=type / photos=spread / roles=split / questions=selector / writing=image split / history=sticky navigation / competitions=notebook / music=portrait split / contact=type.
Scores: design 7.5 · usability 8 · creativity 7.5 · content 8.5 → overall 7.75
Caps applied: none; four raster images include three personal photographs and one real product capture.
Remaining limitations:
1. Mobile page 01: question answers require reading below the selector; the selected state remains visible and controls are comfortably sized.
2. Desktop page 02: the history anchor remains pinned across three screens; its active chapter changes with scrolling and gives the reading column a stable location.
3. Photography is limited to the three supplied personal images. No performance/event footage was supplied, so no unrelated video is introduced.

## Verification

- Production Vite build passes. Existing large-chunk warning remains.
- All 39 existing unit/DOM tests pass; their existing WebGL/act environment warnings remain.
- Source lint: zero failures, zero warnings.
- Final production browser inspector at 1440, 768 and 390px: zero failures. Warnings: no footage and long history pin, defended above.
- All ten final screenshot sheets/folds opened and reviewed in `.taste-skill/about-after/`.
- Updated `check:personal` passes at all three widths, including real image loading, all four question narratives, story chapters, competition changes, drawer regressions, no page overflow, reduced motion and keyboard entry.
- Captures: `.taste-skill/about-before/`, `.taste-skill/about-after/`, `.taste-skill/personal-cabinet/`.
