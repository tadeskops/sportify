# Sportify

A resident-managed community sports rule book. Production combines the approved
Clubhouse Gold dark and light designs with a slim floating colour/font rail.

**Live:** [Sportify rule book](https://tadeskops.github.io/sportify/).
Published as `tadeskops`; pushes to `main` automatically test, build and deploy.

## Project references

- [Requirements and current status](REQUIREMENTS.md)
- [Repository instructions](AGENTS.md), including the mandatory `tadeskops`-only Git policy

## Run the production site

Node 20+ and Python 3 are sufficient. There are no package dependencies.

```powershell
npm test
npm run build
python -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8765/`. Stop the server with Ctrl+C. Serve over HTTP:
production uses native ES modules, so a direct `file:` URL is not supported.

## Feature configuration

Edit [config/site.js](config/site.js), then test, build and push. This is a public
repository configuration, not an in-browser admin editor or access control.

| Feature | Controls |
| --- | --- |
| `join` | Three-step joining guide and join calls to action; when off, basic instructions remain in General |
| `monthlyRotation` | Monthly booking responsibility section and matching General guideline |
| `venueBooking` | Venue information and booking guidance |
| `bookingPicker` | "Book a turf" dialog with expandable booking steps; when off, a directory below the rules replaces it. Requires `venueBooking` and an enabled venue |
| `gamePost` | "Post a game" header button and "Start a game list" joining-step button that compose the WhatsApp game-list message |
| `football` | Football selector, content access and football deep links |
| `search` | Rule search, result status and reset controls |
| `sectionNavigation` | Rule-section contents navigation |
| `backToTop` | Transparent floating up-arrow after scrolling more than 400px; keyboard accessible and reduced-motion aware |
| `photoBooth` | Photo booth and hero shortcut, only when at least one unexpired photo is present |
| `appearance` | Parent switch for the entire floating appearance panel |
| `themePicker` | Dark/light controls |
| `fontPicker` | Optional Classic serif/Modern sans controls; disabled in the approved UI |
| `textSize` | Single Standard/Larger size group scaling all typography proportionally |
| `rememberPreferences` | Local browser storage of appearance choices |
| `socialLinks` | Footer social navigation (parent switch) |
| `whatsapp` | All WhatsApp links, including joining calls to action |
| `instagram` | The Address Instagram footer link |

All flags are required booleans; unknown flags and invalid configuration cause
explicit errors. If all appearance controls are disabled, the floating panel is
omitted. Disabled controls use configured defaults, not old saved preferences.
The `appearance` object sets default theme, heading font, reading size and idle
delay. The right-centred rail shows circular theme swatches and a single Standard/Larger
text-size group directly, with labelled controls and
tooltips. The compact rail is 52px wide with 36px controls; touch devices retain
44px targets in a 60px rail. Idle opacity drops to 30%, with no background, blur,
border or selected-button fill. Pointer-selected controls do not prevent idle
fading after the pointer leaves; visible keyboard focus keeps controls active.
Drag its grip to move the palette anywhere within the screen; click
the grip to toggle the controls. Keyboard users can focus the grip and use arrow
keys to move it in 20px steps. The palette stays within the viewport on drag and
resize. Its position lasts for this page visit; Escape collapses the controls. Desktop controls
fade to a transparent background when idle. On mobile the rail collapses and
retracts 32px to a right-edge arrow unless manually positioned; tap to reopen. Hover/focus strengthens its
theme-tinted translucent surface. A separate translucent back-to-top icon
appears after 400px of scrolling, without overlapping the palette. It returns
keyboard focus to the page heading and respects reduced-motion preferences.

Ivory gold is the default, including the initial loading screen. A previously
saved theme still takes precedence when theme selection and persistence are enabled.
Classic typography is fixed in the approved UI (`fontPicker: false`); saved sans
preferences are ignored. Larger uses a 1.2x root size so headings, body text,
labels and navigation scale together, preserving their typography ratios.

The hero badge has a fine 2px, theme-matched gold rim with a bright champagne
highlight and a soft layered gold halo
that travels clockwise once every seven seconds. Only the decorative rim moves,
not the logo or card; reduced-motion preferences keep the highlight static.

Community text and links are also configurable. The WhatsApp invitation is
public by design. Never store secrets, payment details or private resident data
in configuration or static assets.

The `venues` array contains community-shared booking listings. Each requires a
unique lowercase slug `id`, boolean `enabled`, and `name`, `provider`, `sport`,
HTTPS `url` and `note` text. Add verified listings here or disable an individual
entry. If no entries are enabled, booking controls and the directory are
omitted. The initial listing is the user-supplied 4 Lions Academy PlaySpots URL.
No rates, live availability or facility guarantees are hard-coded; residents
confirm location, format, price and cancellation terms directly before booking.

The header's **Book a turf** button opens a keyboard-accessible venue picker.
**How to book a turf** in the hero opens the same dialog with management help
expanded and the selected venue's steps visible. Closing returns focus to the
button used to open it. With the picker disabled, it links to the fallback directory.
Its gold border highlight travels slowly around the edge once every 10 seconds,
pauses on hover/keyboard focus, and stays static with reduced-motion preferences.
Selecting a venue updates its booking URL and optional attendant contact.
The booking checklist expands inside this dialog, keeping venue details out of
the main reading flow. If `bookingPicker` is off, the directory and checklist
remain available below the rules through a "Where to book" link.
Use `contact: { name: "", phone: "" }` on a venue, or omit `contact` entirely.
Supply only approved public business contact details; `phone` must use
international format (`+` followed by country code and digits, 7-15 digits).
Blank values are not invented: no call link is shown and the picker directs
users to the provider for contact details. Contacts also appear on fallback venue
cards when supplied. More enabled venue entries automatically become picker options.

Optional `bookingSteps` on a venue is a nonempty array of instruction strings.
Steps appear for that selected venue in the picker and its fallback directory
card, followed by a reminder to notify the game group once confirmed. The
4 Lions instructions use the supplied PlaySpots route: venue, calendar date,
Cricket > Cricket 6A, available slot, and advance payment/date-time confirmation.
The shared 8-9:30 slot is not live availability; users must verify date and AM/PM.

Turf booking management appears under General's Resident coordination and in
the booking dialog/directory using shared policy text. Book one week ahead;
the booker follows up on confirmed numbers and cancels at least 24 hours before
play if insufficient (or earlier if the provider requires). Around festivals
and long weekends, the booker may check availability in the group on Friday.
Notify the group when cancelling; no fixed minimum player count is invented.
The turf booker is the game moderator and must recheck the listed player count
24 hours before play to arrange necessary booking changes. A third deadline
card highlights this duty alongside cancellation and payment reminders.

## Post a game list to WhatsApp

**Post a game** (header) and **Start a game list** (joining step 02) open a
composer for the group's usual "copy this message, add your name and paste"
list. Choose the sport, an optional game number, the venue (enabled venues by
`shortName`, **TBD**, or a typed **Other** venue), whether it is already booked,
one date (defaults to next Saturday) with probable start/end time or TBD,
tentative-time flag, an optional minimum count, the count stop and an optional
note. A live preview shows the exact text.

The minimum line (`🚨 Minimum count required to book the venue: 8 🛑`) appears
only for games that are not booked yet. Unbooked games prefill the sport's
default minimum; clear the field to leave the line out. Ticking **Venue already
booked** clears and disables the minimum, since it is no longer needed.

A game has exactly one date and time. The composer always has **Game 1**;
**+ Add game** appends another game card (a copy of the previous one on the
following day with the next game number, so only the differences need changing)
and **Remove** deletes extra games. For Saturday and Sunday, add two games. All
games go into one message, separated by a divider, each with its own `1. ` name
list and counts. Game numbers must differ.

When games fall on two or more dates, the message automatically starts with
`⚠️ Add names with Day (i.e., Sat & Sun)` (or `Mon, Sat & Sun`, etc.). Each game
ends with `Count stops at 8 🛑` directly followed by the divider:

```text
⚠️ Add names with Day (i.e., Sat & Sun)
————————————-
⚠️ Those who wish to join kindly copy this message, add your name and paste.
——————————-
Game 5: Cricket
Venue: 4 Lions (Not booked)
Date: 24 Oct Sat
Time: 7:30-9 AM (1.5 Hrs)

1. 

🚨 Minimum count required to book the venue: 8 🛑
Count stops at 8 🛑
——————————-
Game 6: Football
...
```

The preview is an editable text box: type in it to change anything before
sharing. Share and Copy always use the edited text. While edited, form changes
no longer overwrite it; **Undo my edits** rebuilds the message from the form.

**Share on WhatsApp** opens `https://wa.me/?text=...`: WhatsApp (app or Web)
opens with the message pre-filled, the user picks the Sportify group and taps
Send, so it is posted from their own account. WhatsApp offers no way for a
website to pre-fill a message into a specific group or to post on a user's
behalf; an invite link cannot carry text. **Copy message** plus **Open Sportify
group** is the fallback. Nothing is stored or sent by the site.

Defaults are in `config/site.js` under `gamePost` (validated):

```js
gamePost: {
  defaultStart: "07:30", defaultEnd: "09:00",
  sports: [{ id: "cricket", name: "Cricket", minPlayers: 8, maxPlayers: 8 }, /* ... */]
}
```

Add or edit sports there; counts are editable per message in the composer.

### Direct links (for the WhatsApp group description)

- `https://tadeskops.github.io/sportify/#book-turf` opens the Book a turf picker
  (or scrolls to the venue directory when `bookingPicker` is off).
- `https://tadeskops.github.io/sportify/#post-game` opens the game-list composer.

Closing the dialog clears the hash, so the same link can be tapped again.

### Organiser guides (G7)

The General rule book's **G7 Organise a game** section gives players precise
steps, with action links:

- `https://tadeskops.github.io/sportify/#G7.1`: how to prepare and post one or
  more games on the WhatsApp group (links: Post a game, Open Sportify group).
- `https://tadeskops.github.io/sportify/#G7.2`: how to book the turf once the
  minimum count is reached (links: Book a turf, G3.3 booking management).

Post the list first and book only after the minimum count is reached. The links
come from `generalRules(features, { postGame, bookTurf, whatsapp })` in
[app.js](assets/js/app.js); disabled features drop their links, and without the
composer G7.1 describes the manual template.

### Rule links (point players to a specific rule)

Every section, sub-rule and point shows a reference badge. Tapping it copies a
link such as `https://tadeskops.github.io/sportify/#G2.1`. Opening that link
switches to the right rule book, expands the section and highlights the rule.
Lower-case links (`#g2.1`) work too.

| Prefix | Rule book | Example |
| --- | --- | --- |
| `G` | General (all sports) | `#G1.2` Guests, `#G2.1.1` |
| `F` | Football | `#F1.1.2` Guest Players, `#F2.2.1` |
| `C` | Cricket (reserved) | |
| `B` | Badminton (reserved) | |
| `T` | Table Tennis (reserved) | |

`G` is used for General because it is not the initial of any sport. Each
reference has the form section, then sub-rule, then point (`G2.1.3`). Football
keeps its source numbering. General blocks carry explicit `number` fields in
[general.js](assets/js/general.js), so optional content such as the join guide
(G1.3) or monthly rotation (G3.2) never renumbers the rules around it. When you
add a rule, give it the next unused number rather than renumbering existing ones.

## Source and structure

- [General rules](assets/js/general.js): relevant shared rules and resident-led coordination.
- [Football rules](assets/js/football.js): the supplied five-section JD Soccer rule book, retained with source attribution and original update date; no new draft-only penalties.
- [Rendering and search](assets/js/rulebook.js) and [appearance](assets/js/appearance.js): independent UI modules.
- [Styles](assets/css/site.css): responsive layout with shared dark/light tokens.
- [Build](scripts/build.mjs): copies only `index.html`, `assets/`, and `config/`.
- [Tests](tests/site.test.js): Node built-in runner; no install required.
- [Game list composer](assets/js/game-post.js): pure message builder plus the "Post a game" dialog ([tests](tests/game-post.test.js)).

The static site does not add names, book venues or collect payments. Residents
join the WhatsApp group and add their own names to planned games for the
following week. Booking responsibility rotates monthly in the group; there is
no invented online roster or individual community owner.
An outlined grid card immediately above the footer explains routine removal of inactive WhatsApp members and welcomes
them to rejoin when ready to participate; no fixed inactivity period is imposed.

General guidelines use concise bullet points. Detailed guest, cancellation,
payment and rotation rules have one home each; the top deadline tiles
are summaries, not additional policies. Community ownership and monthly booking
handover live in Resident coordination rather than a second overview section.
General has six sections; Equipment & hygiene is removed for now. Football's
equipment and hygiene section remains available unchanged.
The supplied Football rules retain their sport-specific requirements, with the
approved unavoidable-circumstances contribution exemption applied consistently.
Players unable to participate due to unavoidable circumstances such as an
emergency are excluded from the contribution share, even without a replacement
or if contribution details have already been circulated. Notify the coordinator
as soon as possible so amounts can be calculated or corrected.
The reference-only JD Soccer welcome,
source panel and sign-off are not displayed, as requested. Source attribution
and its original date remain in the content module for provenance.
The rule book follows the commitment/deadline summaries, before the joining
guide or fallback venue directory. "Read the rules" is the primary hero action;
joining remains one click away from the header and hero.
Sport selectors and search share one desktop row; they stack at 850px and below.

## Community photo booth

Add approved **JPG/JPEG, PNG, WebP or AVIF** images directly to
[`assets/photos/`](assets/photos/), then commit/push them to `main`. No manual
photo list is needed. Use descriptive filenames (for example,
`sunday-football-team.jpg`); they become captions and alternative descriptions.
Do not add subfolders or other file types. Keep `.gitkeep` so an empty folder
continues to exist.

The build scans the folder and generates `assets/photo-booth.json` in the
deployment output. The photo booth appears after the joining guide and before
the closing section, with a **Photo booth** hero shortcut. Empty/expired folders
produce no photo booth or shortcut. A single image stays still; multiple images
rotate every six seconds with Previous/Next and Play/Pause controls. Hover,
keyboard focus, an off-screen section or a hidden tab pauses rotation.
Reduced-motion users get manual navigation. Read failures are reported visibly.

Configuration in [config/site.js](config/site.js):

```js
features: { /* other required flags */ photoBooth: true },
photoBooth: { autoRotate: true, intervalMs: 6000 }
```

Set `photoBooth` to false to hide the feature and omit all photos from the next
deployment. Set `autoRotate` to false for manual viewing; intervals must be at
least 3000ms.

### Three-calendar-month retention

- Each image expires **three calendar months after its first Git addition**,
  using the original addition commit's UTC timestamp, not its filesystem date or
  last edit. A rename preserves history; editing/rebuilding does not extend retention.
- Month ends clamp to the last valid day (31 January becomes 30 April). This is
  not 90 days and not a calendar-quarter purge.
- A daily Pages workflow at **03:17 UTC / 08:47 IST** removes expired source
  photos, commits only those removals as `github-actions[bot]`, then builds and
  deploys in the same run. This is the user-approved, narrowly scoped Git-identity
  exception. Normal changes still use `tadeskops`.
- GitHub may delay scheduled jobs or disable them after repository inactivity.
  Push/manual runs also clean expired photos; maintainers should monitor Actions.
  The build and browser exclude expired photos even before scheduled deletion.
- Deletion removes photos from the current branch and subsequent Pages output,
  **not older Git history, previous Actions artifacts, caches or downloaded copies**.
  Do not treat this public repository as private or as guaranteed permanent erasure.

Local photo builds need full Git history, GitHub CLI and verified `tadeskops`
authentication. Uncommitted photos use creation time for local preview only,
with a warning; publication anchors retention to their first commit.

Only add photos with permission to publish, especially photos of children.
Remove GPS/private metadata before uploading. This is a maintainer-managed
folder, not a public upload endpoint or an automatic WhatsApp importer.

## Local design archive

The persistent, ignored `temp/` folder contains the comparison gallery, eight demos,
source draft, and design context. It is never committed or deployed.

From this repository folder, start a loopback-only preview:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory temp
```

Open `http://127.0.0.1:8765/`. Stop the server with Ctrl+C.
The demos also support directly opening `temp/index.html`.

No install or build is needed. The demos use plain HTML, CSS, JavaScript,
system fonts, and local artwork. Sport-specific destinations are explicitly
unpublished previews, not approved rules.

## GitHub Pages

[Publish Sportify](.github/workflows/pages.yml) tests and builds each push to
`main`, uploads only `dist/`, and deploys using the official Pages actions.
Manual dispatch also supports `main`; other branches do not publish.

Before **any Git command**, verify `gh api --hostname github.com user --jq .login` returns exactly
`tadeskops`. Then verify the local author/email belongs to that account, the
remote is the intended HTTPS repository, and the credential helper uses that
account. Do not force-add `temp/` or change global identity settings.

Once authenticated, enable **Settings > Pages > Build and deployment > Source:
GitHub Actions** in `tadeskops/sportify`. Commit and push only intended production
files, requirements and instructions. Inspect the workflow run and verify its
reported live URL (expected project URL: `https://tadeskops.github.io/sportify/`).
Do not mark the site published until the run and live page are verified.

Initial publication verified on 17 October 2026: Actions Pages source enabled,
HTTPS enforced, all 13 tests passed, and the production page returned HTTP 200.
Live browser checks verified Ivory gold defaults, six General/five Football
sections, emergency contribution exemption, venue picker, image loading and
320px Larger-text layout with no horizontal overflow or uncaught errors.

All asset URLs are relative, supporting the `/sportify/` project path. The
ignored local demos, persistent context, tests, instructions and repository
metadata are not part of the deployment artifact. A dirty output directory
containing unexpected top-level files fails the build instead of publishing
them.
