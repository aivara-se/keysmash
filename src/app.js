import { createRender } from "./render.js";
import { createSpeech } from "./speech.js";
import { createSettings } from "./settings.js";
import { createSettingsPage } from "./settings-page.js";
import { createStore } from "./store.js";
import { wordsFor } from "./lists.js";
import { markText, newUtterances } from "./words.js";
import { READ_IDLE_MS, SPEAK_DEBOUNCE_MS } from "./thresholds.js";

const EXIT_KEYS = new Set(["ShiftLeft", "ShiftRight"]);
const EXIT_HOLD_MS = 3000;

const screen = document.getElementById("screen");
const controls = document.getElementById("controls");
const fullscreenButton = document.getElementById("fullscreen");
const settingsButton = document.getElementById("settings-button");
const settingsScreen = document.getElementById("settings");
const settingsBody = document.getElementById("settings-body");
const closeButton = document.getElementById("settings-close");

const store = createStore();
const settings = createSettings();
const speech = createSpeech();

/** The word lists the app draws from: the device's copy, seeded on first run. */
let lists = [];
let activeWords = new Map();
let exitTimer = null;
let readTimer = null;
let speakTimer = null;
let paused = false;
const exitDown = new Set();
const spoken = new Map();

const render = createRender({ screen, wordsFor: () => activeWords });

/** The active list ids, read against the lists the app currently knows. */
function activeListIds() {
  return settings.activeListIds(lists.map((list) => list.id));
}

/** Reads the active lists' words again, and draws the text against them. */
function markAgain() {
  activeWords = wordsFor(activeListIds(), lists);
  spoken.clear();
  render.repaint();
}

const page = createSettingsPage({
  container: settingsBody,
  lists: () => lists,
  activeIds: activeListIds,

  setActiveIds(ids) {
    settings.setActiveListIds(ids);
    markAgain();
  },

  /** Shows the parent's change at once, then keeps it; a device that will not keep it says so. */
  async applyLists(next) {
    const before = new Map(lists.map((list) => [list.id, list]));
    lists = next;
    markAgain();
    for (const list of next) {
      if (before.get(list.id) === list) continue;
      try {
        await store.put(list);
      } catch {
        return "The device would not keep that change.";
      }
    }
    return null;
  },

  async restore() {
    await store.restore();
    lists = await store.lists();
    markAgain();
  },
});

/**
 * Writes the character at the caret, and speaks its name only when nothing else
 * follows inside SPEAK_DEBOUNCE_MS — so a flurry is written, not read aloud.
 */
function write(character) {
  render.insert(character);
  if (!/^[A-Za-z]$/.test(character)) return;
  clearTimeout(speakTimer);
  speakTimer = setTimeout(() => speech.letter(character), SPEAK_DEBOUNCE_MS);
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
    exitTimer = setTimeout(openSettings, EXIT_HOLD_MS);
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
  // Auto-repeat is the same key still down, not a new press: one character.
  if (event.repeat || event.key.length !== 1) return;
  noteStop();
  write(event.key);
}

function onKeyUp(event) {
  if (paused) return;
  if (EXIT_KEYS.has(event.code)) releaseExit(event.code);
}

function openSettings() {
  paused = true;
  clearTimeout(readTimer);
  exitDown.clear();
  exitTimer = null;
  settingsScreen.hidden = false;
  page.render();
}

function closeSettings() {
  settingsScreen.hidden = true;
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

/** The lists the app draws from, read from the device on start. */
async function boot() {
  try {
    lists = await store.lists();
  } catch {
    // A device that will not give the page a database still plays; nothing is marked.
    lists = [];
  }
  markAgain();
}

fullscreenButton.addEventListener("click", toggleFullscreen);
settingsButton.addEventListener("click", openSettings);
closeButton.addEventListener("click", closeSettings);
document.addEventListener("fullscreenchange", syncControls);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("resize", () => render.resize());

render.reset();
speech.ready();
syncControls();
boot();

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
