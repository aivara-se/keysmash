<script lang="ts">
  import { toPillImage } from "#lib/images.js";
  import {
    addWord,
    clearImage,
    CUSTOM_PACK_ID,
    drawingOf,
    removeWord,
    setEmoji,
    setImage,
    type Pack,
  } from "#lib/packs.js";

  /**
   * The settings page: the language the app marks, and the parent's own words
   * drawn on it as the child's screen draws them — a pill each, with its
   * emoji or its picture.
   *
   * It holds no data. It draws the packs it is handed and gives every change
   * back through `applyPacks`; storing them and redrawing the child's screen
   * belong to the caller. The look is the app's own: one large text size,
   * black on white, pills the size of the ones the child sees
   * (`src/app.css`, DESIGN.md).
   */

  /** How long a Restore waits for its second tap before it stands down. */
  const RESTORE_ARM_MS = 5000;

  let {
    packs,
    language,
    hidden = false,
    onClose,
    onLanguage,
    applyPacks,
    restore,
  }: {
    packs: Pack[];
    language: string;
    hidden?: boolean;
    onClose: () => void;
    onLanguage: (id: string) => void;
    applyPacks: (next: Pack[]) => Promise<string | null>;
    restore: () => Promise<void>;
  } = $props();

  /** The languages to choose between: every pack but the parent's own. */
  const languages = $derived(
    packs.filter((pack) => pack.id !== CUSTOM_PACK_ID),
  );
  /** The parent's own words, marked whatever language is chosen. */
  const mine = $derived(packs.find((pack) => pack.id === CUSTOM_PACK_ID));
  /** The word whose emoji or picture the parent is choosing, or null. */
  let picking = $state<string | null>(null);
  /** Whether the empty pill a new word is typed into is on the page. */
  let adding = $state(false);
  /** What the parent has typed into that pill. */
  let typed = $state("");
  /** Why a word was refused, or a picture refused. */
  let error = $state<string | null>(null);
  /** Whether a Restore is waiting for its second tap. */
  let armed = $state(false);
  /** Why the last Restore failed, when it did. */
  let restoreError = $state<string | null>(null);
  let armTimer: ReturnType<typeof setTimeout> | undefined;

  /** Puts the cursor in the new pill's field as soon as it is drawn. */
  function focus(node: HTMLInputElement): void {
    node.focus();
  }

  /** Applies a change to the packs; a device that will not keep it is told here. */
  async function change(next: Pack[]): Promise<void> {
    const refused = await applyPacks(next);
    if (refused !== null) error = refused;
  }

  /** Adds the typed word to My words, or says why it will not go there. */
  async function commit(): Promise<void> {
    if (!adding) return;
    if (typed.trim() === "") {
      adding = false;
      return;
    }
    const result = addWord(packs, CUSTOM_PACK_ID, typed);
    if (result.error !== null) {
      error = result.error;
      return;
    }
    error = null;
    adding = false;
    typed = "";
    await change(result.packs);
  }

  /**
   * Sets the word's emoji, and takes its picture away: the emoji field is the
   * pill's own drawing, so clearing it leaves the word with nothing drawn.
   */
  function setTheEmoji(word: string, value: string): void {
    const next = clearImage(
      setEmoji(packs, CUSTOM_PACK_ID, word, value),
      CUSTOM_PACK_ID,
      word,
    );
    void change(next);
    picking = null;
  }

  /** Gives the word a picture off the device, drawn where its emoji would be. */
  async function setThePicture(word: string, event: Event): Promise<void> {
    const chosen = (event.currentTarget as HTMLInputElement).files?.[0];
    if (chosen === undefined) return;
    try {
      void change(
        setImage(packs, CUSTOM_PACK_ID, word, await toPillImage(chosen)),
      );
      picking = null;
    } catch {
      error = "That file is not a picture the app can read.";
    }
  }

  /** Takes a word off My words. */
  function remove(word: string): void {
    void change(removeWord(packs, CUSTOM_PACK_ID, word));
  }

  /** Puts the built-in words back, on the second tap of a two-tap Restore. */
  async function onRestore(): Promise<void> {
    if (!armed) {
      armed = true;
      clearTimeout(armTimer);
      armTimer = setTimeout(() => {
        armed = false;
      }, RESTORE_ARM_MS);
      return;
    }
    armed = false;
    clearTimeout(armTimer);
    try {
      await restore();
      restoreError = null;
    } catch {
      restoreError = "The app could not put the built-in words back.";
    }
  }
</script>

<section id="settings" {hidden}>
  <header>
    <h1>Settings</h1>
    <button
      type="button"
      class="close"
      aria-label="Close settings"
      onclick={onClose}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M5 5l14 14" />
        <path d="M19 5L5 19" />
      </svg>
    </button>
  </header>

  <section class="language">
    <h2>Language</h2>
    {#each languages as pack (pack.id)}
      <label class="choice">
        <input
          type="radio"
          name="language"
          value={pack.id}
          checked={language === pack.id}
          onchange={() => onLanguage(pack.id)}
        />
        <span class="name">{pack.name}</span>
        <span class="count">({pack.words.length})</span>
      </label>
    {/each}
  </section>

  {#if mine !== undefined}
    <section class="mine">
      <h2>My words <span class="count">({mine.words.length})</span></h2>
      <div class="pills">
        {#each mine.words as entry (entry.word)}
          {@const art = drawingOf(entry)}
          <span class="pill mark" data-color={art.color}>
            <button
              type="button"
              class="art"
              aria-label={`Image for ${entry.word}`}
              onclick={() =>
                (picking = picking === entry.word ? null : entry.word)}
            >
              {#if art.image !== undefined}
                <img src={art.image} alt="" />
              {:else if art.emoji !== undefined}
                {art.emoji}
              {:else}
                <span class="none"></span>
              {/if}
            </button>
            <span class="letters">{entry.word}</span>
            <button
              type="button"
              class="remove"
              aria-label={`Remove ${entry.word}`}
              onclick={() => remove(entry.word)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
            {#if picking === entry.word}
              <div class="pick">
                <input
                  type="text"
                  class="emoji"
                  placeholder="emoji"
                  aria-label={`Emoji for ${entry.word}`}
                  value={entry.emoji ?? ""}
                  onchange={(event) =>
                    setTheEmoji(entry.word, event.currentTarget.value)}
                />
                <label class="picture">
                  Picture
                  <input
                    type="file"
                    accept="image/*"
                    aria-label={`Picture for ${entry.word}`}
                    onchange={(event) => void setThePicture(entry.word, event)}
                  />
                </label>
              </div>
            {/if}
          </span>
        {/each}

        {#if adding}
          <span class="pill mark">
            <span class="art none-slot"><span class="none"></span></span>
            <input
              class="new"
              type="text"
              placeholder="word"
              aria-label="Add a word to My words"
              bind:value={typed}
              use:focus
              onkeydown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void commit();
                }
                if (event.key === "Escape") adding = false;
              }}
              onblur={() => void commit()}
            />
            <button
              type="button"
              class="remove"
              aria-label="Cancel"
              onclick={() => (adding = false)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </span>
        {/if}

        <button
          type="button"
          class="add"
          aria-label="Add a word"
          disabled={adding}
          onclick={() => {
            picking = null;
            typed = "";
            adding = true;
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>
      {#if error !== null}
        <p class="error">{error}</p>
      {/if}
    </section>
  {/if}

  <div class="restore">
    <button type="button" class="restore-button" onclick={onRestore}>
      {armed ? "Tap again to restore" : "Restore built-in words"}
    </button>
    <p class="note">
      {restoreError ??
        "Restoring puts the built-in words back and takes your words, emojis and pictures off this device."}
    </p>
  </div>

  <p class="hint">
    Hold the left and right Shift keys for three seconds to open this page while
    the app is full screen.
  </p>
</section>
