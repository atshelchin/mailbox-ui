import { api } from './client';

export interface SystemStats {
	timestamp: string;
	users: {
		total: number;
		active24h: number;
	};
	domains: {
		total: number;
		verified: number;
		official: number;
		autoDiscovered: number;
	};
	mailboxes: {
		total: number;
	};
	emails: {
		total: number;
		today: number;
		totalSize: number;
		totalSizeFormatted: string;
	};
	attachments: {
		total: number;
		totalSize: number;
		totalSizeFormatted: string;
	};
	storage: {
		total: number;
		totalFormatted: string;
	};
	antispam: {
		blocked: number;
		passed: number;
		blockedRate: string;
	};
	system: {
		uptime: number;
		memory: {
			heapUsed: number;
			heapTotal: number;
			rss: number;
			heapUsedFormatted: string;
			heapTotalFormatted: string;
			rssFormatted: string;
		};
		platform: string;
		nodeVersion: string;
	};
}

export interface TopDomains {
	byMailboxes: { name: string; count: number }[];
	byEmails: { name: string; count: number }[];
}

export interface ActivityData {
	hourly: { hour: string; count: number }[];
}

interface StatsResponse {
	success: boolean;
	error?: string;
}

type SystemStatsResponse = StatsResponse & SystemStats;
type TopDomainsResponse = StatsResponse & TopDomains;
type ActivityResponse = StatsResponse & ActivityData;

export async function getStats(): Promise<SystemStatsResponse> {
	return api.get<SystemStatsResponse>('/api/stats');
}

export async function getTopDomains(): Promise<TopDomainsResponse> {
	return api.get<TopDomainsResponse>('/api/stats/top-domains');
}

export async function getActivity(): Promise<ActivityResponse> {
	return api.get<ActivityResponse>('/api/stats/activity');
}
