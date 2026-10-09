import { createClassifier } from "./babble.js";
import { createRender } from "./render.js";
import { createSpeech } from "./speech.js";
import { createSettings } from "./settings.js";
import { LISTS, wordsFor } from "./lists.js";
import { markText, newUtterances } from "./words.js";
import { READ_IDLE_MS } from "./thresholds.js";

const EXIT_KEYS = new Set(["ShiftLeft", "ShiftRight"]);
const EXIT_HOLD_MS = 3000;

const startScreen = document.getElementById("start");
const playScreen = document.getElementById("play");
const parentScreen = document.getElementById("parent");
const screen = document.getElementById("screen");
const listContainer = document.getElementById("lists");

const settings = createSettings();
const speech = createSpeech();
const render = createRender({ screen, wordsFor: () => activeWords });
const spoken = new Map();

let activeWords = wordsFor(settings.activeListIds());
let classifier = createClassifier();
let playing = false;
let readTimer = null;
let exitTimer = null;
const exitDown = new Set();

const now = () => performance.now();

function readWords() {
  for (const utterance of newUtterances(markText(render.text(), activeWords), spoken)) {
    speech.word(utterance);
  }
}

function noteStop() {
  clearTimeout(readTimer);
  readTimer = setTimeout(readWords, READ_IDLE_MS);
}

function apply(actions) {
  for (const action of actions) {
    if (action.type === "undo") {
      render.removeTail(action.count);
      speech.cut();
      continue;
    }
    render.insert(action.key);
    if (/^[A-Za-z]$/.test(action.key)) speech.letter(action.key);
  }
}

function holdExit(code) {
  exitDown.add(code);
  if (exitDown.size === EXIT_KEYS.size && exitTimer === null) {
    exitTimer = setTimeout(leaveToParent, EXIT_HOLD_MS);
  }
}

function releaseExit(code) {
  exitDown.delete(code);
  clearTimeout(exitTimer);
  exitTimer = null;
}

function onKeyDown(event) {
  if (!playing) return;
  if (EXIT_KEYS.has(event.code)) return holdExit(event.code);
  if (event.repeat || event.key.length !== 1) return;
  noteStop();
  apply(classifier.press(event.key, now()));
}

function onKeyUp(event) {
  if (!playing) return;
  if (EXIT_KEYS.has(event.code)) return releaseExit(event.code);
  if (event.key.length !== 1) return;
  apply(classifier.release(event.key));
}

function leaveToParent() {
  playing = false;
  clearTimeout(readTimer);
  exitDown.clear();
  exitTimer = null;
  playScreen.hidden = true;
  parentScreen.hidden = false;
}

function start() {
  classifier = createClassifier();
  spoken.clear();
  startScreen.hidden = true;
  parentScreen.hidden = true;
  playScreen.hidden = false;
  render.reset();
  playing = true;
  speech.ready();
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function stop() {
  playing = false;
  clearTimeout(readTimer);
  playScreen.hidden = true;
  parentScreen.hidden = true;
  startScreen.hidden = false;
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

document.getElementById("start-button").addEventListener("click", start);
document.getElementById("stop").addEventListener("click", stop);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("resize", () => render.resize());
selectLists();

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
