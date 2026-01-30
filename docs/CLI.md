# i18nfix CLI Reference

This is a detailed reference for **all commands and flags**.

> Tip: i18nfix loads `i18nfix.config.json` by default, and auto-loads `.env`.

## Global/common options

These options are shared by most commands:

- `-c, --config <path>`: config path (default: `i18nfix.config.json`)
- `--base <path>`: override base locale path
- `--targets <paths>`: override targets (comma-separated)
- `--key-style <auto|nested|flat>`: override key style
- `--placeholder-style <auto|brace|mustache|printf|ruby|list>`: placeholder validation style (comma-separated list supported)
- `--ignore-keys <keys>`: ignore keys (comma-separated)

Precedence:

`CLI flags` > `config file` > `defaults`

---

## `init`

Create a new `i18nfix.config.json` via an interactive wizard.

```bash
i18nfix init
```

Options:
- `-c, --config <path>`: where to write the config

---

## `config`

Interactive Q&A to **update** `i18nfix.config.json` (or create it if missing).

```bash
i18nfix config
```

Options:
- `-c, --config <path>`

---

## `check`

Check target locales vs base locale.

```bash
i18nfix check
i18nfix check --json
```

Options:
- common options
- `--json`: output full JSON report
- `--init-if-missing`: if config is missing, run the init wizard first

Exit codes:
- `0`: no issues
- `1`: issues found
- `2`: parse errors

---

## `fix`

Fix target locales (add missing keys, optionally remove extra keys). Can also run translation afterwards.

```bash
i18nfix fix --out-dir fixed
i18nfix fix --in-place
```

Options:
- common options
- `--in-place`: overwrite target files
- `--out-dir <dir>`: write fixed files to a directory
- `--drop-extra-keys`: remove keys that are not present in base
- `--fill-missing-with-base`: when adding missing keys, fill with base value (otherwise empty string)

Translation options:
- `--translate`: run translation after fix (requires `translate` config)
- `--translate-mode <all|missing|empty|untranslated>`:
  - `all` (default): translate only keys that have issues (missing/empty/untranslated/placeholder mismatch)
  - `missing`: only missing keys
  - `empty`: only empty-string values
  - `untranslated`: only values equal to base
- `--translate-out-dir <dir>`: write translated output to a directory
- `-v, --verbose`: print BASE/TRNS text for each translated key

---

## `translate` (advanced)

Translate strings using an LLM provider.

```bash
i18nfix translate --out-dir translated
i18nfix translate -v
i18nfix translate --no-show-langs
```

Options:
- common options
- `--in-place`
- `--out-dir <dir>`
- `--mode <missing|empty|untranslated|all>` (default: `all`)
- `--no-show-langs`: hide from/to language line
- `-v, --verbose`: print BASE/TRNS for each translated key
