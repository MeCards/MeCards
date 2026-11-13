const PFX = 'card:';

export const cards = {
	clear() {
		const keys = Object.keys(localStorage).filter((key) => key.startsWith(PFX));
		for (const key of keys) localStorage.removeItem(key);
		return keys.map((key) => key.slice(PFX.length));
	},
	get count() {
		return Object.keys(localStorage).filter((key) => key.startsWith(PFX)).length;
	},
	delete(key: CardId) {
		localStorage.removeItem(`${PFX}${key}`);
	},
	get(key: CardId) {
		const val = localStorage.getItem(`${PFX}${key}`);
		return val == null
			? val
			: JSON.parse(val) as CardData;
	},
	* getAll() {
		for (const [key, val] of Object.entries(localStorage)) {
			if (!key.startsWith(PFX)) continue;
			yield [key.split(PFX)[1], JSON.parse(val)] as [CardId, CardData];
		}
	},
	set(key: CardId, val: CardData) {
		localStorage.setItem(`${PFX}${key}`, JSON.stringify(val));
	},
};

export type CardsCollection = ReturnType<typeof cards['getAll']>;
export type CardId = string;
export type CardData = {
	barcode: string,
	label: string,
	notes: string,
};
