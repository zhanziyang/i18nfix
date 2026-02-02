import React from 'react';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';

export default function Footer() {
  const {footer} = useThemeConfig();
  const year = new Date().getFullYear();

  // Keep it minimal and product-like (diffs.com-ish)
  const links = footer?.links ?? [];
  const flat: Array<{label: string; href: string}> = [];

  for (const group of links) {
    for (const item of group.items ?? []) {
      if (!item.label) continue;
      const href = 'href' in item && item.href ? item.href : 'to' in item && item.to ? item.to : null;
      if (!href) continue;
      flat.push({label: item.label, href});
    }
  }

  const unique = Array.from(
    new Map(flat.map((l) => [l.label + '|' + l.href, l])).values()
  ).slice(0, 6);

  return (
    <footer className="i18nfixFooter">
      <div className="i18nfixFooter__inner">
        <div className="i18nfixFooter__left">
          <span className="i18nfixFooter__brand">i18nfix</span>
          <span className="i18nfixFooter__sep">·</span>
          <span className="i18nfixFooter__copy">© {year}</span>
        </div>

        <nav className="i18nfixFooter__nav" aria-label="footer">
          {unique.map((l) => (
            <Link key={l.label + l.href} className="i18nfixFooter__link" to={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
