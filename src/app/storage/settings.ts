const settings = {
	delete(key: string, duration: 'forever' | 'temp' = 'forever') {
		const storage = duration === 'temp' ? sessionStorage : localStorage;
		storage.removeItem(key);
	},
	get(key: string, duration: 'forever' | 'temp' = 'forever') {
		const storage = duration === 'temp' ? sessionStorage : localStorage;
		const val = storage.getItem(key);
		if (val == null) return val;

		try { return JSON.parse(val) } catch {}

		return val;
	},
	set(key: string, val: unknown, duration: 'forever' | 'temp' = 'forever') {
		const storage = duration === 'temp' ? sessionStorage : localStorage;
		storage.setItem(key, JSON.stringify(val));
	},
};
export default settings;

export const FLAG_KEYS = {
	NO_SCANNER: 'flag:warned-no-scanner',
};
