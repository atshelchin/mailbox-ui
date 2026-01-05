<script lang="ts">
	import { userStore } from '$lib/stores';
	import { goto } from '$app/navigation';

	async function handleLogout() {
		await userStore.logout();
		goto('/');
	}
</script>

<header class="header">
	<div class="header-inner container">
		<a href="/" class="logo">
			<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="2" y="4" width="20" height="16" rx="2" />
				<path d="M22 7l-10 6L2 7" />
			</svg>
			<span>Mailbox</span>
		</a>

		<nav class="nav">
			{#if userStore.isLoggedIn}
				<a href="/mailboxes" class="nav-link">Mailboxes</a>
				<a href="/domains" class="nav-link">Domains</a>
				<div class="user-menu">
					<span class="username">{userStore.user?.username}</span>
					<button class="btn btn-ghost btn-sm" onclick={handleLogout}>Logout</button>
				</div>
			{:else if userStore.initialized}
				<a href="/login" class="btn btn-ghost btn-sm">Login</a>
				<a href="/register" class="btn btn-primary btn-sm">Register</a>
			{/if}
		</nav>
	</div>
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(10, 10, 11, 0.8);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-border);
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--color-text);
		font-size: 20px;
		font-weight: 700;
	}

	.logo svg {
		color: var(--color-primary);
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.nav-link {
		padding: 8px 14px;
		color: var(--color-text-secondary);
		border-radius: var(--radius-md);
		transition: all var(--transition);
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--color-bg-tertiary);
	}

	.user-menu {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-left: 16px;
		padding-left: 16px;
		border-left: 1px solid var(--color-border);
	}

	.username {
		color: var(--color-text-secondary);
		font-size: 14px;
	}

	@media (max-width: 640px) {
		.nav-link {
			display: none;
		}

		.user-menu {
			margin-left: 0;
			padding-left: 0;
			border-left: none;
		}

		.username {
			display: none;
		}
	}
</style>
