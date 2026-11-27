import type { ReactNode } from 'react';

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="inline-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
