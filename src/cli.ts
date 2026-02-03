#!/usr/bin/env node
import dotenv from 'dotenv';
// Quiet dotenv runtime banner/tips (keeps CI output clean)
dotenv.config({ quiet: true });
import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, mergeConfig, normalizeKeyStyle, normalizePlaceholderStyle, resolveConfigPath } from './config.js';
import { runInit } from './commands/init.js';
import { runCheck } from './commands/check.js';
import { runFix } from './commands/fix.js';
import { runTranslate } from './commands/translate.js';
import { runConfigure } from './commands/configure.js';
import { runNew } from './commands/new.js';

const program = new Command();
program
  .name('i18nfix')
  .description('Check/fix i18n JSON files (keys, placeholders, untranslated)')
  .version('0.1.0');

program
  .command('init')
  .description('Create i18nfix.config.json via an interactive wizard')
  .option('-c, --config <path>', 'config path (default: i18nfix.config.json)')
  .action(async (opts) => {
    const p = await runInit(opts.config);
    console.log(chalk.green(`Wrote config: ${p}`));
  });

program
  .command('config')
  .description('Interactive Q&A to update i18nfix.config.json (or create it if missing)')
  .option('-c, --config <path>', 'config path (default: i18nfix.config.json)')
  .action(async (opts) => {
    const p = await runConfigure(opts.config);
    console.log(chalk.green(`Wrote config: ${p}`));
  });

program
  .command('new')
  .description('Create new target locale files for additional languages (copy base values)')
  .option('-c, --config <path>', 'config path (default: i18nfix.config.json)')
  .option('--langs <langs>', 'comma-separated language codes to create (e.g. fr,ja,zh)')
  .option('--skip-existing', 'skip creating files that already exist', true)
  .option('--no-update-config', 'do not add created/existing targets into config')
  .action(async (opts) => {
    const configPath = resolveConfigPath(opts.config);
    const cfg0 = await loadConfig(configPath);
    const langs = (opts.langs ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
    await runNew(cfg0, { langs, skipExisting: true, updateConfig: Boolean(opts.updateConfig), configPath });
  });

function applyCommonOptions(cmd: Command) {
  return cmd
    .option('-c, --config <path>', 'config path (default: i18nfix.config.json)')
    .option('--base <path>', 'override base locale path')
    .option('--targets <paths>', 'override targets (comma-separated)')
    .option('--key-style <auto|nested|flat>', 'override key style')
    .option('--placeholder-style <auto|brace|mustache|printf|ruby|list>', 'override placeholder style (comma-separated supported)')
    .option('--ignore-keys <keys>', 'ignore keys (comma-separated)')
    .option('--fail-fast', 'stop immediately on first parse error', false);
}

program
  .command('check')
  .description('Check target locales vs base locale')
  .hook('preAction', () => {})
  .allowExcessArguments(false);

applyCommonOptions(program.commands.find((c) => c.name() === 'check')!)
  .option('--json', 'print JSON report', false)
  .option('--init-if-missing', 'run init wizard if config is missing', false)
  .action(async (opts) => {
    const configPath = resolveConfigPath(opts.config);
    let cfg0;
    try {
      cfg0 = await loadConfig(configPath);
    } catch (e) {
      if (opts.initIfMissing) {
        const p = await runInit(opts.config);
        cfg0 = await loadConfig(p);
      } else {
        throw e;
      }
    }

    const cfg = mergeConfig(cfg0, {
      base: opts.base,
      targets: opts.targets ? opts.targets.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
      keyStyle: opts.keyStyle ? normalizeKeyStyle(opts.keyStyle) : undefined,
      placeholderStyle: opts.placeholderStyle ? normalizePlaceholderStyle(opts.placeholderStyle) : undefined,
      ignoreKeys: opts.ignoreKeys ? opts.ignoreKeys.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
    });

    const report = await runCheck(cfg, { failFast: Boolean(opts.failFast) });
    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
      process.exit(report.summary.parseErrors > 0 ? 2 : report.issues.length ? 1 : 0);
    }

    const s = report.summary;
    console.log(chalk.bold('Summary'));
    console.log(`- missing keys: ${s.missingKeys}`);
    console.log(`- extra keys: ${s.extraKeys}`);
    console.log(`- empty values: ${s.emptyValues}`);
    console.log(`- untranslated: ${s.untranslated}`);
    console.log(`- placeholder mismatches: ${s.placeholderMismatches}`);
    console.log(`- parse errors: ${s.parseErrors}`);

    if (report.issues.length) {
      console.log('');
      console.log(chalk.bold('Top issues'));
      for (const issue of report.issues.slice(0, 30)) {
        const key = issue.key ? ` ${chalk.gray(issue.key)}` : '';
        console.log(`- ${chalk.yellow(issue.type)} ${chalk.cyan(issue.file)}${key} — ${issue.message}`);
      }
      if (report.issues.length > 30) console.log(chalk.gray(`... ${report.issues.length - 30} more`));
    }

    process.exit(report.summary.parseErrors > 0 ? 2 : report.issues.length ? 1 : 0);
  });

program
  .command('fix')
  .description('Fix target locales (add missing keys, optionally remove extras)')
  .allowExcessArguments(false);

applyCommonOptions(program.commands.find((c) => c.name() === 'fix')!)
  .option('--in-place', 'overwrite target files', false)
  .option('--out-dir <dir>', 'write fixed files to a directory')
  .option('--drop-extra-keys', 'remove keys that are not present in base', false)
  .option('--keep-extra-keys', 'do not remove extra keys (deprecated; default behavior)', true)
  .option('--fill-missing-with-base', 'fill missing keys with base value (otherwise empty string)', false)
  .option('--translate', 'run translation after fix (requires translate config)', false)
  .option('--translate-mode <all|missing|empty|untranslated>', 'what to translate after fix', 'all')
  .option('--translate-out-dir <dir>', 'write translated files to a directory (overrides fix out-dir for translation)')
  .option('-v, --verbose', 'verbose output (prints base + translated text for each key during translation)', false)
  .action(async (opts) => {
    const configPath = resolveConfigPath(opts.config);
    const cfg0 = await loadConfig(configPath);
    const cfg = mergeConfig(cfg0, {
      base: opts.base,
      targets: opts.targets ? opts.targets.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
      keyStyle: opts.keyStyle ? normalizeKeyStyle(opts.keyStyle) : undefined,
      placeholderStyle: opts.placeholderStyle ? normalizePlaceholderStyle(opts.placeholderStyle) : undefined,
      ignoreKeys: opts.ignoreKeys ? opts.ignoreKeys.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
    });

    const report = await runFix(cfg, {
      inPlace: Boolean(opts.inPlace),
      outDir: opts.outDir,
      keepExtraKeys: !Boolean(opts.dropExtraKeys),
      fillMissingWithBase: Boolean(opts.fillMissingWithBase),
      failFast: Boolean(opts.failFast),
    });

    const translateRequested = Boolean(opts.translate);

    if (translateRequested && !cfg.translate) {
      // Still allow `fix` to complete, but fail the command because user asked to translate.
      console.log(chalk.green('Fix done.'));
      console.log(`Issues found: ${report.issues.length}`);
      console.error(chalk.red('Translation requested, but config is missing a translate section.'));
      console.error(chalk.gray('Add translate: { provider, apiKeyEnv, model } to i18nfix.config.json.'));
      process.exit(1);
    }

    console.log(chalk.green(translateRequested ? 'Fix done. Starting translation…' : 'Done.'));
    console.log(`Issues found: ${report.issues.length}`);

    if (translateRequested) {
      try {
        await runTranslate(cfg, {
          inPlace: Boolean(opts.inPlace),
          outDir: opts.translateOutDir ?? opts.outDir,
          mode: opts.translateMode,
          showLangs: true,
          printText: Boolean(opts.verbose),
          failFast: Boolean(opts.failFast),
        });
      } catch (e: any) {
        console.error(chalk.red(e?.message ?? String(e)));
        process.exit(1);
      }
    }

    process.exit(report.summary.parseErrors > 0 ? 2 : 0);
  });

program
  .command('translate')
  .description('Translate strings using an LLM provider (advanced; prefer: fix --translate)')
  .allowExcessArguments(false);

applyCommonOptions(program.commands.find((c) => c.name() === 'translate')!)
  .option('--in-place', 'overwrite target files', false)
  .option('--out-dir <dir>', 'write translated files to a directory')
  .option('--mode <missing|empty|untranslated|all>', 'what to translate', 'all')
  .option('--no-show-langs', 'disable printing from/to language per file')
  .option('-v, --verbose', 'print base + translated text for each key', false)
  .action(async (opts) => {
    const configPath = resolveConfigPath(opts.config);
    const cfg0 = await loadConfig(configPath);
    const cfg = mergeConfig(cfg0, {
      base: opts.base,
      targets: opts.targets ? opts.targets.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
      keyStyle: opts.keyStyle ? normalizeKeyStyle(opts.keyStyle) : undefined,
      placeholderStyle: opts.placeholderStyle ? normalizePlaceholderStyle(opts.placeholderStyle) : undefined,
      ignoreKeys: opts.ignoreKeys ? opts.ignoreKeys.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
    });

    try {
      await runTranslate(cfg, {
        inPlace: Boolean(opts.inPlace),
        outDir: opts.outDir,
        mode: opts.mode,
        showLangs: Boolean(opts.showLangs),
        printText: Boolean(opts.verbose),
        failFast: Boolean(opts.failFast),
      });
    } catch (e: any) {
      console.error(chalk.red(e?.message ?? String(e)));
      process.exit(1);
    }

    process.exit(0);
  });

program.parseAsync(process.argv);
