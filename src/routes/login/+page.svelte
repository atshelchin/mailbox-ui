<script lang="ts">
	import { login } from '$lib/api';
	import { userStore } from '$lib/stores';
	import { goto } from '$app/navigation';

	let loading = $state(false);
	let error = $state('');

	async function handleLogin() {
		loading = true;
		error = '';

		const res = await login();

		if (res.success && res.user) {
			userStore.setUser(res.user);
			goto('/mailboxes');
		} else {
			error = res.error || 'Login failed';
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Login - Mailbox</title>
</svelte:head>

<div class="auth-page container">
	<div class="auth-card card">
		<div class="auth-header">
			<div class="passkey-icon">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5z" />
					<path d="M8.5 14h7a4 4 0 014 4v4H4.5v-4a4 4 0 014-4z" />
				</svg>
			</div>
			<h1>Welcome Back</h1>
			<p>Sign in with your passkey</p>
		</div>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		<button class="btn btn-primary btn-block btn-lg" onclick={handleLogin} disabled={loading}>
			{#if loading}
				<span class="spinner"></span>
				Authenticating...
			{:else}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2a5 5 0 015 5v2a5 5 0 01-10 0V7a5 5 0 015-5z" />
					<path d="M12 14v4" />
					<circle cx="12" cy="21" r="1" />
				</svg>
				Sign In with Passkey
			{/if}
		</button>

		<div class="passkey-info">
			<p>
				Your browser will prompt you to use your passkey.
				This could be a fingerprint, face recognition, or security key.
			</p>
		</div>

		<div class="auth-footer">
			<p>Don't have an account? <a href="/register">Create one</a></p>
		</div>
	</div>
</div>

<style>
	.auth-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
	}

	.auth-card {
		width: 100%;
		max-width: 400px;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 32px;
	}

	.passkey-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background: linear-gradient(135deg, var(--color-primary) 0%, #a855f7 100%);
		border-radius: 50%;
		margin-bottom: 24px;
		color: white;
	}

	.auth-header h1 {
		font-size: 28px;
		font-weight: 700;
		margin-bottom: 8px;
	}

	.auth-header p {
		color: var(--color-text-secondary);
	}

	.alert {
		margin-bottom: 20px;
	}

	.btn-block {
		width: 100%;
	}

	.passkey-info {
		margin-top: 24px;
		padding: 16px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		text-align: center;
	}

	.passkey-info p {
		font-size: 13px;
		color: var(--color-text-secondary);
		line-height: 1.5;
	}

	.auth-footer {
		text-align: center;
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid var(--color-border);
		color: var(--color-text-secondary);
	}
</style>
