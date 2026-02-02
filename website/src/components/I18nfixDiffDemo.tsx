import React, {useEffect, useMemo, useState} from 'react';

import type {FileContents} from '@pierre/diffs';
import {File, MultiFileDiff} from '@pierre/diffs/react';

const EN_FILE: FileContents = {
  name: 'locales/en.json',
  lang: 'json',
  cacheKey: 'en-base-v1',
  contents: `{
  "app": {
    "title": "i18nfix demo",
    "welcome": "Hello, {name}!",
    "cta": "Start now",
    "items": "You have %s items"
  },
  "home": {
    "headline": "Build faster",
    "subtitle": "Fix missing keys, placeholders, and untranslated strings"
  }
}
`,
};

const ZH_BEFORE_FIX: FileContents = {
  name: 'locales/zh.json',
  lang: 'json',
  cacheKey: 'zh-before-fix-v1',
  contents: `{
  "app": {
    "title": "i18nfix demo",
    "welcome": "你好，{username}!", 
    "items": "你有 %d 个项目",
    "extraKey": "这个 key 在 base 里不存在"
  },
  "home": {
    "headline": "Build faster",
    "subtitle": "Fix missing keys, placeholders, and untranslated strings"
  }
}
`,
};

const ZH_AFTER_FIX: FileContents = {
  name: 'zh.json',
  lang: 'json',
  cacheKey: 'zh-after-fix-v1',
  contents: `{
  "app": {
    "title": "i18nfix demo",
    "welcome": "你好，{username}!",
    "items": "你有 %d 个项目",
    "extraKey": "这个 key 在 base 里不存在",
    "cta": ""
  },
  "home": {
    "headline": "Build faster",
    "subtitle": "Fix missing keys, placeholders, and untranslated strings"
  }
}
`,
};

const ZH_BEFORE_TRANSLATE: FileContents = {
  name: 'locales/zh.json',
  lang: 'json',
  cacheKey: 'zh-before-translate-v1',
  contents: ZH_AFTER_FIX.contents,
};

const ZH_AFTER_TRANSLATE: FileContents = {
  name: 'locales/zh.json',
  lang: 'json',
  cacheKey: 'zh-after-translate-v1',
  contents: `{
  "app": {
    "title": "i18nfix demo",
    "welcome": "你好，{name}!",
    "items": "你有 %s 个项目",
    "extraKey": "这个 key 在 base 里不存在",
    "cta": "立即开始"
  },
  "home": {
    "headline": "构建更快",
    "subtitle": "修复缺失 key、占位符与未翻译的字符串"
  }
}
`,
};

function TerminalProgress({label = 'translating'}: {label?: string}) {
  return (
    <div className="i18nfixProgress">
      <div className="i18nfixProgress__top">
        <span className="i18nfixProgress__prompt">$</span>
        <span className="i18nfixProgress__cmd">{label}</span>
        <span className="i18nfixProgress__dots" aria-hidden>
          …
        </span>
      </div>
      <div className="i18nfixProgress__bar" role="progressbar" aria-label="loading" />
      <div className="i18nfixProgress__scan" aria-hidden />
    </div>
  );
}

function useDiffOptionsBase() {
  return useMemo(
    () => ({
      theme: 'pierre-dark' as const,
      themeType: 'dark' as const,
      diffIndicators: 'classic' as const,
      overflow: 'wrap' as const,
      enableLineSelection: true,
    }),
    []
  );
}

export function I18nfixFixDemo() {
  const diffOptionsBase = useDiffOptionsBase();
  return (
    <div style={{borderRadius: 16, overflow: 'hidden'}}>
      <div className="i18nfixDemoGrid">
        <div className="i18nfixDemoPanel">
          <div className="i18nfixDemoPanel__title">Base (en)</div>
          <File
            file={EN_FILE}
            options={{
              theme: 'pierre-dark',
              themeType: 'dark',
              overflow: 'wrap',
              disableLineNumbers: false,
            }}
          />
        </div>

        <div className="i18nfixDemoPanel">
          <div className="i18nfixDemoPanel__title">Target (zh) — fix output</div>
          <MultiFileDiff
            oldFile={ZH_BEFORE_FIX}
            newFile={ZH_AFTER_FIX}
            options={{...diffOptionsBase, diffStyle: 'unified'}}
          />
        </div>
      </div>
    </div>
  );
}

export function I18nfixTranslateDemo({animate = true}: {animate?: boolean}) {
  const diffOptionsBase = useDiffOptionsBase();
  const [loading, setLoading] = useState(Boolean(animate));

  useEffect(() => {
    if (!animate) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [animate]);

  return (
    <div style={{borderRadius: 16, overflow: 'hidden'}}>
      <div className="i18nfixDemoGrid">
        <div className="i18nfixDemoPanel">
          <div className="i18nfixDemoPanel__title">Base (en)</div>
          <File
            file={EN_FILE}
            options={{
              theme: 'pierre-dark',
              themeType: 'dark',
              overflow: 'wrap',
              disableLineNumbers: false,
            }}
          />
        </div>

        <div className="i18nfixDemoPanel">
          <div className="i18nfixDemoPanel__title">Target (zh) — translate output</div>
          <div style={{padding: 10}}>
            {loading ? (
              <TerminalProgress label="i18nfix fix --in-place --translate" />
            ) : (
              <MultiFileDiff
                oldFile={ZH_BEFORE_TRANSLATE}
                newFile={ZH_AFTER_TRANSLATE}
                options={{...diffOptionsBase, diffStyle: 'unified'}}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
