import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { nanoid } from 'nanoid/non-secure';

import { cards, PFX } from './cards.ts';


// Can't use concurrency because localStorage is a shared resource
describe('Card storage', { concurrency: false }, () => {
	const val = { barcode: '123', label: 'Costco', notes: 'bulk snacks' };
	const val1 = { barcode: '1', label: 'A', notes: '' };
	const val2 = { barcode: '2', label: 'B', notes: '' };

	afterEach(() => {
		localStorage.clear();
	});

	describe('count', () => {
		it('is 0 for an empty store', () => {
			assert.equal(cards.count, 0);
		});

		it('reflects the number of stored entries', () => {
			cards.set(nanoid(6), val);
			cards.set(nanoid(6), val);
			cards.set(nanoid(6), val);

			assert.equal(cards.count, 3);
		});

		it('decreases after delete()', () => {
			const key = nanoid(6);
			cards.set(key, val);
			cards.set(nanoid(6), val);

			cards.delete(key);

			assert.equal(cards.count, 1);
		});

		it('does not increase when overwriting an existing key', () => {
			const key = nanoid(6);
			cards.set(key, val1);
			cards.set(key, val2);

			assert.equal(cards.count, 1);
		});
	});

	describe('set', () => {
		it('stores a JSON-serialized value that get() parses back out', () => {
			const key = nanoid(6);

			cards.set(key, val);

			assert.deepEqual(cards.get(key), val);
		});

		it('overwrites an existing value for the same key', () => {
			const key = nanoid(6);
			cards.set(key, { barcode: '1', label: 'Costco', notes: 'old' });
			const newVal = { barcode: '2', label: 'Waitrose', notes: 'new' };
			cards.set(key, newVal);

			assert.deepEqual(cards.get(key), newVal);
		});

		it('doesn’t clobber entries with different keys', () => {
			const key1 = nanoid(6);
			cards.set(key1, val1);
			const key2 = nanoid(6);
			cards.set(key2, val2);

			assert.deepEqual(cards.get(key1), val1);
			assert.deepEqual(cards.get(key2), val2);
		});
	});

	describe('get', () => {
		it('returns null for a key that was never set', () => {
			assert.equal(cards.get(nanoid(6)), null);
		});

		it('returns a fresh object, not a reference to the input', () => {
			const key = nanoid(6);

			cards.set(key, val);
			const result = cards.get(key);

			assert.deepEqual(result, val);
			assert.notEqual(result, val);
		});
	});

	describe('delete', () => {
		it('removes the value for a given key', () => {
			const key = nanoid(6);
			cards.set(key, val);

			cards.delete(key);

			assert.equal(cards.get(key), null);
		});

		it('on a nonexistent key is a no-op and does not throw', () => {
			assert.doesNotThrow(() => cards.delete(nanoid(6)));
		});

		it('only removes the targeted key, leaving others intact', () => {
			const key1 = nanoid(6);
			cards.set(key1, val1);
			const key2 = nanoid(6);
			cards.set(key2, val2);

			cards.delete(key1);

			assert.equal(cards.get(key1), null);
			assert.deepEqual(cards.get(key2), val2);
		});
	});

	describe('getAll', () => {
		it('yields nothing for an empty store', () => {
			assert.deepEqual([...cards.getAll()], []);
		});

		it('yields [key, value] pairs for every stored entry', () => {
			const key1 = nanoid(6);
			const key2 = nanoid(6);

			cards.set(key1, val1);
			cards.set(key2, val2);

			const entries = [...cards.getAll()];
			const asMap = new Map(entries);

			assert.equal(entries.length, 2);
			assert.deepEqual(asMap.get(key1), val1);
			assert.deepEqual(asMap.get(key2), val2);
		});

		it('is a generator (lazy, iterable once retrieved fresh each call)', () => {
			cards.set(nanoid(6), val);

			const iterator = cards.getAll();

			assert.equal(typeof iterator.next, 'function');
			assert.equal(typeof iterator[Symbol.iterator], 'function');
		});

		it('reflects deletions made before iteration', () => {
			const key1 = nanoid(6);
			const key2 = nanoid(6);
			cards.set(key1, val);
			cards.set(key2, val);

			cards.delete(key1);

			const keys = [...cards.getAll()].map(([k]) => k);
			assert.deepEqual(keys, [key2]);
		});
	});

	describe('clear', () => {
		it('empties the store', (t) => {
			cards.set(nanoid(6), val);
			cards.set(nanoid(6), val);

			const keys = cards.clear();
			t.test('key prefix removed', () => {
				assert.equal(keys.length, 2);
				const rgx = new RegExp(PFX);
				assert.doesNotMatch(keys[0], rgx);
				assert.doesNotMatch(keys[1], rgx);
			});

			assert.equal(cards.count, 0);
			assert.deepEqual([...cards.getAll()], []);
		});

		it('returns the keys that were present before clearing', () => {
			const key1 = nanoid(6);
			const key2 = nanoid(6);
			cards.set(key1, val);
			cards.set(key2, val);

			const clearedKeys = cards.clear();

			assert.deepEqual(new Set(clearedKeys), new Set([key1, key2]));
		});

		it('on an already-empty store returns an empty array', () => {
			assert.deepEqual(cards.clear(), []);
		});

		it('followed by set() works normally (store is reusable)', () => {
			cards.set(nanoid(6), val);
			cards.clear();

			const key = nanoid(6);
			cards.set(key, val);

			assert.equal(cards.count, 1);
			assert.deepEqual(cards.get(key), val);
		});
	});
});
