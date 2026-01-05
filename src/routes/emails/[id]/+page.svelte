<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { userStore } from '$lib/stores';
	import { Modal } from '$lib/components';
	import { getEmail, deleteEmail, getRawEmailUrl, getAttachmentUrl, type Email } from '$lib/api';
	import { formatDate, formatBytes } from '$lib/utils';

	let emailId = $derived($page.params.id);
	let email = $state<Email | null>(null);
	let loading = $state(true);
	let error = $state('');
	let viewMode = $state<'html' | 'text'>('html');

	// Delete modal
	let showDeleteModal = $state(false);
	let deleteLoading = $state(false);

	onMount(async () => {
		if (!userStore.isLoggedIn) {
			goto('/login');
			return;
		}
		await loadEmail();
	});

	async function loadEmail() {
		if (!emailId) return;

		loading = true;
		error = '';

		const res = await getEmail(emailId);

		if (res.success && res.email) {
			email = res.email;
			// Default to HTML if available, otherwise text
			viewMode = email.htmlBody ? 'html' : 'text';
		} else {
			error = res.error || 'Failed to load email';
		}

		loading = false;
	}

	async function handleDelete() {
		if (!email) return;

		deleteLoading = true;

		const res = await deleteEmail(email.id);

		if (res.success) {
			// Go back to mailbox
			history.back();
		}

		deleteLoading = false;
	}

	function downloadRaw() {
		if (!email) return;
		window.open(getRawEmailUrl(email.id), '_blank');
	}
</script>

<svelte:head>
	<title>{email?.subject || 'Email'} - Mailbox</title>
</svelte:head>

<div class="container">
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else if error}
		<div class="alert alert-error">{error}</div>
	{:else if email}
		<div class="email-view">
			<div class="email-header card">
				<button class="back-btn" onclick={() => history.back()}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>

				<div class="email-info">
					<h1 class="email-subject">{email.subject || '(No subject)'}</h1>
					<div class="email-meta">
						<div class="meta-row">
							<span class="meta-label">From:</span>
							<span class="meta-value">{email.from}</span>
						</div>
						<div class="meta-row">
							<span class="meta-label">To:</span>
							<span class="meta-value">{email.to}</span>
						</div>
						<div class="meta-row">
							<span class="meta-label">Date:</span>
							<span class="meta-value">
								{new Date(email.receivedAt * 1000).toLocaleString()}
							</span>
						</div>
						{#if email.size}
							<div class="meta-row">
								<span class="meta-label">Size:</span>
								<span class="meta-value">{formatBytes(email.size)}</span>
							</div>
						{/if}
					</div>
				</div>

				<div class="email-actions">
					<button class="btn btn-secondary btn-sm" onclick={downloadRaw}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
						</svg>
						Download .eml
					</button>
					<button class="btn btn-ghost btn-sm" onclick={() => (showDeleteModal = true)}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
						</svg>
						Delete
					</button>
				</div>
			</div>

			{#if email.attachments && email.attachments.length > 0}
				<div class="attachments card">
					<h3 class="attachments-title">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
						</svg>
						Attachments ({email.attachments.length})
					</h3>
					<div class="attachment-list">
						{#each email.attachments as attachment (attachment.id)}
							<a
								href={getAttachmentUrl(attachment.id)}
								class="attachment-item"
								download={attachment.filename}
							>
								<div class="attachment-icon">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
										<path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
									</svg>
								</div>
								<div class="attachment-info">
									<span class="attachment-name">{attachment.filename || 'Untitled'}</span>
									<span class="attachment-meta">
										{attachment.contentType || 'Unknown type'}
										{#if attachment.size}
											· {formatBytes(attachment.size)}
										{/if}
									</span>
								</div>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
								</svg>
							</a>
						{/each}
					</div>
				</div>
			{/if}

			<div class="email-body card">
				{#if email.htmlBody && email.textBody}
					<div class="view-toggle">
						<button
							class="toggle-btn"
							class:active={viewMode === 'html'}
							onclick={() => (viewMode = 'html')}
						>
							HTML
						</button>
						<button
							class="toggle-btn"
							class:active={viewMode === 'text'}
							onclick={() => (viewMode = 'text')}
						>
							Plain Text
						</button>
					</div>
				{/if}

				<div class="body-content">
					{#if viewMode === 'html' && email.htmlBody}
						<iframe
							srcdoc={email.htmlBody}
							title="Email content"
							class="html-frame"
							sandbox="allow-same-origin"
						></iframe>
					{:else if email.textBody}
						<pre class="text-content">{email.textBody}</pre>
					{:else}
						<p class="no-content">No content available</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Delete Modal -->
<Modal title="Delete Email" open={showDeleteModal} onclose={() => (showDeleteModal = false)}>
	<p>Are you sure you want to delete this email?</p>
	<p style="color: var(--color-text-secondary); margin-top: 8px">This action cannot be undone.</p>

	{#snippet footer()}
		<button class="btn btn-secondary" onclick={() => (showDeleteModal = false)} disabled={deleteLoading}>
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

	.email-view {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.email-header {
		display: flex;
		gap: 16px;
		align-items: flex-start;
	}

	.back-btn {
		padding: 10px;
		color: var(--color-text-secondary);
		border-radius: var(--radius-md);
		transition: all var(--transition);
		flex-shrink: 0;
	}

	.back-btn:hover {
		color: var(--color-text);
		background: var(--color-bg-tertiary);
	}

	.email-info {
		flex: 1;
		min-width: 0;
	}

	.email-subject {
		font-size: 22px;
		font-weight: 600;
		margin-bottom: 16px;
		word-break: break-word;
	}

	.email-meta {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.meta-row {
		display: flex;
		gap: 12px;
		font-size: 14px;
	}

	.meta-label {
		color: var(--color-text-muted);
		width: 50px;
		flex-shrink: 0;
	}

	.meta-value {
		color: var(--color-text-secondary);
		word-break: break-all;
	}

	.email-actions {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}

	.attachments {
		padding: 16px;
	}

	.attachments-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 12px;
		color: var(--color-text-secondary);
	}

	.attachment-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.attachment-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		color: var(--color-text);
		transition: all var(--transition);
	}

	.attachment-item:hover {
		background: var(--color-bg-hover);
	}

	.attachment-icon {
		color: var(--color-primary);
	}

	.attachment-info {
		flex: 1;
		min-width: 0;
	}

	.attachment-name {
		display: block;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.attachment-meta {
		font-size: 12px;
		color: var(--color-text-muted);
	}

	.email-body {
		padding: 0;
		overflow: hidden;
	}

	.view-toggle {
		display: flex;
		padding: 12px 16px;
		border-bottom: 1px solid var(--color-border);
		gap: 8px;
	}

	.toggle-btn {
		padding: 6px 12px;
		font-size: 13px;
		color: var(--color-text-secondary);
		border-radius: var(--radius-sm);
		transition: all var(--transition);
	}

	.toggle-btn:hover {
		background: var(--color-bg-tertiary);
	}

	.toggle-btn.active {
		background: var(--color-primary);
		color: white;
	}

	.body-content {
		padding: 0;
	}

	.html-frame {
		width: 100%;
		min-height: 500px;
		border: none;
		background: white;
	}

	.text-content {
		padding: 24px;
		font-family: monospace;
		font-size: 14px;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}

	.no-content {
		padding: 60px 24px;
		text-align: center;
		color: var(--color-text-muted);
	}

	@media (max-width: 768px) {
		.email-header {
			flex-direction: column;
		}

		.back-btn {
			align-self: flex-start;
		}

		.email-actions {
			width: 100%;
		}

		.email-actions .btn {
			flex: 1;
		}
	}
</style>
