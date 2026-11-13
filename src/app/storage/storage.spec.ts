import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cards } from './cards.ts';
import { settings } from './settings.ts';


describe('storage', () => {
	const card = { barcode: '', label: 'a', notes: '' };
	describe('cross-contamination', () => {
		it('clearing one should not affect the other', () => {
			cards.set('abc123', card);
			settings.set('foo', 'a', 'forever');
			settings.set('foo', 'a', 'temp');

			cards.clear();

			assert.equal(cards.get('abc123'), null);

			assert.equal(settings.get('foo', 'forever'), 'a');
			assert.equal(settings.get('foo', 'temp'), 'a');
		});

		it('keys should not collide', () => {
			const key = 'def456';

			cards.set(key, card);
			settings.set(key, 'a');

			assert.deepEqual(cards.get(key), card);
			assert.equal(settings.get(key), 'a');
		});
	});
});
