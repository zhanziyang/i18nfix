import React from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import {I18nfixFixDemo, I18nfixTranslateDemo} from '@site/src/components/I18nfixDiffDemo';
import styles from './demo.module.css';

export default function DemoPage() {
  return (
    <Layout title="Demo" description="See i18nfix fix/translate diffs">
      <main className={styles.page}>
        <div className={clsx('container container--fluid', styles.container)}>
          <div className={styles.titleRow}>
            <div>
              <h1 className={styles.h1}>Demo</h1>
              <div className={styles.sub}>Curated fixtures that demonstrate missing keys, placeholder/printf mismatches, untranslated strings, and safe translation output.</div>
            </div>
          </div>

          <div className={styles.stack}>
            <section className={styles.block}>
              <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                  <div className={styles.blockTitle}>Fix</div>
                  <div className={styles.metaLine}>
                    <span className={styles.pill}>unified</span>
                    <span className={styles.pill}>base: en.json</span>
                    <span className={styles.pill}>target: zh.json</span>
                  </div>
                </div>
                <div className={styles.toolbarRight}>
                  <code className={styles.cmd}>i18nfix fix --out-dir fixed</code>
                </div>
              </div>
              <div className={styles.wrap}>
                <I18nfixFixDemo />
              </div>
            </section>

            <section className={styles.block}>
              <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                  <div className={styles.blockTitle}>Translate</div>
                  <div className={styles.metaLine}>
                    <span className={styles.pill}>unified</span>
                    <span className={styles.pill}>base: en.json</span>
                    <span className={styles.pill}>target: zh.json</span>
                  </div>
                </div>
                <div className={styles.toolbarRight}>
                  <code className={styles.cmd}>i18nfix fix --in-place --translate</code>
                </div>
              </div>
              <div className={styles.wrap}>
                <I18nfixTranslateDemo animate />
              </div>
            </section>
          </div>
        </div>
      </main>
    </Layout>
  );
}
