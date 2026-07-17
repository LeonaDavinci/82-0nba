# 82-0nba · NBA Stats Hub

> NBA 球员数据 / 选秀模拟 Web 应用（基于 Vite + React + TypeScript）。

本项目由空仓库初始化为纯脚手架后，迁入自 `NBA-Stats-Hub` 的 `nba-builder` 工程源码。

## 技术栈

- **构建工具**：[Vite](https://vitejs.dev/)（`vite.config.ts`）
- **框架**：React 18 + TypeScript
- **样式**：Tailwind CSS + Radix UI 组件库
- **路由**：`wouter`
- **状态管理**：`zustand`
- **SSR / 预渲染**：`entry-server.tsx` + `prerender.mjs`（构建时生成静态页）

## 目录结构

```
82-0nba/
├── index.html            # 应用入口 HTML
├── vite.config.ts        # Vite 配置（含 SSR）
├── tsconfig.json         # TypeScript 配置
├── components.json       # shadcn/ui 组件配置
├── prerender.mjs         # 构建后预渲染脚本
├── public/               # 静态资源（favicon、sitemap、robots 等）
├── scripts/              # 辅助脚本（如 genPlayers.mjs）
├── src/
│   ├── App.tsx           # 根组件 / 路由
│   ├── main.tsx          # 客户端入口
│   ├── entry-server.tsx  # SSR 入口
│   ├── components/       # UI 组件（PlayerCard、StatBar 等）
│   ├── pages/            # 页面（Home / Play / Result / Share）
│   ├── engine/           # 模拟与选秀引擎
│   ├── data/             # 球员 / 球队数据
│   ├── store/            # zustand 状态
│   ├── hooks/            # 自定义 hooks
│   ├── lib/              # 工具函数
│   └── types/            # 类型定义
└── README.md
```

## 常用命令

> 依赖使用 pnpm workspace `catalog:` 协议管理，请使用 pnpm 安装。

```bash
pnpm install        # 安装依赖
pnpm dev            # 本地开发（默认 host 0.0.0.0）
pnpm build          # 客户端 + SSR + 预渲染构建
pnpm serve          # 预览构建产物
pnpm typecheck      # 类型检查（tsc --noEmit）
```

## 提交规范

- `feat:` 新功能  ·  `fix:` 缺陷修复  ·  `docs:` 文档  ·  `chore:` 构建/工具  ·  `refactor:` 重构
- 示例：`git commit -m "feat: 初始化球员选秀模拟引擎"`
