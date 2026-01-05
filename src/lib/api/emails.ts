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

interface EmailsResponse {
	success: boolean;
	mailbox?: { id: string; address: string };
	total?: number;
	emails?: EmailSummary[];
	error?: string;
}

interface EmailResponse {
	success: boolean;
	email?: Email;
	error?: string;
}

export async function getEmails(mailboxId: string): Promise<EmailsResponse> {
	return api.get<EmailsResponse>(`/api/emails/mailbox/${mailboxId}`);
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
