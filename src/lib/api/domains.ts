import { api } from './client';

export interface Domain {
	id: string;
	name: string;
	isOfficial: boolean;
	isMine?: boolean;
}

export enum DomainVisibility {
	Private = 0,
	Partial = 1,
	Public = 2
}

export interface UserDomain {
	id: string;
	name: string;
	txtRecord: string;
	verified: boolean;
	visibility: DomainVisibility;
	allowedUsers: number;
	createdAt: number;
}

export interface AllowedUser {
	id: string;
	username: string;
	addedAt: number;
}

interface DomainsResponse {
	success: boolean;
	domains?: Domain[];
	error?: string;
}

interface UserDomainsResponse {
	success: boolean;
	domains?: UserDomain[];
	error?: string;
}

interface AddDomainResponse {
	success: boolean;
	domain?: {
		id: string;
		name: string;
		txtRecord: string;
		verified: boolean;
	};
	error?: string;
}

interface VerifyInfoResponse {
	success: boolean;
	verified?: boolean;
	domain?: string;
	txtRecord?: string;
	instructions?: string;
	error?: string;
}

interface VerifyResponse {
	success: boolean;
	verified?: boolean;
	error?: string;
}

export async function getAllDomains(): Promise<DomainsResponse> {
	return api.get<DomainsResponse>('/api/domains');
}

export async function getMyDomains(): Promise<UserDomainsResponse> {
	return api.get<UserDomainsResponse>('/api/domains/mine');
}

export async function addDomain(name: string): Promise<AddDomainResponse> {
	return api.post<AddDomainResponse>('/api/domains', { name });
}

export async function getVerifyInfo(domainId: string): Promise<VerifyInfoResponse> {
	return api.get<VerifyInfoResponse>(`/api/domains/${domainId}/verify`);
}

export async function verifyDomain(domainId: string): Promise<VerifyResponse> {
	return api.post<VerifyResponse>(`/api/domains/${domainId}/verify`);
}

export async function deleteDomain(domainId: string): Promise<{ success: boolean; error?: string }> {
	return api.delete(`/api/domains/${domainId}`);
}

// Visibility management
interface VisibilityResponse {
	success: boolean;
	visibility?: DomainVisibility;
	visibilityLabel?: string;
	error?: string;
}

export async function updateVisibility(
	domainId: string,
	visibility: DomainVisibility
): Promise<VisibilityResponse> {
	return api.patch<VisibilityResponse>(`/api/domains/${domainId}/visibility`, { visibility });
}

// Allowed users management
interface AllowedUsersResponse {
	success: boolean;
	allowedUsers?: AllowedUser[];
	error?: string;
}

interface AddAllowedUserResponse {
	success: boolean;
	user?: { id: string; username: string };
	error?: string;
}

export async function getAllowedUsers(domainId: string): Promise<AllowedUsersResponse> {
	return api.get<AllowedUsersResponse>(`/api/domains/${domainId}/allowed-users`);
}

export async function addAllowedUser(
	domainId: string,
	username: string
): Promise<AddAllowedUserResponse> {
	return api.post<AddAllowedUserResponse>(`/api/domains/${domainId}/allowed-users`, { username });
}

export async function removeAllowedUser(
	domainId: string,
	userId: string
): Promise<{ success: boolean; error?: string }> {
	return api.delete(`/api/domains/${domainId}/allowed-users/${userId}`);
}
