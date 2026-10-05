<div align="center">

# pi-sticky-model

*上次 `/model` 选的模型就是默认模型，每个模型各记各的 effort。*

[![License: MIT](https://img.shields.io/badge/License-MIT-3fb950?style=flat-square&labelColor=black)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Finn763/pi-sticky-model?style=flat-square&logo=github&labelColor=black)](https://github.com/Finn763/pi-sticky-model/stargazers)
[![Extension](https://img.shields.io/badge/extension-1-8957e5?style=flat-square&labelColor=black)]

中文 | [English](README.md)

</div>

> 原生 pi 会话一结束就忘了你选的模型。Sticky-model 记得。

默认行为里，`/model` 回车只对本次会话有效——下次启动回到钉死的默认值，
只有 `Ctrl+S` 才能留住；`Ctrl+P` 轮切从不持久化。Sticky-model 把它反过来：
回车选中的最后一个模型**就是**今后的默认模型，而且每个模型记住自己的
thinking effort，切回去时原样恢复。

单文件，零依赖。删掉（或禁用）即恢复原生行为。

---

## 为什么做它

修三个每个 pi 用户都遇到过的小毛病：

- **#1：会话失忆。** 选好模型干一天活，重启 pi——没了。**修：**
  `/model` 回车直接写 `defaultProvider`/`defaultModel` 到 `settings.json`，
  下次启动从离开的地方继续。
- **#2：effort 重置。** 重模型开 high、轻模型开 low，但 effort 是全局的，
  每次切换都要重调。**修：** 每个模型在 `modelThinkingLevels["provider/id"]`
  里各记一条，pi 启动时本来就优先用它而不是全局值。
- **#3：误持久化。** `Ctrl+P` 是瞥一眼，不是拍板。**修：**
  只有明确的回车（`source: "set"`）才写盘，轮切（`"cycle"`）和会话恢复
  （`"restore"`）始终仅本次会话有效。

---

## 工作原理

监听两个扩展事件，写 `<agent-dir>/settings.json`
（默认 `~/.pi/agent`，`PI_CODING_AGENT_DIR` 优先）：

1. **`model_select` 且 `source: "set"`** —— 写 `defaultProvider` +
   `defaultModel`，并按当前 thinking level 给新模型记一条
   `modelThinkingLevels`。其他来源（`cycle`、`restore`）一律忽略。
2. **`thinking_level_select`** —— 给当前模型记一条 effort。
   只在真正变化时触发，没有活动模型时跳过。

安全：`settings.json` 解析失败时绝不覆盖——跳过写盘并报错提醒。

---

## 安装

拷一个文件，重启 pi：

```bash
# 所有项目生效（用户级）
cp sticky-model.ts ~/.pi/agent/extensions/
# 或：仅本项目生效
cp sticky-model.ts .pi/extensions/
```

卸载：删掉文件（或禁用）——立刻回到原生行为。

---

## 行为对照

| 事件 | 会发生什么 |
|---|---|
| `/model` 回车 | 记为默认模型 + 记住它的 effort |
| `Ctrl+P` 轮切 | 忽略——和以前一样仅本次会话 |
| 会话恢复 | 忽略——绝不覆盖你的默认模型 |
| `/thinking` 改 effort | 只记到当前模型名下 |
| `settings.json` 已损坏 | 跳过写盘并报错——文件原样保留 |
| 扩展被删 | 一切回到原生 pi |

---

<details>
<summary><strong>仓库结构</strong></summary>

```
sticky-model.ts   # 扩展本体（纯函数已导出，方便测试）
README.md         # English
README.zh-CN.md   # 本文件
LICENSE           # MIT
```

</details>

## 贡献

保持单文件。欢迎修 bug。

## License

[MIT](LICENSE)

*选一次，记住它。*
