import { asset } from "$app/paths";
import type { AssetPath } from "$app/types";

/**
 * The URL of a file in `static/` whose name the app only knows at run time: the
 * built-in lists are read from an index the parent can extend, and a letter's
 * clip is named by the key the child pressed. `asset()` is the same call for a
 * name the build knows; it is narrowed to the files that ship, so a name built
 * from data needs the path it already is. Both resolve under the base the app
 * is served from, and neither leaves the device.
 */
export function assetUrl(path: string): string {
  return asset(path as AssetPath);
}
