import XMarkIcon from '@tabler/icons/outline/x.svg';
import type { GenericEventHandler } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Trash from '@tabler/icons/outline/trash.svg';

import pjson from '../../package.json' with { type: 'json' };
import { hasPersistedStorage, isInstalled } from './Prerequisites/checks.ts';
import { cards } from './storage/cards.ts';
import { useToaster } from './toaster/context.tsx';
import { media } from './storage/media.ts';


export default function About() {
	const { push } = useToaster();

	const [persisted, setPersisted] = useState<Boolean>(false);

	useEffect(() => {
		hasPersistedStorage(setPersisted);
	}, []);

	const handleRemoveAllCards: GenericEventHandler<HTMLButtonElement> = async () => {
		const ids = cards.clear();
		await Promise.all(ids.map((id) => media.remove(`${id}.svg`, 'card')));

		push({
			dismissable: true,
			duration: -1,
			kind: 'primary',
			heading: 'Card data removed',
			message: `${ids.length} removed.`,
		});
	};

	return (
		<main className="padding-m">
			<h1>Details</h1>

			<table>
				<thead>
					<tr>
						<th>Detail</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Version</td>
						<td>{pjson.version}</td>
					</tr>
					<tr>
						<td>Installed</td>
						<td>{isInstalled() ? 'yes' : 'no'}</td>
					</tr>
					<tr>
						<td>Explicit persisted storage</td>
						<td>{persisted ? 'yes' : 'no'}</td>
					</tr>
					<tr>
						<td>Cards saved</td>
						<td>
							<div className="flex gap-m justify-between">
								<span>{cards.count}</span>

								{!!cards.count && (
									<button
										className="danger padding-0 plain size-3xs v-align-top"
										command="show-modal"
										commandFor={CONFIRM_MODAL_ID}
										type="button"
									>
										<Trash className="inline size-5xl" />
									</button>
								)}
							</div>
						</td>
					</tr>
				</tbody>
			</table>

			<dialog
				closedBy="closerequest"
				id={CONFIRM_MODAL_ID}
			>
				<header className="action-header">
					<h1>Delete <em>all</em> card?</h1>

					<button
						aria-label="cancel"
						className="-margin-6xs padding-6xs plain"
						command="request-close"
						commandFor={CONFIRM_MODAL_ID}
					>
						<XMarkIcon />
					</button>
				</header>

				<p>This cannot be undone (you'll need to re-create each card).</p>

				<div className="flex justify-center">
					<button
						className="danger"
						command="request-close"
						commandFor={CONFIRM_MODAL_ID}
						onClick={handleRemoveAllCards}
					>Delete everything</button>
				</div>
			</dialog>

			<h1>About</h1>

			<p>Inspired by StoCard; RIP.</p>

			<p>This app is not monetised in any way, and there is no intention to ever do so.</p>

			<p>It’s <a href={`https://github.com/${pjson.repository.split(':')[1]}`}>open-source</a>, and works fully offline (except when fetching a merchant’s logo from <a href="https://commons.wikimedia.org/">WikiMedia</a>). All data you enter is stored locally on your device and never sent to third parties. The app is solely a client application—it has no server and nowhere to send any of your information.</p>

			<p>There’s currently no analytics or telemetry; if added in future, it will be a privacy-centric feature (for instance, automatically creating anoynomised bug reports in the project repo when an error is encountered).</p>
		</main>
	);
}

const CONFIRM_MODAL_ID = 'remove-all-cards';
