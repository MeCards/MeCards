import type { Dispatch, StateUpdater } from 'preact/hooks';


export const hasBarcodeDetector = await (async () => {
	// if (!('BarcodeDetector' in window)) {
		return import('@undecaf/barcode-detector-polyfill')
			.then(({ BarcodeDetectorPolyfill }) => window['BarcodeDetector'] = BarcodeDetectorPolyfill)
			.then(
				() => true,
				() => false,
			);
	// }

	// return true;
})();

export const hasPersistedStorage = (set: Dispatch<StateUpdater<Boolean>>) => navigator.storage?.persist?.()
	.then(
		(v) => { set(v); return v },
		() => { set(false); return false },
	);

export const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches;
