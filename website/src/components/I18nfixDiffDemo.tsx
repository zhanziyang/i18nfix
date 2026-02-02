import React, {useEffect, useMemo, useState} from 'react';

import type {FileContents} from '@pierre/diffs';
import {File, MultiFileDiff} from '@pierre/diffs/react';

// NOTE: These are intentionally crafted fixtures to demonstrate i18nfix capabilities.
// - `fix` shows structural fixes (missing keys added, extras kept)
// - `translate` shows content fixes (translations + placeholder/format preservation)

const EN_FILE: FileContents = {
  name: 'locales/en.json',
  lang: 'json',
  cacheKey: 'en-base-v2',
  contents: `{
  "app": {
    "title": "i18nfix",
    "welcome": "Hello, {name}!",
    "cta": "Start now",
    "items": "You have %s items"
  },
  "home": {
    "subtitle": "Fix missing keys, placeholders, and untranslated strings",
    "markdown": "Read the **docs** at [Getting Started](/docs/getting-started)."
  },
  "errors": {
    "required": "<b>{field}</b> is required."
  },
  "footer": {
    "legal": "© {year} i18nfix"
  }
}
`,
};

// BEFORE FIX: intentionally includes
// - missing keys: app.cta, errors.required
// - placeholder mismatch: {name} -> {username}
// - printf mismatch: %s -> %d
// - untranslated: home.subtitle, home.markdown (same as base)
// - extra key: app.extraKey
const ZH_BEFORE_FIX: FileContents = {
  name: 'locales/zh.json',
  lang: 'json',
  cacheKey: 'zh-before-fix-v2',
  contents: `{
  "app": {
    "title": "i18nfix",
    "welcome": "你好，{username}!",
    "items": "你有 %d 个项目",
    "extraKey": "这个 key 在 base 里不存在"
  },
  "home": {
    "subtitle": "Fix missing keys, placeholders, and untranslated strings",
    "markdown": "Read the **docs** at [Getting Started](/docs/getting-started)."
  },
  "footer": {
    "legal": ""
  }
}
`,
};

// AFTER FIX: structure repaired (missing keys added with empty strings by default).
// Content issues remain until translate.
const ZH_AFTER_FIX: FileContents = {
  name: 'locales/zh.json',
  lang: 'json',
  cacheKey: 'zh-after-fix-v2',
  contents: `{
  "app": {
    "title": "i18nfix",
    "welcome": "你好，{username}!",
    "items": "你有 %d 个项目",
    "extraKey": "这个 key 在 base 里不存在",
    "cta": ""
  },
  "home": {
    "subtitle": "Fix missing keys, placeholders, and untranslated strings",
    "markdown": "Read the **docs** at [Getting Started](/docs/getting-started)."
  },
  "errors": {
    "required": ""
  },
  "footer": {
    "legal": ""
  }
}
`,
};

const ZH_BEFORE_TRANSLATE: FileContents = {
  name: 'locales/zh.json',
  lang: 'json',
  cacheKey: 'zh-before-translate-v2',
  contents: ZH_AFTER_FIX.contents,
};

// AFTER TRANSLATE: demonstrates
// - placeholder alignment: {name}
// - printf alignment: %s
// - markdown preserved
// - HTML tag preserved (<b>)
const ZH_AFTER_TRANSLATE: FileContents = {
  name: 'locales/zh.json',
  lang: 'json',
  cacheKey: 'zh-after-translate-v2',
  contents: `{
  "app": {
    "title": "i18nfix",
    "welcome": "你好，{name}!",
    "items": "你有 %s 个项目",
    "extraKey": "这个 key 在 base 里不存在",
    "cta": "立即开始"
  },
  "home": {
    "subtitle": "修复缺失 key、占位符与未翻译的字符串",
    "markdown": "阅读 **文档**： [Getting Started](/docs/getting-started)。"
  },
  "errors": {
    "required": "<b>{field}</b> 为必填项。"
  },
  "footer": {
    "legal": "© {year} i18nfix"
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
