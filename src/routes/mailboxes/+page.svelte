<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores';
	import { Modal } from '$lib/components';
	import { getMailboxes, createMailbox, deleteMailbox, getAllDomains, type Mailbox, type Domain } from '$lib/api';
	import { formatDate, generateRandomLocalPart } from '$lib/utils';

	let mailboxes = $state<Mailbox[]>([]);
	let domains = $state<Domain[]>([]);
	let loading = $state(true);
	let error = $state('');

	// Create modal
	let showCreateModal = $state(false);
	let createLoading = $state(false);
	let createError = $state('');
	let localPart = $state('');
	let selectedDomainId = $state('');

	// Delete modal
	let showDeleteModal = $state(false);
	let deleteLoading = $state(false);
	let mailboxToDelete = $state<Mailbox | null>(null);

	onMount(async () => {
		if (!userStore.isLoggedIn) {
			goto('/login');
			return;
		}
		await loadData();
	});

	async function loadData() {
		loading = true;
		error = '';

		try {
			const [mailboxRes, domainRes] = await Promise.all([
				getMailboxes(),
				getAllDomains()
			]);

			if (mailboxRes.success && mailboxRes.mailboxes) {
				mailboxes = mailboxRes.mailboxes;
			} else {
				error = mailboxRes.error || 'Failed to load mailboxes';
			}

			if (domainRes.success && domainRes.domains) {
				domains = domainRes.domains.filter(d => d.isOfficial || d.isMine);
				if (domains.length > 0) {
					selectedDomainId = domains[0].id;
				}
			}
		} catch {
			error = 'Failed to load data';
		}

		loading = false;
	}

	function openCreateModal() {
		localPart = generateRandomLocalPart();
		createError = '';
		showCreateModal = true;
	}

	function generateRandom() {
		localPart = generateRandomLocalPart();
	}

	async function handleCreate() {
		if (!localPart.trim() || !selectedDomainId) {
			createError = 'Please enter an email address';
			return;
		}

		createLoading = true;
		createError = '';

		const res = await createMailbox(localPart.trim().toLowerCase(), selectedDomainId);

		if (res.success && res.mailbox) {
			mailboxes = [res.mailbox, ...mailboxes];
			showCreateModal = false;
			localPart = '';
		} else {
			createError = res.error || 'Failed to create mailbox';
		}

		createLoading = false;
	}

	function confirmDelete(mailbox: Mailbox) {
		mailboxToDelete = mailbox;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (!mailboxToDelete) return;

		deleteLoading = true;

		const res = await deleteMailbox(mailboxToDelete.id);

		if (res.success) {
			mailboxes = mailboxes.filter(m => m.id !== mailboxToDelete!.id);
			showDeleteModal = false;
			mailboxToDelete = null;
		}

		deleteLoading = false;
	}

	function getSelectedDomainName(): string {
		const domain = domains.find(d => d.id === selectedDomainId);
		return domain?.name || '';
	}
</script>

<svelte:head>
	<title>Mailboxes - Mailbox</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<div>
			<h1 class="page-title">Mailboxes</h1>
			<p class="page-subtitle">Manage your email addresses</p>
		</div>
		<button class="btn btn-primary" onclick={openCreateModal} disabled={domains.length === 0}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 5v14M5 12h14" />
			</svg>
			New Mailbox
		</button>
	</div>

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else if error}
		<div class="alert alert-error">{error}</div>
	{:else if mailboxes.length === 0}
		<div class="empty-state card">
			<div class="empty-state-icon">📭</div>
			<h3 class="empty-state-title">No mailboxes yet</h3>
			<p>Create your first email address to start receiving emails</p>
			<button class="btn btn-primary" onclick={openCreateModal} style="margin-top: 16px">
				Create Mailbox
			</button>
		</div>
	{:else}
		<div class="mailbox-grid">
			{#each mailboxes as mailbox (mailbox.id)}
				<div class="mailbox-card card card-hover">
					<div class="mailbox-info">
						<a href="/mailboxes/{mailbox.id}" class="mailbox-address">{mailbox.address}</a>
						<span class="mailbox-date">Created {formatDate(mailbox.createdAt)}</span>
					</div>
					<div class="mailbox-actions">
						<a href="/mailboxes/{mailbox.id}" class="btn btn-secondary btn-sm">
							View Emails
						</a>
						<button class="btn btn-ghost btn-sm" onclick={() => confirmDelete(mailbox)}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
							</svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create Modal -->
<Modal title="Create Mailbox" open={showCreateModal} onclose={() => showCreateModal = false}>
	{#if createError}
		<div class="alert alert-error" style="margin-bottom: 16px">{createError}</div>
	{/if}

	<div class="form-group">
		<label class="form-label">Email Address</label>
		<div class="email-input-group">
			<div class="email-local">
				<input
					type="text"
					class="input"
					bind:value={localPart}
					placeholder="username"
					disabled={createLoading}
				/>
				<button class="random-btn" onclick={generateRandom} title="Generate random">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M23 4v6h-6M1 20v-6h6" />
						<path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
					</svg>
				</button>
			</div>
			<span class="email-at">@</span>
			<select class="input domain-select" bind:value={selectedDomainId} disabled={createLoading}>
				{#each domains as domain (domain.id)}
					<option value={domain.id}>
						{domain.name}
						{#if domain.isOfficial}(official){/if}
					</option>
				{/each}
			</select>
		</div>
		<p class="form-hint">
			Preview: <strong>{localPart || 'username'}@{getSelectedDomainName()}</strong>
		</p>
	</div>

	{#snippet footer()}
		<button class="btn btn-secondary" onclick={() => showCreateModal = false} disabled={createLoading}>
			Cancel
		</button>
		<button class="btn btn-primary" onclick={handleCreate} disabled={createLoading}>
			{#if createLoading}
				<span class="spinner"></span>
			{/if}
			Create Mailbox
		</button>
	{/snippet}
</Modal>

<!-- Delete Modal -->
<Modal title="Delete Mailbox" open={showDeleteModal} onclose={() => showDeleteModal = false}>
	<p>Are you sure you want to delete <strong>{mailboxToDelete?.address}</strong>?</p>
	<p style="color: var(--color-text-secondary); margin-top: 8px">
		All emails in this mailbox will be permanently deleted.
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
	.loading {
		display: flex;
		justify-content: center;
		padding: 60px 0;
	}

	.mailbox-grid {
		display: grid;
		gap: 12px;
	}

	.mailbox-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.mailbox-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.mailbox-address {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mailbox-address:hover {
		color: var(--color-primary);
	}

	.mailbox-date {
		font-size: 13px;
		color: var(--color-text-muted);
	}

	.mailbox-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.email-input-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.email-local {
		flex: 1;
		display: flex;
		gap: 8px;
	}

	.email-local .input {
		flex: 1;
	}

	.random-btn {
		padding: 12px;
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		transition: all var(--transition);
	}

	.random-btn:hover {
		background: var(--color-bg-hover);
		color: var(--color-text);
	}

	.email-at {
		color: var(--color-text-muted);
		font-size: 18px;
	}

	.domain-select {
		width: auto;
		min-width: 160px;
	}

	@media (max-width: 640px) {
		.mailbox-card {
			flex-direction: column;
			align-items: flex-start;
		}

		.mailbox-actions {
			width: 100%;
		}

		.mailbox-actions .btn {
			flex: 1;
		}

		.email-input-group {
			flex-direction: column;
		}

		.email-local {
			width: 100%;
		}

		.email-at {
			display: none;
		}

		.domain-select {
			width: 100%;
		}
	}
</style>
