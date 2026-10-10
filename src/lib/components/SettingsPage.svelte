<script lang="ts">
	import { SvelteMap, SvelteSet } from "svelte/reactivity";
	import { addWord, type List } from "#lib/lists.js";
	import WordRow from "./WordRow.svelte";

	/**
	 * The settings page: the lists the app marks, the words on each of them, and
	 * how each word is drawn — its emoji, or a picture in the emoji's place.
	 *
	 * It holds no data. It draws the lists it is handed and gives every change
	 * back through `applyLists`; storing them and redrawing the child's screen
	 * belong to the caller. The look is the app's own: one large text size,
	 * black on white (`src/app.css`, DESIGN.md).
	 */

	/** How long a Restore waits for its second tap before it stands down. */
	const RESTORE_ARM_MS = 5000;

	let {
		lists,
		activeIds,
		hidden = false,
		onClose,
		onToggleList,
		applyLists,
		restore
	}: {
		lists: List[];
		activeIds: readonly string[];
		hidden?: boolean;
		onClose: () => void;
		onToggleList: (id: string, on: boolean) => void;
		applyLists: (next: List[]) => Promise<string | null>;
		restore: () => Promise<void>;
	} = $props();

	/** The lists whose words the parent has opened, kept across a redraw. */
	const opened = new SvelteSet<string>();
	/** What the parent has typed into an add field, so a refusal keeps it there. */
	const drafts = new SvelteMap<string, string>();
	/** Why an add was refused, or a picture refused, under the list it happened on. */
	const errors = new SvelteMap<string, string>();
	/** Whether a Restore is waiting for its second tap. */
	let armed = $state(false);
	/** Why the last Restore failed, when it did. */
	let restoreError = $state<string | null>(null);
	let armTimer: ReturnType<typeof setTimeout> | undefined;

	/**
	 * Applies a change to a list. `applyLists` hands back a message when the
	 * device would not keep the change, and that is put where the list's other
	 * answers go.
	 */
	async function change(listId: string, next: List[]): Promise<void> {
		const refused = await applyLists(next);
		if (refused !== null) errors.set(listId, refused);
	}

	/** Adds the parent's word to a list, or says why it will not go on. */
	async function add(listId: string, typed: string): Promise<void> {
		const result = addWord(lists, listId, typed);
		if (result.error !== null) {
			errors.set(listId, result.error);
			return;
		}
		errors.delete(listId);
		drafts.delete(listId);
		await change(listId, result.lists);
	}

	/** Opens a list's words, or closes them again. */
	function toggleWords(listId: string): void {
		if (opened.has(listId)) opened.delete(listId);
		else opened.add(listId);
	}

	/** Puts the built-in lists back, on the second tap of a two-tap Restore. */
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
			restoreError = "The app could not put the built-in lists back.";
		}
	}
</script>

<section id="settings" {hidden}>
	<header>
		<h1>Settings</h1>
		<button type="button" onclick={onClose}>Close</button>
	</header>

	{#each lists as list (list.id)}
		<section class="list">
			<div class="head">
				<label class="switch">
					<input
						type="checkbox"
						checked={activeIds.includes(list.id)}
						onchange={(event) => onToggleList(list.id, event.currentTarget.checked)}
					/>
					<span class="name">{list.name}</span>
				</label>
				<span class="count">({list.words.length})</span>
				<button type="button" class="more" onclick={() => toggleWords(list.id)}>
					{opened.has(list.id) ? "Hide words" : "Words"}
				</button>
			</div>

			<div class="words" hidden={!opened.has(list.id)}>
				{#each list.words as entry (entry.word)}
					<WordRow
						{lists}
						listId={list.id}
						{entry}
						change={(next) => void change(list.id, next)}
						onError={(message) => errors.set(list.id, message)}
					/>
				{/each}
				<div class="add">
					<input
						type="text"
						class="new"
						placeholder="Add a word"
						aria-label={`Add a word to ${list.name}`}
						value={drafts.get(list.id) ?? ""}
						oninput={(event) => drafts.set(list.id, event.currentTarget.value)}
						onkeydown={(event) => {
							if (event.key !== "Enter") return;
							event.preventDefault();
							void add(list.id, drafts.get(list.id) ?? "");
						}}
					/>
					<button type="button" class="submit" onclick={() => void add(list.id, drafts.get(list.id) ?? "")}>Add</button>
				</div>
				{#if errors.has(list.id)}
					<p class="error">{errors.get(list.id)}</p>
				{/if}
			</div>
		</section>
	{/each}

	<div class="restore">
		<button type="button" class="restore-button" onclick={onRestore}>
			{armed ? "Tap again to restore" : "Restore built-in lists"}
		</button>
		<p class="note">
			{restoreError ?? "Restoring puts the built-in lists back and takes your words, emojis and pictures off this device."}
		</p>
	</div>

	<p class="hint">Hold the left and right Shift keys for three seconds to open this page while the app is full screen.</p>
</section>
