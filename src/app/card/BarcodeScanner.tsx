import { useEffect, useRef, useState } from 'preact/hooks';

import ScanBarcode from '@tabler/icons/outline/barcode.svg';
import ToggleOn from '@tabler/icons/outline/toggle-right.svg';

import { hasBarcodeDetector } from '../Prerequisites/checks.ts';
import { getMobileOS } from '../Prerequisites/getMobileOS.ts';
import type { CardData } from '../storage/cards.ts';
import { useToaster } from '../toaster/context.tsx';

import styles from './BarcodeScanner.module.css';


type BarcodeProps = {
	card: CardData,
	setBarcode: (barcode: CardData['barcode']) => void,
	src: URL['href'],
};

export default function Barcode({
	card,
	setBarcode,
	src,
}: BarcodeProps) {
	const { push } = useToaster();
	const video = useRef<HTMLVideoElement>(null);
	const [isScanning, setIsScanning] = useState(false);

	if (card.barcode) return (
		<img
			alt={card.barcode}
			src={src}
		/>
	);

	useEffect(() => {
		if (!hasBarcodeDetector && getMobileOS(navigator, window) === 'iOS') push({
			dismissable: true,
			duration: -1,
			kind: 'warning',
			message: <ISOMessage />,
		});
	}, []);

	function stopScanner() {
		// @ts-expect-error https://github.com/microsoft/TypeScript/issues/51671
		const tracks = video.current?.srcObject?.getTracks();
		for (const track of tracks) track.stop();
		video.current!.srcObject = null;
		setIsScanning(false);
	}

	useEffect(() => stopScanner, []); // Clean up any active scanner on unmount to avoid memory leaks

	const startScanner = () => {
		navigator.mediaDevices.getUserMedia({ audio: false, video: true })
			.then((stream) => {
				video.current!.srcObject = stream;
				setIsScanning(true);
			});

		//! This MUST be called **directly** (and synchronously) in the user-triggered event handler
		//! NOT inside `getUserMedia`
		// Can be called after getUserMedia is started though, so it can already run in the background.
		video.current!.play();
	};

	/**
	 * `BarcodeDetector.detect` checks the _current_ frame of the video feed, and then stops 😪 so it
	 * has to be called continuously, effectively on every frame.
	 */
	const captureBarcode = () => (new BarcodeDetector()).detect(video.current!).then(handleScanEnded);

	/** The scan result of the current frame. */
	const handleScanEnded = ([barcode]: Awaited<ReturnType<BarcodeDetector['detect']>>) => {
		if (!barcode) return void captureBarcode(); // Nothing in this frame; try again.

		setBarcode(barcode.rawValue);
		stopScanner();
	};

	if (!hasBarcodeDetector) return;

	return (
		<div className={styles.Container}>
			{!isScanning && (
				<button
					aria-label="start barcode scanner"
					className="aspect-ratio-16x9 container justify-center plain primary"
					id={styles.ScanActivator}
					onClick={startScanner}
				>
					<ScanBarcode className="size-6xl" />
				</button>
			)}

			<video
				autoPlay
				className="aspect-ratio-16x9"
				onCanPlay={captureBarcode}
				playsInline
				preload="auto"
				ref={video}
			/>
		</div>
	);
}

const ISOMessage = () => (
	<>
		<p>Barcode scanning must be enabled in iOS's settings (because why not):</p>

		<details>
			<summary>Instructions</summary>

			<ol>
				<li>Open the <code>Settings</code> app</li>
				<li>Navigate to Apps → Safari → Advanced → Feature Flags</li>
				<li><ToggleOn className="inline size-m" /> Toggle <code>Shape Detection API</code> "on"</li>
				<li>Quit and relaunch the MeCards app</li>
			</ol>
		</details>
	</>
);
