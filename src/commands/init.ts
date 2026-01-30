import inquirer from 'inquirer';
import { I18nFixConfig } from '../types.js';
import { resolveConfigPath, writeJsonFile } from '../config.js';

export async function runInit(configPath?: string) {
  const p = resolveConfigPath(configPath);
  const ans = await inquirer.prompt([
    {
      type: 'input',
      name: 'base',
      message: 'Base locale JSON path (source language):',
      default: 'locales/en.json',
    },
    {
      type: 'input',
      name: 'targets',
      message: 'Target locale JSON paths (comma-separated):',
      default: 'locales/zh.json',
      filter: (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean),
    },
    {
      type: 'list',
      name: 'keyStyle',
      message: 'Key style:',
      choices: [
        { name: 'auto (detect)', value: 'auto' },
        { name: 'nested JSON (e.g. {"home":{"title":"..."}})', value: 'nested' },
        { name: 'flat keys (e.g. {"home.title":"..."})', value: 'flat' },
      ],
      default: 'auto',
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
      ],
      default: ['auto'],
      validate: (arr: string[]) => (arr.length ? true : 'Select at least one'),
    },
    {
      type: 'confirm',
      name: 'treatSameAsBaseAsUntranslated',
      message: 'Treat values equal to base as “untranslated”?',
      default: true,
    },
  ]);

  const cfg: I18nFixConfig = {
    base: ans.base,
    targets: ans.targets,
    keyStyle: ans.keyStyle,
    placeholderStyle: ans.placeholderStyle.length === 1 ? ans.placeholderStyle[0] : ans.placeholderStyle,
    treatSameAsBaseAsUntranslated: ans.treatSameAsBaseAsUntranslated,
    ignoreKeys: [],
  };

  await writeJsonFile(p, cfg);
  return p;
}
