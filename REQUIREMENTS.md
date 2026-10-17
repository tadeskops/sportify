# Sportify rule-book website requirements

Last updated: 17 October 2026

## Goal

Create a static community sports rule book for Sportify - The Address, Aundh-Baner Link Road. Publish the approved design through GitHub Pages at the `tadeskops/sportify` repository. A confirmed pre-booking is a commitment: last-minute withdrawal is unacceptable unless circumstances are genuinely unavoidable.

## Current scope and status

- Phase: published. Live at `https://tadeskops.github.io/sportify/`. Production is implemented outside `temp/`; pushes to `main` automatically test, build and deploy through GitHub Actions Pages.
- Retain the eight locally viewable, responsive concepts with a comparison gallery in ignored `temp/`.
- Concepts: Field Notes (editorial), Stadium (high-energy dark), Clubhouse (warm accordions), Playbook (dashboard), Quiet Rules (minimal long-form), and Gold Standard (badge-led black/gold).
- Seventh concept: Clubhouse Gold, requested as an additional demo combining Clubhouse's layout, rounded styling and accordions with Gold Standard's black/gold palette. Use the supplied Sportify badge as the primary identity and The Address logo as a supporting header/closing identity, without altering source artwork. Preserve the original six concepts.
- Eighth concept: Clubhouse Gold Light, a separate light companion with the same layout, rules, logos and interactions. Use ivory surfaces, muted gold accents and readable warm dark text. Preserve the dark demo unchanged.
- Archived concepts retain draft content and future sport previews. Production has General and Football rule books only; do not publish invented rules for other sports.
- Use the supplied Sportify badge locally; do not edit the source artwork.
- No booking, payments, login, or member tracking functionality is requested.

## Policy coverage

Latest approved exception: a player unable to participate due to unavoidable
circumstances such as an emergency is excluded from the contribution share.
Apply to General, Football and the cancellation summary, even without a
replacement or after contribution details were circulated. Notify the coordinator
as soon as possible to calculate/correct shares. This overrides the original
source's payment-finalisation cutoff for this exception only.

Retain applicable points from the generic draft based on the supplied JD Soccer rule book:

1. Prominent joining walkthrough: join the supplied Sportify WhatsApp group, find games planned for the following week, check the details and add your own name only when confirmed. Group membership alone does not reserve a place. Retain capacity, guest responsibility and waitlisting.
2. At least 24-hour cancellation notice; late backout payment unless replaced; Main List, Waitlist and Backout List; timely communication; attendance consequences and genuine-unavoidable-circumstance handling from the supplied source.
3. Venue-booker as session coordinator; respectful shared coordination. No individual owns the community: it is self-sustaining and managed by residents.
4. Monthly turf/venue booking responsibility rotates among different residents, announced in the group with a booking/payment/venue handover. This is distinct from rotating who pays for an individual session.
5. Transparent contributions; payment within 24 hours; venue-payer rotation; payment disclosure within 2-3 hours; source injury exemption.
6. Safe play, respectful language, encouragement, injury awareness, shared roles and captain/coordinator-led conflict resolution.
7. Sport-appropriate fair rotation, substitutions, late-entry rotation and immediate injury substitutions.
8. Equipment & hygiene is removed from General for now. Retain Football's equipment, bib washing, drying, fair duties, washing incentive and handover rules in Football only.

Football retains all five original JD Soccer sections, including every supplied
rule, 5-minute cycles, 1-6 sequence, 15-minute alternative, goalkeeping rotation,
injury exemption and washing incentive. Retain attribution and its original
18 April 2026 date in source metadata, not a public reference panel. Adapt relevant source points for General. Prior assistant
draft additions such as suspension, emergency proof, advance forfeiture and a
longer notice requirement are not production policy. Football's original
attendance/payment wording is preserved rather than silently rewritten.

## Design and interaction requirements

- Mobile-first readability, high contrast, visible keyboard focus, semantic landmarks, and labelled controls.
- Default to Ivory gold (light), including the initial HTML/loading screen and browser theme colour. Preserve an explicitly saved user theme when preferences are enabled.
- Ivory gold is the base CSS fallback as well as the configured/HTML default at every viewport, regardless of operating-system colour preference. Midnight gold requires an explicit user selection (or its saved preference).
- Bottom-of-page group note: display in a bordered grid card immediately above (not inside) the footer, with heading and message side by side on desktop and stacked on mobile. Inactive WhatsApp members will be removed during routine reviews and are always welcome to rejoin when ready to participate. Do not invent inactivity thresholds, review dates or a permanent exclusion.
- Reference-aligned floating controls: slim right-centred rail with direct circular theme swatches, serif/sans font samples and standard/larger reading samples. Use theme-tinted translucent surfaces that become transparent when idle; strengthen on hover/focus. Back-to-top uses a matching translucent circle after scrolling more than 400px; hide at the top, avoid palette overlap, support keyboard focus return and reduced motion. Public `backToTop` flag controls this independently of appearance.
- Palette grip must support dragging around the screen (mouse/touch), not merely floating in a fixed position. Keep it within viewport bounds on drag/resize. Click still collapses/expands; a completed drag must not toggle it. Provide keyboard arrow-key repositioning. Position is visit-only; manually positioned palettes do not auto-retract off-screen.
- Approved typography UI has one Standard/Larger size group, not separate font-style and size groups. Keep the classic font style (`fontPicker: false`), ignoring saved sans selections. Scale all headings/body/labels/navigation proportionally by 1.2x in Larger, using relative font units and preserving responsive layout.
- Keep the commitment message, cancellation deadline, payment deadline, and genuine-emergency exception prominent.
- The original six designs differ in composition and navigation, not just colours. The seventh is an intentional hybrid of Clubhouse and Gold Standard; the eighth is its light companion.
- Production rule navigation switches between General and the full supplied Football rule book. Each supports section links and search.
- Provide rule search with a clear result count and an empty state; preserve all content when the search is cleared.
- No external font, analytics, CDN, or backend dependencies. Use relative paths for GitHub Pages project hosting.
- Demos remain clearly marked drafts. Production does not collect confirmations, payments or approvals.
- Floating non-modal appearance rail shows dark/light gold and Standard/Larger reading size. Classic serif/Modern sans remains a configurable capability but is disabled in the approved UI. Remember preferences locally when enabled. Disabled controls must ignore stale saved choices.
- Desktop palette stays available and transparent when idle. On mobile it collapses and retracts 32px to the right border, leaving a discoverable arrow. Restore on tap and support keyboard focus. Grip toggles controls; Escape collapses them. This rail replaces the earlier large drawer/close-button layout.
- Repository configuration `config/site.js` enables/disables join calls to action, monthly rotation, football, search, contents navigation, appearance and its individual controls, preference storage, footer social navigation and individual social links. Parent switches govern child controls. No backend or in-browser config editor.
- Public social links: supplied Sportify WhatsApp invitation and The Address Instagram `https://www.instagram.com/theaddress_society`, verified from VibeHive configuration. Use accessible icons and both supplied community logos without editing artwork.
- Configurable "Where to book" directory with the supplied 4 Lions Academy - Pimple PlaySpots listing (`https://book.playspots.in/venues/4-lions-academy-pimple`). Provide coordinator-led booking steps: check next-week interest, confirm venue/location/slot/cost, read provider terms, book only after enough commitments, and share confirmation in the group. Do not claim unverified prices, live availability, facilities or travel distances. `venueBooking` and per-entry `enabled` control visibility; additional venues are config entries.
- Header calendar icon / "Book a turf" opens a modal venue picker on desktop and mobile. Select a turf to update the provider booking link and optional attendant name/phone. Initial label clarified by user as "4 Lions Academy - Pimple Nilakh". `bookingPicker` can disable this header control independently; it requires the parent `venueBooking` feature and enabled listings. Contact data is optional, public-business-only, config-driven and never invented; configured phone numbers render tap-to-call links. Empty contacts show a provider-contact notice, not a fabricated number. Support keyboard selection, Escape/backdrop/close dismissal and focus return.
- Native ES modules with separate content, configuration validation, rendering/search and appearance modules; CSS tokens shared by themes. No framework or package dependencies.
- Content refinement: General rules must be point-wise and concise, with no duplicated rule text across sections. Keep a three-step joining guide, two deadline summaries and a four-step booking checklist. Put ownership/monthly booking handover in Resident coordination only, and guest payment responsibility under Guests only. Preserve detailed Football rules; do not display the reference-only JD Soccer source/welcome/closing panel or reference-site description. If the joining guide is disabled, retain basic joining instructions in General.
- Rules-first reading flow: put the rule book directly after the commitment/deadline summaries, ahead of joining or venue details. Make "Read the rules" the primary hero action; retain one-click joining links. Show venue selection separately through the header's "Book a turf" dialog, with the four-step checklist expandable inside it. Do not duplicate the venue directory on the page when the picker is enabled. When `bookingPicker` is disabled, retain the linked directory below the rules.

## Repository and publishing requirements

- Repository location: `C:\CR7\TAMC\IRP_Repo\ta.sportify`.
- Remote: `https://github.com/tadeskops/sportify`, branch `main`.
- All Git activity must be under verified `tadeskops` identity, as specified in `AGENTS.md`.
- `temp/` is persistent local context and demo storage, always ignored and never committed or deployed.
- This requirements file must be committed/pushed and kept current with repository changes.
- Authentication blocker resolved: explicit `gh api --hostname github.com user --jq .login` returns `tadeskops`. Earlier host-unspecified checks targeted the enterprise server. Repository remote, branch and local author verified; temp and dist are ignored and were not committed. Initial publication completed successfully.
- `.github/workflows/pages.yml` tests and builds on `main` pushes (and manual dispatch on `main`), uploads only the allowlisted `dist/` output and deploys using GitHub Pages actions.
- Enable Pages with GitHub Actions once authenticated. Verify the workflow and expected project URL `https://tadeskops.github.io/sportify/` before claiming publication.
- Build copies only `index.html`, `assets/`, and `config/`. Local demos, context, instructions, tests and metadata never enter the deployment artifact.

## Acceptance checks

- Eight concept links open working static demos with the shared draft content.
- Search, clear, sport selection, accordions, and section navigation work.
- Desktop and narrow mobile views have no horizontal page overflow.
- Local assets resolve and no third-party resources are needed.
- Theme/font/size changes persist when enabled; disabled features disappear from UI and stale preferences cannot re-enable them.
- Joining links and footer social destinations are correct; monthly booking rotation and resident ownership model are clear.
- Football content retains source-specific timings, roles, payment exemptions and all five original sections.
- Static build passes tests and works at a project subpath; Pages uploads only production output.
- `temp/` is excluded from version control and production deployment.
- After `tadeskops` authentication: verify remote, author and ignored/untracked status; stage only intended tracked files; commit and push the up-to-date requirements and instructions.

## Verification record

17 October 2026: the six local demos and gallery passed 28 layout checks at
1440, 768, 390 and 320 pixels. Search, empty states, reset, sport previews
(36 checks), section navigation, Clubhouse accordions and keyboard skip links
passed. No uncaught JavaScript errors were observed; source copies match the
original hashes. Validation used direct local file URLs, not a published site.
Git ignore/remote/author verification and commit/push remain blocked on
`tadeskops` authentication. These records describe archived demos, not live deployment.

17 October 2026, hybrid addition: Clubhouse Gold and all six existing demos,
plus the updated seven-concept gallery, passed 32 layout/asset checks at the
same four widths. The new hybrid passed search, empty state, reset, all six
sport previews, accordion opening, section links and keyboard skip navigation.
Existing demos passed search/reset, Football preview and keyboard-skip
regression checks. Both supplied logos load without source-artwork edits.
No Git activity or deployment was performed.

17 October 2026, light companion: light/dark hybrid demos and the eight-concept
gallery passed 12 layout/asset checks at 1440, 768, 390 and 320 pixels. Search
and empty-state checks passed; reset, sport switching, accordion and contents
handlers passed with browser DOM activation. Pointer stability/keyboard
automation timed out, so those checks are not claimed for the new demo.
JavaScript syntax passed. Desktop appearance was visually reviewed.

## Production verification (17 October 2026)

- Nine dependency-free Node tests passed at the content-refinement milestone, including config/venue/contact validation,
  disabled-preference gating, general content/search, football requirements,
  escaped rendering and allowlisted publication output. Unexpected top-level
  output files explicitly fail the build.
- `npm run check` and `npm run build` pass. No dependency install was required.
- Built site tested via HTTP at `/sportify/` in an isolated browser tab with
  exact viewport sizes. Both themes, Modern sans and Larger text passed eight
  layout/asset checks at 1440, 768, 390 and 320 pixels without horizontal overflow
  or missing images.
- Theme/font/size persistence, pointer-operated controls, Escape/focus return,
  outside-click closing, transparent desktop idle and right-edge mobile idle
  were verified. A mobile panel clipping issue at 320px was fixed and retested.
- General and Football search, no-results/reset, the 15-minute football rule,
  all five football sections and direct Football fragment opening passed.
- Five feature/config profiles tested: all flags off, child appearance/social
  controls off, theme-only controls, empty venue list and disabled venue entries.
  Disabled sections/anchors and controls were absent as intended.
- Invalid configuration and failed module-load cases display explicit errors.
  Normal production navigation raised no uncaught browser errors.
- Venue, WhatsApp and Instagram destinations were checked. The PlaySpots page
  exposed only a client-rendered shell to fetch; no current booking terms or
  availability are asserted.
- Git ignore status, author, remote, commit/push, workflow execution and live
  GitHub Pages URL remain unverified: the available CLI still authenticates as
  `mj31939`, not `tadeskops`. Publication is blocked, not completed.
- Header venue-picker follow-up: eight desktop/mobile dark/light dialog layout
  checks passed at the four widths above. Initial focus, Escape/focus return,
  close-button dismissal, venue-to-provider link selection, optional contact
  rendering and tap-to-call targets passed. A second venue/contact was injected
  only in the isolated browser test; no fictional listings or phone numbers were
  saved to production config. `bookingPicker: false` removed the header/dialog
  while preserving the venue directory. Explicit Escape handling was added for
  embedded-browser reliability and retested. Normal checks logged no uncaught errors.

Content refinement review: General now has seven sections with 47 bullet points
(572 words; longest point 21 words). Long prose blocks and the duplicate community
overview were removed. All rules remain covered, including cancellation/payment
exceptions, resident coordination and bib-washing incentives. Football content
was not edited. Eight dark/light layout checks passed through 320px with Larger
text, along with search, source-panel expansion, football substitution lookup,
venue link, and disabled-join/monthly-rotation fallback checks. No uncaught browser
errors were observed. Publication remains deferred for local review.

Rules-first/reference-removal follow-up: 10 Node tests, syntax check and build
pass. Browser verification confirms the rules precede joining, venue information
opens separately, and the JD Soccer reference panel is absent. Football's five
sections and substitution search still work. The expandable booking checklist
retains four steps; Escape closes the dialog and returns focus to its button.
Eight dark/light checks with Larger text at 1440, 768, 390 and 320px found no
page/dialog horizontal overflow. Disabled-picker fallback, disabled booking and
disabled joining profiles pass. No uncaught errors in normal layout checks.
Local preview refreshed; no Git operations or publication.

Floating-controls follow-up: 10 tests, syntax check and build pass. Both themes
at 1440/390/320px pass transparent-control, no-overlap and no-overflow checks.
The up-arrow is hidden at 400px and visible at 401px; keyboard activation,
heading focus return, smooth scrolling, reduced-motion return and disabled-flag
gating pass. Mobile idle palette retracts 42px with a transparent background and
reopens by pointer. No uncaught errors during layout checks.

Draggable palette and unified typography follow-up: 11 Node tests and build
pass. Browser checks verify real pointer dragging (400px left/100px down),
both-corner bounds clamping, resize clamping, no toggle after drag, click toggle,
theme selection after drag and 20px keyboard movement. Measured font sizes for
hero/section headings, body, labels, navigation and branding scale exactly 1.2x.
Eight dark/light layout checks at 1440/768/390/320px pass with Larger text and
booking dialogs. Separate font-style buttons are absent; classic remains active.

## Live publication verification

17 October 2026: published as `tadeskops` to `main`, initial commit `0eb10f5`.
GitHub Pages uses Actions builds with HTTPS enforced. Deployment run
`https://github.com/tadeskops/sportify/actions/runs/39012999102` succeeded.
All 13 Node tests, syntax check and build passed before pushing. Live URL
`https://tadeskops.github.io/sportify/` returns HTTP 200; browser checks confirm
Ivory gold default, six General sections (no Equipment & hygiene), five Football
sections, emergency contribution exemption, correct PlaySpots picker link,
loaded images and 320px Larger-text layout without horizontal overflow or
uncaught errors. Every subsequent push to `main` runs the same deployment.
Earlier blocked/local-only verification records above are historical.
