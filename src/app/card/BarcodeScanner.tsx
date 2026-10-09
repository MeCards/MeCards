import { useRef, useState } from 'preact/hooks';

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

	if (!hasBarcodeDetector && getMobileOS(navigator, window) === 'iOS') push({
		dismissable: true,
		duration: -1,
		kind: 'warning',
		message: <ISOMessage />,
	});

	const enableCamera = () => {
		video.current!.play();

		navigator.mediaDevices.getUserMedia({ audio: false, video: true })
			.then((stream) => {
				video.current!.srcObject = stream;
				setIsScanning(true);
			});
	};

	const captureBarcode = () => (new BarcodeDetector()).detect(video.current!).then(handleScanEnded);

	const handleScanEnded = ([barcode]: Awaited<ReturnType<BarcodeDetector['detect']>>) => {
		if (!barcode) {
			captureBarcode();
		} else {
			setBarcode(barcode.rawValue);
			for (const track of video.current!.srcObject!.getTracks()) track.stop();
			video.current!.srcObject = null;
			setIsScanning(false);
		}
	};

	return (
		<div className={styles.Container}>
			{!isScanning && (
				<button
					className="aspect-ratio-16x9 container justify-center plain primary"
					id={styles.ScanActivator}
					onClick={enableCamera}
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
			</ol>
		</details>
	</>
);
