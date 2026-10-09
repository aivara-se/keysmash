# Keysmash — product spec

A typing app for a two-year-old. A deliberate keypress gets an answer: the letter spoken and written. A hand dragged across the keyboard gets nothing. The child cannot read or type on purpose; the parent hands over the device.

## babble and mash

- **babble** — one key, pressed on purpose. Answered: the letter is spoken and written.
- **mash** — two keys down at once, or a press while a key is down. Answered with silence, and no text.

The pair is the product. Answering everything is noise; answering nothing leaves the child nothing to control.

## babble

A press is a babble when it is one key, released before the next press. A held key answers on its own after 150 ms, and gives one babble, no repeat.

Each babble writes the character at the caret, and says the letter **name** only when the child is not typing fast: the name is spoken when no other letter follows it within 150 ms, so a flurry is written but not read aloud. Only the voice waits — input is never debounced, and every character is written the moment its key lands. One fixed, low voice; a new letter cuts off the last, so sounds never stack and the volume never rises.

## mash

Two keys down at once, or any press while a key is down — that press answers nothing, and neither does the key it interrupted.

No sound, no text, no shake, no colour change. A mash is not scolded and not made into a game.

A mash never takes back a letter already written. What the child has typed is what the child has typed; the app does not edit it.

## words and numbers

- Half a second after the child stops, the text is read against the active word lists. Every real word or number is marked; the one just completed is spoken.
- A marked word is not spoken again until it changes.
- A marked word reads with a capital first letter. It is a rendering of the mark only: nothing rewrites the characters the child typed.
- A digit alone is spoken as its name ("three"); digits in a row as one number ("thirty-three"). Numbers are names, never counts.
- Marking asks nothing of the child.

## screen

One screen; the parent's two controls in the top corner — full screen and clear — are the only things to tap.

Text is anchored to the bottom, inside padding on every side: the newest character is written after the last and the caret moves with it, and older lines move up as the text grows. Pixels and spacing: `docs/DESIGN.md`.

## word lists

The parent picks the active lists in settings; the app speaks only words on them. An allow-list, never "whatever letters make".

A two-year-old at two and three letters reaches rude words inside a session. One small, safe list is on by default, so the app works when opened.

## leaving and locking

- The child is given no way out of the app and nothing to open in it: no settings, no second screen, no dialogs, and no browser chrome while it runs full screen.
- The parent leaves by holding two named keys for three seconds. Behind it: settings and Stop.
- The parent's controls sit in the top corner: full screen, and clear. Both go away while the app is full screen, leaving the child nothing to tap. Clear blanks the screen at the parent's ask; nothing else ever edits what the child typed.
- Full screen is not a lock: the OS still answers Esc, its shortcuts, notifications, and the volume and power keys, and the app does not pretend otherwise.

## offline and private

No request off the device. No account, analytics, ads, or third party. Runs with the network off. Nothing leaves the device; the text is gone when the app closes. Deliberate.

## v1 does not do

Lessons, levels, scoring, rewards, streaks, curriculum, profiles, sync, a parent dashboard, more than one language, any test of learning.

## v1 must do

1. One key at a time → the letter name per press, within 150 ms, measured.
2. A hand dragged across the keyboard → no sound, no text; a recorded trace replays as silence.
3. A real word or number on an active list → marked, nothing asked.
4. A held key → one letter, no repeat.
5. Network off, half an hour, no route to settings or the OS.
6. No sound on a mash, at any speed.
7. Nothing typed is ever changed: no press removes or rewrites a character already written.

## name

The name says "gentle press-and-answer toy for a small child". "Keysmash" names the behaviour the app ignores and reads as the noise. Renaming is cheap now. Code terms stay `babble` and `mash` whatever the product is called.
