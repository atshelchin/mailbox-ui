import { API_BASE } from '$lib/config';

interface ApiResponse<T> {
	success: boolean;
	error?: string;
	[key: string]: unknown;
}

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T> & T> {
		const url = `${this.baseUrl}${endpoint}`;

		const response = await fetch(url, {
			...options,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			}
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
