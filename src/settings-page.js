import { addWord, clearImage, removeWord, setEmoji, setImage } from "./lists.js";
import { toPillImage } from "./images.js";

/**
 * The settings page: the lists the app marks, the words on each of them, and how
 * each word is drawn — its emoji, or a picture in the emoji's place.
 *
 * It holds no data. It draws the lists it is handed and gives every change back
 * through `applyLists`; storing them and redrawing the child's screen belong to
 * the caller. The look is the app's own: one large text size, black on white
 * (DESIGN.md).
 */

/** How long a Restore waits for its second tap before it stands down. */
const RESTORE_ARM_MS = 5000;

/** A button carrying the words that say what it does. */
function control(label, className) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = className;
  element.textContent = label;
  return element;
}

export function createSettingsPage({ container, lists, activeIds, setActiveIds, applyLists, restore }) {
  /** The lists whose words the parent has opened, kept across a redraw. */
  const opened = new Set();
  /** What the parent has typed into an add field, so a refusal keeps it there. */
  const drafts = new Map();
  /** Why an add was refused, or a picture refused, under the list it happened on. */
  const errors = new Map();
  /** Whether a Restore is waiting for its second tap, and why the last one failed. */
  let armed = false;
  let armTimer = null;
  let restoreError = null;

  /**
   * Applies a change to a list and draws the page again. `applyLists` hands back
   * a message when the device would not keep the change, and that is put where
   * the list's other answers go.
   */
  async function change(listId, next) {
    const refused = await applyLists(next);
    if (refused !== null) errors.set(listId, refused);
    render();
  }

  function drawWord(list, entry) {
    const row = document.createElement("div");
    row.className = "word";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = entry.word;

    const emoji = document.createElement("input");
    emoji.type = "text";
    emoji.className = "emoji";
    emoji.value = entry.emoji ?? "";
    emoji.placeholder = "emoji";
    emoji.setAttribute("aria-label", `Emoji for ${entry.word}`);
    emoji.addEventListener("change", () => change(list.id, setEmoji(lists(), list.id, entry.word, emoji.value)));

    row.append(name, emoji);

    // The word's picture, when it has one, drawn at the size the settings page
    // reads at — and inside the pill on the play screen at the text's own size.
    if (entry.image !== undefined) {
      const thumb = document.createElement("img");
      thumb.className = "thumb";
      thumb.src = entry.image;
      thumb.alt = "";
      row.append(thumb);
    }

    const picture = document.createElement("label");
    picture.className = "picture";
    picture.textContent = "Picture";
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    file.setAttribute("aria-label", `Picture for ${entry.word}`);
    file.addEventListener("change", async () => {
      const chosen = file.files?.[0];
      if (chosen === undefined) return;
      try {
        await change(list.id, setImage(lists(), list.id, entry.word, await toPillImage(chosen)));
      } catch {
        errors.set(list.id, "That file is not a picture the app can read.");
        render();
      }
    });
    picture.append(file);
    row.append(picture);

    if (entry.image !== undefined) {
      const clear = control("No picture", "unset");
      clear.addEventListener("click", () => change(list.id, clearImage(lists(), list.id, entry.word)));
      row.append(clear);
    }

    const remove = control("Remove", "remove");
    remove.addEventListener("click", () => change(list.id, removeWord(lists(), list.id, entry.word)));
    row.append(remove);
    return row;
  }

  function drawAdd(list) {
    const row = document.createElement("div");
    row.className = "add";

    const field = document.createElement("input");
    field.type = "text";
    field.className = "new";
    field.placeholder = "Add a word";
    field.setAttribute("aria-label", `Add a word to ${list.name}`);
    field.value = drafts.get(list.id) ?? "";
    field.addEventListener("input", () => drafts.set(list.id, field.value));

    const send = async () => {
      const result = addWord(lists(), list.id, field.value);
      if (result.error !== null) {
        errors.set(list.id, result.error);
        render();
        return;
      }
      errors.delete(list.id);
      drafts.delete(list.id);
      await change(list.id, result.lists);
    };

    const submit = control("Add", "submit");
    submit.addEventListener("click", send);
    field.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      send();
    });

    row.append(field, submit);
    return row;
  }

  function drawWords(list) {
    const words = document.createElement("div");
    words.className = "words";
    if (!opened.has(list.id)) words.hidden = true;
    for (const entry of list.words) words.append(drawWord(list, entry));
    words.append(drawAdd(list));
    if (errors.has(list.id)) {
      const error = document.createElement("p");
      error.className = "error";
      error.textContent = errors.get(list.id);
      words.append(error);
    }
    return words;
  }

  function drawList(list, active) {
    const section = document.createElement("section");
    section.className = "list";

    const head = document.createElement("div");
    head.className = "head";

    const on = document.createElement("label");
    on.className = "switch";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.dataset.id = list.id;
    box.checked = active.includes(list.id);
    box.addEventListener("change", () => {
      const ids = [...container.querySelectorAll(".switch input:checked")].map((input) => input.dataset.id);
      setActiveIds(ids);
    });
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = list.name;
    on.append(box, name);

    const count = document.createElement("span");
    count.className = "count";
    count.textContent = `(${list.words.length})`;

    const more = control(opened.has(list.id) ? "Hide words" : "Words", "more");
    more.addEventListener("click", () => {
      if (opened.has(list.id)) opened.delete(list.id);
      else opened.add(list.id);
      render();
    });

    head.append(on, count, more);
    section.append(head, drawWords(list));
    return section;
  }

  function drawRestore() {
    const footer = document.createElement("div");
    footer.className = "restore";

    const button = control(armed ? "Tap again to restore" : "Restore built-in lists", "restore-button");
    button.addEventListener("click", async () => {
      if (!armed) {
        armed = true;
        render();
        clearTimeout(armTimer);
        armTimer = setTimeout(() => {
          armed = false;
          render();
        }, RESTORE_ARM_MS);
        return;
      }
      armed = false;
      clearTimeout(armTimer);
      try {
        await restore();
        restoreError = null;
      } catch {
        restoreError = "The app could not put the built-in lists back.";
      }
      render();
    });

    const note = document.createElement("p");
    note.className = "note";
    note.textContent =
      restoreError ??
      "Restoring puts the built-in lists back and takes your words, emojis and pictures off this device.";

    footer.append(button, note);
    return footer;
  }

  function render() {
    const active = activeIds();
    container.replaceChildren(...lists().map((list) => drawList(list, active)), drawRestore());
  }

  return { render };
}
