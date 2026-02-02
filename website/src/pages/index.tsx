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

      <Tabs groupId="install" defaultValue="npm" values={[
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
            Keep locale files in sync. Fix keys. Preserve placeholders. Translate only what’s broken.
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

          <div className={styles.installRow}>
            <InstallTabs />
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
        <div className={styles.demoTop}>
          <div className={styles.demoTitle}>See the change</div>
          <div className={styles.demoSub}>
            Fix uses unified view (base en on the left, zh diff on the right). Translate uses split view.
          </div>
        </div>
        <div className={styles.demoStack}>
          <div className={styles.demoBlock}>
            <div className={styles.demoToolbar}>
              <div className={styles.demoToolbarLeft}>
                <div className={styles.demoBlockTitle}>Fix</div>
                <div className={styles.demoMetaLine}>
                  <span className={styles.demoPill}>unified</span>
                  <span className={styles.demoPill}>base: en.json</span>
                  <span className={styles.demoPill}>target: zh.json</span>
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
                  <span className={styles.demoPill}>split</span>
                  <span className={styles.demoPill}>before → after</span>
                  <span className={styles.demoPill}>provider: (local)</span>
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
      body: "Validates placeholders and basic formatting so translations don’t silently break runtime.",
    },
    {
      title: 'Fix structure',
      body: 'Detect missing/extra keys and write fixed output (or in-place).',
    },
    {
      title: 'Translate only what’s broken',
      body: 'LLM translation focuses on problematic keys, not everything.',
    },
    {
      title: 'CI-friendly',
      body: 'Run check in PRs and fail fast with a JSON report for tooling.',
    },
  ];

  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.featuresGrid}>
          {items.map((it) => (
            <div key={it.title} className={styles.featureCard}>
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

export default function Home(): ReactNode {
  return (
    <Layout
      title="i18nfix"
      description="A CLI to check, fix, and translate i18n locale files safely.">
      <Hero />
      <main>
        <Demo />
        <Features />
      </main>
    </Layout>
  );
}
