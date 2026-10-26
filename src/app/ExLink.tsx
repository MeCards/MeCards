import type { AnchorHTMLAttributes } from 'preact';
import type { PropsWithChildren } from 'preact/compat';


export default function ExLink(props: PropsWithChildren<AnchorHTMLAttributes>) {
	return (
		<a {...props} rel="noopener noreferrer" target="_blank" />
	);
}
