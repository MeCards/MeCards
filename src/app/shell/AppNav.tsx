import { clsx } from 'clsx';
import debounce from 'lodash.debounce';
import type { ChangeEvent } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { useLocation } from 'preact-iso';

import AddNew from '@tabler/icons/outline/square-plus.svg';
import Info from '@tabler/icons/outline/info-circle.svg';
import SearchList from '@tabler/icons/outline/list-search.svg';
import Wallet from '@tabler/icons/outline/wallet.svg';

import styles from './AppNav.module.css';

export function AppNav() {
	const { path, query: { search }, route } = useLocation();

	const handleSearch = useMemo(
		() => debounce(
			(value: ChangeEvent<HTMLInputElement>['currentTarget']['value']) => route(`/?search=${value}`),
			300,
		),
		[],
	);

	return (
		<footer className={clsx(styles.AppNav, 'flex gap-m justify-center')}>
			{path !== '/about' && (
				<a className="flex-inline" href="/about" aria-label="about the app">
					<Info className="size-5xl" />
				</a>
			)}

			{path === '/'
				? (
					<label className="flex gap-m">
						<SearchList aria-label="search cards" className="size-5xl" />

						<input
							className="margin-start-0"
							defaultValue={search}
							name="search-cards"
							onChange={(e) => handleSearch(e.currentTarget.value)}
							type="search"
						/>
					</label>
				)
				: (
					<a className="flex-inline" href="/" aria-label="list of cards">
						<Wallet className="size-5xl" />
					</a>
				)
			}

			{!path.startsWith('/card') && (
				<a className="flex-inline" href="/card/new" aria-label="add a new card">
					<AddNew className="size-5xl" />
				</a>
			)}
		</footer>
	);
}
