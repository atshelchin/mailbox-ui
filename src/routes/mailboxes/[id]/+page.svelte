<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { userStore } from '$lib/stores';
	import { Modal } from '$lib/components';
	import { getEmails, deleteEmail, type EmailSummary } from '$lib/api';
	import { formatDate, formatBytes } from '$lib/utils';

	let mailboxId = $derived($page.params.id);
	let mailboxAddress = $state('');
	let emails = $state<EmailSummary[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let error = $state('');

	// Delete modal
	let showDeleteModal = $state(false);
	let deleteLoading = $state(false);
	let emailToDelete = $state<EmailSummary | null>(null);

	// Auto refresh
	let refreshInterval: ReturnType<typeof setInterval>;

	onMount(() => {
		if (!userStore.isLoggedIn) {
			goto('/login');
			return;
		}
		loadEmails();

		// Auto refresh every 30 seconds
		refreshInterval = setInterval(loadEmails, 30000);

		return () => {
			if (refreshInterval) clearInterval(refreshInterval);
		};
	});

	async function loadEmails() {
		if (!mailboxId) return;

		const wasLoading = loading;
		if (wasLoading) loading = true;
		error = '';

		const res = await getEmails(mailboxId);

		if (res.success) {
			if (res.mailbox) mailboxAddress = res.mailbox.address;
			if (res.emails) emails = res.emails;
			if (res.total !== undefined) total = res.total;
		} else {
			error = res.error || 'Failed to load emails';
		}

		loading = false;
	}

	function confirmDelete(email: EmailSummary) {
		emailToDelete = email;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (!emailToDelete) return;

		deleteLoading = true;

		const res = await deleteEmail(emailToDelete.id);

		if (res.success) {
			emails = emails.filter(e => e.id !== emailToDelete!.id);
			total = Math.max(0, total - 1);
			showDeleteModal = false;
			emailToDelete = null;
		}

		deleteLoading = false;
	}

	function copyAddress() {
		navigator.clipboard.writeText(mailboxAddress);
	}
</script>

<svelte:head>
	<title>{mailboxAddress || 'Emails'} - Mailbox</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<div>
			<a href="/mailboxes" class="back-link">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
				Back to Mailboxes
			</a>
			<h1 class="page-title email-title">
				{mailboxAddress}
				<button class="copy-btn" onclick={copyAddress} title="Copy address">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="9" y="9" width="13" height="13" rx="2" />
						<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
					</svg>
				</button>
			</h1>
			<p class="page-subtitle">{total} email{total !== 1 ? 's' : ''}</p>
		</div>
		<button class="btn btn-secondary" onclick={loadEmails} disabled={loading}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M23 4v6h-6M1 20v-6h6" />
				<path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
			</svg>
			Refresh
		</button>
	</div>

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else if error}
		<div class="alert alert-error">{error}</div>
	{:else if emails.length === 0}
		<div class="empty-state card">
			<div class="empty-state-icon">📬</div>
			<h3 class="empty-state-title">No emails yet</h3>
			<p>Emails sent to this address will appear here</p>
			<p class="email-address-hint">{mailboxAddress}</p>
		</div>
	{:else}
		<div class="email-list card">
			{#each emails as email (email.id)}
				<div class="email-item">
					<a href="/emails/{email.id}" class="email-link">
						<div class="email-from">{email.from}</div>
						<div class="email-subject">{email.subject || '(No subject)'}</div>
						<div class="email-meta">
							<span>{formatDate(email.receivedAt)}</span>
							{#if email.size}
								<span>·</span>
								<span>{formatBytes(email.size)}</span>
							{/if}
						</div>
					</a>
					<button class="delete-btn" onclick={() => confirmDelete(email)} title="Delete email">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
						</svg>
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Modal -->
<Modal title="Delete Email" open={showDeleteModal} onclose={() => showDeleteModal = false}>
	<p>Are you sure you want to delete this email?</p>
	<p style="color: var(--color-text-secondary); margin-top: 8px">
		From: {emailToDelete?.from}<br />
		Subject: {emailToDelete?.subject || '(No subject)'}
	</p>

	{#snippet footer()}
		<button class="btn btn-secondary" onclick={() => showDeleteModal = false} disabled={deleteLoading}>
			Cancel
		</button>
		<button class="btn btn-danger" onclick={handleDelete} disabled={deleteLoading}>
			{#if deleteLoading}
				<span class="spinner"></span>
			{/if}
			Delete
		</button>
	{/snippet}
</Modal>

<style>
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--color-text-secondary);
		font-size: 14px;
		margin-bottom: 12px;
	}

	.back-link:hover {
		color: var(--color-text);
	}

	.email-title {
		display: flex;
		align-items: center;
		gap: 12px;
		word-break: break-all;
	}

	.copy-btn {
		color: var(--color-text-muted);
		padding: 6px;
		border-radius: var(--radius-sm);
		transition: all var(--transition);
	}

	.copy-btn:hover {
		color: var(--color-text);
		background: var(--color-bg-tertiary);
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: 60px 0;
	}

	.email-address-hint {
		margin-top: 16px;
		padding: 12px 16px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		font-family: monospace;
		font-size: 14px;
		color: var(--color-primary);
	}

	.email-list {
		padding: 0;
		overflow: hidden;
	}

	.email-item {
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--color-border);
	}

	.email-item:last-child {
		border-bottom: none;
	}

	.email-link {
		flex: 1;
		display: grid;
		grid-template-columns: 200px 1fr auto;
		gap: 16px;
		padding: 16px 20px;
		color: var(--color-text);
		transition: background var(--transition);
		min-width: 0;
	}

	.email-link:hover {
		background: var(--color-bg-tertiary);
	}

	.email-from {
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.email-subject {
		color: var(--color-text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.email-meta {
		display: flex;
		gap: 8px;
		font-size: 13px;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.delete-btn {
		padding: 12px 16px;
		color: var(--color-text-muted);
		transition: all var(--transition);
	}

	.delete-btn:hover {
		color: var(--color-error);
		background: rgba(239, 68, 68, 0.1);
	}

	@media (max-width: 768px) {
		.email-link {
			grid-template-columns: 1fr;
			gap: 4px;
		}

		.email-from {
			font-size: 14px;
		}

		.email-subject {
			font-size: 14px;
		}
	}
</style>
