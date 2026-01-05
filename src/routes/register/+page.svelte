<script lang="ts">
	import { register } from '$lib/api';
	import { userStore } from '$lib/stores';
	import { goto } from '$app/navigation';

	let username = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const trimmed = username.trim();

		if (!trimmed) {
			error = 'Please enter a username';
			return;
		}

		if (trimmed.length < 3) {
			error = 'Username must be at least 3 characters';
			return;
		}

		if (trimmed.length > 32) {
			error = 'Username must be at most 32 characters';
			return;
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
			error = 'Username can only contain letters, numbers, underscores, and hyphens';
			return;
		}

		loading = true;
		error = '';

		const res = await register(trimmed);

		if (res.success && res.user) {
			userStore.setUser(res.user);
			goto('/mailboxes');
		} else {
			error = res.error || 'Registration failed';
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Register - Mailbox</title>
</svelte:head>

<div class="auth-page container">
	<div class="auth-card card">
		<div class="auth-header">
			<h1>Create Account</h1>
			<p>Set up your account with a passkey</p>
		</div>

		<form onsubmit={handleSubmit}>
			{#if error}
				<div class="alert alert-error">{error}</div>
			{/if}

			<div class="form-group">
				<label class="form-label" for="username">Username</label>
				<input
					type="text"
					id="username"
					class="input"
					bind:value={username}
					placeholder="Choose a username"
					autocomplete="username webauthn"
					disabled={loading}
				/>
				<p class="form-hint">3-32 characters, letters, numbers, underscores, hyphens</p>
			</div>

			<button type="submit" class="btn btn-primary btn-block" disabled={loading}>
				{#if loading}
					<span class="spinner"></span>
					Creating Passkey...
				{:else}
					Create Account with Passkey
				{/if}
			</button>
		</form>

		<div class="passkey-info">
			<h3>What is a Passkey?</h3>
			<p>
				Passkeys are a secure, passwordless way to sign in. Your device will use
				biometrics (fingerprint, face) or a security key to verify your identity.
			</p>
		</div>

		<div class="auth-footer">
			<p>Already have an account? <a href="/login">Sign in</a></p>
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
	}

	.passkey-info h3 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 8px;
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
