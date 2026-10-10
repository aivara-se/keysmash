<script lang="ts">
	import { onMount } from "svelte";
	import { markText, type Drawing, type Mark } from "#lib/words.js";

	/** A run of the text as the screen draws it: the characters, and its mark when it is one. */
	interface Piece {
		text: string;
		mark: Mark | undefined;
	}

	let { text, words }: { text: string; words: ReadonlyMap<string, Drawing> } = $props();

	let screen = $state<HTMLElement | null>(null);
	let textEl = $state<HTMLElement | null>(null);
	/** Bumped by a resize, so the mask is measured again against the new text size. */
	let resizes = $state(0);

	/** How many lines above the current line the fade runs over. */
	const FADE_LINES = 2.5;

	/** The text cut into the runs the screen draws. */
	const pieces = $derived(split(text, words));

	onMount(() => {
		const onResize = () => {
			resizes += 1;
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	});

	/** The text cut into the runs the screen draws: a mark, then the plain text between marks. */
	function split(text: string, words: ReadonlyMap<string, Drawing>): Piece[] {
		const pieces: Piece[] = [];
		let cursor = 0;
		for (const mark of markText(text, words)) {
			pieces.push({ text: text.slice(cursor, mark.start), mark: undefined });
			pieces.push({ text: text.slice(mark.start, mark.end), mark });
			cursor = mark.end;
		}
		pieces.push({ text: text.slice(cursor), mark: undefined });
		return pieces;
	}

	/**
	 * Fades the lines above the current one: a mask that is clear above the
	 * current line and solid at it. It moves with the caret, so the fade follows
	 * the newest line however far the text has scrolled. The gradient is in the
	 * screen's own coordinates, so the line's top is measured from the screen's
	 * top edge.
	 */
	function fade(container: HTMLElement, content: HTMLElement): void {
		const range = document.createRange();
		range.selectNodeContents(content);
		const rects = range.getClientRects();
		const lineTop = rects.length > 0 ? rects[rects.length - 1].top - container.getBoundingClientRect().top : container.clientHeight;
		const lineHeight = parseFloat(getComputedStyle(container).lineHeight) || 0;
		const start = Math.max(0, lineTop - lineHeight * FADE_LINES);
		const gradient = `linear-gradient(to bottom, transparent ${start}px, black ${lineTop}px)`;
		container.style.maskImage = gradient;
		container.style.setProperty("-webkit-mask-image", gradient);
	}

	// An effect runs after the DOM the update produced, so this follows what the
	// screen now holds: the older lines leave at the top and the newest line
	// stays on the bottom padding. It follows the runs rather than the text, so
	// a word the parent adds while the child's text is on the screen re-measures
	// the fade and the bottom anchor too.
	$effect(() => {
		void pieces;
		void resizes;
		const container = screen;
		const content = textEl;
		if (container === null || content === null) return;
		container.scrollTop = container.scrollHeight;
		fade(container, content);
	});
</script>

<!-- The runs are written with no space between them: the screen draws the
     child's characters and nothing else. -->
<main id="screen" bind:this={screen} aria-label="Keysmash"><div id="text" bind:this={textEl}>{#each pieces as piece}{#if piece.mark !== undefined}<span class="mark" data-color={piece.mark.color} data-kind={piece.mark.kind === "number" ? "number" : undefined} data-emoji={piece.mark.image === undefined ? piece.mark.emoji : undefined}>{#if piece.mark.image !== undefined}<img src={piece.mark.image} alt="" />{/if}{piece.text}</span>{:else}{piece.text}{/if}{/each}<span class="caret"></span></div></main>
