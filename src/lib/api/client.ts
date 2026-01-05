import { API_BASE } from '$lib/config';

const TOKEN_KEY = 'mailbox_token';

interface ApiResponse<T> {
	success: boolean;
	error?: string;
	[key: string]: unknown;
}

// Token management
export function getToken(): string | null {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.removeItem(TOKEN_KEY);
}

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T> & T> {
		const url = `${this.baseUrl}${endpoint}`;
		const token = getToken();

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(options.headers as Record<string, string>)
		};

		// Add Authorization header if token exists
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(url, {
			...options,
			credentials: 'include', // Keep cookies for backward compatibility
			headers
		});

		const data = await response.json();
		return data;
	}

	get<T>(endpoint: string) {
		return this.request<T>(endpoint, { method: 'GET' });
	}

	post<T>(endpoint: string, body?: unknown) {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined
		});
	}

	patch<T>(endpoint: string, body?: unknown) {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: body ? JSON.stringify(body) : undefined
		});
	}

	delete<T>(endpoint: string) {
		return this.request<T>(endpoint, { method: 'DELETE' });
	}
}

export const api = new ApiClient(API_BASE);
