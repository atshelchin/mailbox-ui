<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		open: boolean;
		onclose: () => void;
		children: Snippet;
		footer?: Snippet;
	}

	let { title, open, onclose, children, footer }: Props = $props();

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onclose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={handleBackdrop}>
		<div class="modal" role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2 class="modal-title">{title}</h2>
				<button class="modal-close" onclick={onclose} aria-label="Close">×</button>
			</div>
			<div class="modal-body">
				{@render children()}
			</div>
			{#if footer}
				<div class="modal-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
