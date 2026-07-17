# 82-0 · NBA Team Builder Game

> 一个 NBA 传奇球员选秀 / 赛季模拟 Web 游戏。在随机的球队与年代约束下选出五名传奇，模拟能否打出完美的 82-0 赛季。

本项目已由 Vite + React SPA **重构为 Next.js 15（App Router）**，采用原生服务端渲染（SSR）以获得最佳 SEO。

## 技术栈

- **框架**：[Next.js 15](https://nextjs.org/)（App Router，SSR）+ React 19 + TypeScript
- **样式**：Tailwind CSS v4（`@tailwindcss/postcss`）+ Radix UI 组件库（shadcn/ui 风格）
- **状态管理**：`zustand`（`persist` 持久化最近战绩，SSR 安全存储）
- **动画**：`framer-motion`
- **SEO**：Next `metadata` / `generateMetadata` 逐路由输出、JSON-LD 结构化数据、canonical、OpenGraph / Twitter Card
- **分析**：Google Analytics（`next/script`）

## 路由（App Router）

| 路径 | 说明 | 索引 |
|---|---|---|
| `/` | 首页（品牌 + 传奇榜 + 玩法介绍，SEO 主页面） | ✅ index |
| `/play` | 选秀页（选 5 名球员） | ✅ index |
| `/result` | 赛季模拟结果（依赖客户端状态） | 🚫 noindex |
| `/run/[id]` | 分享某次战绩（按设备本地存储） | 🚫 noindex |
| `not-found` | 404 | — |

## 目录结构

```
82-0nba/
├── next.config.mjs        # Next.js 配置
├── postcss.config.mjs     # Tailwind v4 (@tailwindcss/postcss)
├── tsconfig.json          # TypeScript（含 next 插件、@/* 别名）
├── public/                # 静态资源（favicon、opengraph、sitemap、robots）
├── scripts/               # 辅助脚本（genPlayers.mjs 生成球员数据）
├── src/
│   ├── app/               # App Router：layout / page / not-found / globals.css
│   │   ├── layout.tsx     # 根布局：metadata、JSON-LD、字体、GA
│   │   ├── page.tsx       # 首页路由 → 渲染 <HomePage />
│   │   ├── play/          # /play
│   │   ├── result/        # /result
│   │   └── run/[id]/      # /run/:id
│   ├── pages/             # 视图组件（客户端交互，"use client"）
│   ├── components/        # UI 组件（PlayerCard、StatBar、ui/*）
│   ├── engine/            # 选秀与模拟引擎
│   ├── data/              # 球员 / 球队数据
│   ├── store/             # zustand 状态
│   ├── hooks/ · lib/ · types/
└── README.md
```

## 常用命令

```bash
npm install         # 安装依赖
npm run dev         # 本地开发（http://localhost:3000）
npm run build       # 生产构建（SSR）
npm run start       # 启动生产服务器
npm run typecheck   # 类型检查（tsc --noEmit）
```

## 环境变量（可选）

| 变量 | 默认值 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://82-0nba.com` | 站点规范域名，用于 canonical / OG / JSON-LD |
| `NEXT_PUBLIC_GA_ID` | `G-JP6Y587W7M` | Google Analytics 衡量 ID |

## 部署

推送到 GitHub 后，Vercel 会自动识别为 Next.js 项目并构建部署（无需 `vercel.json`）。Root Directory 指向仓库根即可。

## 提交规范

- `feat:` 新功能 · `fix:` 缺陷修复 · `docs:` 文档 · `chore:` 构建/工具 · `refactor:` 重构
