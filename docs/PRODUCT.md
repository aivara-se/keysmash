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
- A marked word is drawn in the colour it names for itself, or the one its emoji names, or its list's, or the plain ink when none does. Where the emoji's colour is the thing's colour the word takes it, so an apple is red and a frog is green.
- A word that can be drawn as an emoji is drawn with it inside the pill, before the word. A word the parent has given a picture is drawn with the picture in the emoji's place. A word with neither is drawn with neither.
- A number is drawn in its own colour, never a word's, so a number pill never reads as a word.
- When a word is complete — the child has stopped and it is marked at the end of the text — the app writes a space after it, so the next letter starts a new word instead of growing the one just read. That one space is the only character the app adds, and it can only lengthen the text.
- A digit alone is spoken as its name ("three"); digits in a row as one number ("thirty-three"). Numbers are names, never counts.
- Marking asks nothing of the child.

## screen

One screen; the parent's two controls in the top corner — full screen and settings — are the only things to tap. Both are gone while the app is full screen.

Text is anchored to the bottom, inside padding on every side: the newest character is written after the last and the caret moves with it, and older lines move up as the text grows. Pixels and spacing: `docs/DESIGN.md`.

## word lists

The parent decides what the app marks. It ships with nine lists of the things a small child knows — animals, fruit and vegetables, food, weather and sky, vehicles, toys and play, home and things, people, and doing words — and a tenth, My words, that ships empty for the parent's own.

An allow-list, never "whatever letters make": the app marks and speaks only words on an active list. Every list is on by default, so the app works whatever the child happens to type; the parent turns off the ones they do not want.

The settings page is where the parent works on them:

- turn any list on or off;
- add a word to a list. A word is letters only, and one word lives on one list: a word another list already holds is refused, and the refusal names that list;
- change the emoji a word is drawn with, or leave the field empty to take its emoji away;
- give a word a picture off the device, which is drawn where its emoji would be, and take the picture off again;
- take a word off a list;
- put the built-in lists back — one control, which takes the parent's words, emojis and pictures off the device and restores what shipped.

The lists are the parent's once they are on the device: a list may end up shorter than it shipped, and My words holds whatever the parent typed. A change is kept on the device as it is made.

## leaving and locking

- The child is given no way out of the app and nothing to open in it: no second screen, no dialogs, and no browser chrome while it runs full screen. The settings page is the parent's, and the only way the child could reach it is holding two keys down for three seconds.
- The parent opens the settings page two ways: the settings control in the top corner, and holding the left and right Shift keys for three seconds. While the app is full screen the corner controls are gone, so the Shift-hold is the way in for a parent who handed over an installed app.
- The child's text is never cleared by the app and never rewritten: nothing the parent does on the settings page edits a character the child typed, and the text is gone only when the app closes.
- Full screen is not a lock: the OS still answers Esc, its shortcuts, notifications, and the volume and power keys, and the app does not pretend otherwise.

## offline and private

No request off the device. No account, analytics, ads, or third party. Runs with the network off. Nothing leaves the device: the lists and the pictures the parent adds are kept on the device, and the child's text is gone when the app closes. Deliberate.

## v1 does not do

Lessons, levels, scoring, rewards, streaks, curriculum, profiles, sync, a parent dashboard, more than one language, any test of learning.

## v1 must do

1. One key → its character on the screen, within 150 ms, measured.
2. A hand dragged across the keyboard → every character it passed, written; no sound.
3. A real word or number on an active list → marked, nothing asked.
4. A held key → one character, no repeat.
5. Network off, half an hour, no route to the settings page the child can reach.
6. A flurry is written in full at any speed, and read aloud only at the letter it ends on.
7. Nothing typed is ever withheld: every character the child presses is written, and no press removes or rewrites one already written. The only character the app adds is the space after a completed word.
8. A word the parent adds, with an emoji or a picture of the parent's own, is marked and drawn like any word that shipped.
9. The parent's lists, words, emojis and pictures are still on the device after a reload.
10. Restore takes the parent's words, emojis and pictures off the device and puts the built-in lists back.

## name

The name says "gentle press-and-answer toy for a small child". "Keysmash" names the noise the toy simply writes down. Renaming is cheap now.
