# Keysmash — product spec

A typing app for a two-year-old. A deliberate keypress gets an answer: the letter spoken and written. A hand dragged across the keyboard gets nothing. The child cannot read or type on purpose; the parent hands over the device.

## babble and mash

- **babble** — one key, pressed on purpose. Answered: the letter is spoken and written.
- **mash** — many keys at once, or a flurry. Answered with silence, and no text.

The pair is the product. Answering everything is noise; answering nothing leaves the child nothing to control.

## babble

A press is a babble when it is one key, released before the next, at least 150 ms after the previous press. A held key gives one babble, no repeat.

150 ms is provisional: set it from a recording of a real two-year-old, then freeze it.

Each babble speaks the letter **name** and writes the character at the caret. One fixed, low voice; a new letter cuts off the last, so sounds never stack and the volume never rises.

## mash

Two keys down at once, five presses in one second, or any press while a key is down — the whole burst is a mash, including the presses that began it.

No sound, no text, no shake, no colour change. A mash is not scolded and not made into a game.

## words and numbers

- Half a second after the child stops, the text is read against the active word lists. Every real word or number is marked; the one just completed is spoken.
- A marked word is not spoken again until it changes.
- A digit alone is spoken as its name ("three"); digits in a row as one number ("thirty-three"). Numbers are names, never counts.
- Marking asks nothing of the child.

## screen

One screen; nothing to tap but the keyboard.

Text is right-aligned, the caret pinned at the **2:1 point** (two-thirds across), so the newest character always lands in the same place and older text grows left; older lines fade first.

Attention, not reading: the newest letter always lands where the child is already looking, and nothing moves. The line is anchored at its end and grows leftward, which is not how writing is laid out — so this is no base for a later reading feature. Pixels and overflow: `docs/DESIGN.md`.

## word lists

The parent picks the active lists in settings; the app speaks only words on them. An allow-list, never "whatever letters make".

A two-year-old at two and three letters reaches rude words inside a session. One small, safe list is on by default, so the app works when opened.

## leaving and locking

- The child is given no way out of the app and nothing to open in it: no settings, no second screen, no dialogs, and no browser chrome while it runs full screen.
- The parent leaves by holding two named keys for three seconds. Behind it: settings and Stop.
- The parent opens it full screen (one step, in the app's own instructions). Full screen is not a lock: the OS still answers Esc, its shortcuts, notifications, and the volume and power keys, and the app does not pretend otherwise.

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

## name

The name says "gentle press-and-answer toy for a small child". "Keysmash" names the behaviour the app ignores and reads as the noise. Renaming is cheap now. Code terms stay `babble` and `mash` whatever the product is called.
