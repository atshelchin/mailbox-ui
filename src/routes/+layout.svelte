<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components';
	import { userStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		userStore.init();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<Header />

<main class="main">
	{#if userStore.loading && !userStore.initialized}
		<div class="loading-screen">
			<div class="spinner"></div>
		</div>
	{:else}
		{@render children()}
	{/if}
</main>

<style>
	.main {
		min-height: calc(100vh - 64px);
		padding: 32px 0;
	}

	.loading-screen {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
	}
</style>
