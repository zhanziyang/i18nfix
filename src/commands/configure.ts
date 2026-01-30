import inquirer from 'inquirer';
import { I18nFixConfig } from '../types.js';
import {
  DEFAULT_CONFIG_FILENAME,
  loadConfig,
  resolveConfigPath,
  writeJsonFile,
} from '../config.js';

function int(v: string): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error('maxItems must be a positive number');
  return Math.floor(n);
}

export async function runConfigure(configPath?: string) {
  const p = resolveConfigPath(configPath);

  let current: I18nFixConfig | null = null;
  try {
    current = await loadConfig(p);
  } catch {
    // if missing/invalid, start from empty and write to default
    current = null;
  }

  const ans = await inquirer.prompt([
    {
      type: 'input',
      name: 'base',
      message: 'Base locale JSON path (source language):',
      default: current?.base ?? 'locales/en.json',
    },
    {
      type: 'input',
      name: 'targets',
      message: 'Target locale JSON paths (comma-separated):',
      default: (current?.targets ?? ['locales/zh.json']).join(', '),
      filter: (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean),
    },
    {
      type: 'list',
      name: 'keyStyle',
      message: 'Key style:',
      choices: [
        { name: 'auto (detect)', value: 'auto' },
        { name: 'nested JSON', value: 'nested' },
        { name: 'flat keys', value: 'flat' },
      ],
      default: current?.keyStyle ?? 'auto',
    },
    {
      type: 'checkbox',
      name: 'placeholderStyle',
      message: 'Placeholder style(s) to validate:',
      choices: [
        { name: 'auto (detect)', value: 'auto' },
        { name: 'brace: {name}', value: 'brace' },
        { name: 'mustache: {{name}}', value: 'mustache' },
        { name: 'printf: %s %d %1$s', value: 'printf' },
        { name: 'ruby: %{count}', value: 'ruby' },
      ],
      default:
        current?.placeholderStyle == null
          ? ['auto']
          : Array.isArray(current.placeholderStyle)
            ? current.placeholderStyle
            : [current.placeholderStyle],
      validate: (arr: string[]) => (arr.length ? true : 'Select at least one'),
    },
    {
      type: 'confirm',
      name: 'treatSameAsBaseAsUntranslated',
      message: 'Treat values equal to base as “untranslated”?',
      default: current?.treatSameAsBaseAsUntranslated ?? true,
    },
    {
      type: 'input',
      name: 'ignoreKeys',
      message: 'Ignore keys (comma-separated):',
      default: (current?.ignoreKeys ?? []).join(', '),
      filter: (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean),
    },
    {
      type: 'confirm',
      name: 'enableTranslate',
      message: 'Enable translate (LLM provider) configuration?',
      default: Boolean(current?.translate),
    },
    {
      type: 'list',
      name: 'provider',
      message: 'Translate provider:',
      choices: [
        { name: 'OpenAI', value: 'openai' },
        { name: 'OpenRouter (OpenAI-compatible)', value: 'openrouter' },
        { name: 'Claude (Anthropic API)', value: 'claude' },
        { name: 'Gemini (Google)', value: 'gemini' },
      ],
      default: current?.translate?.provider ?? 'openai',
      when: (a) => a.enableTranslate,
    },
    {
      type: 'input',
      name: 'apiKeyEnv',
      message: 'API key environment variable name (recommended):',
      default: current?.translate?.apiKeyEnv ?? '',
      when: (a) => a.enableTranslate,
    },
    {
      type: 'input',
      name: 'model',
      message: 'Model name (optional):',
      default: current?.translate?.model ?? '',
      when: (a) => a.enableTranslate,
    },
    {
      type: 'input',
      name: 'maxItems',
      message: 'Max strings per run (leave blank for no limit):',
      default: current?.translate?.maxItems ?? '',
      filter: (v: string) => v.trim(),
      when: (a) => a.enableTranslate,
    },
    {
      type: 'number',
      name: 'delayMs',
      message: 'Delay between requests (ms):',
      default: current?.translate?.delayMs ?? 0,
      when: (a) => a.enableTranslate,
    },
  ]);

  const cfg: I18nFixConfig = {
    base: ans.base,
    targets: ans.targets,
    keyStyle: ans.keyStyle,
    placeholderStyle: ans.placeholderStyle.length === 1 ? ans.placeholderStyle[0] : ans.placeholderStyle,
    treatSameAsBaseAsUntranslated: ans.treatSameAsBaseAsUntranslated,
    ignoreKeys: ans.ignoreKeys,
    translate: ans.enableTranslate
      ? {
          provider: ans.provider,
          apiKeyEnv: ans.apiKeyEnv || undefined,
          model: ans.model || undefined,
                    maxItems: ans.maxItems ? int(ans.maxItems) : undefined,
          delayMs: typeof ans.delayMs === 'number' ? ans.delayMs : undefined,
        }
      : undefined,
  };

  await writeJsonFile(p, cfg);
  return p;
}
