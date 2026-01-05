import { getCurrentUser, logout as apiLogout, type User } from '$lib/api/auth';

interface UserState {
	user: User | null;
	loading: boolean;
	initialized: boolean;
}

function createUserStore() {
	let state = $state<UserState>({
		user: null,
		loading: true,
		initialized: false
	});

	return {
		get user() {
			return state.user;
		},
		get loading() {
			return state.loading;
		},
		get initialized() {
			return state.initialized;
		},
		get isLoggedIn() {
			return state.user !== null;
		},

		setUser(user: User | null) {
			state.user = user;
		},

		async init() {
			if (state.initialized) return;

			state.loading = true;
			try {
				const res = await getCurrentUser();
				if (res.success && res.user) {
					state.user = res.user;
				}
			} catch {
				// Not logged in or API error
			} finally {
				state.loading = false;
				state.initialized = true;
			}
		},

		async logout() {
			await apiLogout();
			state.user = null;
		}
	};
}

export const userStore = createUserStore();
