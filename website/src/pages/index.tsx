import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {I18nfixFixDemo, I18nfixTranslateDemo} from '@site/src/components/I18nfixDiffDemo';

import styles from './index.module.css';

function InstallTabs() {
  return (
    <div className={styles.installCard}>
      <div className={styles.installHeader}>
        <div className={styles.installKicker}>Install</div>
        <div className={styles.installHint}>Add as a dev dependency (recommended)</div>
      </div>

      <Tabs
        groupId="install"
        defaultValue="npm"
        values={[
          {label: 'npm', value: 'npm'},
          {label: 'pnpm', value: 'pnpm'},
          {label: 'yarn', value: 'yarn'},
          {label: 'bun', value: 'bun'},
        ]}>
        <TabItem value="npm">
          <pre className={clsx('prism-code', styles.terminal)}>
            <code>npm i -D i18nfix</code>
          </pre>
        </TabItem>
        <TabItem value="pnpm">
          <pre className={clsx('prism-code', styles.terminal)}>
            <code>pnpm add -D i18nfix</code>
          </pre>
        </TabItem>
        <TabItem value="yarn">
          <pre className={clsx('prism-code', styles.terminal)}>
            <code>yarn add -D i18nfix</code>
          </pre>
        </TabItem>
        <TabItem value="bun">
          <pre className={clsx('prism-code', styles.terminal)}>
            <code>bun add -d i18nfix</code>
          </pre>
        </TabItem>
      </Tabs>

      <div className={styles.installFooter}>
        <div className={styles.installNote}>
          Then run <code>i18nfix --help</code>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroBg} />
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroLeft}>
          <div className={styles.badge}>CLI for i18n hygiene</div>
          <Heading as="h1" className={styles.title}>
            i18nfix
          </Heading>
          <p className={styles.subtitle}>
            Maintain one source language. Let CI keep every other locale in sync—automatically.
          </p>

          <div className={styles.ctaRow}>
            <Link className={clsx(styles.ctaPrimary)} to="/docs/getting-started">
              Get started
            </Link>
            <Link className={clsx(styles.ctaSecondary)} href="https://github.com/zhanziyang/i18nfix">
              View on GitHub
            </Link>
          </div>

          <div className={styles.quickRow}>
            <span className={styles.quickLabel}>$</span>
            <pre className={clsx('prism-code', styles.terminalInline)}>
              <code>i18nfix fix --in-place --translate</code>
            </pre>
          </div>
        </div>
      </div>
    </header>
  );
}

function Demo() {
  return (
    <section id="demo" className={styles.demoSection}>
      <div className={clsx('container container--fluid', styles.demoContainer)}>
        <div className={styles.demoStack}>
          <div className={styles.demoBlock}>
            <div className={styles.demoToolbar}>
              <div className={styles.demoToolbarLeft}>
                <div className={styles.demoBlockTitle}>Fix</div>
                <div className={styles.demoMetaLine}>
                  <span className={styles.demoPill}>Adds missing keys</span>
                  <span className={styles.demoPill}>Keeps structure consistent</span>
                  <span className={styles.demoPill}>No content changes</span>
                </div>
              </div>
              <div className={styles.demoToolbarRight}>
                <code className={styles.demoCmd}>i18nfix fix --out-dir fixed</code>
              </div>
            </div>
            <div className={styles.demoWrap}>
              <I18nfixFixDemo />
            </div>
          </div>

          <div className={styles.demoBlock}>
            <div className={styles.demoToolbar}>
              <div className={styles.demoToolbarLeft}>
                <div className={styles.demoBlockTitle}>Translate</div>
                <div className={styles.demoMetaLine}>
                  <span className={styles.demoPill}>Fills missing/untranslated strings</span>
                  <span className={styles.demoPill}>Preserves variables</span>
                  <span className={styles.demoPill}>Great for CI</span>
                </div>
              </div>
              <div className={styles.demoToolbarRight}>
                <code className={styles.demoCmd}>i18nfix fix --in-place --translate</code>
              </div>
            </div>
            <div className={styles.demoWrap}>
              <I18nfixTranslateDemo animate />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      title: 'Safe by default',
      body: "Validates placeholders so translations don’t break runtime.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2l8 4v6c0 5-3.3 9.4-8 10-4.7-.6-8-5-8-10V6l8-4z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8.5 12.2l2.1 2.2 4.9-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: 'Fix structure',
      body: 'Adds missing keys and keeps your locale shape consistent.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 3h10v4H7V3z" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M5 10h14M5 14h14M5 18h10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: 'Translate only what’s broken',
      body: 'Focus on missing/empty/untranslated keys — not everything.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 6h7l-3 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M13 18h7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14.5 6h5.5l-2.8 7.2c-.4 1-1.3 1.8-2.4 2.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: 'CI-friendly',
      body: 'Deterministic exit codes + JSON report for PR checks.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 7a3 3 0 106 0 3 3 0 00-6 0z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M11 10v4a3 3 0 103 3h3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 10V6h-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.featuresGrid}>
          {items.map((it) => (
            <div key={it.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{it.icon}</div>
              <div className={styles.featureTitle}>{it.title}</div>
              <div className={styles.featureBody}>{it.body}</div>
            </div>
          ))}
        </div>

        <div className={styles.workflowSection}>
          <div className={styles.workflowHeader}>
            <div className={styles.workflowTitle}>One command workflow</div>
            <div className={styles.workflowSub}>Fix structure first, then translate the problematic keys.</div>
          </div>

          <div className={styles.workflowGrid}>
            <div className={styles.workflowStep}>
              <div className={styles.stepKicker}>1</div>
              <div className={styles.stepTitle}>Fix</div>
              <pre className={clsx('prism-code', styles.terminal)}>
                <code>{`i18nfix fix --in-place`}</code>
              </pre>
              <div className={styles.stepHint}>Adds missing keys. Optionally drops extra keys.</div>
            </div>

            <div className={styles.workflowStep}>
              <div className={styles.stepKicker}>2</div>
              <div className={styles.stepTitle}>Translate</div>
              <pre className={clsx('prism-code', styles.terminal)}>
                <code>{`i18nfix fix --in-place --translate`}</code>
              </pre>
              <div className={styles.stepHint}>Translates only keys that need attention (missing/empty/untranslated).</div>
            </div>
          </div>
        </div>

        <div className={styles.commandStrip}>
          <div className={styles.commandItem}>
            <div className={styles.commandName}>check</div>
            <div className={styles.commandDesc}>find issues</div>
          </div>
          <div className={styles.commandItem}>
            <div className={styles.commandName}>fix</div>
            <div className={styles.commandDesc}>repair structure</div>
          </div>
          <div className={styles.commandItem}>
            <div className={styles.commandName}>translate</div>
            <div className={styles.commandDesc}>advanced mode</div>
          </div>
          <div className={styles.commandItem}>
            <div className={styles.commandName}>new</div>
            <div className={styles.commandDesc}>scaffold languages</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstallFinal() {
  return (
    <section className={styles.installFinalSection}>
      <div className={clsx('container', styles.installFinalContainer)}>
        <InstallTabs />
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="i18nfix"
      description="Write one language. Ship all languages. i18nfix keeps locale files in sync (CI-friendly) with safe placeholder validation.">
      <Hero />
      <main>
        <Demo />
        <Features />
        <InstallFinal />
      </main>
    </Layout>
  );
}
