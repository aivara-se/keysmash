/**
 * Longest edge of the picture a word is drawn with, in pixels. A word's picture
 * sits in a pill beside its letters, and a photo off a camera roll is orders of
 * magnitude larger than that; keeping the whole file would put megabytes in the
 * database per word and megabytes through the DOM on every redraw.
 */
const MAX_EDGE = 512;

/**
 * Turns the file the parent chose into the picture a word is drawn with: scaled
 * to fit MAX_EDGE and returned as a data URL, so it is stored in the same
 * record as the word and drawn without an object URL to keep alive (SYSTEM.md).
 */
export async function toPillImage(file) {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    bitmap.close();
  }
}
