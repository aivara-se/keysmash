<script lang="ts">
	import { onMount } from "svelte";
	import SettingsPage from "#lib/components/SettingsPage.svelte";
	import TextScreen from "#lib/components/TextScreen.svelte";
	import { wordsFor, type List } from "#lib/lists.js";
	import { createSettings } from "#lib/settings.js";
	import { createSpeech } from "#lib/speech.js";
	import { createStore } from "#lib/store.js";
	import { READ_IDLE_MS, SPEAK_DEBOUNCE_MS } from "#lib/thresholds.js";
	import { markText, newUtterances } from "#lib/words.js";

	/** The two keys a parent holds to open the settings page while the app is full screen. */
	const EXIT_KEYS = new Set(["ShiftLeft", "ShiftRight"]);
	const EXIT_HOLD_MS = 3000;

	const store = createStore();
	const settings = createSettings();
	const speech = createSpeech();

	/** The lists the app draws from: the device's copy, seeded on first run. */
	let lists = $state<List[]>([]);
	/** The child's text: written one keypress at a time, never rewritten. */
	let text = $state("");
	/** The lists whose words are marked, kept on the device in localStorage. */
	let activeIds = $state<string[]>([]);
	/** Whether the parent's page is over the child's screen. */
	let settingsOpen = $state(false);
	/** The device is holding the screen, so the corner controls are gone. */
	let fullscreen = $state(false);
	/** The keys of the parent's hold that are down, and the timer its hold started. */
	let exitTimer: ReturnType<typeof setTimeout> | undefined;
	let readTimer: ReturnType<typeof setTimeout> | undefined;
	let speakTimer: ReturnType<typeof setTimeout> | undefined;
	const exitDown = new Set<string>();
	/** What was last spoken at each mark position, so a word is spoken once. */
	const spoken = new Map<number, string>();

	const activeWords = $derived(wordsFor(activeIds, lists));

	/**
	 * Writes the character at the caret and speaks its name only when nothing
	 * else follows inside SPEAK_DEBOUNCE_MS — so a flurry is written, not read
	 * aloud, and only the letter the child stops on is named.
	 */
	function write(character: string): void {
		text += character;
		if (!/^[A-Za-z]$/.test(character)) return;
		clearTimeout(speakTimer);
		speakTimer = setTimeout(() => speech.letter(character), SPEAK_DEBOUNCE_MS);
	}

	/**
	 * After the child stops: reads the marks in the text and speaks the new ones,
	 * then finishes a completed word with a space, so the next letter starts a
	 * new word instead of growing the one just read. It waits for the stop, so a
	 * word still being typed — "cats" on its way — is left alone.
	 */
	function readWords(): void {
		const marks = markText(text, activeWords);
		for (const utterance of newUtterances(marks, spoken)) speech.word(utterance);
		const last = marks[marks.length - 1];
		if (last !== undefined && last.end === text.length) text += " ";
	}

	/** A word or number is read this long after the child stops. */
	function noteStop(): void {
		clearTimeout(readTimer);
		readTimer = setTimeout(readWords, READ_IDLE_MS);
	}

	/** Starts, or leaves running, the hold that opens the parent's page. */
	function holdExit(code: string): void {
		exitDown.add(code);
		if (exitDown.size === EXIT_KEYS.size && exitTimer === undefined) {
			exitTimer = setTimeout(openSettings, EXIT_HOLD_MS);
		}
	}

	/** Ends the hold: one of its keys came up before it ran its time. */
	function releaseExit(code: string): void {
		exitDown.delete(code);
		clearTimeout(exitTimer);
		exitTimer = undefined;
	}

	function onKeyDown(event: KeyboardEvent): void {
		if (settingsOpen) return;
		if (EXIT_KEYS.has(event.code)) return holdExit(event.code);
		// Auto-repeat is the same key still down, not a new press: one character.
		if (event.repeat || event.key.length !== 1) return;
		noteStop();
		write(event.key);
	}

	function onKeyUp(event: KeyboardEvent): void {
		if (settingsOpen) return;
		if (EXIT_KEYS.has(event.code)) releaseExit(event.code);
	}

	function openSettings(): void {
		settingsOpen = true;
		clearTimeout(readTimer);
		exitDown.clear();
		exitTimer = undefined;
	}

	function closeSettings(): void {
		settingsOpen = false;
	}

	/** Keeps the parent's choice of lists on the device, and marks by it. */
	function setActiveIds(ids: string[]): void {
		settings.setActiveListIds(ids);
		activeIds = ids;
	}

	/** Turns one list on or off, taking the ids back in the order the lists are held. */
	function toggleList(id: string, on: boolean): void {
		const chosen = new Set(activeIds);
		if (on) chosen.add(id);
		else chosen.delete(id);
		setActiveIds(lists.filter((list) => chosen.has(list.id)).map((list) => list.id));
	}

	/**
	 * Shows the parent's change at once, then keeps it; a device that will not
	 * keep it says so.
	 */
	async function applyLists(next: List[]): Promise<string | null> {
		const before = new Map(lists.map((list) => [list.id, list]));
		lists = next;
		for (const list of next) {
			if (before.get(list.id) === list) continue;
			try {
				await store.put(list);
			} catch {
				return "The device would not keep that change.";
			}
		}
		return null;
	}

	/** Puts the built-in lists back, taking the parent's edits off the device. */
	async function restore(): Promise<void> {
		await store.restore();
		lists = await store.lists();
	}

	async function toggleFullscreen(): Promise<void> {
		try {
			if (document.fullscreenElement !== null) await document.exitFullscreen();
			else await document.documentElement.requestFullscreen();
		} catch {
			// The device refused full screen: the app still plays.
		}
	}

	/** The corner controls are the parent's, and they go while the app has the screen. */
	function syncControls(): void {
		fullscreen = document.fullscreenElement !== null;
	}

	onMount(() => {
		speech.ready();
		syncControls();
		document.addEventListener("fullscreenchange", syncControls);
		void (async () => {
			try {
				lists = await store.lists();
			} catch {
				// A device that will not give the page a database still plays; nothing is marked.
				lists = [];
			}
			activeIds = settings.activeListIds(lists.map((list) => list.id));
		})();
		return () => document.removeEventListener("fullscreenchange", syncControls);
	});

	// A list turning on or off changes what the text marks, so the words the app
	// has already spoken are spoken again against the lists the parent chose.
	$effect(() => {
		void activeWords;
		spoken.clear();
	});
</script>

<svelte:window onkeydown={onKeyDown} onkeyup={onKeyUp} />

<section id="play">
	<TextScreen {text} words={activeWords} />
	{#if !fullscreen}
		<div id="controls">
			<button type="button" aria-label="Full screen" onclick={toggleFullscreen}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
					<path d="M4 9V4h5" />
					<path d="M15 4h5v5" />
					<path d="M20 15v5h-5" />
					<path d="M9 20H4v-5" />
				</svg>
			</button>
			<button type="button" aria-label="Settings" onclick={openSettings}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="12" cy="12" r="3" />
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
				</svg>
			</button>
		</div>
	{/if}
</section>

<SettingsPage
	{lists}
	{activeIds}
	{applyLists}
	{restore}
	onToggleList={toggleList}
	onClose={closeSettings}
	hidden={!settingsOpen}
/>
