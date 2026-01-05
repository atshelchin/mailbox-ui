<script lang="ts">
	import { onMount } from 'svelte';
	import { getStats, getTopDomains, getActivity, type SystemStats, type TopDomains, type ActivityData } from '$lib/api';

	let stats = $state<SystemStats | null>(null);
	let topDomains = $state<TopDomains | null>(null);
	let activity = $state<ActivityData | null>(null);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		await loadStats();
	});

	async function loadStats() {
		loading = true;
		error = '';

		try {
			const [statsRes, topDomainsRes, activityRes] = await Promise.all([
				getStats(),
				getTopDomains(),
				getActivity()
			]);

			if (statsRes.success) {
				stats = statsRes;
			} else {
				error = statsRes.error || 'Failed to load stats';
			}

			if (topDomainsRes.success) {
				topDomains = topDomainsRes;
			}

			if (activityRes.success) {
				activity = activityRes;
			}
		} catch (e) {
			error = 'Failed to connect to server';
		}

		loading = false;
	}

	function formatUptime(seconds: number): string {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		if (days > 0) {
			return `${days}d ${hours}h ${minutes}m`;
		} else if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else {
			return `${minutes}m`;
		}
	}

	function formatNumber(num: number | undefined | null): string {
		if (num == null) return '0';
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	}
</script>

<svelte:head>
	<title>Statistics - Mailbox</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<div>
			<h1 class="page-title">System Statistics</h1>
			<p class="page-subtitle">Overview of system resources and usage</p>
		</div>
		<button class="btn btn-secondary" onclick={loadStats} disabled={loading}>
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
	{:else if stats}
		<!-- Main Stats Grid -->
		<div class="stats-grid">
			<div class="stat-card card">
				<div class="stat-icon users">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{formatNumber(stats.users.total)}</span>
					<span class="stat-label">Total Users</span>
					<span class="stat-sub">{stats.users.active24h} active today</span>
				</div>
			</div>

			<div class="stat-card card">
				<div class="stat-icon domains">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10" />
						<path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{formatNumber(stats.domains.total)}</span>
					<span class="stat-label">Total Domains</span>
					<span class="stat-sub">{stats.domains.verified} verified, {stats.domains.official} official</span>
				</div>
			</div>

			<div class="stat-card card">
				<div class="stat-icon mailboxes">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
						<polyline points="22,6 12,13 2,6" />
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{formatNumber(stats.mailboxes.total)}</span>
					<span class="stat-label">Total Mailboxes</span>
				</div>
			</div>

			<div class="stat-card card">
				<div class="stat-icon emails">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{formatNumber(stats.emails.total)}</span>
					<span class="stat-label">Total Emails</span>
					<span class="stat-sub">{stats.emails.today} received today</span>
				</div>
			</div>
		</div>

		<!-- Storage & System -->
		<div class="section-grid">
			<div class="section-card card">
				<h3 class="section-title">Storage Usage</h3>
				<div class="storage-stats">
					<div class="storage-item">
						<span class="storage-label">Emails</span>
						<span class="storage-value">{stats.emails.totalSizeFormatted}</span>
					</div>
					<div class="storage-item">
						<span class="storage-label">Attachments</span>
						<span class="storage-value">{stats.attachments.totalSizeFormatted}</span>
					</div>
					<div class="storage-item total">
						<span class="storage-label">Total Storage</span>
						<span class="storage-value">{stats.storage.totalFormatted}</span>
					</div>
				</div>
			</div>

			<div class="section-card card">
				<h3 class="section-title">Anti-Spam</h3>
				<div class="antispam-stats">
					<div class="antispam-row">
						<span class="antispam-label">Blocked</span>
						<span class="antispam-value blocked">{formatNumber(stats.antispam.blocked)}</span>
					</div>
					<div class="antispam-row">
						<span class="antispam-label">Passed</span>
						<span class="antispam-value passed">{formatNumber(stats.antispam.passed)}</span>
					</div>
					<div class="antispam-row">
						<span class="antispam-label">Block Rate</span>
						<span class="antispam-value">{stats.antispam.blockedRate}</span>
					</div>
				</div>
			</div>

			<div class="section-card card">
				<h3 class="section-title">System</h3>
				<div class="system-stats">
					<div class="system-row">
						<span class="system-label">Uptime</span>
						<span class="system-value">{formatUptime(stats.system.uptime)}</span>
					</div>
					<div class="system-row">
						<span class="system-label">Memory (Heap)</span>
						<span class="system-value">{stats.system.memory.heapUsedFormatted} / {stats.system.memory.heapTotalFormatted}</span>
					</div>
					<div class="system-row">
						<span class="system-label">Memory (RSS)</span>
						<span class="system-value">{stats.system.memory.rssFormatted}</span>
					</div>
					<div class="system-row">
						<span class="system-label">Platform</span>
						<span class="system-value">{stats.system.platform} / {stats.system.nodeVersion}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Top Domains -->
		{#if topDomains}
			<div class="section-grid two-col">
				<div class="section-card card">
					<h3 class="section-title">Top Domains by Mailboxes</h3>
					{#if topDomains.byMailboxes.length === 0}
						<p class="no-data">No data available</p>
					{:else}
						<ul class="top-list">
							{#each topDomains.byMailboxes as domain, i (domain.name)}
								<li class="top-item">
									<span class="top-rank">#{i + 1}</span>
									<span class="top-name">{domain.name}</span>
									<span class="top-count">{domain.count}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="section-card card">
					<h3 class="section-title">Top Domains by Emails</h3>
					{#if topDomains.byEmails.length === 0}
						<p class="no-data">No data available</p>
					{:else}
						<ul class="top-list">
							{#each topDomains.byEmails as domain, i (domain.name)}
								<li class="top-item">
									<span class="top-rank">#{i + 1}</span>
									<span class="top-name">{domain.name}</span>
									<span class="top-count">{domain.count}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Activity Timeline -->
		{#if activity && activity.hourly.length > 0}
			<div class="section-card card">
				<h3 class="section-title">Email Activity (Last 24 Hours)</h3>
				<div class="activity-chart">
					{#each activity.hourly.slice().reverse() as hour (hour.hour)}
						<div class="activity-bar-container" title="{hour.hour}: {hour.count} emails">
							<div
								class="activity-bar"
								style="height: {Math.max(4, (hour.count / Math.max(...activity.hourly.map(h => h.count))) * 100)}%"
							></div>
							<span class="activity-label">{hour.hour.split(' ')[1]?.slice(0, 2) || ''}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<p class="timestamp">Last updated: {new Date(stats.timestamp).toLocaleString()}</p>
	{/if}
</div>

<style>
	.loading {
		display: flex;
		justify-content: center;
		padding: 60px 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 16px;
		margin-bottom: 24px;
	}

	.stat-card {
		display: flex;
		align-items: flex-start;
		gap: 16px;
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.stat-icon.users {
		background: rgba(99, 102, 241, 0.1);
		color: var(--color-primary);
	}

	.stat-icon.domains {
		background: rgba(16, 185, 129, 0.1);
		color: var(--color-success);
	}

	.stat-icon.mailboxes {
		background: rgba(245, 158, 11, 0.1);
		color: var(--color-warning);
	}

	.stat-icon.emails {
		background: rgba(239, 68, 68, 0.1);
		color: var(--color-error);
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		line-height: 1.2;
	}

	.stat-label {
		font-size: 14px;
		color: var(--color-text-secondary);
	}

	.stat-sub {
		font-size: 12px;
		color: var(--color-text-muted);
	}

	.section-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 16px;
		margin-bottom: 24px;
	}

	.section-grid.two-col {
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	}

	.section-card {
		padding: 20px;
	}

	.section-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-bottom: 16px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.storage-stats,
	.antispam-stats,
	.system-stats {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.storage-item,
	.antispam-row,
	.system-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.storage-label,
	.antispam-label,
	.system-label {
		font-size: 14px;
		color: var(--color-text-secondary);
	}

	.storage-value,
	.system-value {
		font-size: 14px;
		font-weight: 500;
	}

	.storage-item.total {
		padding-top: 12px;
		border-top: 1px solid var(--color-border);
	}

	.storage-item.total .storage-label,
	.storage-item.total .storage-value {
		font-weight: 600;
	}

	.antispam-value {
		font-size: 14px;
		font-weight: 600;
	}

	.antispam-value.blocked {
		color: var(--color-error);
	}

	.antispam-value.passed {
		color: var(--color-success);
	}

	.top-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.top-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 12px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-sm);
	}

	.top-rank {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-text-muted);
		width: 24px;
	}

	.top-name {
		flex: 1;
		font-size: 14px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.top-count {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-primary);
	}

	.no-data {
		font-size: 14px;
		color: var(--color-text-muted);
		text-align: center;
		padding: 24px 0;
	}

	.activity-chart {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		height: 120px;
		padding: 8px 0;
	}

	.activity-bar-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		height: 100%;
	}

	.activity-bar {
		width: 100%;
		max-width: 24px;
		background: var(--color-primary);
		border-radius: 2px 2px 0 0;
		min-height: 4px;
		margin-top: auto;
	}

	.activity-label {
		font-size: 10px;
		color: var(--color-text-muted);
	}

	.timestamp {
		text-align: center;
		font-size: 12px;
		color: var(--color-text-muted);
		margin-top: 24px;
	}

	@media (max-width: 640px) {
		.stats-grid {
			grid-template-columns: 1fr 1fr;
		}

		.stat-card {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.stat-value {
			font-size: 24px;
		}

		.section-grid,
		.section-grid.two-col {
			grid-template-columns: 1fr;
		}
	}
</style>
