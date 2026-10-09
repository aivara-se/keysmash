# Keysmash — product spec

A typing app for a two-year-old. Every key the child presses is written down. A deliberate press is answered with the letter's name, and the words the child has made are read back. The child cannot read or type on purpose; the parent hands over the device.

## typing

Every character key writes its character at the caret the moment it goes down. Nothing the child types is withheld: a hand dragged across the keys is written down like anything else. Holding a key writes one character, not a stream — the system's auto-repeat is ignored.

What the app holds back is the **voice**, not the text. A letter's name is spoken only when the child is not typing fast: when no other letter follows it within 150 ms. A flurry is written at once and not read aloud — only the letter the child stops on is named. One fixed, low voice; a new letter cuts off the last, so sounds never stack and the volume never rises.

A mash is not scolded and not made into a game. It is written, and only the letter it ends on is named.

## words and numbers

- Half a second after the child stops, the text is read against the active word lists. Every real word or number is marked; the one just completed is spoken.
- A marked word is not spoken again until it changes.
- A marked word reads with a capital first letter. It is a rendering of the mark only: nothing rewrites the characters the child typed.
- A marked word is drawn in the colour its list gives it, or the colour the word names for itself, or the plain ink when neither does.
- A word that can be drawn as an emoji is drawn with it inside the pill, before the word. A word with none is drawn with none.
- A number is drawn in its own colour, never a word's, so a number pill never reads as a word.
- When a word is complete — the child has stopped and it is marked at the end of the text — the app writes a space after it, so the next letter starts a new word instead of growing the one just read. That one space is the only character the app adds, and it can only lengthen the text.
- A digit alone is spoken as its name ("three"); digits in a row as one number ("thirty-three"). Numbers are names, never counts.
- Marking asks nothing of the child.

## screen

One screen; the parent's two controls in the top corner — full screen and clear — are the only things to tap.

Text is anchored to the bottom, inside padding on every side: the newest character is written after the last and the caret moves with it, and older lines move up as the text grows. Pixels and spacing: `docs/DESIGN.md`.

## word lists

The parent picks the active lists in settings; the app speaks only words on them. An allow-list, never "whatever letters make". The lists hold what a small child knows: animals, fruit and vegetables, food, weather and sky, vehicles, toys and play, home and things, people, and doing words.

A two-year-old at two and three letters reaches rude words inside a session. A small, safe set of lists is on by default, so the app works when opened.

## leaving and locking

- The child is given no way out of the app and nothing to open in it: no settings, no second screen, no dialogs, and no browser chrome while it runs full screen.
- The parent leaves by holding two named keys for three seconds. Behind it: the word lists, and Close.
- The parent's controls sit in the top corner: full screen, and clear. Both go away while the app is full screen, leaving the child nothing to tap. Clear blanks the screen at the parent's ask; nothing else ever edits what the child typed.
- Full screen is not a lock: the OS still answers Esc, its shortcuts, notifications, and the volume and power keys, and the app does not pretend otherwise.

## offline and private

No request off the device. No account, analytics, ads, or third party. Runs with the network off. Nothing leaves the device; the text is gone when the app closes. Deliberate.

## v1 does not do

Lessons, levels, scoring, rewards, streaks, curriculum, profiles, sync, a parent dashboard, more than one language, any test of learning.

## v1 must do

1. One key → its character on the screen, within 150 ms, measured.
2. A hand dragged across the keyboard → every character it passed, written; no sound.
3. A real word or number on an active list → marked, nothing asked.
4. A held key → one character, no repeat.
5. Network off, half an hour, no route to settings or the OS.
6. A flurry is written in full at any speed, and read aloud only at the letter it ends on.
7. Nothing typed is ever withheld: every character the child presses is written, and no press removes or rewrites one already written. The only character the app adds is the space after a completed word.

## name

The name says "gentle press-and-answer toy for a small child". "Keysmash" names the noise the toy simply writes down. Renaming is cheap now.
