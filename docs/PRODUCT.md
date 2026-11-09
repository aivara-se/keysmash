# Keysmash: product

A typing app for a two-year-old. Every key the child presses is written down; a deliberate press is answered with the letter's name, and the words the child has made are read back.

## Problem

A small child wants the keyboard and cannot have the parent's work. A text field teaches nothing and risks everything: a stray tap sends a message, a shortcut closes a window. A child that young cannot read and does not know that a hand across the keys is not a word.

The parent hands over the device and wants it back unchanged, so the screen has one input and no way out. Keysmash is that screen: presses become text nobody loses, and letters are named back.

## Scope

**In.** One screen. Every key written, a held key written once. A letter named when the child stops. Words and numbers marked, coloured and drawn with an emoji. My words, with a parent's emoji and picture, and Restore. English. Offline, installed, full screen.

**Not this version.** More than one language. A parent dashboard. Listening to the marks.

**Never.** Lessons, levels, scoring, rewards, streaks, curriculum or profiles. Sync, an account, a server, analytics or ads. A request that leaves the device. A way out the child can reach, and anything that clears or rewrites the text already written.

## Behaviour

- Every character key writes its character as it goes down; the system's auto-repeat is ignored.
- A letter is named only when no other letter follows within 150 ms.
- A flurry is written in full and read aloud only at the letter it ends on.
- Half a second after the child stops, each real word and number is marked.
- A marked word is spoken once, not again until it changes.
- A marked word reads with a capital first letter; the characters typed are untouched.
- A marked word takes its own colour, its emoji's, or the plain ink.
- A word with an emoji or picture draws it inside its pill.
- A number is drawn in its own colour, so it never reads as a word.
- A completed word takes one space after it: the only character the app adds.
- A digit alone is a name ("three"); digits in a row are one number ("thirty-three").
- The app marks only words the chosen language holds, and the parent's words whatever the language.
- The parent adds a word, gives it an emoji or picture, and removes it; Restore puts the shipped words back.
- A word the language already holds is refused, and the refusal names the language.
- One screen; the only things to tap are full screen and settings, gone in full screen.
- Holding left and right Shift for three seconds opens settings while in full screen.
- Nothing the parent does edits a typed character; the text is gone when the app closes.

## Autonomy

An agent decides alone: wording, layout and the mechanics behind a rule here, inside the scope. It stops for a decision on a new dependency, a change to what is stored on the device, a second language, or anything `Never` refuses.

## Vision

The child's noise becomes their first words on a screen that never punishes them. What must not change: nothing is withheld, and nothing leaves the device.

## Acceptance

1. A key writes its character within 150 ms.
2. A drag writes every character; nothing is named.
3. A held key writes one character.
4. A real word or number is marked, unasked.
5. A parent's word draws its emoji or picture.
6. Parent's words, emojis, pictures and language survive a reload.
7. Restore drops the parent's words.
8. Offline, a reload still marks words.
