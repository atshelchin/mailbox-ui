import { api } from './client';

export interface Mailbox {
	id: string;
	address: string;
	localPart: string;
	domain: string;
	emailCount: number;
	createdAt: number;
}

interface MailboxesResponse {
	success: boolean;
	mailboxes?: Mailbox[];
	error?: string;
}

interface CreateMailboxResponse {
	success: boolean;
	mailbox?: Mailbox;
	error?: string;
}

export async function getMailboxes(): Promise<MailboxesResponse> {
	return api.get<MailboxesResponse>('/api/mailboxes');
}

export async function createMailbox(
	localPart: string,
	domainId: string
): Promise<CreateMailboxResponse> {
	return api.post<CreateMailboxResponse>('/api/mailboxes', { localPart, domainId });
}

export async function deleteMailbox(
	mailboxId: string
): Promise<{ success: boolean; error?: string }> {
	return api.delete(`/api/mailboxes/${mailboxId}`);
}
