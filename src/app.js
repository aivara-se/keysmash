import { createClassifier } from "./babble.js";
import { createRender } from "./render.js";
import { createSpeech } from "./speech.js";
import { createSettings } from "./settings.js";
import { LISTS, wordsFor } from "./lists.js";
import { markText, newUtterances } from "./words.js";
import { READ_IDLE_MS, SPEAK_DEBOUNCE_MS } from "./thresholds.js";

const EXIT_KEYS = new Set(["ShiftLeft", "ShiftRight"]);
const EXIT_HOLD_MS = 3000;
const TICK_MS = 16;

const screen = document.getElementById("screen");
const controls = document.getElementById("controls");
const fullscreenButton = document.getElementById("fullscreen");
const clearButton = document.getElementById("clear");
const parentScreen = document.getElementById("parent");
const listContainer = document.getElementById("lists");

const settings = createSettings();
const speech = createSpeech();
const render = createRender({ screen, wordsFor: () => activeWords });
const spoken = new Map();

let activeWords = wordsFor(settings.activeListIds());
let classifier = createClassifier();
let exitTimer = null;
let readTimer = null;
let speakTimer = null;
let paused = false;
const exitDown = new Set();

const now = () => performance.now();

/**
 * Writes every letter at once, and speaks the last one only if nothing else
 * arrives inside SPEAK_DEBOUNCE_MS — so fast typing is written, not read aloud.
 */
function write(letters) {
  let latest = null;
  for (const letter of letters) {
    render.insert(letter.key);
    if (/^[A-Za-z]$/.test(letter.key)) latest = letter.key;
  }
  if (latest === null) return;
  clearTimeout(speakTimer);
  speakTimer = setTimeout(() => speech.letter(latest), SPEAK_DEBOUNCE_MS);
}

function tick() {
  write(classifier.tick(now()));
}

/**
 * After the child stops: read the marks, then finish a completed word with a
 * space, so the next letter starts a new word instead of growing the one just
 * read. It waits for the stop, so a word still being typed — "cats" on its way
 * — is left alone.
 */
function readWords() {
  const text = render.text();
  const marks = markText(text, activeWords);
  for (const utterance of newUtterances(marks, spoken)) speech.word(utterance);
  const last = marks[marks.length - 1];
  if (last !== undefined && last.end === text.length) render.insert(" ");
}

function noteStop() {
  clearTimeout(readTimer);
  readTimer = setTimeout(readWords, READ_IDLE_MS);
}

function holdExit(code) {
  exitDown.add(code);
  if (exitDown.size === EXIT_KEYS.size && exitTimer === null) {
    exitTimer = setTimeout(openParent, EXIT_HOLD_MS);
  }
}

function releaseExit(code) {
  exitDown.delete(code);
  clearTimeout(exitTimer);
  exitTimer = null;
}

function onKeyDown(event) {
  if (paused) return;
  if (EXIT_KEYS.has(event.code)) return holdExit(event.code);
  if (event.repeat || event.key.length !== 1) return;
  noteStop();
  write(classifier.press(event.code, event.key, now()));
}

function onKeyUp(event) {
  if (paused) return;
  if (EXIT_KEYS.has(event.code)) return releaseExit(event.code);
  // Always release by code: a capital reports "a" on the way up once Shift is
  // out, and a press left behind would stop the keyboard answering for good.
  write(classifier.release(event.code));
}

function openParent() {
  paused = true;
  clearTimeout(readTimer);
  exitDown.clear();
  exitTimer = null;
  parentScreen.hidden = false;
}

function closeParent() {
  parentScreen.hidden = true;
  paused = false;
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement !== null) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    // The device refused full screen: the app still plays.
  }
}

function syncControls() {
  controls.hidden = document.fullscreenElement !== null;
}

/** The parent asks for a blank screen. Nothing else ever edits the child's text. */
function clearScreen() {
  render.reset();
  spoken.clear();
  clearTimeout(readTimer);
}

function selectLists() {
  const active = new Set(settings.activeListIds());
  for (const list of LISTS) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = active.has(list.id);
    input.addEventListener("change", () => {
      const ids = [...listContainer.querySelectorAll("input:checked")].map((box) => box.dataset.id);
      settings.setActiveListIds(ids);
      activeWords = wordsFor(ids);
      spoken.clear();
    });
    input.dataset.id = list.id;
    label.append(input, document.createTextNode(` ${list.name}`));
    listContainer.append(label);
  }
}

fullscreenButton.addEventListener("click", toggleFullscreen);
clearButton.addEventListener("click", clearScreen);
document.addEventListener("fullscreenchange", syncControls);
document.getElementById("close").addEventListener("click", closeParent);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("resize", () => render.resize());

selectLists();
render.reset();
speech.ready();
syncControls();
setInterval(tick, TICK_MS);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // Guard the update check against the HTTP cache, so a returning device
      // notices a new version instead of being handed the old sw.js.
      const registration = await navigator.serviceWorker.register("sw.js", { updateViaCache: "none" });
      await registration.update();
    } catch {
      // No service worker on this device: the app still plays, it is just not offline.
    }
  });
}
