<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores';
	import { Modal } from '$lib/components';
	import {
		getMyDomains,
		addDomain,
		verifyDomain,
		deleteDomain,
		getVerifyInfo,
		updateVisibility,
		getAllowedUsers,
		addAllowedUser,
		removeAllowedUser,
		DomainVisibility,
		type UserDomain,
		type AllowedUser
	} from '$lib/api';
	import { formatDate } from '$lib/utils';

	let domains = $state<UserDomain[]>([]);
	let loading = $state(true);
	let error = $state('');

	// Add modal
	let showAddModal = $state(false);
	let addLoading = $state(false);
	let addError = $state('');
	let domainName = $state('');

	// Verify modal
	let showVerifyModal = $state(false);
	let verifyLoading = $state(false);
	let verifyError = $state('');
	let domainToVerify = $state<UserDomain | null>(null);
	let verifyInstructions = $state('');

	// Delete modal
	let showDeleteModal = $state(false);
	let deleteLoading = $state(false);
	let domainToDelete = $state<UserDomain | null>(null);

	// Visibility modal
	let showVisibilityModal = $state(false);
	let visibilityLoading = $state(false);
	let domainToManage = $state<UserDomain | null>(null);
	let allowedUsers = $state<AllowedUser[]>([]);
	let allowedUsersLoading = $state(false);
	let newUsername = $state('');
	let addUserError = $state('');
	let addUserLoading = $state(false);

	// Copy feedback
	let copiedRecord = $state('');

	onMount(async () => {
		if (!userStore.isLoggedIn) {
			goto('/login');
			return;
		}
		await loadDomains();
	});

	async function loadDomains() {
		loading = true;
		error = '';

		const res = await getMyDomains();

		if (res.success && res.domains) {
			domains = res.domains;
		} else {
			error = res.error || 'Failed to load domains';
		}

		loading = false;
	}

	async function handleAdd() {
		const trimmed = domainName.trim().toLowerCase();

		if (!trimmed) {
			addError = 'Please enter a domain name';
			return;
		}

		if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(trimmed)) {
			addError = 'Invalid domain name format';
			return;
		}

		addLoading = true;
		addError = '';

		const res = await addDomain(trimmed);

		if (res.success && res.domain) {
			domains = [
				{
					id: res.domain.id,
					name: res.domain.name,
					txtRecord: res.domain.txtRecord,
					verified: res.domain.verified,
					visibility: DomainVisibility.Private,
					allowedUsers: 0,
					mailboxCount: 0,
					emailCount: 0,
					createdAt: Math.floor(Date.now() / 1000)
				},
				...domains
			];
			showAddModal = false;
			domainName = '';

			// Auto open verify modal
			domainToVerify = domains[0];
			showVerifyModal = true;
		} else {
			addError = res.error || 'Failed to add domain';
		}

		addLoading = false;
	}

	async function openVerifyModal(domain: UserDomain) {
		domainToVerify = domain;
		verifyError = '';
		verifyInstructions = '';
		showVerifyModal = true;

		const res = await getVerifyInfo(domain.id);
		if (res.success && res.instructions) {
			verifyInstructions = res.instructions;
		}
	}

	async function handleVerify() {
		if (!domainToVerify) return;

		verifyLoading = true;
		verifyError = '';

		const res = await verifyDomain(domainToVerify.id);

		if (res.success && res.verified) {
			domains = domains.map((d) =>
				d.id === domainToVerify!.id ? { ...d, verified: true } : d
			);
			showVerifyModal = false;
			domainToVerify = null;
		} else {
			verifyError = res.error || 'Verification failed. Make sure DNS records are propagated.';
		}

		verifyLoading = false;
	}

	function confirmDelete(domain: UserDomain) {
		domainToDelete = domain;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (!domainToDelete) return;

		deleteLoading = true;

		const res = await deleteDomain(domainToDelete.id);

		if (res.success) {
			domains = domains.filter((d) => d.id !== domainToDelete!.id);
			showDeleteModal = false;
			domainToDelete = null;
		}

		deleteLoading = false;
	}

	function copyTxtRecord(record: string) {
		navigator.clipboard.writeText(record);
		copiedRecord = record;
		setTimeout(() => (copiedRecord = ''), 2000);
	}

	// Visibility management
	async function openVisibilityModal(domain: UserDomain) {
		domainToManage = domain;
		showVisibilityModal = true;
		addUserError = '';
		newUsername = '';

		if (domain.visibility === DomainVisibility.Partial) {
			await loadAllowedUsers(domain.id);
		}
	}

	async function loadAllowedUsers(domainId: string) {
		allowedUsersLoading = true;
		const res = await getAllowedUsers(domainId);
		if (res.success && res.allowedUsers) {
			allowedUsers = res.allowedUsers;
		}
		allowedUsersLoading = false;
	}

	async function handleVisibilityChange(visibility: DomainVisibility) {
		if (!domainToManage) return;

		visibilityLoading = true;
		const res = await updateVisibility(domainToManage.id, visibility);

		if (res.success) {
			domains = domains.map((d) =>
				d.id === domainToManage!.id ? { ...d, visibility } : d
			);
			domainToManage = { ...domainToManage, visibility };

			if (visibility === DomainVisibility.Partial) {
				await loadAllowedUsers(domainToManage.id);
			}
		}

		visibilityLoading = false;
	}

	async function handleAddUser() {
		if (!domainToManage || !newUsername.trim()) return;

		addUserLoading = true;
		addUserError = '';

		const res = await addAllowedUser(domainToManage.id, newUsername.trim());

		if (res.success && res.user) {
			allowedUsers = [...allowedUsers, { ...res.user, addedAt: Math.floor(Date.now() / 1000) }];
			domains = domains.map((d) =>
				d.id === domainToManage!.id ? { ...d, allowedUsers: d.allowedUsers + 1 } : d
			);
			newUsername = '';
		} else {
			addUserError = res.error || 'Failed to add user';
		}

		addUserLoading = false;
	}

	async function handleRemoveUser(userId: string) {
		if (!domainToManage) return;

		const res = await removeAllowedUser(domainToManage.id, userId);

		if (res.success) {
			allowedUsers = allowedUsers.filter((u) => u.id !== userId);
			domains = domains.map((d) =>
				d.id === domainToManage!.id ? { ...d, allowedUsers: Math.max(0, d.allowedUsers - 1) } : d
			);
		}
	}

	function getVisibilityLabel(visibility: DomainVisibility): string {
		switch (visibility) {
			case DomainVisibility.Private:
				return 'Private';
			case DomainVisibility.Partial:
				return 'Partial';
			case DomainVisibility.Public:
				return 'Public';
			default:
				return 'Unknown';
		}
	}

	function getVisibilityBadgeClass(visibility: DomainVisibility): string {
		switch (visibility) {
			case DomainVisibility.Private:
				return 'badge-secondary';
			case DomainVisibility.Partial:
				return 'badge-warning';
			case DomainVisibility.Public:
				return 'badge-success';
			default:
				return '';
		}
	}
</script>

<svelte:head>
	<title>Domains - Mailbox</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<div>
			<h1 class="page-title">Custom Domains</h1>
			<p class="page-subtitle">Use your own domains to receive emails</p>
		</div>
		<button class="btn btn-primary" onclick={() => (showAddModal = true)}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 5v14M5 12h14" />
			</svg>
			Add Domain
		</button>
	</div>

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else if error}
		<div class="alert alert-error">{error}</div>
	{:else if domains.length === 0}
		<div class="empty-state card">
			<div class="empty-state-icon">🌐</div>
			<h3 class="empty-state-title">No custom domains yet</h3>
			<p>Add your own domain to create custom email addresses</p>
			<button class="btn btn-primary" onclick={() => (showAddModal = true)} style="margin-top: 16px">
				Add Domain
			</button>
		</div>
	{:else}
		<div class="domain-grid">
			{#each domains as domain (domain.id)}
				<div class="domain-card card card-hover">
					<div class="domain-info">
						<div class="domain-header">
							<span class="domain-name">{domain.name}</span>
							{#if domain.verified}
								<span class="badge badge-success">Verified</span>
							{:else}
								<span class="badge badge-warning">Pending</span>
							{/if}
							{#if domain.verified}
								<span class="badge {getVisibilityBadgeClass(domain.visibility)}">
									{getVisibilityLabel(domain.visibility)}
									{#if domain.visibility === DomainVisibility.Partial && domain.allowedUsers > 0}
										({domain.allowedUsers})
									{/if}
								</span>
							{/if}
						</div>
						<div class="domain-stats">
							<span class="domain-stat">{domain.mailboxCount} mailboxes</span>
							<span class="domain-stat-sep">·</span>
							<span class="domain-stat">{domain.emailCount} emails</span>
						</div>
					</div>
					<div class="domain-actions">
						{#if !domain.verified}
							<button class="btn btn-secondary btn-sm" onclick={() => openVerifyModal(domain)}>
								Verify
							</button>
						{:else}
							<button class="btn btn-secondary btn-sm" onclick={() => openVisibilityModal(domain)} title="Manage visibility">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="12" cy="12" r="3" />
									<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
								</svg>
							</button>
						{/if}
						<button class="btn btn-ghost btn-sm" onclick={() => confirmDelete(domain)}>
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

<!-- Add Modal -->
<Modal title="Add Custom Domain" open={showAddModal} onclose={() => (showAddModal = false)}>
	{#if addError}
		<div class="alert alert-error" style="margin-bottom: 16px">{addError}</div>
	{/if}

	<div class="form-group">
		<label class="form-label" for="domain">Domain Name</label>
		<input
			type="text"
			id="domain"
			class="input"
			bind:value={domainName}
			placeholder="example.com"
			disabled={addLoading}
		/>
		<p class="form-hint">Enter your domain without http:// or www</p>
	</div>

	{#snippet footer()}
		<button class="btn btn-secondary" onclick={() => (showAddModal = false)} disabled={addLoading}>
			Cancel
		</button>
		<button class="btn btn-primary" onclick={handleAdd} disabled={addLoading}>
			{#if addLoading}
				<span class="spinner"></span>
			{/if}
			Add Domain
		</button>
	{/snippet}
</Modal>

<!-- Verify Modal -->
<Modal title="Verify Domain" open={showVerifyModal} onclose={() => (showVerifyModal = false)}>
	{#if verifyError}
		<div class="alert alert-error" style="margin-bottom: 16px">{verifyError}</div>
	{/if}

	<div class="verify-steps">
		<p><strong>Domain:</strong> {domainToVerify?.name}</p>

		<div class="step">
			<h4>Step 1: Add TXT Record</h4>
			<p>Add the following TXT record to your DNS configuration:</p>

			<div class="dns-record">
				<div class="record-row">
					<span class="record-label">Host:</span>
					<code>_mailbox-verify.{domainToVerify?.name}</code>
				</div>
				<div class="record-row">
					<span class="record-label">Type:</span>
					<code>TXT</code>
				</div>
				<div class="record-row">
					<span class="record-label">Value:</span>
					<div class="record-value">
						<code>{domainToVerify?.txtRecord}</code>
						<button
							class="copy-btn"
							class:copied={copiedRecord === domainToVerify?.txtRecord}
							onclick={() => copyTxtRecord(domainToVerify?.txtRecord || '')}
							title="Copy"
						>
							{#if copiedRecord === domainToVerify?.txtRecord}
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M20 6L9 17l-5-5" />
								</svg>
							{:else}
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="9" y="9" width="13" height="13" rx="2" />
									<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
								</svg>
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="step">
			<h4>Step 2: Configure MX Record</h4>
			<p>Point your domain's MX record to our mail server:</p>

			<div class="dns-record">
				<div class="record-row">
					<span class="record-label">Host:</span>
					<code>{domainToVerify?.name}</code>
				</div>
				<div class="record-row">
					<span class="record-label">Type:</span>
					<code>MX</code>
				</div>
				<div class="record-row">
					<span class="record-label">Priority:</span>
					<code>10</code>
				</div>
				<div class="record-row">
					<span class="record-label">Value:</span>
					<code>mail.appsdata.xyz</code>
				</div>
			</div>
		</div>

		<div class="step">
			<h4>Step 3: Wait & Verify</h4>
			<p>DNS changes can take up to 48 hours to propagate. Click verify when ready.</p>
		</div>
	</div>

	{#snippet footer()}
		<button class="btn btn-secondary" onclick={() => (showVerifyModal = false)} disabled={verifyLoading}>
			Close
		</button>
		<button class="btn btn-primary" onclick={handleVerify} disabled={verifyLoading}>
			{#if verifyLoading}
				<span class="spinner"></span>
			{/if}
			Verify Now
		</button>
	{/snippet}
</Modal>

<!-- Visibility Modal -->
<Modal title="Domain Visibility" open={showVisibilityModal} onclose={() => (showVisibilityModal = false)}>
	<div class="visibility-settings">
		<p class="visibility-domain"><strong>{domainToManage?.name}</strong></p>

		<div class="visibility-options">
			<label class="visibility-option" class:active={domainToManage?.visibility === DomainVisibility.Private}>
				<input
					type="radio"
					name="visibility"
					checked={domainToManage?.visibility === DomainVisibility.Private}
					onchange={() => handleVisibilityChange(DomainVisibility.Private)}
					disabled={visibilityLoading}
				/>
				<div class="option-content">
					<span class="option-title">Private</span>
					<span class="option-desc">Only you can create mailboxes on this domain</span>
				</div>
			</label>

			<label class="visibility-option" class:active={domainToManage?.visibility === DomainVisibility.Partial}>
				<input
					type="radio"
					name="visibility"
					checked={domainToManage?.visibility === DomainVisibility.Partial}
					onchange={() => handleVisibilityChange(DomainVisibility.Partial)}
					disabled={visibilityLoading}
				/>
				<div class="option-content">
					<span class="option-title">Partial</span>
					<span class="option-desc">You and allowed users can create mailboxes</span>
				</div>
			</label>

			<label class="visibility-option" class:active={domainToManage?.visibility === DomainVisibility.Public}>
				<input
					type="radio"
					name="visibility"
					checked={domainToManage?.visibility === DomainVisibility.Public}
					onchange={() => handleVisibilityChange(DomainVisibility.Public)}
					disabled={visibilityLoading}
				/>
				<div class="option-content">
					<span class="option-title">Public</span>
					<span class="option-desc">Anyone can create mailboxes on this domain</span>
				</div>
			</label>
		</div>

		{#if domainToManage?.visibility === DomainVisibility.Partial}
			<div class="allowed-users-section">
				<h4>Allowed Users</h4>

				{#if addUserError}
					<div class="alert alert-error" style="margin-bottom: 12px; font-size: 13px;">{addUserError}</div>
				{/if}

				<div class="add-user-form">
					<input
						type="text"
						class="input"
						bind:value={newUsername}
						placeholder="Enter username"
						disabled={addUserLoading}
					/>
					<button class="btn btn-primary btn-sm" onclick={handleAddUser} disabled={addUserLoading || !newUsername.trim()}>
						{#if addUserLoading}
							<span class="spinner"></span>
						{/if}
						Add
					</button>
				</div>

				{#if allowedUsersLoading}
					<div class="loading-small">
						<div class="spinner"></div>
					</div>
				{:else if allowedUsers.length === 0}
					<p class="no-users">No allowed users yet</p>
				{:else}
					<ul class="allowed-users-list">
						{#each allowedUsers as user (user.id)}
							<li class="allowed-user-item">
								<span class="user-name">{user.username}</span>
								<button class="remove-user-btn" onclick={() => handleRemoveUser(user.id)} title="Remove user">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M18 6L6 18M6 6l12 12" />
									</svg>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</div>

	{#snippet footer()}
		<button class="btn btn-secondary" onclick={() => (showVisibilityModal = false)}>
			Close
		</button>
	{/snippet}
</Modal>

<!-- Delete Modal -->
<Modal title="Delete Domain" open={showDeleteModal} onclose={() => (showDeleteModal = false)}>
	<p>Are you sure you want to delete <strong>{domainToDelete?.name}</strong>?</p>
	<p style="color: var(--color-text-secondary); margin-top: 8px">
		All mailboxes and emails on this domain will be permanently deleted.
	</p>

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

	.domain-grid {
		display: grid;
		gap: 12px;
	}

	.domain-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.domain-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.domain-header {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.domain-name {
		font-size: 16px;
		font-weight: 600;
	}

	.domain-stats {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--color-text-muted);
	}

	.domain-stat-sep {
		color: var(--color-border);
	}

	.domain-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.verify-steps {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.step {
		padding: 16px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
	}

	.step h4 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.step p {
		font-size: 13px;
		color: var(--color-text-secondary);
		margin-bottom: 12px;
	}

	.dns-record {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.record-row {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 13px;
	}

	.record-label {
		color: var(--color-text-muted);
		width: 60px;
		flex-shrink: 0;
	}

	.record-row code {
		padding: 4px 8px;
		background: var(--color-bg);
		border-radius: var(--radius-sm);
		font-family: monospace;
		font-size: 12px;
		word-break: break-all;
	}

	.record-value {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.copy-btn {
		padding: 4px;
		color: var(--color-text-muted);
		border-radius: var(--radius-sm);
		transition: all var(--transition);
	}

	.copy-btn:hover {
		color: var(--color-text);
		background: var(--color-bg-hover);
	}

	.copy-btn.copied {
		color: var(--color-success);
	}

	/* Visibility Modal Styles */
	.visibility-settings {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.visibility-domain {
		font-size: 15px;
	}

	.visibility-options {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.visibility-option {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px;
		background: var(--color-bg-tertiary);
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition);
	}

	.visibility-option:hover {
		background: var(--color-bg-hover);
	}

	.visibility-option.active {
		border-color: var(--color-primary);
		background: rgba(99, 102, 241, 0.1);
	}

	.visibility-option input {
		margin-top: 2px;
	}

	.option-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.option-title {
		font-weight: 500;
		font-size: 14px;
	}

	.option-desc {
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.allowed-users-section {
		padding-top: 16px;
		border-top: 1px solid var(--color-border);
	}

	.allowed-users-section h4 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.add-user-form {
		display: flex;
		gap: 8px;
		margin-bottom: 12px;
	}

	.add-user-form .input {
		flex: 1;
	}

	.loading-small {
		display: flex;
		justify-content: center;
		padding: 16px 0;
	}

	.no-users {
		font-size: 13px;
		color: var(--color-text-muted);
		text-align: center;
		padding: 16px 0;
	}

	.allowed-users-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.allowed-user-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 12px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-sm);
	}

	.user-name {
		font-size: 14px;
	}

	.remove-user-btn {
		padding: 4px;
		color: var(--color-text-muted);
		border-radius: var(--radius-sm);
		transition: all var(--transition);
	}

	.remove-user-btn:hover {
		color: var(--color-error);
		background: rgba(239, 68, 68, 0.1);
	}

	.badge-secondary {
		background: var(--color-bg-tertiary);
		color: var(--color-text-secondary);
	}

	@media (max-width: 640px) {
		.domain-card {
			flex-direction: column;
			align-items: flex-start;
		}

		.domain-actions {
			width: 100%;
		}

		.domain-actions .btn {
			flex: 1;
		}
	}
</style>
