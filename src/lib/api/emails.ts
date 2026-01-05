import { api } from './client';
import { API_BASE } from '$lib/config';

export interface EmailSummary {
	id: string;
	from: string;
	to: string;
	subject: string;
	size: number | null;
	receivedAt: number;
}

export interface Attachment {
	id: string;
	filename: string;
	contentType: string | null;
	size: number | null;
}

export interface Email {
	id: string;
	from: string;
	to: string;
	subject: string;
	textBody: string | null;
	htmlBody: string | null;
	size: number | null;
	receivedAt: number;
	attachments: Attachment[];
}

export interface Pagination {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasMore: boolean;
}

interface EmailsResponse {
	success: boolean;
	mailbox?: { id: string; address: string };
	pagination?: Pagination;
	emails?: EmailSummary[];
	error?: string;
}

interface EmailResponse {
	success: boolean;
	email?: Email;
	error?: string;
}

export async function getEmails(
	mailboxId: string,
	page = 1,
	pageSize = 20
): Promise<EmailsResponse> {
	return api.get<EmailsResponse>(
		`/api/emails/mailbox/${mailboxId}?page=${page}&pageSize=${pageSize}`
	);
}

export async function getEmail(emailId: string): Promise<EmailResponse> {
	return api.get<EmailResponse>(`/api/emails/${emailId}`);
}

export async function deleteEmail(emailId: string): Promise<{ success: boolean; error?: string }> {
	return api.delete(`/api/emails/${emailId}`);
}

export function getRawEmailUrl(emailId: string): string {
	return `${API_BASE}/api/emails/${emailId}/raw`;
}

export function getAttachmentUrl(attachmentId: string): string {
	return `${API_BASE}/api/attachments/${attachmentId}`;
}
