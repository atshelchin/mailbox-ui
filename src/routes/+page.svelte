<script lang="ts">
	import { userStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (userStore.isLoggedIn) {
			goto('/mailboxes');
		}
	});
</script>

<svelte:head>
	<title>Mailbox - Disposable Email Service</title>
</svelte:head>

<div class="hero container">
	<div class="hero-content">
		<h1 class="hero-title">
			Disposable Email
			<span class="gradient-text">Made Simple</span>
		</h1>
		<p class="hero-subtitle">
			Create temporary email addresses instantly. Protect your privacy, avoid spam,
			and manage multiple inboxes with ease.
		</p>

		<div class="hero-actions">
			<a href="/register" class="btn btn-primary btn-lg">Get Started</a>
			<a href="/login" class="btn btn-secondary btn-lg">Sign In</a>
		</div>

		<div class="features">
			<div class="feature">
				<div class="feature-icon">🔐</div>
				<h3>Passkey Authentication</h3>
				<p>Secure, passwordless login with biometrics or security keys</p>
			</div>
			<div class="feature">
				<div class="feature-icon">📧</div>
				<h3>Instant Mailboxes</h3>
				<p>Create random or custom email addresses in seconds</p>
			</div>
			<div class="feature">
				<div class="feature-icon">🌐</div>
				<h3>Custom Domains</h3>
				<p>Use your own domain for a professional touch</p>
			</div>
		</div>
	</div>
</div>

<style>
	.hero {
		text-align: center;
		padding: 60px 0;
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-title {
		font-size: 56px;
		font-weight: 800;
		line-height: 1.1;
		margin-bottom: 24px;
	}

	.gradient-text {
		display: block;
		background: linear-gradient(135deg, var(--color-primary) 0%, #a855f7 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 20px;
		color: var(--color-text-secondary);
		line-height: 1.6;
		margin-bottom: 40px;
	}

	.hero-actions {
		display: flex;
		justify-content: center;
		gap: 16px;
		margin-bottom: 80px;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 32px;
		text-align: left;
	}

	.feature {
		padding: 28px;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: all var(--transition);
	}

	.feature:hover {
		border-color: var(--color-border-light);
		transform: translateY(-2px);
	}

	.feature-icon {
		font-size: 32px;
		margin-bottom: 16px;
	}

	.feature h3 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.feature p {
		color: var(--color-text-secondary);
		font-size: 14px;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.hero-title {
			font-size: 36px;
		}

		.hero-subtitle {
			font-size: 16px;
		}

		.hero-actions {
			flex-direction: column;
		}

		.features {
			grid-template-columns: 1fr;
		}
	}
</style>
