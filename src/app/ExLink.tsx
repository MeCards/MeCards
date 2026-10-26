import type { AnchorHTMLAttributes } from 'preact';
import type { PropsWithChildren } from 'preact/compat';


export default function ExLink({
	onClick = () => {},
	...props
}: PropsWithChildren<Exclude<AnchorHTMLAttributes, 'href'>> & { href: string }
) {
	if (!props.href) return null;

	return (
		<a
			{...props}
			onClick={(e) => {
				window.open(props.href, '_blank');
				e.preventDefault();
				onClick(e);
			}}
			rel="noopener noreferrer"
			target="_blank"
		/>
	);
}
