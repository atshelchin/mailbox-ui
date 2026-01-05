export function formatDate(timestamp: number): string {
	const date = new Date(timestamp * 1000);
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (days === 0) {
		return date.toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit'
		});
	} else if (days === 1) {
		return 'Yesterday';
	} else if (days < 7) {
		return date.toLocaleDateString(undefined, { weekday: 'short' });
	} else {
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
		});
	}
}

export function formatBytes(bytes: number | null): string {
	if (bytes === null || bytes === 0) return '0 B';

	const units = ['B', 'KB', 'MB', 'GB'];
	const k = 1024;
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + units[i];
}

export function generateRandomLocalPart(length = 8): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}
