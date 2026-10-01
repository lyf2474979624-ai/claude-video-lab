# 项目指引：让你的 Agent 接手这支视频

交接日期：2026-10-02。项目名称：`claude-video-lab`。当前作品：《成形》V2。

公开仓库：<https://github.com/lyf2474979624-ai/claude-video-lab>。
样片与完整交接包：[GitHub Release](https://github.com/lyf2474979624-ai/claude-video-lab/releases/tag/handoff-2026-10-02)。

```bash
git clone https://github.com/lyf2474979624-ai/claude-video-lab.git
cd claude-video-lab
```

Git 仓库包含源码、指引、预生成音频和过程图片；MP4 单独放在 Release，避免每次 clone 都下载所有样片。完整交接 ZIP 包内带有三支对照 MP4。

## 先看什么

完整分享包里，先播放 `out/becoming-v2-telegram.mp4`。这是方便传输的 1600×670、60fps、28 秒版本；源码可以重新导出 1920×804 母版。

然后阅读 `docs/制作过程复盘.md`。这份工程保留了从简单 Demo、静态风格帧、旁白版到三维运动版的过程。V1 曾被用户明确指出像 PPT，V2 是据此重做的结果。现有记录没有用户对 V2 审美效果的最终确认。

如果只收到源码包，包内没有 MP4，但有预生成音频、过程总览图和全部代码。安装依赖后即可预览和渲染。

## 可以直接转给 Agent 的话

> 请在解压后的 claude-video-lab 目录工作。先完整阅读 AGENTS.md、PROJECT_GUIDE.md 和 docs/制作过程复盘.md，再检查 package.json、src/Root.tsx 与当前环境。重点理解用户要的是有实际运动的画面和同步音效，不需要旁白。不要重建工程或默认升级依赖。先说明各版本区别、当前实现与限制；如果我让你继续制作，先验证一个短运动片段，再输出新的版本。

## 这到底怎么生成视频

本次工程主要由 Codex 在本地编辑，项目名中的 Claude 不表示所有内容都由 Claude 生成。可由 Claude Code、Codex 或其他能读写本地代码的 Agent 接手。

```text
人的目标、参考片与反馈
    ↓
Agent 编写 React / TypeScript / GLSL 和音效生成脚本
    ↓
Three.js + React Three Fiber：粒子、几何、镜头、光效逐帧变化
    ↓
Remotion：帧时间、画面编排、音轨、导出
    ↓
FFmpeg / FFprobe：声音处理、视频压缩、媒体检查
    ↓
MP4 → 看运动、听声画配合 → 反馈修改
```

本片采用程序化图形和程序合成声音，没有使用写实生成式视频模型、外部付费 TTS 或真人录音。模型并不直接吐出最终视频文件，而是生成可执行工程。

## 最短运行路径

### 0. 环境

作者机器已使用 Node.js `22.23.1`、npm `10.9.8`、FFmpeg `8.1`。这是复现参考，并非宣称最低版本。建议先使用 Node 22；需要网络下载 npm 包，首次渲染可能还需下载浏览器运行时。

检查：

```bash
node --version
npm --version
ffmpeg -version
ffprobe -version
```

V2 无须 API Key。系统应能运行 Chromium/WebGL；不同系统的字体和 GPU 后端可能让画面略有差异。

### 1. 安装与预览

在解压后的项目根目录执行：

```bash
npm ci
npm run lint
npm run dev
```

在 Remotion Studio 选择 **`BecomingFilmV2`**。包内的 `public/audio/becoming-v2/sound-design.wav` 已准备好，初次预览不必重新生成声音。Studio 的实际端口以终端输出为准。

### 2. 先做小样

```bash
npx remotion render BecomingFilmV2 out/check-v2.mp4 --frames=744-1103 --scale=0.5 --gl=angle --concurrency=1
```

这段覆盖约 12.4–18.4 秒的爆裂与重组，共 6 秒。检查物体是否真正改变形状、声效是否对齐，以及是否存在闪烁或黑场。

### 3. 完整一键导出

```bash
npm run render:film
```

等同于 `npm run render:v2`，自动执行：生成声音 → 导出 MP4 → 逐帧差异和音轨检查。

输出：

- `out/becoming-v2.mp4`：1920×804、60fps 母版。
- `out/becoming-v2.motion-check.json`：帧差和媒体参数报告。
- `public/audio/becoming-v2/events.json`：声音事件列表。

**注意：`npm run render` 仍指向最早的 12 秒 Demo。导出当前版本请使用 `render:film` 或 `render:v2`。**

若只修改画面，可复用声音直接执行：

```bash
npx remotion render BecomingFilmV2 out/becoming-v2.mp4 --crf=19 --gl=angle --concurrency=3
node scripts/check-motion.mjs out/becoming-v2.mp4
```

### 4. 制作便于分享的副本

```bash
ffmpeg -y -i out/becoming-v2.mp4 -vf scale=1600:670 -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -c:a copy -movflags +faststart out/becoming-v2-telegram.mp4
```

文件名带 `telegram` 只是历史命名。这是普通 MP4，不包含发送凭据，也不要求安装 Telegram。此命令会覆盖同名副本；需要保留旧版时改用新文件名。

## 文件地图

| 文件/目录 | 内容与修改入口 |
| --- | --- |
| `src/Root.tsx` | 合成注册、尺寸、帧率、总帧数 |
| `src/film-v2/BecomingFilm.tsx` | 当前片整体、音轨、片名、明暗效果 |
| `src/film-v2/ParticleWorld.tsx` | 粒子 shader、镜头、核心、光环、碎片、曲线、辉光与渲染等待 |
| `src/film-v2/timing.json` | 部分共享动作时间点 |
| `scripts/generate-sound-v2.mjs` | 确定性程序音效、立体声、混音与响度处理 |
| `scripts/check-motion.mjs` | 解码后逐帧对比；报告不是审美评分 |
| `public/audio/becoming-v2/` | 当前可直接使用的声音与事件表 |
| `src/film/` | 旧版 V1：静态画面推拉、旁白和字幕 |
| `src/styleframes/` | 五张静态风格帧源码 |
| `src/scenes/`、`src/ClaudeVideoDemo.tsx` | 最早的 12 秒卡片式 Demo |
| `.agents/skills/` | 随工程保留的 Remotion 技能文档快照 |
| `references/BV1b9ad6xEnD/analysis/视觉拆解.md` | 参考片观片分析；分享包不含原片和截图 |
| `docs/制作过程复盘.md` | 制作经过、错误路线和修正原因 |
| `PACKAGE_MANIFEST.json` | 源码/分享包内文件大小和 SHA-256；由打包脚本生成 |
| `docs/previews/` | 本项目的风格帧、V1 字幕版、V2 导出画面总览 |

## 版本怎么区分

| 版本 | 合成 ID | 内容 | 交接定位 |
| --- | --- | --- | --- |
| Demo | `ClaudeVideoDemo` | 12 秒网页卡片风格 | 最初跑通渲染的证据 |
| 风格帧 | `Styleframe-01-Ignition` 等 | 五张 2.39:1 静态画面 | 排版和色彩探索，不能代替动画 |
| V1 | `SignalFormFilm` | 33 秒、推拉淡入淡出、中文旁白和字幕 | 被用户否定运动效果，供复盘 |
| V2 | `BecomingFilmV2` | 28 秒、空间粒子形变、60fps、同步音效 | 当前继续工作的起点 |

完整包内保留 Demo、V1、V2 的 MP4 及过程总览图，方便比较。体积约 103 MiB 的 V2 母版未打入包，可由源码重新渲染；已有帧差报告是对该母版的历史检查记录，不能当作在收件人机器上新跑过的结果。

## 已知限制和排错

- **没有完全参数化**：部分时间点在 shader、片名、音效脚本及 `Root.tsx` 中仍是常量。改 `timing.json` 不能保证整片自动适配。当前版本是可运行样片工程，不是任意时长的视频生成平台。
- **跨平台未全面实测**：V2 的 Node 脚本适用于普通桌面环境，但 `--gl=angle`、GPU 驱动、浏览器和字体需要在目标机器验证。黑屏时先单帧/短片排错，检查浏览器日志，可试省略 `--gl=angle` 使用默认后端。
- **V1 重建依赖 macOS**：`render:film-v1` 调用 Bash 和 `say`；Windows/Linux 可播放包内成片，也可用预生成 WAV 预览 V1，不必重新生成旁白。
- **内存/GPU 压力**：先将 `--concurrency` 降为 `1`、`--scale` 降为 `0.5`；不要因为预览慢就把静态图推拉当作替代方案。
- **音频缺失**：先检查包内 WAV 是否存在；重新生成需要 FFmpeg 在 PATH 中。
- **帧差报告会覆盖**：检查脚本将结果写在被检查 MP4 旁边，文件名为 `.motion-check.json`。
- **第三方资料**：参考片分析对技术实现的判断是推测，不等同于拿到了原作者工程。技能和依赖沿用各自上游条款；当前项目 `license` 为 `UNLICENSED`，此分享包没有另行授予公开发行或商业许可。

## 分享包包含与不包含

包含源码、精确依赖锁、配置、Agent 指引、复盘、项目内技能、预生成 WAV、分析文字和项目自己的过程图片。完整包额外包含三支对照 MP4。

未包含 `node_modules`、浏览器缓存、`.git`、`.env`、Hermes/Telegram 配置与日志、个人账号数据、原始 Bilibili 视频及其截图、重复音频中间文件、大尺寸母版和调试片段。运行 V2 不依赖这些个人配置。

`docs/工具与项目.md` 与参考片分析保留研究当时的记录，涉及外部产品和许可的描述应在使用前重新核实。

## 下一步怎么改才有意义

先选一段运动提出具体修改，例如“穿行段更快、层次更深”“碎裂后保留短暂停顿”“低频撞击只在核心破裂时出现”。改完看同一片段的前后对照。是否好看、是否接近参考片，需要观看和反馈；文件成功导出、60fps、没有冻结均不能代替这个判断。
