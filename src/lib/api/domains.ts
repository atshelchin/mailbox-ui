import { api } from './client';

export interface Domain {
	id: string;
	name: string;
	isOfficial: boolean;
	isMine?: boolean;
}

export interface UserDomain {
	id: string;
	name: string;
	txtRecord: string;
	verified: boolean;
	createdAt: number;
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
