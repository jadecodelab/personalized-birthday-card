# Project Journal: Personalized Birthday Card

## Table of Contents

- [Why I Built This](#why-i-built-this)
- [Working With Codex](#working-with-codex)
- [Phase 0: Idea and MVP Planning](#phase-0-idea-and-mvp-planning)
- [Phase 1: Project Foundation](#phase-1-project-foundation)
- [Phase 2: Core Builder](#phase-2-core-builder)
- [Phase 3: Personalization and Templates](#phase-3-personalization-and-templates)
- [Phase 4: Export, Sharing, and Deployment](#phase-4-export-sharing-and-deployment)
- [Phase 5: Next Polish Phase](#phase-5-next-polish-phase)
- [What I Learned So Far](#what-i-learned-so-far)
- [Future Journal Entries](#future-journal-entries)

## Why I Built This

The idea started from wanting to create personalized birthday cards for my loved ones and turn a simple celebration into something more personal and memorable.

I did not want the app to feel like a plain form. I wanted it to feel closer to building a tiny celebration: choosing a style, adding a favorite photo, moving decorations around, and ending with something that could actually be downloaded or shared.

The first version of the idea had a few important pieces:

- Let the user enter the recipient's name and birthday.
- Let the user choose a birthday message or write their own.
- Let the user upload a photo.
- Let the user choose a card template.
- Let the user download or share the final card.

I decided to build it one feature at a time instead of trying to create the entire app in one pass. That became one of the most important parts of the project. Each small step gave me a chance to test the experience, notice what felt awkward, and improve the design before moving forward.

## Working With Codex

I built this project while working with Codex as my coding assistant.

I wanted to be transparent about that because it is part of the real development process behind this app. Codex helped with implementation, debugging, and explaining technical choices, but I guided the product direction, decided what features mattered, reviewed the app in the browser, requested changes, and approved commits.

This workflow helped me practice a modern way of building software:

- Breaking a broad idea into small, testable features.
- Communicating requirements clearly.
- Reviewing generated code instead of accepting it blindly.
- Testing changes visually in the browser.
- Making product decisions based on how the app actually felt to use.
- Keeping a clean Git history with regular commits.

Using Codex did not remove the need to think like a developer. It made the collaboration faster, but I still had to decide what the app should become, identify what did not feel right, and keep improving the user experience.

## Phase 0: Idea and MVP Planning

Before writing the full app, I broke the idea into an MVP.

The first MVP was focused on the smallest useful version of the product: a user should be able to enter birthday card details, personalize a message, choose a style, add a photo, and create something they could send.

I also decided to work in small phases:

1. Build a working base.
2. Add one feature.
3. Review it in the browser.
4. Adjust it if needed.
5. Commit the working version.

This gave the project a steady rhythm. Instead of feeling like one large app, it became a series of small decisions.

## Phase 1: Project Foundation

### Starting With the Scaffold

The first implementation step was scaffolding the app with React, Vite, and TypeScript.

At this point, the app did not have birthday card features yet. The goal was to create a clean technical foundation: a working development server, a TypeScript setup, a basic React entry point, and a project structure that could grow.

This was also when I learned what "scaffold" means in a project. It is not the finished app. It is the starter structure that gives the project a working frame.

Related commit: `chore: scaffold react vite app`

### Creating the First App Shell

After the app was running, I added the first real interface: a builder layout with controls on one side and a preview area on the other.

This changed the project from "a React app" into "a birthday card app." The preview was important because the user should be able to see the card changing as they customize it.

The first layout was intentionally simple. It gave the project a visual direction before adding too many controls.

Related commit: `feat: add birthday card builder layout`

## Phase 2: Core Builder

### Adding Recipient Details

Next, I added recipient information.

The app started with a name input, then birthday details. At first, the birthday included a full date, but I changed it to month and day only. That made more sense for a birthday card because the year is usually unnecessary and can feel too personal.

This was a small change, but it made the app feel more thoughtful. Good user experience is often about removing details that do not need to be there.

Related commits:

- `feat: add recipient name input`
- `feat: add birthday month and day input`

### Creating Message Options

The next feature was message customization.

I added preset messages so a user could quickly choose a tone, such as warm, funny, or heartfelt. Then I added custom editing so the user could change both the headline and the message body.

This part went through an important design decision. At one point, custom messages behaved like their own separate style, but that made the templates feel less consistent. The better solution was to let users edit the message on any template.

That made the app more flexible without making the design feel scattered.

Related commits:

- `feat: add message presets`
- `feat: add custom message editor`

## Phase 3: Personalization and Templates

### Making the Card Feel Visual

Once the basic inputs worked, the card needed personality.

I added multiple templates, photo upload, and visual decorations like a birthday cake, flowers, balloons, a gift, and a Happy Birthday tag. This is when the app started to feel fun instead of just functional.

The templates were not only color changes. Each one needed a different visual mood:

- A soft, sweet style.
- A playful confetti style.
- A bold pop art style.
- A photo-focused style.

This stage taught me that visual polish is not just about adding decoration. The arrangement matters. White space, photo placement, sticker position, and text hierarchy all change how the card feels.

Related commit: `feat: add card templates and photo preview`

### Letting Users Move the Design Pieces

After seeing the decorated templates, I wanted more control over the final card. A fixed arrangement did not feel personal enough.

The next step was making the photo, stickers, and Happy Birthday tag movable. This changed the app from a template selector into a small design tool.

This was one of the most satisfying features because it gave users creative control. Instead of accepting a layout, they could shape the card themselves.

It also introduced more technical complexity. The app had to track element positions, support dragging, keep each template's layout separate, and still export the final card correctly.

Related commit: `feat: add movable card elements`

## Phase 4: Export, Sharing, and Deployment

### Adding Download and Share

Once the card could be customized, it needed a real finish line.

I added the ability to download the card as an image and share it using the browser's native share feature when available. If sharing is not supported, the app falls back to downloading the PNG.

This feature made the project feel much more complete because the user could actually take the card out of the app and send it to someone.

It also required careful testing. The export needed to include the uploaded photo, the selected template, the message, and all moved elements exactly as they appeared in the preview.

Related commit: `feat: add card export actions`

### Preparing the Portfolio Version

After the main builder worked, I added screenshots, improved the README, and deployed the app with Vercel.

This step was not about adding a new app feature. It was about presenting the project clearly. A portfolio project needs more than working code. It should explain what the app does, what tools were used, what I learned, and where the project could go next.

The README became the quick overview. This journal is the deeper story.

Related commits:

- `Add README and screenshots`
- `Update README`

## Phase 5: Next Polish Phase

The next phase is focused on making the app feel more guided and more magical.

### June 14, 2026: Guided Builder Wizard

The first polish feature in this phase was turning the builder into a guided wizard.

Before this change, the left side of the app showed all controls at once. It worked, but it could feel like a lot to take in. I wanted the experience to feel more intentional, so I organized the builder into five steps: Recipient, Message, Photo, Customize, and Download.

The live preview still stays visible, which is important because users should see the card respond as they make choices. The change is not about hiding the card. It is about making the editing process feel calmer and easier to follow.

What changed:

- Added a step progress indicator.
- Added Back and Next navigation.
- Moved the existing controls into focused wizard steps.
- Added a final Download step with download and share actions.
- Refined the progress indicator into a simple dot timeline.
- Tightened the small-screen card layout so longer messages stay inside the card frame.
- Standardized the message area's bottom spacing across card styles.
- Kept the existing live preview, templates, photo upload, draggable layout, and export behavior working.

What I learned:

- A better interface is not always about adding more features.
- Sometimes the biggest improvement is reorganizing what already works.
- A guided flow can make a creative tool feel less overwhelming.

How I tested it:

- Ran the production build.
- Clicked through all five steps in the browser.
- Checked the layout on desktop and mobile-sized viewports.
- Tested the longer Heartfelt message on Sweet and Pop Art templates.
- Confirmed the page did not create horizontal overflow.

Related commit: `feat: add guided builder wizard`

### June 19, 2026: Preview Guidance and Photo Resizing

After reviewing the guided builder, I noticed that movable card elements were powerful but not obvious enough. A user might not realize they can drag the photo, birthday tag, and stickers directly on the preview.

To make that interaction clearer, I added a short guide near the live preview and inserted a dedicated Preview step before Download. I also replaced the temporary photo size control with a more natural interaction: desktop users can select the photo and resize it from the corners, while mobile users can pinch to resize.

What changed:

- Added a Preview step between Customize and Download.
- Added a brief preview guide for movable stickers, the tag, and the photo.
- Added desktop corner resize handles when the photo is selected.
- Added mobile pinch resizing for the photo.
- Clarified the Customize step instruction so users know to scroll to the preview for final adjustments.
- Stored photo size separately for each template.
- Prevented the photo from being dragged outside the card boundaries.
- Made Reset layout restore the current template's photo size.
- Kept downloaded card exports aligned with the adjusted photo size.
- Removed duplicate Reset layout controls from the guided steps so the final preview stays cleaner.
- Polished the six-step progress indicator so it fits across desktop and stacks neatly on small screens.

What I learned:

- A feature can exist technically but still need a small guide to be discoverable.
- Giving users both position and size control makes the card feel more personal.
- Direct manipulation often feels better than a form control for visual design tools.

Related commit: `feat: add preview guide and photo sizing`

### June 23, 2026: Splitting Builder and Recipient Routes

On June 23, 2026, I created a new branch, `envelope-feature`, off main to work on this phase without touching the working app on `main`. This is also the point where I switched assistants, from Codex to Claude Code, for this project. I want to be upfront about that the same way I was about using Codex: the working process hasn't changed. I still decide what gets built, review every change before it's committed, and test in the browser myself.

Before any envelope animation, sound, or shareable link could be built, the app needed two separate experiences instead of one. Up to this point, `App.tsx` was a single file that handled the entire wizard, every drag/resize/pinch interaction, the PNG export pipeline, and the live preview all at once. A recipient opening a finished card was always going to need a much lighter experience than someone building one, so the first step of this phase was carving out that boundary before adding anything new on top of it.

I added a router and split the app into a `/create` builder route and a `/card` recipient route. The card's visual markup (the graphics, ribbon, photo frame, and message) moved into its own `CardPreview` component so both routes render the same card instead of keeping two copies in sync. `CardPreview` takes an `interactive` flag: the builder gets full drag-and-drop and resize exactly as before, while the recipient route renders the same visual statically, with no drag handles. For this commit, `/card` shows a sample card rather than a real one, since shareable links (passing an actual finished card to that route) is its own piece of work still to come.

What changed:

- Added `react-router-dom` and a router shell in `App.tsx` with `/`, `/create`, and `/card` routes (`/` redirects to `/create`).
- Moved the wizard, all interaction state, and the export pipeline into `src/pages/CreatePage.tsx`, unchanged in behavior.
- Extracted the card's visual markup into `src/components/CardPreview.tsx`, reused by both routes.
- Added `src/pages/CardPage.tsx`, a static recipient view rendering a sample card.
- Moved shared constants and types (templates, message presets, default layouts) into `src/lib/cardData.ts` so both routes can use them without duplication.

What I learned:

- Splitting a monolith is its own task, separate from the feature it's in service of. Doing the route split as its own commit, with zero behavior change to the builder, made it easy to verify nothing broke before any new feature touched the code.
- A shared presentational component (`CardPreview`) is a cleaner seam for "the recipient sees a different version of this" than branching logic inside one big component.

How I tested it:

- Ran `npm run build` to confirm the new file layout still type-checks.
- Ran the dev server and walked through the builder wizard end to end, dragging stickers and resizing the photo, to confirm no regression from the original single-file version.
- Visited `/card` directly and confirmed it renders a static sample card with no resize handles or drag behavior.

Related commit: `feat: split builder into /create and /card routes`

### June 23, 2026: Shareable Card Links, No Backend

The original idea for shareable links, written down a few entries ago, was "links for cards without uploaded photos" because I assumed the photo would have to live on a server somewhere. My actual priority right now is a working demo by tomorrow, not the most scalable version of this, so I asked: optimize for speed of implementation over scalability. That changed the whole approach. Instead of standing up a backend, the entire card, including a compressed copy of the uploaded photo, gets encoded directly into the `/card` link itself. No server, no database, no account to create. It's not how I'd build this for real long-term, but it gets the actual feature working today, photo and all, which is what tomorrow needs.

Testing this in an actual browser, not just reading the code, caught two real problems. First, the generated link was long enough (the photo pushes it to roughly 15-20 KB of text) that the dev server rejected it outright with a 431 "Request Header Fields Too Large" error — a server-side limit I hadn't considered. The fix was putting the encoded data after a `#` instead of a `?`: browsers never send the part of a URL after `#` to the server at all, so the size limit stops applying. Second, I noticed the UI was saying "Could not create the link" even when the link had clearly been generated and was sitting right there on screen — turned out a failed clipboard-copy attempt was being reported as a failed link creation. Both were the kind of bug you only catch by actually running the thing.

What changed:

- Added a "Create card link" button next to Download and Share in the Download step.
- The uploaded photo gets resized and compressed client-side before it's encoded, to keep the link a reasonable size.
- The full card (recipient name, birthday, message, template, layout, photo scale, and the compressed photo) is base64-encoded into the link's URL fragment (`#d=...`), not its query string.
- `/card` decodes that and renders the real card. With no link data, it now shows a card clearly labeled as a demo instead of quietly pretending to be a real one.
- Fixed the clipboard-copy bug so a copy failure no longer reports as a link-creation failure.

What I learned:

- Running the feature end-to-end in a browser found two bugs that reading the code never would have.
- "Optimize for speed, not scalability" is a real, legitimate way to scope a feature, not a shortcut to be embarrassed about. It's the reason the photo made it into the link at all today instead of waiting on backend work.
- Anything that doesn't need to be seen by the server belongs after the `#`, not in the `?`.

How I tested it:

- Built a full card with a real uploaded photo, generated its link, and opened that link fresh to confirm the actual name, message, and photo appeared, not the sample card.
- Confirmed visiting `/card` with no link data still shows a card clearly labeled as a demo.
- Confirmed the clipboard fallback message is now accurate when copying isn't available.

Related commit: `feat: shareable card links with the real photo, no backend`

### June 23, 2026: Envelope-Opening Animation

With `/card` able to show a real card and the real photo, the next piece was making the recipient's first moment feel like opening an actual gift instead of just loading a webpage. I built a self-contained `EnvelopeReveal` component that wraps the card on `/card`: a closed envelope addressed "To: [name]" sits in front of the real card until tapped, then the flap flips open and the whole envelope fades away to reveal the card underneath. I kept this CSS-only, no animation library, for the same reason the link feature stayed backend-free — it's fast to build and has nothing extra to install.

Looking at it on screen, not just reading the CSS, caught a real bug: the first version rotated the flap open but never faded it, so after the rotation finished a thin sliver of the flap was still visible, overlapping the top of the revealed card. The fix was fading the flap's opacity alongside its rotation, not relying on the rotation alone to make it disappear.

What changed:

- Added `EnvelopeReveal` (`src/components/EnvelopeReveal.tsx`), used only on `/card` — the builder's live preview is untouched, no envelope there.
- Closed state: envelope addressed to the recipient with a "Tap to open" prompt.
- Open state: flap flips via a CSS `rotateX` transform, then the whole envelope fades while the real card scales and fades in underneath.
- Respects `prefers-reduced-motion` — the open state applies instantly with no transition for anyone who has that setting on.

What I learned:

- A transform without a matching opacity fade can leave a visible artifact once something rotates past edge-on to the camera. Looked fine in my head; wasn't fine on screen until I actually looked.
- Self-contained UI state (the envelope owns its own open/closed flag) is a clean fit for an interaction that's purely visual and doesn't need to affect anything else in the app.

How I tested it:

- Built a real card with a photo, generated its link, opened it like a recipient would, and confirmed the envelope appears closed first, opens on tap, and reveals the actual card and photo underneath.
- Took screenshots before, mid-open, and after specifically to catch the flap artifact, since that bug was invisible just from reading the CSS.

Related commit: `feat: envelope-opening animation on the recipient view`

### June 23, 2026: Sound Effect on Envelope Open

Sound was next. Downloading and licensing an audio file felt like more setup than the feature was worth at demo speed, so the chime is synthesized in the browser instead, using the Web Audio API: two short sine-wave notes shaped with a volume envelope. No asset file, nothing to license, nothing to load.

The one real constraint here is that browsers block audio until a genuine user gesture creates or resumes the `AudioContext`. Calling the chime function synchronously inside the same click handler that opens the envelope satisfies that automatically — no special-casing needed.

What changed:

- Added `src/lib/sound.ts` with a `playOpenChime()` function that synthesizes a two-note chime via Web Audio oscillators and gain envelopes.
- `EnvelopeReveal` calls it the moment the envelope is tapped, right as the open animation starts.
- Wrapped in a `try`/`catch` so a browser without Web Audio support just opens the envelope silently instead of breaking anything.

What I learned:

- Not every "add a sound effect" ask needs an audio file. For a short UI chime, synthesizing it is faster and sidesteps any licensing question entirely.
- I confirmed the `AudioContext` actually gets created at the moment of the click rather than just trusting the code looked right on read-through.

How I tested it:

- Verified an `AudioContext` is created exactly when the envelope is tapped, with no console errors, and that the card still reveals correctly with the sound wired in.
- Listening for the sound itself isn't something I can verify from code or screenshots — that part's a manual check, on my own machine.

Related commit: `feat: play a chime when the envelope opens`

### June 23, 2026: Mobile Pass and Link Previews

Before assuming the new envelope and link features worked fine on a phone, I actually checked instead of guessing. Tested the builder's Download step and the recipient's envelope/card on an iPhone-sized viewport and again at a much narrower 320px width. Both held up with no horizontal overflow and no cramped buttons — the existing responsive CSS from the original wizard work already covered the new elements, since they reuse the same button and input classes rather than introducing new ones.

I also wanted to check what happens to the open-chime sound on a browser without Web Audio support, since I can't test real iOS Safari from here. The closest available stand-in is Playwright's WebKit engine, and in this sandbox's headless build it turns out `AudioContext` isn't available at all. That ended up being a useful accident: it confirmed the chime's `try`/`catch` does exactly what it's supposed to — the envelope still opens perfectly, with no console errors, just silently with no sound. That's the right fallback behavior regardless of which browser causes it.

The last piece was link previews — the roadmap's idea was that sharing a card link should show the actual photo in the messaging app preview. That's not possible with the no-backend design: a server-side preview crawler can't see anything in the URL fragment, since fragments never leave the browser. So I added Open Graph and Twitter Card tags to `index.html`, but they're necessarily generic — a static preview image for the app itself, not the actual card someone built. Worth being honest about: this is a direct, known limitation of choosing speed over a real backend, not something I solved.

What changed:

- Verified `/create`'s Download step and `/card`'s envelope/card at iPhone and 320px-wide viewports — no layout fixes were needed.
- Confirmed the open-chime fails silently with no errors when Web Audio isn't available, using WebKit's lack of `AudioContext` in this environment as the test case.
- Added generic Open Graph/Twitter Card meta tags and a static preview image (`public/og-preview.jpg`) so sharing the app's own link looks intentional in chat previews.

What I learned:

- "It probably works on mobile" isn't the same as checking. The existing CSS held up because the new UI reused existing classes, not because mobile was an afterthought I got lucky on.
- A missing API in one browser is still a useful test of a fallback path, even if it's not a perfect stand-in for the real device I actually care about (iOS Safari).
- Some limitations are downstream of an earlier decision, not new problems. The no-photo-in-link-preview gap is the same backend-vs-speed tradeoff from the shareable-links step, just showing up again here.

How I tested it:

- Walked the full builder flow and generated a card link at both a 390px and a 320px viewport width, checking for horizontal overflow at each step.
- Tapped the envelope open via touch emulation at both widths and confirmed the reveal still works.
- Ran the same envelope-open flow under WebKit and confirmed no errors when Web Audio is unavailable.
- Built the production bundle and confirmed the Open Graph image is actually copied into `dist/` alongside `index.html`.

Related commit: `feat: mobile usability pass and generic Open Graph tags`

### June 23, 2026: Hardening the No-Backend Approach

The original roadmap's last phase was scalability and hardening, written back when I was still planning a real backend: storage expiry, rate limiting on a public write endpoint, that kind of thing. None of that applies anymore, since there's no backend and no write endpoint. Rather than skip the phase entirely, I re-scoped it to what's actually real for the approach I ended up shipping: making sure the link-encoding trick doesn't quietly break on inputs I didn't test by hand.

Two gaps stood out. First, the photo upload only had the browser's `accept="image/*"` hint, which is a suggestion, not an enforcement — nothing stopped someone from picking a non-image file and the app silently treating it like a photo. Second, and more important, `compressPhotoForLink` had no upper bound at all. Every sample photo I'd tested with happened to compress to well under 15KB, but I had no actual evidence that would hold for every possible photo, and I didn't want to find out from a recipient with a broken link instead of from my own testing.

What changed:

- Photo upload now checks the file's actual MIME type and shows a clear message instead of accepting a non-image file.
- `compressPhotoForLink` now retries at progressively smaller dimensions and quality (320px/0.6 → 240px/0.5 → 180px/0.4) and gives up rather than ever shipping a photo over 40KB in the link — comfortably above the worst case I actually measured, but a real backstop instead of an assumption.
- If every attempt is still too large, the link is created without the photo, and the status message says so honestly instead of pretending it worked.

What I learned:

- "I tested it with a few photos and it was fine" is not the same as "it has a guaranteed upper bound." The first is a sample; the second is a guarantee. Only one of those is something I can stand behind for a recipient I haven't met.
- A re-scoped phase is still worth doing under its original name, even when the original plan doesn't apply anymore. The intent behind "hardening" survived the architecture change, even though the specific roadmap items didn't.
- I couldn't trigger the drop-the-photo path with any of my real sample images, so I temporarily forced the size cap down to confirm that exact code path actually runs and behaves correctly, then put the real number back. Code that only theoretically works isn't tested.

How I tested it:

- Uploaded a non-image file and confirmed it's rejected with a clear message, with no photo state silently set.
- Generated a card link with each sample photo and confirmed the link still includes the real photo with the actual compression cap in place.
- Temporarily set the cap absurdly low, regenerated a link, and confirmed the photo gets dropped, the card still renders correctly with the right name and message, and the status message explains what happened — then restored the real value and re-confirmed normal behavior.

Related commit: `feat: harden photo upload and link compression`

### June 23, 2026: Confetti on Open

The last item on the original roadmap was confetti or floating balloon animations. With the envelope, the chime, and the reveal already working, this was the smallest possible addition that still made the moment feel a little more like a celebration: a short burst of confetti pieces falling and fading right as the envelope opens, on top of the flap animation and the chime that were already there.

I kept this consistent with everything else in this phase: CSS-only, no animation library, decorative and `aria-hidden`, and skipped entirely for anyone with `prefers-reduced-motion` set, rather than just slowed down. Sixteen pieces with hardcoded (not randomized) positions, colors, and stagger delays — randomizing them would have looked the same to a viewer but added complexity for no real benefit here.

What changed:

- Added a `confetti-burst` layer inside `EnvelopeReveal`, rendered above the envelope and the card.
- Sixteen small pieces fall and rotate with staggered delays over about 1.3 seconds, triggered by the same `envelope-reveal--open` class toggle that drives the flap and card-reveal transitions.
- Confetti is skipped entirely under `prefers-reduced-motion`, matching how the rest of the envelope's motion is handled.

What I learned:

- The smallest version of an idea is often enough. "Confetti or floating balloons" didn't need both, and didn't need to be physics-accurate — a believable fall-and-fade with a bit of stagger reads as confetti without much code.
- Checking a mid-animation screenshot can look like a bug (the card looked washed-out, with envelope text still faintly visible through it) when it's actually just an honest snapshot of two transitions crossing over each other. Looking at the *settled* end state, not just one frame, is what actually tells you if something's wrong.

How I tested it:

- Opened a real card link and captured the moment mid-fall (confetti visible, card and envelope still cross-fading) and well after the animation ends, confirming the final state is clean with no leftover artifacts.
- Confirmed no console errors with the confetti layer added.

Related commit: `feat: confetti burst on envelope open`

This closes out every idea from the original roadmap: envelope animation, sound, shareable links (re-scoped for speed), mobile usability, hardening, and now confetti. What's left, if this ever needs to grow past a demo, is revisiting real backend storage for shareable links — shorter links, no size limit on the photo, and real per-card link previews with the actual photo, none of which are possible with the current no-backend approach.

### June 23, 2026: Builder UI Pass

With the recipient side (envelope, sound, confetti, the real card) feeling polished, I took a step back and asked for honest feedback on the builder side, since I'd been heads-down on features and hadn't really looked at it critically in a while. The feedback was specific, not generic: the builder panel had a lot of dead space on most steps, every button in the app was the same pink with no sense of which action mattered most, the Preview step had almost no content of its own, and — the one I liked most — the person *building* the card never got to experience the envelope/chime/confetti moment unless they pasted their own link into a new tab.

I agreed with all of it, and added two more: drop the "Share card" button entirely (Download plus the link feature cover that need now), and make the dark preview panel background feel less flat.

What changed:

- Removed "Share card"/"Share" and the Web Share API code behind them — Download and Create card link cover what Share was doing.
- Added "Preview as recipient" on the Preview step: it opens the actual `EnvelopeReveal` + `CardPreview` experience, using whatever I've built so far, right inside the builder, no link required. This gave the Preview step real content for the first time, and doubles as a way to sanity-check a card before sharing it for real.
- Demoted "Download card" to a secondary, outlined style so "Create card link" reads as the headline action on that step.
- Vertically centered each step's content in the builder panel instead of leaving it stuck at the top with empty space below — most steps just don't have much content, and centering makes that read as a calm layout instead of an unfinished one.
- Gave the dark preview panel background a few soft layered gradients instead of one flat color.

What I learned:

- Asking for feedback on my own work, instead of only reacting to what looked obviously broken, surfaced things I'd stopped noticing because I'd been looking at the same screens for hours.
- The empty-space problem and the "Preview step has nothing in it" problem turned out to be the same problem solved by the same fix — adding real content to Preview made it worth keeping as its own step, which I almost solved by just removing the step instead.
- Reusing a component (`EnvelopeReveal`) in a second context (the builder, not just the recipient route) immediately surfaced a real bug: the overlay it lives in bled across the whole mobile page because `.preview-panel` switches to `position: static` under 900px, and `position: absolute; inset: 0` needs a positioned ancestor to mean what I wanted it to mean. Changing that one breakpoint rule to `position: relative` fixed it without giving up the reason it was static-ish in the first place (canceling the desktop sticky behavior).
- A mid-test screenshot that looks visually wrong (a couple of my screenshots rendered oddly small) isn't automatically a real bug — checking the actual computed layout sizes before chasing it confirmed it was a screenshot-capture timing quirk, not the app.

How I tested it:

- Walked the full wizard on desktop, opened "Preview as recipient," confirmed the envelope/chime/confetti experience plays correctly using live in-progress data, closed it, and confirmed Download still works afterward (the card's DOM reference doesn't get disturbed by the overlay mounting on top of it).
- Confirmed zero "Share" buttons remain anywhere in the app.
- Repeated the same flow on an iPhone-sized mobile viewport and caught the overlay bleeding past the preview panel before fixing it, then reran the mobile check clean.

Related commit: `feat: UI polish - remove Share, preview-as-recipient, layout/background`

### June 23, 2026: Happy Birthday Tune on Open

The short two-note chime on open was a placeholder for the real thing: actual birthday music. I upgraded it to a synthesized rendition of "Happy Birthday to You" instead of finding an audio file somewhere, for the same reason the chime was synthesized in the first place — no asset to license, nothing to load. It's also worth knowing the song itself has been public domain in the US since a 2015 court ruling found Warner/Chappell's copyright claim invalid, so even using a recording would have been fine; synthesizing it just kept the approach consistent with everything else in this phase.

It's 25 notes across four phrases, built on the same oscillator-plus-gain-envelope approach as the chime, just scheduled in sequence instead of two overlapping notes. It plays once, about 7.5 seconds, when the envelope is tapped — same trigger point as before, so it still rides the same user gesture that satisfies browsers' audio autoplay rules.

What changed:

- Replaced `playOpenChime` in `src/lib/sound.ts` with `playBirthdayTune`, a 25-note melody table plus a small scheduling loop.
- `EnvelopeReveal` now calls the tune instead of the chime on open. Since the builder's "Preview as recipient" reuses the same component, the tune plays there too, for free.

What I learned:

- Verifying "the melody plays" needed more than checking the code looked musically right. I instrumented `AudioContext.prototype.createOscillator` in the browser to actually count how many notes got scheduled, confirmed it was 25, and ran the same check through both entry points (the real `/card` link and the builder's recipient preview) rather than assuming the second one would just work because it shares the component.

How I tested it:

- Counted scheduled notes via the oscillator instrumentation above: 25 on the real card link, 25 via the builder's "Preview as recipient."
- Confirmed the card stays revealed and stable for several seconds after the tune finishes, with no console errors in either path.

Related commit: `feat: play Happy Birthday tune on envelope open`

## What I Learned So Far

This project helped me practice more than React syntax. It helped me practice product thinking.

I learned how to break a large idea into smaller phases, how to review each feature before moving on, and how design decisions can change after seeing the app in the browser.

Some of the most useful lessons were:

- A small MVP is easier to improve than a large unfinished plan.
- User input should feel guided, not overwhelming.
- Templates need different layouts, not just different colors.
- Personalization feels stronger when users can move pieces around.
- AI assistance still requires human judgment, testing, and clear direction.
- A portfolio project should show the process, not only the final result.

## Future Journal Entries

Going forward, I will update this journal after meaningful features. Each new entry should include:

- Time frame or phase.
- What changed.
- Why the change mattered.
- What I learned.
- How I tested it.
- Which commit captured the work.
