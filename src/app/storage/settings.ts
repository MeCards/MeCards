const settings = {
	delete(key: string) {
		localStorage.removeItem(key);
	},
	get(key: string) {
		const val = localStorage.getItem(key);
		if (val == null) return val;

		try { return JSON.parse(val) } catch {}

		return val;
	},
	set(key: string, val: unknown) {
		localStorage.setItem(key, JSON.stringify(val));
	},
};
export default settings;

export const FLAG_KEYS = {
	NO_SCANNER: 'warned:no-scanner',
};
