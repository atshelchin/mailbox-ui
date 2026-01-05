import { api, setToken, removeToken } from './client';
import {
	startRegistration,
	startAuthentication,
	type PublicKeyCredentialCreationOptionsJSON,
	type PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/browser';

export interface User {
	id: string;
	username: string;
}

interface RegisterOptionsResponse {
	success: boolean;
	options?: PublicKeyCredentialCreationOptionsJSON;
	tempUserId?: string;
	error?: string;
}

interface LoginOptionsResponse {
	success: boolean;
	options?: PublicKeyCredentialRequestOptionsJSON;
	userId?: string;
	challengeId?: string;
	error?: string;
}

interface AuthResponse {
	success: boolean;
	user?: User;
	token?: string;
	error?: string;
}

export async function getRegisterOptions(username: string): Promise<RegisterOptionsResponse> {
	return api.post<RegisterOptionsResponse>('/api/auth/register/options', { username });
}

export async function verifyRegistration(
	username: string,
	tempUserId: string,
	credential: Credential
): Promise<AuthResponse> {
	const res = await api.post<AuthResponse>('/api/auth/register/verify', {
		username,
		tempUserId,
		response: credential
	});

	// Store token if returned
	if (res.success && res.token) {
		setToken(res.token);
	}

	return res;
}

export async function getLoginOptions(username?: string): Promise<LoginOptionsResponse> {
	return api.post<LoginOptionsResponse>('/api/auth/login/options', { username });
}

export async function verifyLogin(
	credential: Credential,
	options: { userId?: string; challengeId?: string }
): Promise<AuthResponse> {
	const res = await api.post<AuthResponse>('/api/auth/login/verify', {
		...options,
		response: credential
	});

	// Store token if returned
	if (res.success && res.token) {
		setToken(res.token);
	}

	return res;
}

export async function logout(): Promise<{ success: boolean }> {
	removeToken();
	return api.post('/api/auth/logout');
}

export async function getCurrentUser(): Promise<AuthResponse> {
	return api.get<AuthResponse>('/api/auth/me');
}

export async function register(username: string): Promise<AuthResponse> {
	const optionsRes = await getRegisterOptions(username);

	if (!optionsRes.success || !optionsRes.options || !optionsRes.tempUserId) {
		return { success: false, error: optionsRes.error || 'Failed to get registration options' };
	}

	try {
		const credential = await startRegistration({ optionsJSON: optionsRes.options });
		return verifyRegistration(username, optionsRes.tempUserId, credential);
	} catch (err) {
		if (err instanceof Error) {
			if (err.name === 'NotAllowedError') {
				return { success: false, error: 'Registration was cancelled' };
			}
			return { success: false, error: err.message };
		}
		return { success: false, error: 'Registration failed' };
	}
}

export async function login(): Promise<AuthResponse> {
	// Use discoverable credentials (no username required)
	const optionsRes = await getLoginOptions();

	if (!optionsRes.success || !optionsRes.options) {
		return { success: false, error: optionsRes.error || 'Failed to get login options' };
	}

	try {
		const credential = await startAuthentication({ optionsJSON: optionsRes.options });

		// Use challengeId for discoverable credentials flow
		return verifyLogin(credential, { challengeId: optionsRes.challengeId });
	} catch (err) {
		if (err instanceof Error) {
			if (err.name === 'NotAllowedError') {
				return { success: false, error: 'Login was cancelled' };
			}
			return { success: false, error: err.message };
		}
		return { success: false, error: 'Login failed' };
	}
}
