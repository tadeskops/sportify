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
| `football` | Football selector, content access and football deep links |
| `search` | Rule search, result status and reset controls |
| `sectionNavigation` | Rule-section contents navigation |
| `backToTop` | Transparent floating up-arrow after scrolling more than 400px; keyboard accessible and reduced-motion aware |
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

## Source and structure

- [General rules](assets/js/general.js): relevant shared rules and resident-led coordination.
- [Football rules](assets/js/football.js): the supplied five-section JD Soccer rule book, retained with source attribution and original update date; no new draft-only penalties.
- [Rendering and search](assets/js/rulebook.js) and [appearance](assets/js/appearance.js): independent UI modules.
- [Styles](assets/css/site.css): responsive layout with shared dark/light tokens.
- [Build](scripts/build.mjs): copies only `index.html`, `assets/`, and `config/`.
- [Tests](tests/site.test.js): Node built-in runner; no install required.

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
