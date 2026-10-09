import { markText } from "./words.js";

/** How many lines above the current line the fade runs over. */
const FADE_LINES = 2.5;

/**
 * Draws the text on the one screen (DESIGN.md): left-aligned and anchored to
 * the bottom of the padded area, wrapping at the right edge, the caret drawn
 * after the newest character. As the text grows the older lines move up and
 * leave at the top, and the lines above the current one fade out with their
 * distance from it.
 */
export function createRender({ screen, wordsFor }) {
  const textEl = document.createElement("div");
  textEl.id = "text";
  const caret = document.createElement("span");
  caret.className = "caret";
  screen.append(textEl);

  let text = "";

  /** The top of the line the caret is on, in the screen's own coordinates. */
  function currentLineTop() {
    const range = document.createRange();
    range.selectNodeContents(textEl);
    const rects = range.getClientRects();
    return rects.length > 0 ? rects[rects.length - 1].top : screen.clientHeight;
  }

  /**
   * Fade the lines above the current one: a mask that is clear above the
   * current line and solid at it. It moves with the caret, so the fade follows
   * the newest line however far the text has scrolled.
   */
  function fade() {
    const current = currentLineTop();
    const lineHeight = parseFloat(getComputedStyle(screen).lineHeight) || 0;
    const start = Math.max(0, current - lineHeight * FADE_LINES);
    const gradient = `linear-gradient(to bottom, transparent ${start}px, black ${current}px)`;
    screen.style.maskImage = gradient;
    screen.style.setProperty("-webkit-mask-image", gradient);
  }

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
    fade();
  }

  return {
    reset() {
      text = "";
      paint();
    },

    resize() {
      screen.scrollTop = screen.scrollHeight;
      fade();
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
