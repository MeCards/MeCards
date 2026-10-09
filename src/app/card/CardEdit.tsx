import ArrowLeft from '@tabler/icons/outline/arrow-left.svg';
import Trash from '@tabler/icons/outline/trash.svg';
import XMarkIcon from '@tabler/icons/outline/x.svg';
import { nanoid } from 'nanoid';
import {
	type FocusEventHandler,
	type GenericEventHandler,
	type SubmitEventHandler,
} from 'preact';
import type { PropsWithChildren } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';
import { useLocation, useRoute } from 'preact-iso';

import { cards, type CardData } from '../storage/cards.ts';
import { media } from '../storage/media.ts';
import { useToaster } from '../toaster/context.tsx';
import { generateBarcodeFile } from './generate-barcode.ts';
import { composeMerchantSlug, retrieveMerchantLogo } from './merchant-info.ts';
import Barcode from './BarcodeScanner.tsx';


const FORM_ID = 'upsert';
const ID_NEW = 'new';

export default function CardEdit() {
	const { params } = useRoute();
	const isNew = params.id === ID_NEW;
	const [id] = useState(() => isNew ? nanoid(6) : params.id!);
	const [card, setCard] = useState(
		isNew
		? {} as CardData
		: cards.get(id) ?? {} as CardData
	);
	// This is necessary because of browser DOM caching:
	// it refuses to re-render the image unless the `src` is actually different.
	const [barcodeSrc, setBarcodeSrc] = useState<URL['href']>('');
	const [disabled, setDisabled] = useState<boolean>();
	const [logo, setLogo] = useState<URL['href']>();
	const { route } = useLocation();
	const { push } = useToaster();

	const setBarcode = async (barcode: string) => {
		setCard((prev) => ({ ...prev, barcode }));

		await media.save(
			generateBarcodeFile(barcode, id),
			'card',
		);
		await media.createTmpUrl(`${id}.svg`, 'card', barcodeSrc).then(setBarcodeSrc);
	};

	const getMerchantLogo: FocusEventHandler<HTMLInputElement> = async ({
		currentTarget: { value: merchantName },
	}) => {
		if (!merchantName) return;

		setDisabled(true);

		const url = await retrieveMerchantLogo(merchantName)
			.catch(() => push({
				kind: 'warning',
				message: `Could not find a logo for “${merchantName}”.`,
			}))
			.finally(() => setDisabled(false));

		setLogo(url);
	};

	useEffect(() => {
		if (!card.label) return;

		const merchantSlug = composeMerchantSlug(card.label);
		const filename = `${merchantSlug}.svg`;

		media
			.find(filename, 'logo')
			.then((key) => key && setLogo(key));
	}, [card.label]);

	useEffect(() => {
		if (!isNew) media.createTmpUrl(`${id}.svg`, 'card')
			.then(setBarcodeSrc)
			.catch((err) => push({
				kind: 'warning',
				heading: 'No barcode found',
				message: err.message,
			}));

		return () => URL.revokeObjectURL(barcodeSrc);
	}, []);

	const handleDelete: GenericEventHandler<HTMLButtonElement> = () => {
		cards.delete(id);
		media.remove(`${id}.svg`, 'card');
		route('/');
		push({
			kind: 'primary',
			heading: 'Card deleted',
			message: `${card.label} ${card.barcode}`,
		})
	};

	const handleReset: GenericEventHandler<HTMLFormElement> = () => location.reload();

	const handleSubmit: SubmitEventHandler<HTMLFormElement & { elements: {
		barcode: HTMLInputElement,
		label: HTMLInputElement,
		notes: HTMLInputElement,
	} }> = async (event) => {
		event.preventDefault();

		const {
			label: { value: label },
			notes: { value: notes },
		} = event.currentTarget.elements;
		const barcode = event.currentTarget.elements.barcode.value.replaceAll(/\s+/g, '');

		cards.set(id, {
			barcode,
			label,
			notes,
		});

		await media.save(
			generateBarcodeFile(barcode, id),
			'card',
		);

		setCard({
			barcode,
			label,
			notes,
		});

		route('/');
	};

	return (
		<main className="container">
			<div className="full stack">
				<header className="flex split">
					<a className="btn link padding-0" href="/"><ArrowLeft /> Back to list</a>

					{isNew
					? (<span />)
					: (
							<button
								className="danger padding-0 plain size-3xs"
								command="show-modal"
								commandFor={CONFIRM_MODAL_ID}
								type="button"
							>
								<Trash className="size-5xl" />
							</button>
						)
					}
				</header>

				<section className="align-center stack">
					<img className="size-5xl" src={logo} />

					<Barcode
						card={card}
						setBarcode={setBarcode}
						src={barcodeSrc}
					/>
				</section>

				<EditWrapper isNew={isNew}>
					<form
						className="align-center stack"
						id={FORM_ID}
						onReset={handleReset}
						onSubmit={handleSubmit}
					>

						<label>
							Merchant
							<input
								defaultValue={card.label}
								id="label"
								onBlur={getMerchantLogo}
								placeholder="Costco"
								required
								type="text"
							/>
						</label>
						<label>
							Card number
							<input
								defaultValue={card.barcode}
								id="barcode"
								onBlur={(e) => setBarcode(e.currentTarget.value)}
								placeholder="4 003994 155486"
								required
								type="text"
							/>
						</label>
						<label>
							Notes
							<textarea
								defaultValue={card.notes}
								id="notes"
								placeholder="Whatever you want"
							/>
						</label>

						<div className="split">
							{isNew
								? <button type="reset">Reset</button>
								: <a className="btn neutral" href="/">Cancel</a>
							}

							<button
								className="primary"
								disabled={disabled}
								type="submit"
							>Save</button>
						</div>
					</form>
				</EditWrapper>
			</div>

			<dialog
				closedBy="closerequest"
				id={CONFIRM_MODAL_ID}
			>
				<header className="action-header">
					<h1>Delete this {card.label} card?</h1>

					<button
						aria-label="cancel"
						className="-margin-6xs padding-6xs plain"
						command="request-close"
						commandFor={CONFIRM_MODAL_ID}
					>
						<XMarkIcon />
					</button>
				</header>

				<p>This cannot be undone (you'll need to re-create the card).</p>

				<div className="flex justify-center">
					<button
						className="danger"
						command="request-close"
						commandFor={CONFIRM_MODAL_ID}
						onClick={handleDelete}
					>Delete it</button>
				</div>
			</dialog>
		</main>
	);
}

function EditWrapper({ children, isNew }: PropsWithChildren<{ isNew: boolean }>) {
	if (isNew) return children;

	return (
		<details>
			<summary>Edit</summary>

			{children}
		</details>
	)
}

const CONFIRM_MODAL_ID = 'confirm-delete';
