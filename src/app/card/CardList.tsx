import { useMemo } from 'preact/hooks';
import { useRoute } from 'preact-iso';
import NoCard from '@tabler/icons/outline/id-off.svg';

import { cards, type CardData, type CardId } from '../storage/cards.ts';
import { media } from '../storage/media.ts';
import { composeMerchantSlug } from './merchant-info.ts';

import styles from './CardList.module.css';

export default function CardList() {
	const { query: { search } } = useRoute();
	const allCards = Array.from(cards.getAll());
	const fuzzy = useMemo(() => new RegExp(`.*${search}.*`, 'i'), [search]);
	const sortedCards = allCards
		? allCards
			.filter(({ 1: { label } }) => search ? fuzzy.test(label) : true)
			.sort(({ 1: a }, { 1: b }) => {
				if (a.label < b.label) return -1;
				if (a.label > b.label) return 1;
				return 0;
			})
		: [];

	return (
		<main className="container">
			<section className="callout grid-auto fill primary">
				{sortedCards?.length
					? sortedCards.map(([id, data]) => (<Card id={id} {...data} />))
					: <NoCards search={search} />
				}
			</section>
		</main>
	)
}

const Card = ({ barcode, label, id }: CardData & { id: CardId }) => (
	<a className="callout neutral" href={`/card/${id}`}>
		<figure className="align-center direction-column flex">
			<img className={styles.CardListIcon} src={media.composeUrlPath(`${composeMerchantSlug(label)}.svg`, 'logo')} />

			<figcaption>{label} ({barcode.slice(-4)})</figcaption>
		</figure>
	</a>
);

const NoCards = ({ search }: { search?: string | undefined }) => (
	<a className="align-center link-subtle stack" href="/card/new">
		<NoCard className="size-6xl" />

		{search
			? <>No card found for “{search}”. Add one!</>
			: <>No cards. Add one!</>
		}
	</a>
)
