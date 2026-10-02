import type { AnchorHTMLAttributes } from 'react';
export const usePathname = () => window.location.pathname;
export const useSearchParams = () => new URLSearchParams(window.location.search);
export const useRouter = () => ({ push: (href: string) => window.location.assign(href) });
export default function Link({ prefetch: _prefetch, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) { void _prefetch; return <a {...props} />; }

export const signOut = () => undefined;
