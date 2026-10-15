import { useEffect, useRef, useState } from 'preact/hooks';

import ScanBarcode from '@tabler/icons/outline/barcode.svg';

import { hasBarcodeDetector } from '../Prerequisites/checks.ts';
import { getMobileOS } from '../Prerequisites/getMobileOS.ts';
import type { CardData } from '../storage/cards.ts';
import { useToaster } from '../toaster/context.tsx';

import styles from './BarcodeScanner.module.css';
import type { PropsWithChildren } from 'preact/compat';


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
		if (!hasBarcodeDetector) {
			let Message = DefaultMessage;
			if (getMobileOS(navigator, window) === 'iOS') Message = ISOMessage;
			else if (isFirefox(navigator)) Message = FirefoxMessage;

			push({
				dismissable: true,
				duration: -1,
				heading: 'Barcode scanner disabled',
				kind: 'warning',
				message: <Message>You’ll have to enter the barcode manually.</Message>,
			});
		}
	}, []);

	function stopScanner() {
		// @ts-expect-error https://github.com/microsoft/TypeScript/issues/51671
		const tracks = video.current?.srcObject?.getTracks();

		if (!tracks) return;

		for (const track of tracks) track.stop();
		video.current!.srcObject = null;
		setIsScanning(false);
	}

	useEffect(() => stopScanner, []); // Clean up any active scanner on unmount to avoid memory leaks

	const startScanner = () => {
		navigator.mediaDevices.getUserMedia({
			audio: false,
			video: { facingMode: 'environment' },
		})
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
	const captureBarcode = () => video.current && (new BarcodeDetector())
		.detect(video.current)
		.then(handleScanEnded);

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

const DefaultMessage = ({ children }: PropsWithChildren) => (
	<>
		<p>Your device or browser does not support barcode detection.</p>

		<p>{children}</p>
	</>
);

const ISOMessage = ({ children }: PropsWithChildren) => (
	<>
		<p>
			iOS's barcode detection is broken (see <a href="https://bugs.webkit.org/show_bug.cgi?id=281848">WebKit <code>281848</code></a>).
		</p>

		<p>{children}</p>
	</>
);

const FirefoxMessage = ({ children }: PropsWithChildren) => (
	<>
		<p>Firefox does not support barcode detection (see <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1553738">Bugzilla <code>1553738</code></a>).</p>

		<p>{children}</p>
	</>
);

const isFirefox = (navigator: Navigator) => navigator.userAgent.includes('Firefox');
