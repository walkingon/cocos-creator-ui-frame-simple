# Cocos Creator UI Frame Simple

一个基于 **Cocos Creator 3.8** 的轻量级 UI 框架示例工程，采用 **场景-UI 分离** 的设计理念，提供有限状态机驱动的场景管理、三层 UI 架构、事件总线、引用计数资源管理等核心基础设施。

> 🎯 麻雀虽小，五脏俱全 —— 适合作为 2D 休闲游戏或小型项目的起点脚手架。

## ✨ 核心特性

- **场景与 UI 解耦** — Cocos `Scene` 仅作为容器，UI 通过 `UIMgr` 动态加载 Prefab
- **FSM 场景管理** — 纯逻辑有限状态机驱动场景切换，状态生命周期清晰
- **三层 UI 架构** — basic / normal / top 三个层级，支持遮罩、弹窗、界面叠加
- **事件总线** — 全局事件通信，`target` 绑定 + 批量解绑，防止内存泄漏
- **引用计数资源管理** — 防重复加载，自动释放无引用资源
- **DataCom 参数传递** — 轻量组件解决动态 Prefab 实例化时的参数注入问题

## 📁 目录结构

```
assets/scripts/
├── core/                         # 核心框架层
│   ├── fsm/
│   │   ├── FSM.ts                # 有限状态机
│   │   └── FSMState.ts           # 状态基类
│   ├── UIMgr.ts                  # UI 管理器（三层架构）
│   ├── ResMgr.ts                 # 资源管理器（引用计数）
│   ├── EventBus.ts               # 全局事件总线
│   └── DataCom.ts                # View 参数传递组件
├── scene/                        # 场景管理层
│   ├── SceneMgr.ts               # 场景管理器（持久节点）
│   ├── SceneLoading.ts           # 加载场景状态
│   └── SceneGame.ts              # 游戏场景状态
├── ui-view/                      # UI 视图层
│   ├── loading/
│   │   └── UIViewLoading.ts      # 加载界面（进度条动画）
│   ├── game/
│   │   └── UIViewGame.ts         # 游戏主界面
│   └── common/
│       └── UIViewTip.ts          # 弹窗示例
└── game-world/
    └── GameWorld.ts              # 游戏简单演示
```

## 🚀 快速开始

### 环境要求

- **Cocos Creator 3.8.8**
- TypeScript

### 运行

1. 用 Cocos Creator 3.8.8 导入项目
2. 打开scenes/Loading场景，在编辑器中点击 **运行预览**
3. 你将看到：加载界面 → 游戏主界面（含视差滚动背景 + 弹窗交互）

## 📦 核心模块

### SceneMgr — 场景管理器

- 通过 `director.addPersistRootNode()` 常驻内存，场景切换不销毁
- FSM 驱动场景状态：`SceneLoading` → `SceneGame`
- `switchScene(sceneName, ...args)` 触发切换

### UIMgr — UI 管理器

- `openUIView(path, args?, isBasic?)` 异步加载并挂载 Prefab
- `isBasic=true` 自动替换旧 basic 界面（防闪屏）
- `closeAllUIView()` 一键关闭所有 normal 层界面

### ResMgr — 资源管理器

- 引用计数缓存，同一资源多次加载只计数 +1
- `_pendingLoads` Map 防止并发重复加载
- `release(path)` 减引用，归零时自动释放

### EventBus — 事件总线

- `on` / `once` / `off` / `emit` 标准 API
- `target` 绑定：`offAllByTarget(target)` 批量解绑

### FSM — 有限状态机

- 纯逻辑类，不依赖 Cocos 运行时
- 状态生命周期：`onEnter` → `onUpdate` → `onExit`
- 同名状态不重复切换

## 📄 License

MIT

---

⭐ 如果这个项目对你有帮助，欢迎 Star！
