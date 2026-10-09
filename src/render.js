import { markText } from "./words.js";

/**
 * Draws the text on the one screen (DESIGN.md): left-aligned from the top of
 * the padded area, wrapping at the right edge, the caret drawn after the
 * newest character. When the text passes the bottom, the screen scrolls up so
 * the newest line stays in view.
 */
export function createRender({ screen, wordsFor }) {
  const textEl = document.createElement("div");
  textEl.id = "text";
  const caret = document.createElement("span");
  caret.className = "caret";
  screen.append(textEl);

  let text = "";

  function paint() {
    const nodes = [];
    let cursor = 0;
    for (const mark of markText(text, wordsFor())) {
      nodes.push(document.createTextNode(text.slice(cursor, mark.start)));
      const word = document.createElement("span");
      word.className = "mark";
      word.textContent = text.slice(mark.start, mark.end);
      nodes.push(word);
      cursor = mark.end;
    }
    nodes.push(document.createTextNode(text.slice(cursor)));
    textEl.replaceChildren(...nodes, caret);
    screen.scrollTop = screen.scrollHeight;
  }

  return {
    reset() {
      text = "";
      paint();
    },

    resize() {
      screen.scrollTop = screen.scrollHeight;
    },

    /** Writes one character at the caret. */
    insert(character) {
      text += character;
      paint();
    },

    /** The child's text so far. */
    text() {
      return text;
    },
  };
}
