<div align="center">

# pi-sticky-model

*Your last `/model` pick becomes the default. Each model keeps its own effort.*

[![License: MIT](https://img.shields.io/badge/License-MIT-3fb950?style=flat-square&labelColor=black)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Finn763/pi-sticky-model?style=flat-square&logo=github&labelColor=black)](https://github.com/Finn763/pi-sticky-model/stargazers)
[![Extension](https://img.shields.io/badge/extension-1-8957e5?style=flat-square&labelColor=black)]

[中文](README.zh-CN.md) | English

</div>

> Stock pi forgets your model the moment the session ends. Sticky-model remembers.

Out of the box, `/model` + Enter switches for this session only — next launch
you're back to the pinned default, and `Ctrl+S` is the only way to keep it.
`Ctrl+P` cycling never persists at all. Sticky-model flips that: the last model
you picked with Enter **is** the default from now on, and each model remembers
its own thinking effort, so switching back restores how you left it.

One file, no dependencies. Delete it (or disable it) and stock behavior returns.

---

## Why it exists

Built to fix three small paper cuts every pi user has met:

- **#1: Session amnesia.** You pick a model, work all day, restart pi — and it's
  gone. **Fix:** Enter on `/model` writes `defaultProvider`/`defaultModel` to
  `settings.json`, so the next session starts where you left off.
- **#2: Effort resets.** Heavy model on high, light model on low — but effort is
  global, so every switch means re-tuning. **Fix:** each model keeps its own
  entry in `modelThinkingLevels["provider/id"]`, which pi already prefers over
  the global level at startup.
- **#3: Accidental persistence.** `Ctrl+P` is for peeking, not committing.
  **Fix:** only an explicit Enter (`source: "set"`) persists. Cycling
  (`"cycle"`) and session resume (`"restore"`) stay session-only.

---

## How it works

Listens to two extension events, writes to `<agent-dir>/settings.json`
(`~/.pi/agent` by default, `PI_CODING_AGENT_DIR` when set):

1. **`model_select` with `source: "set"`** — writes `defaultProvider` +
   `defaultModel`, plus a `modelThinkingLevels` entry for the new model from the
   current thinking level. Anything else (`cycle`, `restore`) is ignored.
2. **`thinking_level_select`** — writes a `modelThinkingLevels` entry for the
   current model. Fires only on real changes, and no-ops when no model is active.

Safety: unparsable `settings.json` is never overwritten — the write is skipped
and you get an error notice instead.

---

## Installation

Copy one file, restart pi:

```bash
# every project (user scope)
cp sticky-model.ts ~/.pi/agent/extensions/
# or: this project only
cp sticky-model.ts .pi/extensions/
```

Uninstall: delete the file (or disable it) — stock behavior returns immediately.

---

## What it pins down

| Event | What happens |
|---|---|
| `/model` + Enter | Persists model as default + records its effort |
| `Ctrl+P` cycle | Ignored — session-only, as before |
| Session resume | Ignored — never overwrites your default |
| `/thinking` change | Recorded under the current model only |
| Corrupt `settings.json` | Write skipped, error notice — file left untouched |
| Extension removed | Everything back to stock pi |

---

<details>
<summary><strong>Repo layout</strong></summary>

```
sticky-model.ts   # the extension (pure helpers exported for tests)
README.md         # this file
README.zh-CN.md   # 中文版
LICENSE           # MIT
```

</details>

## Contributing

Keep it one file. Fixes welcome.

## License

[MIT](LICENSE)

*Pick once. It sticks.*
