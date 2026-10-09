import { markText } from "./words.js";

const MAX_LINES = 3;

/**
 * Draws the growing text on the one screen (DESIGN.md): right-aligned to the
 * 2:1 point, the caret pinned there, older lines above and faded, marked words
 * heavier and underlined.
 */
export function createRender({ screen, wordsFor }) {
  let lines = [];
  let columnWidth = 0;
  let pointY = 0;
  let step = 0;
  let fontPx = 0;

  const caret = document.createElement("div");
  caret.className = "caret";
  screen.append(caret);

  function measure() {
    const rect = screen.getBoundingClientRect();
    columnWidth = rect.width * (2 / 3);
    pointY = rect.height * (2 / 3);
  }

  function makeLine() {
    const el = document.createElement("div");
    el.className = "line";
    screen.append(el);
    const line = { el, text: "" };
    const style = getComputedStyle(el);
    if (step === 0) {
      const height = parseFloat(style.lineHeight);
      if (Number.isFinite(height) && height > 0) step = height;
      const size = parseFloat(style.fontSize);
      if (Number.isFinite(size) && size > 0) fontPx = size;
    }
    return line;
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function paint(line) {
    let html = "";
    let cursor = 0;
    for (const mark of markText(line.text, wordsFor())) {
      html += escapeHtml(line.text.slice(cursor, mark.start));
      html += `<span class="mark">${escapeHtml(line.text.slice(mark.start, mark.end))}</span>`;
      cursor = mark.end;
    }
    line.el.innerHTML = html + escapeHtml(line.text.slice(cursor));
  }

  function layout() {
    const step_ = step > 0 ? step : 1;
    for (let i = 0; i < lines.length; i++) {
      const index = lines.length - 1 - i;
      const { el } = lines[i];
      // The current line sits on the caret, not below it.
      el.style.top = `${Math.round(pointY - (index + 1) * step_)}px`;
      el.className = `line ${index === 0 ? "current" : index === 1 ? "previous" : "older"}`;
    }
    // The caret is one text-height tall and sits on the current line, not the
    // whole line box (the concept's caret is about the cap height).
    const caretHeight = fontPx > 0 ? fontPx : step_;
    caret.style.top = `${Math.round(pointY - step_ + (step_ - caretHeight) / 2)}px`;
    caret.style.height = `${Math.round(caretHeight)}px`;
  }

  return {
    reset() {
      for (const line of lines) line.el.remove();
      lines = [];
      step = 0;
      fontPx = 0;
      measure();
      layout();
    },

    resize() {
      measure();
      layout();
    },

    /** Writes one character at the caret. */
    insert(character) {
      if (lines.length === 0) lines.push(makeLine());
      const current = lines[lines.length - 1];
      current.text += character;
      paint(current);
      if (current.el.scrollWidth > columnWidth) {
        current.text = current.text.slice(0, -1);
        paint(current);
        const next = makeLine();
        next.text = character;
        paint(next);
        lines.push(next);
        while (lines.length > MAX_LINES) {
          const gone = lines.shift();
          gone.el.remove();
        }
      }
      layout();
    },

    /** The child's text so far, across every line. */
    text() {
      return lines.map((line) => line.text).join("");
    },
  };
}
