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
    if (step === 0) {
      const height = parseFloat(getComputedStyle(el).lineHeight);
      if (Number.isFinite(height) && height > 0) step = height;
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
      el.style.top = `${Math.round(pointY - index * step_)}px`;
      el.className = `line ${index === 0 ? "current" : index === 1 ? "previous" : "older"}`;
    }
    caret.style.top = `${Math.round(pointY - step_)}px`;
    caret.style.height = `${Math.round(step_)}px`;
  }

  return {
    reset() {
      for (const line of lines) line.el.remove();
      lines = [];
      step = 0;
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

    /** Takes back the last characters written, unwrapping a line if it empties. */
    removeTail(count) {
      let remaining = count;
      while (remaining > 0 && lines.length > 0) {
        const line = lines[lines.length - 1];
        if (line.text.length === 0) {
          if (lines.length > 1) {
            line.el.remove();
            lines.pop();
            continue;
          }
          break;
        }
        if (line.text.length > remaining) {
          line.text = line.text.slice(0, line.text.length - remaining);
          remaining = 0;
        } else {
          remaining -= line.text.length;
          line.text = "";
        }
        paint(line);
        if (line.text.length === 0 && lines.length > 1) {
          line.el.remove();
          lines.pop();
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
